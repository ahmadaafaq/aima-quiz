import React from 'react';

interface MovingBorderButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  borderRadius?: string;
  children: React.ReactNode;
  as?: any;
  containerClassName?: string;
  borderClassName?: string;
  duration?: number;
  className?: string;
}

export const MovingBorderButton: React.FC<MovingBorderButtonProps> = ({
  borderRadius = '1rem',
  children,
  as: Component = 'button',
  containerClassName = '',
  borderClassName = '',
  duration = 3000,
  className = '',
  ...otherProps
}) => {
  return (
    <Component
      className={`relative bg-transparent p-[1.5px] overflow-hidden text-sm font-semibold inline-flex items-center justify-center transition duration-200 cursor-pointer ${containerClassName}`}
      style={{
        borderRadius: borderRadius,
      }}
      {...otherProps}
    >
      {/* Animated gradient spinning border */}
      <div
        className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite]"
        style={{
          background: 'conic-gradient(from 90deg at 50% 50%, #38bdf8 0%, #6366f1 25%, #a855f7 50%, #10b981 75%, #38bdf8 100%)',
        }}
      />
      {/* Button content surface */}
      <span
        className={`relative z-10 w-full h-full flex items-center justify-center gap-2 px-5 py-3 rounded-[calc(${borderRadius}-1.5px)] bg-slate-900 text-white dark:bg-slate-950 font-bold backdrop-blur-xl transition-all duration-200 hover:bg-slate-800 dark:hover:bg-slate-900 ${className}`}
        style={{
          borderRadius: `calc(${borderRadius} - 1.5px)`,
        }}
      >
        {children}
      </span>
    </Component>
  );
};
