import React, { useRef, useState, MouseEvent } from 'react';

interface CardContainerProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

export const CardContainer: React.FC<CardContainerProps> = ({
  children,
  className = '',
  containerClassName = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = ((y - centerY) / centerY) * -12; // tilt angle max 12 deg
    const rY = ((x - centerX) / centerX) * 12;

    setRotateX(rX);
    setRotateY(rY);
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.25,
    });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePos({ x: 50, y: 50, opacity: 0 });
  };

  return (
    <div
      className={`flex items-center justify-center [perspective:1000px] ${containerClassName}`}
    >
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.15s ease-out',
        }}
        className={`relative rounded-3xl transition-shadow ${className}`}
      >
        {/* Dynamic Specular Glare */}
        <div
          className="pointer-events-none absolute inset-0 z-50 rounded-3xl transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,${glarePos.opacity}), transparent 60%)`,
          }}
        />
        {children}
      </div>
    </div>
  );
};

interface CardItemProps {
  children: React.ReactNode;
  className?: string;
  translateZ?: number | string;
  translateX?: number | string;
  translateY?: number | string;
  as?: React.ElementType;
  [key: string]: any;
}

export const CardItem: React.FC<CardItemProps> = ({
  children,
  className = '',
  translateZ = 0,
  translateX = 0,
  translateY = 0,
  as: Component = 'div',
  ...rest
}) => {
  return (
    <Component
      style={{
        transform: `translateZ(${translateZ}px) translateX(${translateX}px) translateY(${translateY}px)`,
        transformStyle: 'preserve-3d',
      }}
      className={`transition-transform duration-200 ease-out ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
};
