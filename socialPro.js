// ===============================
// SOCIAL PROJECTS PAGE - JAVASCRIPT
// Save as: social-projects.js
// ===============================

// Click handler for project grid items
const gridItems = document.querySelectorAll('.grid-item');

gridItems.forEach(item => {
  item.addEventListener('click', function() {
    const projectLink = this.getAttribute('data-project');
    // Redirect to individual project detail page
    window.location.href = projectLink;
  });
});

// Fade in animation for grid items
const gridObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }, index * 50);
      gridObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1
});

// Set initial state and observe
gridItems.forEach(item => {
  item.style.opacity = '0';
  item.style.transform = 'translateY(30px)';
  item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  gridObserver.observe(item);
});

// Navbar background on scroll
const nav = document.querySelector('.top-nav');
let lastScrollY = window.pageYOffset;

window.addEventListener('scroll', () => {
  const scrollY = window.pageYOffset;
  
  if (scrollY > 50) {
    nav.style.background = 'rgba(0, 0, 0, 0.9)';
  } else {
    nav.style.background = 'rgba(0, 0, 0, 0.5)';
  }
  
  lastScrollY = scrollY;
});

// ===============================
// STARFIELD ANIMATION (REUSABLE)
// Save as: starfield.js
// Use this same file for all your pages
// ===============================

const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d', { alpha: false });
let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;
canvas.width = canvasWidth;
canvas.height = canvasHeight;

const stars = [];
let asteroid = null;
let asteroidTimer = -180;
let animationFrameId = null;

class Star {
  constructor() { 
    this.reset(); 
  }
  
  reset() {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    this.sz = Math.random() * 0.4 + 0.01;
    this.br = Math.random() * 0.6 + 0.3;
    this.tw = Math.random() * 0.15 + 0.005;
    this.color = this.getPixieDustColor();
    this.rotation = Math.random() * Math.PI * 2;
  }
  
  getPixieDustColor() {
    const colors = [
      { r: 255, g: 255, b: 255 },
      { r: 200, g: 220, b: 255 },
      { r: 230, g: 200, b: 255 },
      { r: 255, g: 240, b: 200 }
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  update() {
    this.br += this.tw;
    if (this.br > 1 || this.br < 0.2) this.tw *= -1;
  }
  
  drawStar(x, y, size, brightness) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(this.rotation);
    
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI / 2) * i;
      const x1 = Math.cos(angle) * size;
      const y1 = Math.sin(angle) * size;
      const x2 = Math.cos(angle + Math.PI / 4) * (size * 0.3);
      const y2 = Math.sin(angle + Math.PI / 4) * (size * 0.3);
      
      if (i === 0) ctx.moveTo(x1, y1);
      else ctx.lineTo(x1, y1);
      ctx.lineTo(x2, y2);
    }
    ctx.closePath();
    
    ctx.fillStyle = `rgba(${this.color.r},${this.color.g},${this.color.b},${brightness})`;
    ctx.fill();
    
    ctx.restore();
  }
  
  draw() {
    const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.sz * 4);
    glow.addColorStop(0, `rgba(${this.color.r},${this.color.g},${this.color.b},${this.br * 0.6})`);
    glow.addColorStop(0.5, `rgba(${this.color.r},${this.color.g},${this.color.b},${this.br * 0.2})`);
    glow.addColorStop(1, `rgba(${this.color.r},${this.color.g},${this.color.b},0)`);
    
    ctx.fillStyle = glow;
    ctx.fillRect(this.x - this.sz * 4, this.y - this.sz * 4, this.sz * 8, this.sz * 8);
    
    this.drawStar(this.x, this.y, this.sz * 2, Math.max(0, Math.min(1, this.br)));
  }
}

class Asteroid {
  constructor() {
    this.reset();
  }
  
  reset() {
    const leftToRight = Math.random() < 0.5;
    const verticalPos = canvasHeight * (0.2 + Math.random() * 0.6);
    
    if (leftToRight) {
      this.x = -50;
      this.y = verticalPos;
      this.targetX = canvasWidth + 50;
      this.targetY = verticalPos + (canvasHeight * 0.3) * (Math.random() < 0.5 ? 1 : -1);
    } else {
      this.x = canvasWidth + 50;
      this.y = verticalPos;
      this.targetX = -50;
      this.targetY = verticalPos + (canvasHeight * 0.3) * (Math.random() < 0.5 ? 1 : -1);
    }
    
    this.targetY = Math.max(0, Math.min(canvasHeight, this.targetY));
    
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    this.speed = 3 + Math.random() * 2;
    this.vx = (dx / dist) * this.speed;
    this.vy = (dy / dist) * this.speed;
    
    this.size = 2 + Math.random() * 3;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.1;
    this.trail = [];
    this.shimmer = 0;
  }
  
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.rotation += this.rotationSpeed;
    this.shimmer += 0.08;
    
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 30) this.trail.shift();
    
    if (this.x < -100 || this.x > canvasWidth + 100 || 
        this.y < -100 || this.y > canvasHeight + 100) {
      return false;
    }
    return true;
  }
  
  draw() {
    this.trail.forEach((point, i) => {
      const alpha = (i / this.trail.length) * 0.5;
      const progress = i / this.trail.length;
      
      const r = 255;
      const g = Math.floor(250 - progress * 10);
      const b = Math.floor(255 - progress * 15);
      
      const glow = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, this.size * 2.5);
      glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
      glow.addColorStop(0.4, `rgba(240, 245, 255, ${alpha * 0.6})`);
      glow.addColorStop(0.7, `rgba(255, 250, 240, ${alpha * 0.3})`);
      glow.addColorStop(1, `rgba(255, 255, 255, 0)`);
      
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(point.x, point.y, this.size * 2 * (progress + 0.3), 0, Math.PI * 2);
      ctx.fill();
    });
    
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    
    const outerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 3.5);
    outerGlow.addColorStop(0, `rgba(255, 255, 255, 0.4)`);
    outerGlow.addColorStop(0.3, `rgba(245, 250, 255, 0.25)`);
    outerGlow.addColorStop(0.6, `rgba(255, 252, 245, 0.15)`);
    outerGlow.addColorStop(1, `rgba(255, 255, 255, 0)`);
    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(0, 0, this.size * 3.5, 0, Math.PI * 2);
    ctx.fill();
    
    const gradient = ctx.createRadialGradient(-this.size * 0.3, -this.size * 0.3, 0, 0, 0, this.size * 1.3);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.3, '#fafcff');
    gradient.addColorStop(0.6, '#fffef8');
    gradient.addColorStop(1, '#f0f5fa');
    
    ctx.beginPath();
    const points = 9;
    for (let i = 0; i < points; i++) {
      const angle = (Math.PI * 2 / points) * i;
      const variation = 0.75 + Math.sin(this.shimmer * 2 + i) * 0.12;
      const radius = this.size * variation;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    
    ctx.restore();
  }
}

// Initialize stars
for (let i = 0; i < 600; i++) {
  stars.push(new Star());
}

function animate() {
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  
  stars.forEach(s => { 
    s.update(); 
    s.draw(); 
  });
  
  asteroidTimer++;
  if (!asteroid && asteroidTimer > 600 + Math.random() * 600) {
    asteroid = new Asteroid();
    asteroidTimer = 560;
  }
  
  if (asteroid) {
    const stillActive = asteroid.update();
    asteroid.draw();
    if (!stillActive) {
      asteroid = null;
    }
  }
  
  animationFrameId = requestAnimationFrame(animate);
}
animate();

// Resize handler
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    stars.forEach(s => s.reset());
  }, 250);
});

// Pause when tab not visible
document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  } else {
    if (!animationFrameId) {
      animate();
    }
  }
});