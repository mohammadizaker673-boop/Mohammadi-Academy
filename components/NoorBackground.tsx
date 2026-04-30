import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  opacityDir: number;
  hue: number;
  pulse: number;
  pulseSpeed: number;
}

interface Meteor {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  life: number;
  maxLife: number;
  thickness: number;
}

const NoorBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const meteorsRef = useRef<Meteor[]>([]);
  const lastMeteorRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Create particles — white divine light specks (1.5x size)
    const count = Math.min(120, Math.floor((window.innerWidth * window.innerHeight) / 12000));
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: (Math.random() * 2.2 + 0.5) * 1.5,
        speedX: (Math.random() - 0.5) * 0.15,
        speedY: (Math.random() - 0.5) * 0.15 - 0.04,
        opacity: Math.random() * 0.6 + 0.2,
        opacityDir: Math.random() > 0.5 ? 1 : -1,
        // Pure white noor — hue 0 with 0 saturation
        hue: 0,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.006 + Math.random() * 0.012,
      });
    }
    particlesRef.current = particles;

    // Meteor / shooting star system
    const meteors: Meteor[] = [];
    meteorsRef.current = meteors;

    const spawnMeteor = () => {
      const angle = (Math.PI / 6) + Math.random() * (Math.PI / 4); // 30-75 degrees downward
      meteors.push({
        x: Math.random() * canvas.width * 1.2 - canvas.width * 0.1,
        y: -20 - Math.random() * 100,
        length: 80 + Math.random() * 120,
        speed: 4 + Math.random() * 3,
        angle,
        opacity: 0.6 + Math.random() * 0.4,
        life: 0,
        maxLife: 80 + Math.random() * 60,
        thickness: 1 + Math.random() * 1.5,
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Spawn meteors occasionally (every 3-7 seconds)
      const now = performance.now();
      if (now - lastMeteorRef.current > 3000 + Math.random() * 4000) {
        spawnMeteor();
        // Sometimes spawn 2 close together
        if (Math.random() < 0.3) {
          setTimeout(() => spawnMeteor(), 200 + Math.random() * 400);
        }
        lastMeteorRef.current = now;
      }

      // Draw meteors / shooting stars
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.life++;
        m.x += Math.cos(m.angle) * m.speed;
        m.y += Math.sin(m.angle) * m.speed;

        // Fade in then out
        const lifeRatio = m.life / m.maxLife;
        const fadeOpacity = lifeRatio < 0.1 ? lifeRatio / 0.1 : lifeRatio > 0.7 ? (1 - lifeRatio) / 0.3 : 1;
        const currentOpacity = m.opacity * fadeOpacity;

        // Tail gradient
        const tailX = m.x - Math.cos(m.angle) * m.length;
        const tailY = m.y - Math.sin(m.angle) * m.length;

        const grad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
        grad.addColorStop(0, `rgba(255, 255, 255, 0)`);
        grad.addColorStop(0.6, `rgba(200, 220, 255, ${currentOpacity * 0.3})`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${currentOpacity})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(m.x, m.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = m.thickness;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Bright head glow
        const headGrad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 4);
        headGrad.addColorStop(0, `rgba(255, 255, 255, ${currentOpacity})`);
        headGrad.addColorStop(1, `rgba(200, 220, 255, 0)`);
        ctx.beginPath();
        ctx.arc(m.x, m.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = headGrad;
        ctx.fill();

        // Remove dead meteors
        if (m.life > m.maxLife || m.x > canvas.width + 100 || m.y > canvas.height + 100) {
          meteors.splice(i, 1);
        }
      }

      for (const p of particles) {
        // Animate position
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around edges
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;

        // Pulsing glow
        p.pulse += p.pulseSpeed;
        const glowFactor = 0.5 + 0.5 * Math.sin(p.pulse);
        const currentOpacity = p.opacity * (0.4 + 0.6 * glowFactor);

        // Outer glow — pure white noor
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 8);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${currentOpacity * 0.9})`);
        gradient.addColorStop(0.25, `rgba(255, 255, 255, ${currentOpacity * 0.4})`);
        gradient.addColorStop(0.6, `rgba(220, 230, 255, ${currentOpacity * 0.1})`);
        gradient.addColorStop(1, `rgba(200, 220, 255, 0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 8, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Inner bright core — crisp white
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1]"
      style={{ opacity: 0.7 }}
      aria-hidden="true"
    />
  );
};

export default NoorBackground;
