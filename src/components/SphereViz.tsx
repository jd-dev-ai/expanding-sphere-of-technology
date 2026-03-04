import React, { useState, useEffect, useMemo } from 'react';
import { SKILLS } from '../data';

const SCALE = 6;
const START_YEAR = 1979;

export function SphereViz({ currentYear }: { currentYear: number }) {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    let frame: number;
    const loop = () => {
      setRotation(r => r + 0.002);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);

  const sphereRadius = Math.max(0, (currentYear - START_YEAR) * SCALE);

  // Sort skills by Z so back ones render first
  const projectedSkills = useMemo(() => {
    const tilt = Math.PI / 8; // 22.5 degrees tilt
    const focalLength = 1200;

    return SKILLS.map(skill => {
      const radius = (skill.year - START_YEAR) * SCALE;
      // Spherical to Cartesian
      const x3d = radius * Math.sin(skill.phi) * Math.cos(skill.theta + rotation);
      const z3d = radius * Math.sin(skill.phi) * Math.sin(skill.theta + rotation);
      const y3d = radius * Math.cos(skill.phi);

      // Apply tilt (rotate around X axis)
      const yRotated = y3d * Math.cos(tilt) - z3d * Math.sin(tilt);
      const zRotated = y3d * Math.sin(tilt) + z3d * Math.cos(tilt);

      // Project to 2D
      const scale = focalLength / (focalLength + zRotated);
      const x2d = x3d * scale;
      const y2d = yRotated * scale;

      const isConsumed = skill.year <= currentYear;
      const isBorder = !isConsumed && skill.year <= currentYear + 5;

      return {
        ...skill,
        x: x2d,
        y: y2d,
        z: zRotated,
        scale,
        isConsumed,
        isBorder
      };
    }).sort((a, b) => b.z - a.z);
  }, [currentYear, rotation]);

  // Generate wireframe rings for the sphere
  const rings = useMemo(() => {
    const tilt = Math.PI / 8;
    const focalLength = 1200;
    const numRings = 8;
    const ringPaths = [];

    // Horizontal latitudes
    for (let i = 1; i < numRings; i++) {
      const phi = (i / numRings) * Math.PI;
      const y3d = sphereRadius * Math.cos(phi);
      const ringRadius = sphereRadius * Math.sin(phi);
      
      const points = [];
      for (let j = 0; j <= 32; j++) {
        const theta = (j / 32) * Math.PI * 2;
        const x3d = ringRadius * Math.cos(theta + rotation);
        const z3d = ringRadius * Math.sin(theta + rotation);
        
        const yRotated = y3d * Math.cos(tilt) - z3d * Math.sin(tilt);
        const zRotated = y3d * Math.sin(tilt) + z3d * Math.cos(tilt);
        
        const scale = focalLength / (focalLength + zRotated);
        points.push({ x: x3d * scale, y: yRotated * scale });
      }
      
      const d = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
      ringPaths.push(d);
    }
    return ringPaths;
  }, [sphereRadius, rotation]);

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-900 to-neutral-950">
      <svg viewBox="-400 -400 800 800" className="w-full h-full max-w-[800px] max-h-[800px]">
        <defs>
          <radialGradient id="sphere-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(6, 182, 212, 0.15)" />
            <stop offset="70%" stopColor="rgba(6, 182, 212, 0.05)" />
            <stop offset="100%" stopColor="rgba(6, 182, 212, 0)" />
          </radialGradient>
          <radialGradient id="sphere-core" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="rgba(34, 211, 238, 0.4)" />
            <stop offset="50%" stopColor="rgba(8, 145, 178, 0.6)" />
            <stop offset="100%" stopColor="rgba(22, 78, 99, 0.8)" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Outer Glow */}
        <circle cx={0} cy={0} r={sphereRadius + 40} fill="url(#sphere-glow)" />
        
        {/* Core Sphere */}
        <circle cx={0} cy={0} r={sphereRadius} fill="url(#sphere-core)" />
        
        {/* Wireframe Rings */}
        {rings.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="rgba(103, 232, 249, 0.2)" strokeWidth="1" />
        ))}

        {/* Surface Border Highlight */}
        <circle cx={0} cy={0} r={sphereRadius} fill="none" stroke="rgba(34, 211, 238, 0.8)" strokeWidth="2" filter="url(#glow)" />

        {/* Skills */}
        {projectedSkills.map(skill => {
          const opacity = skill.z < 0 ? 0.3 : 1; // Fade back points
          
          let color = '#94a3b8'; // default slate
          let textColor = '#cbd5e1';
          let dotSize = 3;
          
          if (skill.isConsumed) {
            color = '#0891b2'; // cyan-600
            textColor = '#475569'; // slate-600
            dotSize = 2;
          } else if (skill.isBorder) {
            color = '#f59e0b'; // amber-500
            textColor = '#fcd34d'; // amber-300
            dotSize = 5;
          } else {
            color = '#10b981'; // emerald-500
            textColor = '#6ee7b7'; // emerald-300
            dotSize = 4;
          }

          return (
            <g 
              key={skill.id} 
              transform={`translate(${skill.x}, ${skill.y}) scale(${skill.scale})`}
              style={{ opacity, transition: 'opacity 0.3s' }}
            >
              <circle 
                cx={0} 
                cy={0} 
                r={dotSize} 
                fill={color} 
                filter={skill.isBorder ? 'url(#glow)' : undefined}
              />
              
              {/* Only show labels for front-facing points or border points */}
              {(skill.z > -200 || skill.isBorder) && (
                <text 
                  x={8} 
                  y={4} 
                  fill={textColor} 
                  fontSize="12px" 
                  fontFamily="monospace"
                  style={{ 
                    textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                    opacity: skill.isConsumed ? 0.5 : 1
                  }}
                >
                  {skill.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
