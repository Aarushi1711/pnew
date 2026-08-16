'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

type RevealProps = {
  children: ReactNode;
  /** Delay before the reveal starts, in ms. Use to stagger siblings. */
  delay?: number;
  /** Direction the element travels from as it fades in. */
  from?: 'up' | 'down' | 'left' | 'right';
  className?: string;
  /** Render as a different element (e.g. "li", "article"). Defaults to "div". */
  as?: 'div' | 'li' | 'article' | 'section';
  /** Optional id, useful for anchor navigation. */
  id?: string;
};

const offsetMap: Record<NonNullable<RevealProps['from']>, string> = {
  up: 'translate3d(0, 24px, 0)',
  down: 'translate3d(0, -24px, 0)',
  left: 'translate3d(24px, 0, 0)',
  right: 'translate3d(-24px, 0, 0)',
};

export function Reveal({ children, delay = 0, from = 'up', className, as = 'div', id }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      queueMicrotask(() => setVisible(true));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const Tag = as as 'div';

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      id={id}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translate3d(0, 0, 0)' : offsetMap[from],
        transition: 'opacity 640ms cubic-bezier(0.22, 1, 0.36, 1), transform 640ms cubic-bezier(0.22, 1, 0.36, 1)',
        transitionDelay: `${delay}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </Tag>
  );
}
