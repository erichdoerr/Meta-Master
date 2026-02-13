import React, { useState, useEffect } from 'react';
import { AppSettings, Role, HeroAnalysisResponse } from '../types';
import { HEROES } from '../constants';
import { getHeroMapAnalysis, checkCacheForAnalysis } from '../services/geminiService';
import { Search, Loader2, BarChart2, AlertCircle } from 'lucide-react';

interface HeroAnalysisProps {
  settings: AppSettings;
}

const HeroAnalysis: React.FC<HeroAnalysisProps> = ({ settings }) => {
  const [selectedRole, setSelectedRole] = useState<Role>(Role.TANK);
  const [selectedHeroId, setSelectedHeroId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<HeroAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter heroes by selected role
  const roleHeroes = HEROES.filter(h => h.role === selectedRole);

  // Set default hero when role changes
  useEffect(() => {
    if (roleHeroes.length > 0 && !roleHeroes.find(h => h.id === selectedHeroId)) {
      setSelectedHeroId(roleHeroes[0].id);
    }
  }, [selectedRole, roleHeroes, selectedHeroId]);

  // Check cache when dependencies change
  useEffect(() => {
    if (!selectedHeroId) return;
    
    const hero = HEROES.find(h => h.id === selectedHeroId);
    if (!hero) return;

    const cached = checkCacheForAnalysis(hero.name, hero.role, settings);
    if (cached) {
      setData(cached);
      setError(null);
    } else {
      setData(null);
    }
  }, [selectedHeroId, selectedRole, settings]);

  const handleAnalyze = async () => {
    if (!selectedHeroId) return;

    setLoading(true);
    setError(null);
    setData(null);

    const hero = HEROES.find(h => h.id === selectedHeroId);
    if (!hero) return;

    try {
      const result = await getHeroMapAnalysis(hero.name, hero.role, settings);
      setData(result);
    } catch (err: any) {
      setError(err.message || "Failed to analyze hero.");
    } finally {
      setLoading(false);
    }
  };

  const getWinRateColor = (rateStr: string) => {
    const rate = parseFloat(rateStr);
    if (isNaN(rate)) return "text-slate-400 border-slate-500/30 bg-slate-500/20";
    if (rate >= 55) return "text-green-400 border-green-500/30 bg-green-500/20";
    if (rate >= 50) return "text-blue-400 border-blue-500/30 bg-blue-500/20";
    if (rate >= 45) return "text-yellow-400 border-yellow-500/30 bg-yellow-500/20";
    return "text-red-400 border-red-500/30 bg-red-500/20";
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Controls */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-white/10 shadow-xl mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-purple-400">Select Role</label>
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-700">
              {[Role.TANK, Role.DAMAGE, Role.SUPPORT].map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`flex-1 py-2 text-sm font-bold uppercase tracking-wider rounded-md transition-all ${
                    selectedRole === role
                      ? 'bg-purple-500 text-white shadow-lg'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-purple-400">Select Hero</label>
            <select
              value={selectedHeroId}
              onChange={(e) => setSelectedHeroId(e.target.value)}
              className="w-full bg-slate-950 text-white text-lg font-bold p-3 rounded-lg border border-slate-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            >
              {roleHeroes.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className={`
                w-full py-4 rounded-lg font-bold text-lg uppercase italic tracking-widest flex items-center justify-center gap-2 shadow-xl transition-all
                ${loading
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-white text-slate-900 hover:bg-purple-500 hover:text-white hover:scale-[1.02] active:scale-[0.98]'
              }
            `}
          >
            {loading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
            {loading ? 'Analyzing...' : 'Analyze Maps'}
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-8 text-red-200 flex items-center gap-3">
          <AlertCircle />
          {error}
        </div>
      )}

      {/* Results */}
      {data && (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-full border border-purple-500/50">
                        <BarChart2 className="text-purple-500" size={24} />
                    </div>
                    <div>
                         <h2 className="text-3xl text-white font-bold ow-font uppercase italic">All Maps Performance</h2>
                         <p className="text-slate-400 text-xs uppercase tracking-wider">Sorted Best to Worst</p>
                    </div>
                </div>
                <div className="text-right hidden sm:block">
                     <h3 className="text-xl font-bold text-purple-400 ow-font uppercase">{data.heroName}</h3>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.maps.map((map, idx) => {
                    const colorClass = getWinRateColor(map.winRate);
                    return (
                        <div key={idx} className="bg-slate-800/50 border border-white/5 rounded-lg p-4 hover:bg-slate-800 transition-colors flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <span className={`text-sm font-bold w-6 text-center ${idx < 3 ? 'text-yellow-500' : 'text-slate-600'}`}>
                                    #{idx + 1}
                                </span>
                                <h3 className="text-lg font-bold text-white ow-font uppercase tracking-wide group-hover:text-purple-300 transition-colors">{map.mapName}</h3>
                            </div>
                            <span className={`text-sm font-bold px-2 py-0.5 rounded border font-mono ${colorClass}`}>
                                {map.winRate}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
      )}

      {/* Empty State */}
      {!data && !loading && !error && (
        <div className="text-center py-20 opacity-50">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={40} className="text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-300 ow-font uppercase tracking-wider mb-2">Select a Hero</h3>
            <p className="text-slate-500 max-w-md mx-auto">
                View a comprehensive breakdown of win rates for every map in the current competitive pool.
            </p>
        </div>
      )}
    </div>
  );
};

export default HeroAnalysis;
