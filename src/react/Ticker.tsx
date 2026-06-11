import React, { useEffect, useRef, useState } from 'react';
import type { TickerOptions } from '../core/types';
import { destroyTicker, initTicker } from '../vanilla/render';
import '../style.css';

export const splitClassNameTokens = (className = ''): string[] =>
  className.split(/\s+/).filter(Boolean);

export const initializeTickerRoot = (container: HTMLElement): (() => void) => {
  initTicker(container);

  return () => {
    destroyTicker(container);
  };
};

export interface TickerProps extends TickerOptions {
  children: React.ReactNode;
  className?: string;
}

export interface TickerRootProps extends TickerProps {
  as?: 'div' | 'section' | 'article' | 'nav' | 'footer' | 'header';
}

export function Root({
  children,
  className = '',
  duration = 20,
  direction = 'left',
  pauseOnHover = false,
  as: Component = 'div',
  ...props
}: TickerRootProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const combinedClassName = ['ticker-wrapper', ...splitClassNameTokens(className)].join(' ');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const cleanup = initializeTickerRoot(container);

    setIsReady(true);

    return cleanup;
  }, [duration, direction, pauseOnHover, className]);

  return (
    <Component
      ref={containerRef}
      className={combinedClassName}
      data-ticker=""
      data-duration={duration}
      data-direction={direction}
      data-pause-on-hover={pauseOnHover ? 'true' : 'false'}
      data-ready={isReady ? 'true' : 'false'}
      data-active="true"
      style={{ '--ticker-duration': `${duration}s` } as React.CSSProperties}
      {...props}
    >
      <div
        className={`ticker-track ${pauseOnHover ? 'ticker-pause-on-hover' : ''}`}
        data-ticker-track=""
      >
        <div className="ticker-content" data-ticker-content="">
          {children}
        </div>
      </div>
    </Component>
  );
}

export function Content({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`ticker-content ${className}`}>{children}</div>;
}

export const Ticker = {
  Root,
  Content,
};

export default Ticker;