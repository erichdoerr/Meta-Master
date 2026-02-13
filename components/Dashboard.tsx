import React, { useState, useEffect } from 'react';
import { AppSettings, Role, ApiResponse } from '../types';
import { MAPS, HEROES } from '../constants';
import { getHeroRecommendations, checkCacheForRecommendations } from '../services/geminiService';
import HeroAnalysis from './HeroAnalysis';
import { Settings as SettingsIcon, Search, AlertCircle, Loader2, Target, Map, Trophy, Ban } from 'lucide-react';

interface DashboardProps {
  settings: AppSettings;
  onOpenSettings: () => void;
}

type Tab = 'strategy' | 'analysis';

const Dashboard: React.FC<DashboardProps> = ({ settings, onOpenSettings }) => {
  const [activeTab, setActiveTab] = useState<Tab>('strategy');
  
  // Strategy State
  const [selectedMap, setSelectedMap] = useState<string>(MAPS[0]);
  const [selectedRole, setSelectedRole] = useState<Role>(Role.TANK);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-load cache on selection change
  useEffect(() => {
    const cached = checkCacheForRecommendations(selectedMap, selectedRole, settings);
    if (cached) {
      setData(cached);
      setError(null);
    } else {
      setData(null);
    }
  }, [selectedMap, selectedRole, settings]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    setData(null); 
    
    try {
      const result = await getHeroRecommendations(selectedMap, selectedRole, settings);
      setData(result);
    } catch (err: any) {
      setError(err.message || "Failed to fetch recommendations");
    } finally {
      setLoading(false);
    }
  };

  const getHeroRole = (name: string): string => {
    const found = HEROES.find(h => h.name.toLowerCase() === name.toLowerCase());
    return found ? found.role : 'Unknown';
  };

  return (
    <div className="min-h-screen bg-[#0f172a] pb-12">
      {/* Header */}
      <div className="bg-slate-900 border-b border-white/5 py-4 px-4 sticky top-0 z-40 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center font-bold text-xl italic ow-font text-white shadow-[0_0_15px_rgba(249,115,22,0.6)]">
                    OW
                </div>
                <h1 className="text-2xl font-bold text-white uppercase italic tracking-wider hidden sm:block ow-font">
                    Meta Master
                </h1>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <span className="px-2 py-1 bg-slate-800 rounded border border-white/5 text-slate-300">
                        <span className="text-orange-500 mr-1">Region:</span> {settings.region}
                    </span>
                    <span className="px-2 py-1 bg-slate-800 rounded border border-white/5 text-slate-300">
                        <span className="text-orange-500 mr-1">Tier:</span> {settings.tier}
                    </span>
                    <span className="px-2 py-1 bg-slate-800 rounded border border-white/5 text-slate-300">
                        <span className="text-orange-500 mr-1">Input:</span> {settings.input}
                    </span>
                </div>
                <button 
                    onClick={onOpenSettings}
                    className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    title="Settings"
                >
                    <SettingsIcon size={24} />
                </button>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-8">
        
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
            <div className="bg-slate-900 p-1 rounded-full border border-white/10 flex">
                <button
                    onClick={() => setActiveTab('strategy')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold uppercase tracking-wider text-sm transition-all ${
                        activeTab === 'strategy' 
                        ? 'bg-orange-500 text-white shadow-lg' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                >
                    <Target size={16} /> Meta Strategy
                </button>
                <button
                    onClick={() => setActiveTab('analysis')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold uppercase tracking-wider text-sm transition-all ${
                        activeTab === 'analysis' 
                        ? 'bg-purple-500 text-white shadow-lg' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                >
                    <Map size={16} /> Map Analysis
                </button>
            </div>
        </div>

        {activeTab === 'analysis' ? (
            <HeroAnalysis settings={settings} />
        ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Meta Strategy Controls */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-white/10 shadow-xl mb-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-orange-400">Select Map</label>
                            <select 
                                value={selectedMap}
                                onChange={(e) => setSelectedMap(e.target.value)}
                                className="w-full bg-slate-950 text-white text-lg font-bold p-3 rounded-lg border border-slate-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                            >
                                {MAPS.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-orange-400">Select Role</label>
                            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-700">
                                {[Role.TANK, Role.DAMAGE, Role.SUPPORT].map((role) => (
                                    <button
                                        key={role}
                                        onClick={() => setSelectedRole(role)}
                                        className={`flex-1 py-2 text-sm font-bold uppercase tracking-wider rounded-md transition-all ${
                                            selectedRole === role 
                                            ? 'bg-orange-500 text-white shadow-lg' 
                                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                        }`}
                                    >
                                        {role}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={fetchRecommendations}
                            disabled={loading}
                            className={`
                                w-full py-4 rounded-lg font-bold text-lg uppercase italic tracking-widest flex items-center justify-center gap-2 shadow-xl transition-all
                                ${loading 
                                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                                    : 'bg-white text-slate-900 hover:bg-orange-500 hover:text-white hover:scale-[1.02] active:scale-[0.98]'
                                }
                            `}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
                            {loading ? 'Analyzing Meta...' : 'Get Strategy'}
                        </button>
                    </div>
                </div>

                {/* Results Area */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-8 text-red-200 flex items-center gap-3">
                        <AlertCircle />
                        {error}
                    </div>
                )}

                {data && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Pick Suggestions */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <Trophy className="text-green-500" />
                                <h2 className="text-3xl text-white font-bold ow-font uppercase italic">Top Picks</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-3">
                                {data.recommendations.map((rec, idx) => (
                                    <div key={idx} className="bg-slate-800/50 border-l-4 border-l-green-500 border-y border-r border-white/5 rounded-r-xl p-4 flex gap-4 items-center hover:bg-slate-800 transition-colors group">
                                        <div className="text-3xl font-bold text-green-500/30 w-8 text-center ow-font italic">
                                            #{idx + 1}
                                        </div>
                                        <div className="flex-1 flex items-center justify-between">
                                            <h3 className="text-2xl font-bold text-white ow-font uppercase mr-2 tracking-wide">{rec.heroName}</h3>
                                            <div className="flex gap-4 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Win Rate</span>
                                                    <span className="text-green-400 text-lg font-bold font-mono">{rec.winRate}</span>
                                                </div>
                                                <div className="flex flex-col items-end w-20">
                                                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Pick Rate</span>
                                                    <span className="text-blue-400 text-lg font-bold font-mono">{rec.pickRate}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Ban Suggestions */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <Ban className="text-red-500" />
                                <h2 className="text-3xl text-white font-bold ow-font uppercase italic">Ban Priority</h2>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                {data.bans.map((ban, idx) => (
                                    <div key={idx} className="bg-slate-800/50 border-l-4 border-l-red-500 border-y border-r border-white/5 rounded-r-xl p-4 flex gap-4 items-center hover:bg-slate-800 transition-colors">
                                        <div className="text-3xl font-bold text-red-500/30 w-8 text-center ow-font italic">
                                            #{idx + 1}
                                        </div>
                                        <div className="flex-1 flex items-center justify-between">
                                            <div>
                                                <h3 className="text-xl font-bold text-white ow-font uppercase tracking-wide">{ban.heroName}</h3>
                                                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{ban.role}</span>
                                            </div>
                                            <div className="flex gap-4 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Win Rate</span>
                                                    <span className="text-red-400 text-lg font-bold font-mono">{ban.winRate}</span>
                                                </div>
                                                <div className="flex flex-col items-end w-20">
                                                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Pick Rate</span>
                                                    <span className="text-slate-400 text-lg font-bold font-mono">{ban.pickRate}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty State / Initial Instructions */}
                {!data && !loading && !error && (
                    <div className="text-center py-20 opacity-50">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search size={40} className="text-slate-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-300 ow-font uppercase tracking-wider mb-2">Ready to Analyze</h3>
                        <p className="text-slate-500 max-w-md mx-auto">
                            Select a map and your role to generate real-time meta recommendations powered by Gemini AI.
                        </p>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
