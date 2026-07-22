import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook that uses Intersection Observer to detect when an element
 * enters the viewport. Returns a ref to attach to the element and a
 * boolean `isVisible` state that becomes true once the element is visible.
 *
 * Options:
 *  - threshold:   Intersection ratio (0–1). Default 0.15
 *  - rootMargin:  CSS margin around the root. Default '0px 0px -50px 0px'
 *                 (triggers slightly before element is fully in view)
 *  - once:        If true, unobserve after first trigger. Default true
 */
export function useScrollReveal(options = {}) {
  const {
    threshold = 0.15,
    rootMargin = '0px 0px -50px 0px',
    once = true,
  } = options;

  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Respect prefers-reduced-motion — immediately show
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
    // NOTE: options are plain values — OK to omit from deps for perf
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [ref, isVisible];
}
