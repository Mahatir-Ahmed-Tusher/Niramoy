'use client';

import { useEffect, useState } from 'react';

interface Cube {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  delay: number;
  opacity: number;
}

interface ShootingStar {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
}

export default function HealthAnimations() {
  const [cubes, setCubes] = useState<Cube[]>([]);
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);

  useEffect(() => {
    // Generate falling cubes
    const generateCubes = () => {
      const newCubes: Cube[] = [];
      for (let i = 0; i < 20; i++) {
        newCubes.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 15 + 5,
          speed: Math.random() * 3 + 2,
          delay: Math.random() * 5,
          opacity: Math.random() * 0.4 + 0.1,
        });
      }
      setCubes(newCubes);
    };

    // Generate shooting stars
    const generateShootingStars = () => {
      const newShootingStars: ShootingStar[] = [];
      for (let i = 0; i < 8; i++) {
        newShootingStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          delay: Math.random() * 8,
          duration: Math.random() * 3 + 2,
        });
      }
      setShootingStars(newShootingStars);
    };

    generateCubes();
    generateShootingStars();
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Falling cubes */}
      {cubes.map((cube) => (
        <div
          key={cube.id}
          className="absolute animate-fall"
          style={{
            left: `${cube.x}%`,
            top: `${cube.y}%`,
            width: `${cube.size}px`,
            height: `${cube.size}px`,
            animationDelay: `${cube.delay}s`,
            animationDuration: `${cube.speed * 10}s`,
            opacity: cube.opacity,
          }}
        >
          <div className="w-full h-full bg-white/30 rounded-sm transform rotate-45"></div>
        </div>
      ))}
      
      {/* Shooting stars */}
      {shootingStars.map((star) => (
        <div
          key={star.id}
          className="absolute animate-shoot"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        >
          <div className="relative">
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="absolute top-0 left-0 w-20 h-0.5 bg-gradient-to-r from-white/60 to-transparent transform -rotate-45 origin-left"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
