'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import styles from './page.module.css';

interface LeafConfig {
  top: string;
  left: string;
  duration: number;
  delay: number;
}

const LEAF_CONFIGS: LeafConfig[] = [
  { top: '-8%', left: '-6%', duration: 14, delay: 0 },
  { top: '-12%', left: '3%', duration: 18, delay: 3 },
  { top: '-6%', left: '-12%', duration: 12, delay: 6.5 },
  { top: '-15%', left: '9%', duration: 20, delay: 1.5 },
  { top: '-9%', left: '-2%', duration: 16, delay: 9 },
];

export default function LandingPage() {
  const treelineRef = useRef<HTMLImageElement | null>(null);
  const treeRef = useRef<HTMLImageElement | null>(null);
  const grassRef = useRef<HTMLImageElement | null>(null);
  const leafRefs = useRef<Array<HTMLImageElement | null>>([]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    const ctx = gsap.context(() => {
      // Full-viewport-width strips: rotating them around one pivot amplifies into
      // a large lateral swing at the far edges (mechanical "shake"), so these
      // drift horizontally instead — xPercent is relative to the element's own
      // box, not the viewport, so the drift stays proportionally tiny at any size.
      if (grassRef.current) {
        gsap.set(grassRef.current, { xPercent: -0.3 });
        gsap.to(grassRef.current, {
          xPercent: 0.3,
          duration: 4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }

      if (treelineRef.current) {
        gsap.set(treelineRef.current, { xPercent: -0.2 });
        gsap.to(treelineRef.current, {
          xPercent: 0.2,
          duration: 6,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }

      // The single foreground tree is compact and narrow, not a full-width
      // strip, so rotation reads correctly here and doesn't have the same
      // edge-amplification problem.
      if (treeRef.current) {
        gsap.set(treeRef.current, { rotation: -1, transformOrigin: 'bottom center' });
        gsap.to(treeRef.current, {
          rotation: 1,
          duration: 4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }

      // Leaf particles: diagonal drift + full rotation over the whole timeline,
      // opacity fading in/out only at the very start/end so the infinite-repeat
      // reset back to the starting position is invisible.
      leafRefs.current.forEach((leaf, i) => {
        if (!leaf) return;
        const config = LEAF_CONFIGS[i];
        const fadeDuration = config.duration * 0.08;

        const tl = gsap.timeline({ repeat: -1, delay: config.delay });
        tl.set(leaf, { x: 0, y: 0, rotation: 0, opacity: 0 });
        tl.to(
          leaf,
          { x: '115vw', y: '95vh', rotation: 360, duration: config.duration, ease: 'sine.inOut' },
          0,
        );
        tl.to(leaf, { opacity: 0.8, duration: fadeDuration, ease: 'sine.inOut' }, 0);
        tl.to(
          leaf,
          { opacity: 0, duration: fadeDuration, ease: 'sine.inOut' },
          config.duration - fadeDuration,
        );
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className={styles.viewport}>
      <div className={styles.scene}>
        <img src="/sprites/sky-layer.png" alt="" className={`${styles.layer} ${styles.sky}`} />
        <img
          src="/sprites/skyline-layer.png"
          alt=""
          className={`${styles.layer} ${styles.skyline}`}
        />
        <img
          ref={treelineRef}
          src="/sprites/treeline-layer.png"
          alt=""
          className={`${styles.layer} ${styles.treeline}`}
        />
        <img
          ref={treeRef}
          src="/sprites/tree-layer.png"
          alt=""
          className={`${styles.layer} ${styles.tree}`}
        />
        <img
          src="/sprites/table-character-layer.png"
          alt=""
          className={`${styles.layer} ${styles.table}`}
        />
        <img
          ref={grassRef}
          src="/sprites/grass-layer.png"
          alt=""
          className={`${styles.layer} ${styles.grass}`}
        />

        {LEAF_CONFIGS.map((config, i) => (
          <img
            key={i}
            ref={(el) => {
              leafRefs.current[i] = el;
            }}
            src="/sprites/leaf-particle-1.png"
            alt=""
            className={styles.leaf}
            style={{ top: config.top, left: config.left }}
          />
        ))}
      </div>
    </div>
  );
}
