import React from 'react';

interface InfiniteMarqueeProps {
  items: {
    name: string;
    sub: string;
    badge?: string;
    icon?: string;
  }[];
  direction?: 'left' | 'right';
  speed?: 'fast' | 'normal' | 'slow';
  pauseOnHover?: boolean;
  className?: string;
}

export const InfiniteMarquee: React.FC<InfiniteMarqueeProps> = ({
  items,
  direction = 'left',
  speed = 'normal',
  pauseOnHover = true,
  className = '',
}) => {
  const speedClass =
    speed === 'fast' ? 'duration-20' : speed === 'slow' ? 'duration-60' : 'duration-35';

  return (
    <div
      className={`relative overflow-hidden w-full [mask-image:linear-gradient(to_right,transparent,white_15%,white_85%,transparent)] ${className}`}
    >
      <div
        className={`flex min-w-full shrink-0 gap-4 py-3 w-max flex-nowrap animate-marquee ${
          direction === 'right' ? 'animate-marquee-reverse' : ''
        } ${pauseOnHover ? 'hover:[animation-play-state:paused]' : ''}`}
      >
        {items.concat(items).map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 backdrop-blur-md shadow-sm hover:shadow-md hover:border-blue-500/40 transition-all duration-200"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {item.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5 whitespace-nowrap">
                <span>{item.name}</span>
                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20">
                    {item.badge}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {item.sub}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
