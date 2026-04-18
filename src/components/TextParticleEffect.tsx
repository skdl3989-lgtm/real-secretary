import { useEffect, useRef } from 'react';
import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext';

interface ParticleEffectProps {
  text?: string;
}

class Particle {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  size: number;
  density: number;
  friction: number;
  spring: number;
  vx: number;
  vy: number;
  isFalling: boolean;
  angle: number;
  color: string;
  canvasHeight: number;

  constructor(x: number, y: number, canvasHeight: number) {
    this.baseX = x;
    this.baseY = y;
    this.canvasHeight = canvasHeight;
    
    // Initial falling position
    this.x = x + (Math.random() * 4 - 2); 
    this.y = (Math.random() * -canvasHeight * 2.5) - 50; 
    
    this.size = Math.random() * 1.5 + 0.8; // Slightly larger for better visibility on white
    
    this.density = (Math.random() * 30) + 10;
    this.friction = Math.random() * 0.04 + 0.88;
    this.spring = Math.random() * 0.02 + 0.03;
    
    this.vx = 0;
    this.vy = Math.random() * 5 + 5;
    
    this.isFalling = true;
    this.angle = Math.random() * Math.PI * 2;
    
    // Darker, high-contrast professional colors for light background
    const colors = ['#1d4ed8', '#2563eb', '#3b82f6', '#10b981', '#6366f1'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    // Set global alpha slightly lower for trailing effect on white
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    
    if (this.isFalling) {
      ctx.ellipse(this.x, this.y, this.size * 0.6, this.size * 3.5, 0, 0, Math.PI * 2);
    } else {
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    }
    
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  update(mouseX: number | null, mouseY: number | null, mouseRadius: number, clicked: boolean) {
    if (this.isFalling) {
      this.vy += 0.8;
      if (this.vy > 25) this.vy = 25;
      
      this.y += this.vy;
      
      if (this.y >= this.baseY) {
        this.y = this.baseY;
        this.vy *= -0.3;
        this.isFalling = false;
      }
    } else {
      this.angle += 0.05;
      const targetX = this.baseX + Math.cos(this.angle) * 1.5;
      const targetY = this.baseY + Math.sin(this.angle) * 1.5;

      if (mouseX !== null && mouseY !== null) {
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouseRadius) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const force = (mouseRadius - distance) / mouseRadius;
          const direction = clicked ? -1.5 : 1; 
          
          const pushX = forceDirectionX * force * this.density * direction;
          const pushY = forceDirectionY * force * this.density * direction;
          
          this.vx -= pushX;
          this.vy -= pushY;
        } else {
          this.vx += (targetX - this.x) * this.spring;
          this.vy += (targetY - this.y) * this.spring;
        }
      } else {
        this.vx += (targetX - this.x) * this.spring;
        this.vy += (targetY - this.y) * this.spring;
      }

      this.vx *= this.friction;
      this.vy *= this.friction;
      
      this.x += this.vx;
      this.y += this.vy;
    }
  }
}

export default function TextParticleEffect({ text = "인천AI 교육비서" }: ParticleEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleArray = useRef<Particle[]>([]);
  const mouse = useRef<{ x: number | null; y: number | null; radius: number; clicked: boolean }>({
    x: null,
    y: null,
    radius: 120,
    clicked: false
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let animationId: number;
    let resizeTimer: number;

    const init = () => {
      particleArray.current = [];
      const w = window.innerWidth;
      const h = window.innerHeight;
      
      canvas.width = w;
      canvas.height = h;

      // Use pretext for layout (multiline handle)
      const fontSize = Math.min(w / 8, 100);
      const font = `900 ${fontSize}px "Pretendard"`;
      
      // We use pretext to calculate where the lines should be
      const prepared = prepareWithSegments(text, font);
      const lineHeight = fontSize * 1.2;
      const { lines } = layoutWithLines(prepared, w * 0.8, lineHeight);

      // Temporary canvas to draw text and scan pixels
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      tempCtx.fillStyle = 'white';
      tempCtx.font = font;
      tempCtx.textAlign = 'center';
      tempCtx.textBaseline = 'middle';

      const totalHeight = lines.length * lineHeight;
      const startY = (h - totalHeight) / 2 + lineHeight / 2;

      lines.forEach((line, index) => {
        tempCtx.fillText(line.text, w / 2, startY + index * lineHeight);
      });

      const textCoordinates = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
      const gap = 2;
      
      for (let y = 0; y < textCoordinates.height; y += gap) {
        for (let x = 0; x < textCoordinates.width; x += gap) {
          if (textCoordinates.data[(y * 4 * textCoordinates.width) + (x * 4) + 3] > 128) {
            particleArray.current.push(new Particle(x, y, canvas.height));
          }
        }
      }
    };

    const animate = () => {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Default composite operation is better for light backgrounds
      // lighter is only for neon effects on dark backgrounds
      
      particleArray.current.forEach(particle => {
        particle.update(mouse.current.x, mouse.current.y, mouse.current.radius, mouse.current.clicked);
        particle.draw(ctx);
      });
      animationId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      mouse.current.x = e.touches[0].clientX;
      mouse.current.y = e.touches[0].clientY;
    };

    const handleMouseDown = () => { mouse.current.clicked = true; };
    const handleMouseUp = () => { mouse.current.clicked = false; };
    const handleTouchStart = () => { mouse.current.clicked = true; };
    const handleTouchEnd = () => { 
      mouse.current.clicked = false; 
      mouse.current.x = null; 
      mouse.current.y = null; 
    };
    const handleMouseOut = () => { mouse.current.x = null; mouse.current.y = null; };

    const handleResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(init, 300);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('mouseout', handleMouseOut);
    window.addEventListener('resize', handleResize);

    // Initial setup
    document.fonts.ready.then(() => {
      setTimeout(() => {
        init();
        animate();
      }, 100);
    });

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('mouseout', handleMouseOut);
      window.removeEventListener('resize', handleResize);
    };
  }, [text]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-auto"
      style={{ background: 'transparent' }}
    />
  );
}
