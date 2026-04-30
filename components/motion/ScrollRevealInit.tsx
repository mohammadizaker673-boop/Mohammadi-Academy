import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Global scroll-reveal observer.
 * Watches all elements with .reveal, .reveal-left, .reveal-right, .reveal-scale
 * and toggles .is-visible when they enter the viewport.
 * Re-scans on route change.
 */
const ScrollRevealInit = () => {
  const { pathname } = useLocation();
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Clean up previous observer
    observerRef.current?.disconnect();

    // Small delay to let new DOM render after route change
    const timer = setTimeout(() => {
      const selector = '.reveal, .reveal-left, .reveal-right, .reveal-scale';
      const elements = document.querySelectorAll(selector);

      if (elements.length === 0) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
      );

      observerRef.current = observer;

      elements.forEach(el => {
        if (!el.classList.contains('is-visible')) {
          observer.observe(el);
        }
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      observerRef.current?.disconnect();
    };
  }, [pathname]);

  return null;
};

export default ScrollRevealInit;
