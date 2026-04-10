import React from 'react';

const ConfettiBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-60">
      {[...Array(10)].map((_, i) => (
        <span
          key={i}
          className="absolute block rounded-[4px] opacity-[0.18]"
          style={{
            width: `${Math.random() * 10 + 8}px`,
            height: `${Math.random() * 10 + 8}px`,
            left: `${i * 10 + 5}%`,
            backgroundColor: `var(--${['pink', 'yellow', 'blue', 'green', 'purple', 'orange'][i % 6]})`,
            animation: `cf ${5 + Math.random() * 5}s linear infinite`,
            animationDelay: `${Math.random() * 4}s`,
            borderRadius: i % 3 === 0 ? '50%' : '4px'
          }}
        />
      ))}
    </div>
  );
};

export default ConfettiBackground;
