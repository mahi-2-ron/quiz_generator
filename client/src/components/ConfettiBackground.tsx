import React, { useMemo } from 'react';

/** Colors cycling for the confetti pieces */
const CONFETTI_COLORS = ['pink', 'yellow', 'blue', 'green', 'purple', 'orange'] as const;
const PIECE_COUNT = 10;

interface ConfettiPiece {
  width: number;
  height: number;
  left: string;
  color: string;
  duration: number;
  delay: number;
  isCircle: boolean;
}

/** Stable confetti configuration — computed once, not on every render */
const generatePieces = (): ConfettiPiece[] =>
  Array.from({ length: PIECE_COUNT }, (_, i) => ({
    width: Math.random() * 10 + 8,
    height: Math.random() * 10 + 8,
    left: `${i * 10 + 5}%`,
    color: `var(--${CONFETTI_COLORS[i % CONFETTI_COLORS.length]})`,
    duration: 5 + Math.random() * 5,
    delay: Math.random() * 4,
    isCircle: i % 3 === 0,
  }));

const ConfettiBackground: React.FC = () => {
  // useMemo ensures the random values are stable across re-renders while
  // still being calculated once per mount (no recalculation on parent updates).
  const pieces = useMemo(generatePieces, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-60"
    >
      {pieces.map((piece, i) => (
        <span
          key={i}
          className="absolute block opacity-[0.18]"
          style={{
            width: `${piece.width}px`,
            height: `${piece.height}px`,
            left: piece.left,
            backgroundColor: piece.color,
            animation: `cf ${piece.duration}s linear infinite`,
            animationDelay: `${piece.delay}s`,
            borderRadius: piece.isCircle ? '50%' : '4px',
          }}
        />
      ))}
    </div>
  );
};

export default ConfettiBackground;
