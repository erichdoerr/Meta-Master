import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AppSettings, ApiResponse, HeroAnalysisResponse, FullMapStrategy, Role, Recommendation } from "../types";
import { MAPS } from "../constants";

const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error("API Key is missing. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey });

// --- Cache Helpers ---
const CACHE_PREFIX = 'ow2-meta-cache-v5';
const STRATEGY_BATCH_SIZE = 5;
const STRATEGY_MAPS = MAPS.filter((map) => map !== 'All Maps');

// Key is based on Map + Settings (Role is EXCLUDED so we cache the whole map strategy)
const generateMapKey = (map: string, settings: AppSettings) => {
  const settingsKey = JSON.stringify({
    input: settings.input,
    tier: settings.tier,
    region: settings.region,
    gameMode: settings.gameMode,
    heroPool: [...settings.heroPool].sort()
  });
  return `${CACHE_PREFIX}:map_strategy:${settingsKey}:${map}`;
};

const generateAnalysisKey = (heroName: string, role: string, settings: AppSettings) => {
  const settingsKey = JSON.stringify({
    input: settings.input,
    tier: settings.tier,
    region: settings.region
  });
  return `${CACHE_PREFIX}:analysis:${settingsKey}:${heroName}:${role}`;
};

const getFromCache = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    if (item) {
      return JSON.parse(item);
    }
  } catch (e) {
    console.warn("Cache read error", e);
  }
  return null;
};

const saveToCache = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn("Cache write error (likely full)", e);
  }
};

export const clearCache = () => {
    try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(CACHE_PREFIX)) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (e) {
        console.error("Failed to clear cache", e);
    }
};

// --- Exported Cache Checkers ---

export const checkCacheForRecommendations = (map: string, role: string, settings: AppSettings): ApiResponse | null => {
    const fullStrategy = getFromCache<FullMapStrategy>(generateMapKey(map, settings));
    
    if (!fullStrategy) return null;

    // Filter the full strategy for the specific role requested
    let recs: Recommendation[] = [];
    switch (role) {
        case Role.TANK: recs = fullStrategy.tankRecommendations || []; break;
        case Role.DAMAGE: recs = fullStrategy.damageRecommendations || []; break;
        case Role.SUPPORT: recs = fullStrategy.supportRecommendations || []; break;
        default: recs = [];
    }
    
    return {
        recommendations: recs,
        bans: fullStrategy.bans || []
    };
}

export const checkCacheForAnalysis = (heroName: string, role: string, settings: AppSettings): HeroAnalysisResponse | null => {
    return getFromCache<HeroAnalysisResponse>(generateAnalysisKey(heroName, role, settings));
}

// --- API Functions ---

export const getHeroRecommendations = async (
  map: string,
  role: string,
  settings: AppSettings
): Promise<ApiResponse> => {
  
  // 1. Check Cache for the Full Map Strategy
  const cacheKey = generateMapKey(map, settings);
  let fullStrategy = getFromCache<FullMapStrategy>(cacheKey);

  // 2. If not in cache, fetch a batch of maps for the same settings and cache each map.
  if (!fullStrategy) {
      const uncachedMaps = STRATEGY_MAPS.filter((candidateMap) => !getFromCache<FullMapStrategy>(generateMapKey(candidateMap, settings)));
      const prioritizedMaps = [map, ...uncachedMaps.filter((candidateMap) => candidateMap !== map)];
      const mapsToFetch = prioritizedMaps.slice(0, STRATEGY_BATCH_SIZE);

      // Define schema components explicitly with Schema type
      const recommendationItemSchema: Schema = {
          type: Type.OBJECT,
          properties: {
            heroName: { type: Type.STRING },
            winRate: { type: Type.STRING, description: "Estimated win rate % (e.g., '54.5%')" },
            pickRate: { type: Type.STRING, description: "Estimated pick rate % (e.g., '4.2%')" },
            reason: { type: Type.STRING },
          },
          required: ["heroName", "winRate", "pickRate", "reason"],
      };

      const banItemSchema: Schema = {
          type: Type.OBJECT,
          properties: {
            heroName: { type: Type.STRING },
            role: { type: Type.STRING },
            winRate: { type: Type.STRING },
            pickRate: { type: Type.STRING },
            reason: { type: Type.STRING },
          },
          required: ["heroName", "role", "winRate", "pickRate", "reason"],
      };

      const mapStrategySchema: Schema = {
        type: Type.OBJECT,
        properties: {
          mapName: { type: Type.STRING },
          tankRecommendations: { type: Type.ARRAY, items: recommendationItemSchema },
          damageRecommendations: { type: Type.ARRAY, items: recommendationItemSchema },
          supportRecommendations: { type: Type.ARRAY, items: recommendationItemSchema },
          bans: { type: Type.ARRAY, items: banItemSchema },
        },
        required: ["mapName", "tankRecommendations", "damageRecommendations", "supportRecommendations", "bans"],
      };

      const responseSchema: Schema = {
        type: Type.OBJECT,
        properties: {
          mapStrategies: { type: Type.ARRAY, items: mapStrategySchema },
        },
        required: ["mapStrategies"],
      };

      const poolList = settings.heroPool.join(", ");
      const mapList = mapsToFetch.join(', ');
      
      const prompt = `
        You are an expert Overwatch 2 analyst. I need a hero pick and ban strategy for advanced players.
        
        Context:
        - Maps: ${mapList}
        - Input: ${settings.input}
        - Tier: ${settings.tier}
        - Region: ${settings.region}
        - Game Mode: ${settings.gameMode}
        
        My Personal Hero Pool (IDs): ${poolList}
        
        Task:
        1. For EACH map in [${mapList}], identify the **Top 5** Heroes to Play for **EACH** role (Tank, Damage, Support) considering the current meta. 
           **CRITICAL: Only recommend heroes from "My Personal Hero Pool". If the top meta heroes are not in my pool, select the next best ones that ARE in my pool.**
        2. For EACH map in [${mapList}], identify the Top 7 Heroes to Ban across ALL roles based on the highest win rates or frustration factors.
        
        Data Requirements:
        - **Win Rate**: Must be a percentage (e.g., "54.2%").
        - **Pick Rate**: Must be a percentage (e.g., "5.1%"). Do NOT use terms like "High", "Medium", "Low".
        - Reason: Provide a very brief technical reason (1 sentence).

        Output shape:
        {
          "mapStrategies": [
            {
              "mapName": "Exact map name",
              "tankRecommendations": [...],
              "damageRecommendations": [...],
              "supportRecommendations": [...],
              "bans": [...]
            }
          ]
        }
        
        Use the Google Search tool to find the most recent win rate data from reliable tracker sites.
        
        Return the result strictly as JSON.
      `;

      try {
        const response = await ai.models.generateContent({
          model: "gemini-3-pro-preview",
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: responseSchema,
          },
        });

        const text = response.text;
        if (!text) {
            throw new Error("Empty response from AI");
        }
        
        const parsed = JSON.parse(text) as { mapStrategies: Array<{ mapName: string } & FullMapStrategy> };
        parsed.mapStrategies.forEach((mapStrategy) => {
          saveToCache(generateMapKey(mapStrategy.mapName, settings), {
            tankRecommendations: mapStrategy.tankRecommendations,
            damageRecommendations: mapStrategy.damageRecommendations,
            supportRecommendations: mapStrategy.supportRecommendations,
            bans: mapStrategy.bans,
          } as FullMapStrategy);
        });

        fullStrategy = getFromCache<FullMapStrategy>(cacheKey);

      } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
      }
  }

  // 3. Validation
  if (!fullStrategy) {
      throw new Error("Failed to retrieve strategy data.");
  }

  // 4. Return only the requested role slice from the full strategy
  let recs: Recommendation[] = [];
  switch (role) {
    case Role.TANK: recs = fullStrategy.tankRecommendations || []; break;
    case Role.DAMAGE: recs = fullStrategy.damageRecommendations || []; break;
    case Role.SUPPORT: recs = fullStrategy.supportRecommendations || []; break;
    default: recs = [];
  }

  return {
      recommendations: recs,
      bans: fullStrategy.bans || []
  };
};

export const getHeroMapAnalysis = async (
  heroName: string,
  role: string,
  settings: AppSettings
): Promise<HeroAnalysisResponse> => {
  
  const cacheKey = generateAnalysisKey(heroName, role, settings);
  const cached = getFromCache<HeroAnalysisResponse>(cacheKey);
  if (cached) {
    return cached;
  }

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      heroName: { type: Type.STRING },
      maps: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            mapName: { type: Type.STRING },
            winRate: { type: Type.STRING },
            reason: { type: Type.STRING }
          },
          required: ["mapName", "winRate", "reason"]
        }
      }
    },
    required: ["heroName", "maps"]
  };

  const prompt = `
    Analyze the hero '${heroName}' (Role: ${role}) for Overwatch 2.
    Settings: Input: ${settings.input}, Tier: ${settings.tier}, Region: ${settings.region}.
    
    Task:
    Analyze this hero's performance on ALL current Overwatch 2 competitive maps (including Control, Escort, Hybrid, Push, Flashpoint, and Clash).
    
    Return a SINGLE list of **ALL** maps sorted by Win Rate from Highest (Best) to Lowest (Worst).
    
    Data Requirements:
    - Win Rate: Must be a percentage (e.g., "58%").
    
    Return the result strictly as JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from AI");
    }

    const result = JSON.parse(text) as HeroAnalysisResponse;
    saveToCache(cacheKey, result);
    return result;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
