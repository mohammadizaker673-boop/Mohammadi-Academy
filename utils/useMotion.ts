import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Hook: scroll-reveal via IntersectionObserver.
 * Returns a ref to attach to the element. Adds `.is-visible` when in view.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options?: { threshold?: number; rootMargin?: string; once?: boolean }
) {
  const ref = useRef<T>(null);
  const { threshold = 0.15, rootMargin = '0px 0px -60px 0px', once = true } = options || {};

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          if (once) observer.unobserve(el);
        } else if (!once) {
          el.classList.remove('is-visible');
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return ref;
}

/**
 * Hook: observe multiple children inside a container for staggered reveals.
 * Attach the returned ref to the parent container.
 * Children should have className="reveal" — they'll get `.is-visible` staggered.
 */
export function useStaggerReveal<T extends HTMLElement = HTMLDivElement>(
  options?: { threshold?: number; rootMargin?: string; staggerMs?: number }
) {
  const ref = useRef<T>(null);
  const { threshold = 0.1, rootMargin = '0px 0px -40px 0px', staggerMs = 80 } = options || {};

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const children = container.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    if (children.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = Array.from(children).indexOf(entry.target as Element);
            setTimeout(() => {
              entry.target.classList.add('is-visible');
            }, idx * staggerMs);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    children.forEach(child => observer.observe(child));
    return () => observer.disconnect();
  }, [threshold, rootMargin, staggerMs]);

  return ref;
}

/**
 * Hook: parallax scroll offset.
 * Returns a Y offset value that changes with scroll position.
 */
export function useParallax(speed: number = 0.3) {
  const [offset, setOffset] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const el = ref.current;
        if (el) {
          const rect = el.getBoundingClientRect();
          const windowH = window.innerHeight;
          // How far through the viewport the element is (0 at bottom, 1 at top)
          const progress = (windowH - rect.top) / (windowH + rect.height);
          setOffset((progress - 0.5) * speed * 100);
        }
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return { ref, offset };
}

/**
 * Hook: 3D tilt effect on mouse move over an element.
 * Returns ref + style to apply.
 */
export function useTilt3D(intensity: number = 8) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setStyle({
      transform: `perspective(800px) rotateY(${x * intensity}deg) rotateX(${-y * intensity}deg) scale(1.02)`,
      transition: 'transform 0.1s ease-out',
    });
  }, [intensity]);

  const handleMouseLeave = useCallback(() => {
    setStyle({
      transform: 'perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)',
      transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  return { ref, style };
}

/**
 * Hook: count-up animation for numbers.
 */
export function useCountUp(target: number, duration: number = 1500) {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);

  return { ref, value };
}
