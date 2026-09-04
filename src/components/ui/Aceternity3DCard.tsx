import React, { useState, useRef } from 'react';

interface CardContainerProps {
  children?: React.ReactNode;
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
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = (e.clientX - rect.left - width / 2) / 25;
    const mouseY = (e.clientY - rect.top - height / 2) / 25;
    setRotateY(mouseX);
    setRotateX(-mouseY);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div
      className={`flex items-center justify-center [perspective:1000px] ${containerClassName}`}
    >
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`relative flex items-center justify-center transition-all duration-200 ease-linear ${className}`}
        style={{
          transform: isHovered
            ? `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`
            : 'rotateY(0deg) rotateX(0deg)',
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const CardItem: React.FC<{
  as?: any;
  children: React.ReactNode;
  className?: string;
  translateZ?: number | string;
  rotateX?: number | string;
  rotateY?: number | string;
  rotateZ?: number | string;
  [key: string]: any;
}> = ({
  as: Tag = 'div',
  children,
  className = '',
  translateZ = 0,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  ...rest
}) => {
  return (
    <Tag
      className={`w-fit transition duration-200 ease-linear ${className}`}
      style={{
        transform: `translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
};
