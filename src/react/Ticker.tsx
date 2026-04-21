import React, { useEffect, useRef, useState } from 'react';
import type { TickerOptions } from '../core/types';
import { createTicker, mount, unmount } from '../vanilla/render';
import '../style.css';

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

  useEffect(() => {
    mount();

    const container = containerRef.current;
    if (!container) return;

    const content = container.querySelector<HTMLElement>('.ticker-content');
    if (!content) return;

    const wrapper = document.createElement('div');
    wrapper.classList.add('ticker-wrapper', className);
    wrapper.setAttribute('data-ticker', '');
    wrapper.setAttribute('data-duration', String(duration));
    wrapper.setAttribute('data-direction', direction);
    wrapper.setAttribute('data-pause-on-hover', pauseOnHover ? 'true' : 'false');
    wrapper.setAttribute('data-ready', 'false');
    wrapper.setAttribute('data-active', 'true');
    wrapper.style.setProperty('--ticker-duration', `${duration}s`);

    const track = document.createElement('div');
    track.classList.add('ticker-track');
    if (pauseOnHover) track.classList.add('ticker-pause-on-hover');
    track.setAttribute('data-ticker-track', '');

    const newContent = document.createElement('div');
    newContent.classList.add('ticker-content');
    newContent.setAttribute('data-ticker-content', '');

    while (content.firstChild) {
      newContent.appendChild(content.firstChild);
    }

    track.appendChild(newContent);
    wrapper.appendChild(track);

    const tickerInstance = createTicker({ duration, direction, pauseOnHover, class: className });
    tickerInstance.mount();

    setIsReady(true);

    return () => {
      tickerInstance.unmount();
    };
  }, [duration, direction, pauseOnHover, className]);

  const combinedClassName = `ticker-wrapper ${className}`.trim();

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