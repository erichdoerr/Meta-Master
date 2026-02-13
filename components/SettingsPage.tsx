import React from 'react';
import { AppSettings } from '../types';
import { TIERS } from '../constants';
import HeroPoolSelector from './HeroPoolSelector';
import { clearCache } from '../services/geminiService';
import { ArrowLeft, Save, Trash2, CheckCircle } from 'lucide-react';

interface SettingsPageProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onBack: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ settings, onSave, onBack }) => {
  const [localSettings, setLocalSettings] = React.useState<AppSettings>(settings);
  const [isSaved, setIsSaved] = React.useState(false);
  const [cacheCleared, setCacheCleared] = React.useState(false);

  const handleSave = () => {
    onSave(localSettings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleClearCache = () => {
    clearCache();
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 pb-24">
      <div className="flex items-center justify-between mb-8 sticky top-0 bg-[#0f172a] z-50 py-4 border-b border-white/10">
        <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors uppercase font-bold tracking-wider text-sm"
        >
            <ArrowLeft size={18} /> Back to Dashboard
        </button>
        <h2 className="text-3xl font-bold text-white ow-font italic uppercase tracking-wider">
            Configuration
        </h2>
        <div className="flex items-center gap-3">
            <button 
                onClick={handleClearCache}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-sm font-bold uppercase italic tracking-widest flex items-center gap-2 transition-all border border-white/10"
                title="Force refresh data by clearing local cache"
            >
                {cacheCleared ? <CheckCircle size={18} className="text-green-500" /> : <Trash2 size={18} />}
                {cacheCleared ? 'Cleared' : 'Clear Cache'}
            </button>
            <button 
                onClick={handleSave}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-sm font-bold uppercase italic tracking-widest flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(249,115,22,0.4)]"
            >
            {isSaved ? <CheckIcon /> : <Save size={18} />}
            {isSaved ? 'Saved' : 'Save Config'}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-800/50 p-6 rounded-xl border border-white/5 backdrop-blur-sm sticky top-24">
                <h3 className="text-xl text-white font-bold mb-6 ow-font uppercase border-b border-white/10 pb-2">Global Filters</h3>
                
                <div className="space-y-4">
                    <SelectField 
                        label="Input" 
                        value={localSettings.input} 
                        options={['PC', 'Console']} 
                        onChange={(v) => setLocalSettings({...localSettings, input: v as any})}
                    />
                    <SelectField 
                        label="Region" 
                        value={localSettings.region} 
                        options={['Americas', 'Europe', 'Asia']} 
                        onChange={(v) => setLocalSettings({...localSettings, region: v as any})}
                    />
                    <SelectField 
                        label="Tier" 
                        value={localSettings.tier} 
                        options={TIERS} 
                        onChange={(v) => setLocalSettings({...localSettings, tier: v as any})}
                    />
                    <SelectField 
                        label="Game Mode" 
                        value={localSettings.gameMode} 
                        options={['Role Queue', 'Open Queue']} 
                        onChange={(v) => setLocalSettings({...localSettings, gameMode: v as any})}
                    />
                </div>
                
                <div className="mt-8 p-4 bg-blue-900/20 rounded-lg border border-blue-500/20">
                    <p className="text-xs text-blue-200">
                        These settings directly influence the data analysis engine. Ensure they match your actual game environment for accurate win rate predictions.
                    </p>
                </div>
            </div>
        </div>

        {/* Main Content - Hero Pool */}
        <div className="lg:col-span-3">
             <div className="mb-6">
                <h3 className="text-2xl text-white font-bold ow-font uppercase">Your Hero Pool</h3>
                <p className="text-slate-400 text-sm">
                    Select the heroes you are comfortable playing. Recommendations will be prioritized from this list, while bans will consider the entire roster.
                </p>
             </div>
             <HeroPoolSelector 
                selectedHeroIds={localSettings.heroPool} 
                onChange={(pool) => setLocalSettings({...localSettings, heroPool: pool})}
             />
        </div>
      </div>
    </div>
  );
};

const SelectField = ({ label, value, options, onChange }: { label: string, value: string, options: string[], onChange: (val: string) => void }) => (
    <div className="space-y-1">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</label>
        <select 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-slate-900 text-white border border-slate-700 rounded p-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all font-medium"
        >
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-in zoom-in spin-in-180 duration-300">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

export default SettingsPage;
