import React, { useEffect, useRef } from 'react';
import { APP_COLORS } from '@/lib/colors';
import { ConfettiParticle } from '@/types/interfaces';

interface CelebrationAnimationProps {
  isVisible: boolean;
}

// Puzzle piece shapes from the game
const PUZZLE_SHAPES = [
  [[true, true, true], [false, true, false], [false, true, false]],
  [[true], [true], [true], [true]],
  [[true, false], [true, false], [true, true]],
  [[true, true, false], [false, true, true]],
  [[true, true], [true, true], [true, false]],
  [[true, true], [false, true], [false, true], [false, true]],
  [[true, true, false], [false, true, false], [false, true, true]],
  [[true, true, true], [true, false, true], [false, false, false]],
  [[true, false, false], [true, false, false], [true, true, true]],
  [[true, false], [true, true], [false, true], [false, true]]
];



const CelebrationAnimation: React.FC<CelebrationAnimationProps> = ({ isVisible }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const confettiRef = useRef<ConfettiParticle[]>([]);
  const intervalRef = useRef<NodeJS.Timeout>();

  const createShapePath = (ctx: CanvasRenderingContext2D, shape: boolean[][], cellSize: number) => {
    ctx.beginPath();
    shape.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell) {
          const x = colIndex * cellSize;
          const y = rowIndex * cellSize;
          ctx.rect(x, y, cellSize, cellSize);
        }
      });
    });
  };

  const createConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const newConfetti: ConfettiParticle[] = [];
    for (let i = 0; i < 50; i++) {
      const shape = PUZZLE_SHAPES[Math.floor(Math.random() * PUZZLE_SHAPES.length)];
      newConfetti.push({
        x: Math.random() * canvas.width,
        y: -100,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 5 + 4,
        shape,
        color: APP_COLORS.celebration[Math.floor(Math.random() * APP_COLORS.celebration.length)],
        size: Math.random() * 8 + 6, // Added size property
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
        scale: Math.random() * 0.8 + 0.4,
        scaleSpeed: (Math.random() - 0.5) * 0.02,
        opacity: 1,
        angularVelocity: (Math.random() - 0.5) * 0.05,
        spiralRadius: Math.random() * 30 + 10,
        spiralAngle: Math.random() * Math.PI * 2,
        cellSize: Math.random() * 8 + 6
      });
    }
    confettiRef.current = [...confettiRef.current, ...newConfetti];
  };

  useEffect(() => {
    if (!isVisible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create initial confetti
    createConfetti();

    // Create confetti only once on win (removed interval)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      confettiRef.current = confettiRef.current.filter(particle => {
        // Update position with spiral motion
        particle.spiralAngle += particle.angularVelocity;
        particle.x += particle.vx + Math.sin(particle.spiralAngle) * particle.spiralRadius * 0.02;
        particle.y += particle.vy;
        
        // Update rotation and scale
        particle.rotation += particle.rotationSpeed;
        particle.scale += particle.scaleSpeed;
        particle.scale = Math.max(0.1, Math.min(1.2, particle.scale));
        
        // Update opacity based on scale for depth effect
        particle.opacity = Math.max(0.3, particle.scale);

        // Remove particles that are off screen
        if (particle.y > canvas.height + 100 || particle.opacity <= 0) {
          return false;
        }

        // Draw the puzzle piece shape
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);
        ctx.scale(particle.scale, particle.scale);
        ctx.globalAlpha = particle.opacity;
        
        ctx.fillStyle = particle.color;
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = 1;
        
        createShapePath(ctx, particle.shape, particle.cellSize);
        ctx.fill();
        ctx.stroke();
        
        ctx.restore();
        
        return true;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ background: 'transparent' }}
    />
  );
};

export default CelebrationAnimation;