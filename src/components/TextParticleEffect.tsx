import { useEffect, useRef } from 'react';
import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext';

interface ParticleEffectProps {
  text?: string;
  subtitle?: string;
}

class CharParticle {
  char: string;
  font: string;
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  friction: number;
  spring: number;
  isFalling: boolean;
  color: string;
  density: number;
  canvasHeight: number;

  constructor(char: string, font: string, x: number, y: number, color: string, canvasHeight: number) {
    this.char = char;
    this.font = font;
    this.baseX = x;
    this.baseY = y;
    this.canvasHeight = canvasHeight;
    this.color = color;

    // "진짜 비처럼" - No horizontal scattering, exact target X, randomly high up
    this.x = x;
    this.y = (Math.random() * -canvasHeight * 1.5) - 50;

    this.density = (Math.random() * 20) + 15;
    
    // Higher friction for horizontal (vx) and lower for vertical (vy) later to prevent swaying
    this.friction = 0.88;
    this.spring = 0.08;
    
    this.vx = 0; // Pure vertical drop
    this.vy = Math.random() * 8 + 5;
    
    this.isFalling = true;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.font = this.font;
    ctx.fillStyle = this.color;
    
    const isSettled = !this.isFalling && Math.abs(this.vx) < 0.1 && Math.abs(this.vy) < 0.1;
    const drawX = isSettled ? this.baseX : this.x;
    const drawY = isSettled ? this.baseY : this.y;

    ctx.fillText(this.char, drawX, drawY);
  }

  update(mouseX: number | null, mouseY: number | null, mouseRadius: number, clicked: boolean) {
    if (this.isFalling) {
      this.vy += 0.6; // gravity
      if (this.vy > 30) this.vy = 30; // terminal velocity
      
      this.y += this.vy;
      // Force x to stay exactly on target during fall (비처럼 내리게)
      this.x = this.baseX;
      
      // "통통 튀는 것 정도는 좋아" - Pleasant bounce
      if (this.y >= this.baseY) {
        this.y = this.baseY;
        this.vy *= -0.4; // 40% bounce energy
        
        // Stop falling when bounce settles
        if (Math.abs(this.vy) < 1.0) {
          this.isFalling = false;
          this.vy = 0;
        }
      }
    } else {
      let hoverForce = false;

      if (mouseX !== null && mouseY !== null) {
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        
        if (Math.abs(dx) < mouseRadius && Math.abs(dy) < mouseRadius) {
          const distanceSq = dx * dx + dy * dy;
          
          if (distanceSq < mouseRadius * mouseRadius) {
            hoverForce = true;
            const distance = Math.sqrt(distanceSq);
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (mouseRadius - distance) / mouseRadius;
            const direction = clicked ? -2 : 1.2; 
            
            const pushX = forceDirectionX * force * this.density * direction;
            const pushY = forceDirectionY * force * this.density * direction;
            
            this.vx -= pushX;
            this.vy -= pushY;
          }
        }
      } 
      
      if (!hoverForce) {
        // Tighter spring for X to eliminate swaying, normal spring for Y to allow hovering bounce
        this.vx += (this.baseX - this.x) * (this.spring * 1.5);
        this.vy += (this.baseY - this.y) * this.spring;
      }

      // Kill horizontal velocity much faster to prevent side-to-side pendulum sway
      this.vx *= 0.75; 
      this.vy *= this.friction;
      
      this.x += this.vx;
      this.y += this.vy;
    }
  }
}

export default function TextParticleEffect({ text = "인천AI 교육비서", subtitle = "" }: ParticleEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleArray = useRef<CharParticle[]>([]);
  const mouse = useRef<{ x: number | null; y: number | null; radius: number; clicked: boolean }>({
    x: null,
    y: null,
    radius: 120,
    clicked: false
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // We do NOT need willReadFrequently anymore because there is no getImageData loop! Extreme performance gain.
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let resizeTimer: number;

    const init = () => {
      particleArray.current = [];
      const w = window.innerWidth;
      const h = window.innerHeight;
      
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      
      ctx.setTransform(1, 0, 0, 1, 0, 0); 
      ctx.scale(dpr, dpr);

      // Pretext scaling
      const fontSize = Math.min(w / 8, 110);
      const font = `900 ${fontSize}px "Pretendard", sans-serif`;
      
      const titlePrepared = prepareWithSegments(text, font);
      const titleLineHeight = fontSize * 1.1;
      const titleLayout = layoutWithLines(titlePrepared, w * 0.9, titleLineHeight);

      const subtitleFontSize = Math.min(w / 28, 26);
      const subtitleFont = `600 ${subtitleFontSize}px "Pretendard", sans-serif`;
      const subtitlePrepared = prepareWithSegments(subtitle, subtitleFont);
      const subtitleLineHeight = subtitleFontSize * 1.6;
      const subtitleLayout = layoutWithLines(subtitlePrepared, w * 0.8, subtitleLineHeight);

      // We only measure using the context
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const titleTotalHeight = titleLayout.lines.length * titleLineHeight;
      const subtitleTotalHeight = subtitle ? subtitleLayout.lines.length * subtitleLineHeight : 0;
      const gapBetween = subtitle ? 60 : 0;
      
      const totalCombinedHeight = titleTotalHeight + gapBetween + subtitleTotalHeight;
      let currentY = (h - totalCombinedHeight) / 2 + titleLineHeight / 2 - 40;

      // Extract coordinates for exact characters
      ctx.font = font;
      titleLayout.lines.forEach((line) => {
        const fullWidth = ctx.measureText(line.text).width;
        const startX = (w - fullWidth) / 2;
        
        for (let i = 0; i < line.text.length; i++) {
          const char = line.text[i];
          if (char.trim() !== '') {
            const prefixWidth = ctx.measureText(line.text.substring(0, i)).width;
            const charWidth = ctx.measureText(char).width;
            const targetX = startX + prefixWidth + (charWidth / 2);
            particleArray.current.push(new CharParticle(char, font, targetX, currentY, '#0f172a', h));
          }
        }
        currentY += titleLineHeight;
      });

      if (subtitle) {
        currentY += gapBetween - titleLineHeight / 2 - subtitleLineHeight / 2;
        ctx.font = subtitleFont;
        
        subtitleLayout.lines.forEach((line) => {
          const fullWidth = ctx.measureText(line.text).width;
          const startX = (w - fullWidth) / 2;
          
          for (let i = 0; i < line.text.length; i++) {
            const char = line.text[i];
            if (char.trim() !== '') {
              const prefixWidth = ctx.measureText(line.text.substring(0, i)).width;
              const charWidth = ctx.measureText(char).width;
              const targetX = startX + prefixWidth + (charWidth / 2);
              
              // Apply brand color only to the specific combination
              const hlString = "인천 AI 교육비서";
              const hlIndex = line.text.indexOf(hlString);
              let color = '#64748b'; // standard slate-500
              if (hlIndex !== -1 && i >= hlIndex && i < hlIndex + hlString.length) {
                color = '#0284c7'; // brand color
              }
              
              particleArray.current.push(new CharParticle(char, subtitleFont, targetX, currentY, color, h));
            }
          }
          currentY += subtitleLineHeight;
        });
      }
    };

    const animate = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);
      
      // Ensure text rendering alignment is maintained per frame
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      particleArray.current.forEach(particle => {
        particle.update(mouse.current.x, mouse.current.y, mouse.current.radius, mouse.current.clicked);
        particle.draw(ctx);
      });
      animationId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY + window.scrollY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      mouse.current.x = e.touches[0].clientX;
      mouse.current.y = e.touches[0].clientY + window.scrollY;
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
  }, [text, subtitle]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-auto"
      style={{ background: 'transparent' }}
    />
  );
}
