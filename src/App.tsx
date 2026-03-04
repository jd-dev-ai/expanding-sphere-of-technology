import React, { useState, useEffect } from 'react';
import { SphereViz } from './components/SphereViz';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { SKILLS } from './data';

export default function App() {
  const [year, setYear] = useState(1979);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setYear(y => {
        if (y >= 2026) {
          setIsPlaying(false);
          return 2026;
        }
        return y + 0.1;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleReset = () => {
    setYear(1979);
    setIsPlaying(true);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 font-sans flex flex-col">
      <header className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-950 z-10">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-neutral-100">The Expanding Sphere of Technology</h1>
          <p className="text-neutral-400 text-sm mt-1">Mapping the boundary between automation and human opportunity</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-light font-mono text-cyan-400">{Math.floor(year)}</div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="w-full lg:w-1/3 p-6 lg:p-10 flex flex-col justify-center border-r border-neutral-800 bg-neutral-900/50 z-10 overflow-y-auto">
          <h2 className="text-xl font-medium mb-4 text-neutral-100">The Strategy of the Border</h2>
          <p className="text-neutral-300 leading-relaxed mb-6">
            As technology advances, it consumes skills and industries that were once exclusively human. 
            The sphere of automation is constantly expanding.
          </p>
          <p className="text-neutral-300 leading-relaxed mb-6">
            The most effective strategy is not to compete inside the sphere, but to move to the <strong className="text-amber-400 font-medium">border</strong>—the edge where technology meets human ingenuity—or completely outside it, into domains of deep empathy, complex strategy, and human connection.
          </p>
          
          <div className="mt-8 space-y-8">
            <div>
              <h3 className="text-xs uppercase tracking-widest text-cyan-500 font-semibold mb-3">Inside the Sphere (Automated)</h3>
              <div className="flex flex-wrap gap-2">
                {SKILLS.filter(s => s.year <= year).slice(-8).reverse().map(s => (
                  <span key={s.id} className="px-2 py-1 bg-cyan-950/50 text-cyan-300 border border-cyan-800/50 rounded text-xs transition-all duration-300">
                    {s.label} ({s.year})
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-xs uppercase tracking-widest text-amber-500 font-semibold mb-3">The Human Frontier (Opportunity)</h3>
              <div className="flex flex-wrap gap-2">
                {SKILLS.filter(s => s.year > year).slice(0, 8).map(s => (
                  <span key={s.id} className="px-2 py-1 bg-amber-950/50 text-amber-300 border border-amber-800/50 rounded text-xs transition-all duration-300">
                    {s.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 relative flex flex-col">
          <div className="flex-1 relative">
            <SphereViz currentYear={year} />
          </div>
          
          <div className="p-6 border-t border-neutral-800 bg-neutral-950 flex items-center gap-6 z-10">
            <div className="flex gap-2">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-12 h-12 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-colors text-neutral-200"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
              </button>
              <button 
                onClick={handleReset}
                className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 flex items-center justify-center transition-colors text-neutral-400"
                title="Reset to 1979"
              >
                <RotateCcw size={18} />
              </button>
            </div>
            
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex justify-between text-xs text-neutral-500 font-mono">
                <span>1979</span>
                <span>2026</span>
              </div>
              <input 
                type="range" 
                min="1979" 
                max="2026" 
                step="0.1"
                value={year}
                onChange={(e) => {
                  setYear(parseFloat(e.target.value));
                  setIsPlaying(false);
                }}
                className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
