import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface SlidingSquaresLoaderProps {
  size?: number;
  color?: string;
  speed?: number;
}

const positions = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 1, y: 1 },
  { x: 0, y: 1 },
];

const colorMixes = ['100%', '80%', '60%'];

interface LoaderState {
  squares: number[];
  empty: number;
}

export function SlidingSquaresLoader({
  size = 48,
  color = '#6366F1',
  speed = 190,
}: SlidingSquaresLoaderProps) {
  const [state, setState] = useState<LoaderState>({
    squares: [0, 1, 2],
    empty: 3,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setState((current) => {
        const previousPosition = (current.empty + 3) % 4;
        const squareIndex = current.squares.indexOf(previousPosition);

        if (squareIndex === -1) {
          return current;
        }

        const squares = [...current.squares];
        squares[squareIndex] = current.empty;

        return {
          squares,
          empty: previousPosition,
        };
      });
    }, speed);

    return () => clearInterval(interval);
  }, [speed]);

  return (
    <div
      role="status"
      aria-label="Loading"
      className="relative"
      style={{
        width: size,
        height: size,
      }}
    >
      {state.squares.map((positionIndex, squareIndex) => {
        const position = positions[positionIndex];

        const coordinates = {
          left: `${position.x * 50}%`,
          top: `${position.y * 50}%`,
        };

        return (
          <motion.span
            key={squareIndex}
            className="absolute block rounded-xs"
            style={{
              width: '40%',
              height: '40%',
              backgroundColor: `color-mix(in srgb, ${color} ${colorMixes[squareIndex]}, white)`,
            }}
            initial={coordinates}
            animate={coordinates}
            transition={{
              duration: (speed / 1000) * 0.85,
              ease: 'easeInOut',
            }}
          />
        );
      })}
    </div>
  );
}
