import React from 'react';
import { TargetIcon, CoffeeIcon, HeartbeatIcon } from './Icons';

const moods = [
  { key: 'focused', icon: TargetIcon, color: 'var(--accent)', label: 'Focused', desc: 'Normal JEE Mains difficulty. Standard question.' },
  { key: 'tired', icon: CoffeeIcon, color: 'var(--warning)', label: 'Tired', desc: 'Slightly easier. More conceptual, less calculation-heavy.' },
  { key: 'anxious', icon: HeartbeatIcon, color: 'var(--danger)', label: 'Anxious', desc: 'One level easier. Encouraging phrasing.' }
];

export default function MoodSelector({ onSelect }) {
  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <h2 className="text-xl font-semibold text-center">How are you feeling?</h2>
      <p className="text-gray-400 text-sm text-center">This adjusts question difficulty</p>
      <div className="flex flex-col gap-3 mt-2" role="radiogroup" aria-label="Mood selection">
        {moods.map(m => {
          const IconComp = m.icon;
          return (
            <button
              key={m.key}
              onClick={() => onSelect(m.key)}
              role="radio"
              aria-checked={false}
              aria-label={`${m.label}: ${m.desc}`}
              className="bg-surface border border-border hover:border-accent rounded-xl p-4 text-left transition-all flex items-start gap-4"
            >
              <span className="text-2xl" aria-hidden="true" style={{ color: m.color, marginTop: '2px' }}>
                <IconComp size={24} />
              </span>
              <div>
                <span className="font-semibold text-lg">{m.label}</span>
                <p className="text-gray-400 text-sm mt-1">{m.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
