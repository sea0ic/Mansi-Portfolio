// Typing effect for hero title
const textEl = document.getElementById("typing-text");
const words = ["Mansi.", "Sea."];
let wIdx = 0, cIdx = 0, isDel = false;

function typeEffect() {
  const curr = words[wIdx];
  textEl.textContent = isDel
    ? curr.substring(0, cIdx--)
    : curr.substring(0, cIdx++);

  let spd = isDel ? 100 : 150;

  if (!isDel && cIdx === curr.length + 1) {
    spd = 2000;
    isDel = true;
  } else if (isDel && cIdx === 0) {
    isDel = false;
    wIdx = (wIdx + 1) % words.length;
    spd = 500;
  }

  setTimeout(typeEffect, spd);
}

typeEffect();

// Starfield animation - Optimized for performance
const canvas = document.getElementById("starfield");
const ctx = canvas.getContext("2d", { alpha: false });

let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;

canvas.width = canvasWidth;
canvas.height = canvasHeight;

const stars = [];
let asteroid = null;
let asteroidTimer = 0;
let animationFrameId = null;
let firstAsteroidSpawned = false;
let nextAsteroidDelay = 600 + Math.random() * 600;

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

    if (this.br > 1 || this.br < 0.2) {
      this.tw *= -1;
    }
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

      if (i === 0) {
        ctx.moveTo(x1, y1);
      } else {
        ctx.lineTo(x1, y1);
      }

      ctx.lineTo(x2, y2);
    }

    ctx.closePath();

    ctx.fillStyle = `rgba(${this.color.r},${this.color.g},${this.color.b},${brightness})`;
    ctx.fill();

    ctx.restore();
  }

  draw() {
    const glow = ctx.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      this.sz * 4
    );

    glow.addColorStop(
      0,
      `rgba(${this.color.r},${this.color.g},${this.color.b},${this.br * 0.6})`
    );

    glow.addColorStop(
      0.5,
      `rgba(${this.color.r},${this.color.g},${this.color.b},${this.br * 0.2})`
    );

    glow.addColorStop(
      1,
      `rgba(${this.color.r},${this.color.g},${this.color.b},0)`
    );

    ctx.fillStyle = glow;

    ctx.fillRect(
      this.x - this.sz * 4,
      this.y - this.sz * 4,
      this.sz * 8,
      this.sz * 8
    );

    this.drawStar(
      this.x,
      this.y,
      this.sz * 2,
      Math.max(0, Math.min(1, this.br))
    );
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
      this.targetY =
        verticalPos +
        (canvasHeight * 0.3) * (Math.random() < 0.5 ? 1 : -1);
    } else {
      this.x = canvasWidth + 50;
      this.y = verticalPos;
      this.targetX = -50;
      this.targetY =
        verticalPos +
        (canvasHeight * 0.3) * (Math.random() < 0.5 ? 1 : -1);
    }

    this.targetY = Math.max(
      0,
      Math.min(canvasHeight, this.targetY)
    );

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

    this.trail.push({
      x: this.x,
      y: this.y
    });

    if (this.trail.length > 30) {
      this.trail.shift();
    }

    if (
      this.x < -100 ||
      this.x > canvasWidth + 100 ||
      this.y < -100 ||
      this.y > canvasHeight + 100
    ) {
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

      const glow = ctx.createRadialGradient(
        point.x,
        point.y,
        0,
        point.x,
        point.y,
        this.size * 2.5
      );

      glow.addColorStop(
        0,
        `rgba(${r}, ${g}, ${b}, ${alpha})`
      );

      glow.addColorStop(
        0.4,
        `rgba(240, 245, 255, ${alpha * 0.6})`
      );

      glow.addColorStop(
        0.7,
        `rgba(255, 250, 240, ${alpha * 0.3})`
      );

      glow.addColorStop(
        1,
        "rgba(255, 255, 255, 0)"
      );

      ctx.fillStyle = glow;
      ctx.beginPath();

      ctx.arc(
        point.x,
        point.y,
        this.size * 2 * (progress + 0.3),
        0,
        Math.PI * 2
      );

      ctx.fill();
    });

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    const outerGlow = ctx.createRadialGradient(
      0,
      0,
      0,
      0,
      0,
      this.size * 3.5
    );

    outerGlow.addColorStop(
      0,
      "rgba(255, 255, 255, 0.4)"
    );

    outerGlow.addColorStop(
      0.3,
      "rgba(245, 250, 255, 0.25)"
    );

    outerGlow.addColorStop(
      0.6,
      "rgba(255, 252, 245, 0.15)"
    );

    outerGlow.addColorStop(
      1,
      "rgba(255, 255, 255, 0)"
    );

    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(0, 0, this.size * 3.5, 0, Math.PI * 2);
    ctx.fill();

    const gradient = ctx.createRadialGradient(
      -this.size * 0.3,
      -this.size * 0.3,
      0,
      0,
      0,
      this.size * 1.3
    );

    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.3, "#fafcff");
    gradient.addColorStop(0.6, "#fffef8");
    gradient.addColorStop(1, "#f0f5fa");

    ctx.beginPath();

    const points = 9;

    for (let i = 0; i < points; i++) {
      const angle = (Math.PI * 2 / points) * i;
      const variation =
        0.75 + Math.sin(this.shimmer * 2 + i) * 0.12;
      const radius = this.size * variation;

      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.beginPath();

    ctx.arc(
      this.size * 0.35,
      -this.size * 0.25,
      this.size * 0.2,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle = "rgba(240, 245, 255, 0.6)";
    ctx.beginPath();

    ctx.arc(
      -this.size * 0.2,
      this.size * 0.3,
      this.size * 0.12,
      0,
      Math.PI * 2
    );

    ctx.fill();

    const shimmerValue = Math.sin(this.shimmer) * 0.5 + 0.5;
    const outlineR = Math.floor(200 + shimmerValue * 55);
    const outlineG = Math.floor(220 + shimmerValue * 35);
    const outlineB = 255;

    ctx.strokeStyle = `rgba(${outlineR}, ${outlineG}, ${outlineB}, ${0.3 + shimmerValue * 0.2})`;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.restore();
  }
}

// Initialize stars
for (let i = 0; i < 600; i++) {
  stars.push(new Star());
}

function animate() {
  ctx.fillStyle = "rgba(0,0,0,0.1)";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  stars.forEach((s) => {
    s.update();
    s.draw();
  });

  // Spawn the first meteoroid immediately.
  // Later meteoroids use the original random interval.
  if (!firstAsteroidSpawned) {
    asteroid = new Asteroid();
    firstAsteroidSpawned = true;
    asteroidTimer = 0;
  } else if (!asteroid) {
    asteroidTimer++;

    if (asteroidTimer >= nextAsteroidDelay) {
      asteroid = new Asteroid();
      asteroidTimer = 0;
      nextAsteroidDelay = 600 + Math.random() * 600;
    }
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

// Optimized resize handler with debouncing
let resizeTimeout;

window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);

  resizeTimeout = setTimeout(() => {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    stars.forEach((s) => s.reset());
  }, 250);
});

// Improved Intersection Observer
const obs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        obs.unobserve(e.target);
      }
    });
  },
  {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  }
);

// Observe fade-in elements
document
  .querySelectorAll(".fade-in-up")
  .forEach((el) => obs.observe(el));

document
  .querySelectorAll(".about-section")
  .forEach((el) => obs.observe(el));

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();

    const targetId = this.getAttribute("href");
    const target = document.querySelector(targetId);

    if (target) {
      const navbar = document.querySelector(".navbar");
      const navH = navbar ? navbar.offsetHeight : 0;

      window.scrollTo({
        top: target.offsetTop - navH,
        behavior: "smooth"
      });
    }
  });
});

// Logo click to toggle social links
const logoContainer = document.querySelector(".logo-container");
const logo = document.querySelector(".logo");

let socialLinksLocked = false;

if (logo && logoContainer) {
  logo.addEventListener("click", function (e) {
    e.stopPropagation();

    socialLinksLocked = !socialLinksLocked;

    logoContainer.classList.toggle(
      "locked",
      socialLinksLocked
    );
  });
}

// Close social links when clicking outside
document.addEventListener("click", function (e) {
  if (
    !e.target.closest(".logo-container") &&
    socialLinksLocked
  ) {
    socialLinksLocked = false;

    if (logoContainer) {
      logoContainer.classList.remove("locked");
    }
  }
});

// Dropdown menu functionality
const dropdownToggle = document.querySelector(".dropdown-toggle");

if (dropdownToggle) {
  dropdownToggle.addEventListener("click", function (e) {
    if (window.innerWidth <= 768) {
      e.preventDefault();
      this.parentElement.classList.toggle("active");
    }
  });
}

// Close dropdown when clicking outside
document.addEventListener("click", function (e) {
  if (!e.target.closest(".dropdown")) {
    const dropdown = document.querySelector(".dropdown");

    if (dropdown) {
      dropdown.classList.remove("active");
    }
  }
});

// Optimized scroll handler
const nav = document.querySelector(".navbar");
const heroName = document.querySelector(".hero-name");

let ticking = false;

function updateNavOnScroll() {
  const scrollY = window.pageYOffset;

  if (nav) {
    nav.style.background =
      scrollY > 100
        ? "rgba(0,0,0,0.9)"
        : "rgba(0,0,0,0.3)";
  }

  if (heroName) {
    heroName.style.opacity = Math.max(
      0,
      1 - scrollY / 500
    );
  }

  ticking = false;
}

window.addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(updateNavOnScroll);
    ticking = true;
  }
});

// ===============================
// MUSIC PLAYER
// ===============================
const playButton = document.getElementById("playButton");
const audioPlayer = document.getElementById("audioPlayer");
const playIcon = document.querySelector(".play-icon");
const pauseIcon = document.querySelector(".pause-icon");
const progressBar = document.getElementById("progressBar");
const progressFill = document.getElementById("progressFill");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");

let isPlaying = false;

// Play/pause toggle
if (playButton && audioPlayer) {
  playButton.addEventListener("click", function () {
    if (isPlaying) {
      audioPlayer.pause();
    } else {
      audioPlayer.play().catch((error) => {
        console.warn("Audio playback could not start:", error);
      });
    }
  });
}

// Listen to actual audio events
if (audioPlayer) {
  audioPlayer.addEventListener("play", function () {
    isPlaying = true;

    if (playIcon) playIcon.style.display = "none";
    if (pauseIcon) pauseIcon.style.display = "block";
  });

  audioPlayer.addEventListener("pause", function () {
    isPlaying = false;

    if (playIcon) playIcon.style.display = "block";
    if (pauseIcon) pauseIcon.style.display = "none";
  });
}

// Format time helper
function formatTime(seconds) {
  if (!Number.isFinite(seconds)) {
    return "0:00";
  }

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

// Throttled progress update
let progressUpdateTicking = false;

if (audioPlayer) {
  audioPlayer.addEventListener("timeupdate", function () {
    if (!progressUpdateTicking) {
      progressUpdateTicking = true;

      requestAnimationFrame(() => {
        if (
          progressFill &&
          Number.isFinite(audioPlayer.duration) &&
          audioPlayer.duration > 0
        ) {
          const progress =
            (audioPlayer.currentTime / audioPlayer.duration) * 100;

          progressFill.style.width = progress + "%";
        }

        if (currentTimeEl) {
          currentTimeEl.textContent = formatTime(
            audioPlayer.currentTime
          );
        }

        progressUpdateTicking = false;
      });
    }
  });

  // Set duration when loaded
  audioPlayer.addEventListener("loadedmetadata", function () {
    if (durationEl) {
      durationEl.textContent = formatTime(audioPlayer.duration);
    }
  });

  // Error handling for audio loading
  audioPlayer.addEventListener("error", function (e) {
    console.warn("Audio loading error:", e);

    if (currentTimeEl) currentTimeEl.textContent = "0:00";
    if (durationEl) durationEl.textContent = "0:00";
  });

  // Reset when song ends
  audioPlayer.addEventListener("ended", function () {
    isPlaying = false;

    if (playIcon) playIcon.style.display = "block";
    if (pauseIcon) pauseIcon.style.display = "none";
    if (progressFill) progressFill.style.width = "0%";
    if (currentTimeEl) currentTimeEl.textContent = "0:00";
  });
}

// Click on progress bar to seek
if (progressBar && audioPlayer) {
  progressBar.addEventListener("click", function (e) {
    if (
      !Number.isFinite(audioPlayer.duration) ||
      audioPlayer.duration <= 0
    ) {
      return;
    }

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(
      0,
      Math.min(1, clickX / rect.width)
    );

    audioPlayer.currentTime =
      percentage * audioPlayer.duration;
  });
}

// Pause animation when tab is hidden
document.addEventListener("visibilitychange", function () {
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

// ===============================
// HORIZONTAL TIMELINE
// ===============================

// Drag to scroll functionality
const timelineWrapper = document.querySelector(
  ".timeline-horizontal-wrapper"
);

if (timelineWrapper) {
  let isDown = false;
  let startX;
  let scrollLeft;

  timelineWrapper.addEventListener("mousedown", (e) => {
    isDown = true;
    startX = e.pageX - timelineWrapper.offsetLeft;
    scrollLeft = timelineWrapper.scrollLeft;
  });

  timelineWrapper.addEventListener("mouseleave", () => {
    isDown = false;
  });

  timelineWrapper.addEventListener("mouseup", () => {
    isDown = false;
  });

  timelineWrapper.addEventListener("mousemove", (e) => {
    if (!isDown) return;

    e.preventDefault();

    const x = e.pageX - timelineWrapper.offsetLeft;
    const walk = (x - startX) * 2;

    timelineWrapper.scrollLeft = scrollLeft - walk;
  });
}

// Fade in timeline items as they scroll into view
const timelineItems = document.querySelectorAll(".timeline-item-h");

const timelineObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  },
  {
    threshold: 0.3,
    root: timelineWrapper || null
  }
);

// Set initial state and observe
timelineItems.forEach((item) => {
  item.style.opacity = "0";
  item.style.transform = "translateY(20px)";
  item.style.transition =
    "opacity 0.6s ease, transform 0.6s ease";

  timelineObserver.observe(item);
});

// ===============================
// MILESTONES TITLE - SHINY HOVER EFFECT
// ===============================
const milestonesTitle = document.querySelector(
  ".milestones-section .section-title"
);

if (milestonesTitle) {
  milestonesTitle.addEventListener("mousemove", (e) => {
    const rect = milestonesTitle.getBoundingClientRect();

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    milestonesTitle.style.setProperty("--mouse-x", `${x}%`);
    milestonesTitle.style.setProperty("--mouse-y", `${y}%`);
  });

  milestonesTitle.addEventListener("mouseleave", () => {
    milestonesTitle.style.setProperty("--mouse-x", "50%");
    milestonesTitle.style.setProperty("--mouse-y", "50%");
  });
}

// Project card click functionality
document.querySelectorAll(".project-card").forEach((card) => {
  card.addEventListener("click", () => {
    const link = card.getAttribute("data-link");

    if (link) {
      window.location.href = link;
    }
  });
});