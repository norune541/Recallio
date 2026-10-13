const squares = Array.from({ length: 100 }, (_, i) => {
  const random = (seed: number) => {
    const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
    return value - Math.floor(value);
  };

  const x = random(i + 1);
  const y = random(i + 101);

  const colors = ['#6366F1', '#818CF8', '#4F46E5', '#A5B4FC', '#7C83F5'];

  return {
    id: i,
    size: Math.round(3 + random(i + 201) * 8),
    left: `${x * 100}%`,
    top: `${y * 100}%`,
    opacity: 0.08 + random(i + 301) * 0.18,
    color: colors[Math.floor(random(i + 401) * colors.length)],
  };
});

export function AuthBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ backgroundColor: '#ffffff' }}
    >
      {squares.map((square) => (
        <span
          key={square.id}
          className="absolute block rounded-[1px]"
          style={{
            width: square.size,
            height: square.size,
            left: square.left,
            top: square.top,
            opacity: square.opacity,
            backgroundColor: square.color,
          }}
        />
      ))}
    </div>
  );
}
