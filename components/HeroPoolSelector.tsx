import React, { useMemo } from 'react';
import { Hero, Role } from '../types';
import { HEROES } from '../constants';
import { Check, Shield, Sword, Heart } from 'lucide-react';

interface HeroPoolSelectorProps {
  selectedHeroIds: string[];
  onChange: (ids: string[]) => void;
}

const HeroPoolSelector: React.FC<HeroPoolSelectorProps> = ({ selectedHeroIds, onChange }) => {
  
  const toggleHero = (id: string) => {
    if (selectedHeroIds.includes(id)) {
      onChange(selectedHeroIds.filter(hid => hid !== id));
    } else {
      onChange([...selectedHeroIds, id]);
    }
  };

  const toggleRole = (role: Role) => {
    const roleHeroes = HEROES.filter(h => h.role === role);
    const allRoleIds = roleHeroes.map(h => h.id);
    const allSelected = allRoleIds.every(id => selectedHeroIds.includes(id));

    if (allSelected) {
      // Deselect all in this role
      onChange(selectedHeroIds.filter(id => !allRoleIds.includes(id)));
    } else {
      // Select all in this role
      const newIds = new Set([...selectedHeroIds, ...allRoleIds]);
      onChange(Array.from(newIds));
    }
  };

  const groupedHeroes = useMemo(() => {
    return {
      [Role.TANK]: HEROES.filter(h => h.role === Role.TANK),
      [Role.DAMAGE]: HEROES.filter(h => h.role === Role.DAMAGE),
      [Role.SUPPORT]: HEROES.filter(h => h.role === Role.SUPPORT),
    };
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {(Object.keys(groupedHeroes) as Role[]).map(role => (
        <div key={role} className="bg-slate-800/50 p-6 rounded-xl border border-white/5">
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                <h3 className="text-xl font-bold flex items-center gap-2 ow-font uppercase tracking-widest text-slate-100">
                    {role === Role.TANK && <Shield className="w-5 h-5 text-blue-400" />}
                    {role === Role.DAMAGE && <Sword className="w-5 h-5 text-red-400" />}
                    {role === Role.SUPPORT && <Heart className="w-5 h-5 text-green-400" />}
                    {role}
                </h3>
                <button 
                    onClick={() => toggleRole(role)}
                    className="text-xs uppercase font-bold tracking-wider text-orange-400 hover:text-orange-300 transition-colors"
                >
                    Toggle All
                </button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
            {groupedHeroes[role].map((hero: Hero) => {
                const isSelected = selectedHeroIds.includes(hero.id);
                return (
                <button
                    key={hero.id}
                    onClick={() => toggleHero(hero.id)}
                    className={`
                        flex items-center justify-between px-3 py-2 rounded transition-all duration-200 border
                        ${isSelected 
                            ? 'bg-slate-700 border-orange-500 text-white shadow-sm' 
                            : 'bg-slate-900 border-transparent text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                        }
                    `}
                >
                    <span className="text-xs uppercase font-bold tracking-wider truncate">
                        {hero.name}
                    </span>
                    {isSelected && <Check size={12} className="text-orange-500" />}
                </button>
                );
            })}
            </div>
        </div>
      ))}
    </div>
  );
};

export default HeroPoolSelector;
