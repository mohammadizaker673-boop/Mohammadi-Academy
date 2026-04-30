import React from 'react';
import { useReveal, useStaggerReveal, useParallax } from '../../utils/useMotion';

/* ── Scroll Reveal Wrapper ──────────────────────────────── */
interface RevealProps {
  children: React.ReactNode;
  direction?: 'up' | 'left' | 'right' | 'scale';
  delay?: number;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const Reveal: React.FC<RevealProps> = ({ children, direction = 'up', delay = 0, className = '', as: Tag = 'div' }) => {
  const revealClass = direction === 'left' ? 'reveal-left' : direction === 'right' ? 'reveal-right' : direction === 'scale' ? 'reveal-scale' : 'reveal';
  const ref = useReveal<HTMLDivElement>();

  return (
    // @ts-ignore
    <Tag ref={ref} className={`${revealClass} ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </Tag>
  );
};

/* ── Stagger Container ──────────────────────────────────── */
interface StaggerProps {
  children: React.ReactNode;
  className?: string;
  staggerMs?: number;
}

export const StaggerContainer: React.FC<StaggerProps> = ({ children, className = '', staggerMs = 80 }) => {
  const ref = useStaggerReveal<HTMLDivElement>({ staggerMs });
  return <div ref={ref} className={className}>{children}</div>;
};

/* ── Parallax Layer ─────────────────────────────────────── */
interface ParallaxProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

export const ParallaxLayer: React.FC<ParallaxProps> = ({ children, speed = 0.3, className = '' }) => {
  const { ref, offset } = useParallax(speed);
  return (
    <div ref={ref} className={className} style={{ transform: `translateY(${offset}px)`, willChange: 'transform' }}>
      {children}
    </div>
  );
};

/* ── Floating Depth Orbs (decorative) ───────────────────── */
interface DepthOrbsProps {
  count?: number;
  colors?: string[];
}

export const DepthOrbs: React.FC<DepthOrbsProps> = ({
  count = 3,
  colors = ['rgba(59,130,246,0.12)', 'rgba(245,158,11,0.08)', 'rgba(139,92,246,0.1)']
}) => {
  // Stabilize colors reference to prevent re-creating orbs every render
  const colorsKey = colors.join(',');
  const orbs = React.useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      color: colors[i % colors.length],
      size: 200 + Math.random() * 300,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      delay: i * 2,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, colorsKey]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {orbs.map(orb => (
        <div
          key={orb.id}
          className="depth-orb"
          style={{
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            animationDelay: `${orb.delay}s`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  );
};

/* ── Animated Gradient Border Card ──────────────────────── */
interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

export const GlowCard: React.FC<GlowCardProps> = ({ children, className = '', glowColor = 'rgba(59,130,246,0.15)' }) => {
  return (
    <div className={`relative group ${className}`}>
      <div
        className="absolute -inset-[1px] rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"
        style={{ background: `linear-gradient(135deg, ${glowColor}, transparent, ${glowColor})` }}
      />
      <div className="relative bg-white/5 border border-white/10 rounded-[inherit] overflow-hidden">
        {children}
      </div>
    </div>
  );
};

/* ── Shimmer Loading Placeholder ────────────────────────── */
export const ShimmerBlock: React.FC<{ className?: string }> = ({ className = 'h-4 w-full' }) => (
  <div className={`animate-shimmer rounded ${className}`} style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 100%)', backgroundSize: '200% 100%' }} />
);

/* ── Decorative Orbit Ring ──────────────────────────────── */
export const OrbitRing: React.FC<{ size?: number; className?: string }> = ({ size = 300, className = '' }) => (
  <div className={`absolute pointer-events-none ${className}`} style={{ width: size, height: size }} aria-hidden="true">
    <div className="absolute inset-0 rounded-full border border-white/[0.04] animate-spin-slow" />
    <div className="absolute inset-4 rounded-full border border-white/[0.03]" style={{ animationDirection: 'reverse', animationDuration: '40s' }} />
    <div className="absolute w-2 h-2 rounded-full bg-primary-400/40 animate-orbit" style={{ top: '50%', left: '50%' }} />
    <div className="absolute w-1.5 h-1.5 rounded-full bg-accent-400/30 animate-orbit-rev" style={{ top: '50%', left: '50%' }} />
  </div>
);
