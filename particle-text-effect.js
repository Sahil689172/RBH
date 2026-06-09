/**
 * Particle text effect — vanilla JS port
 * Particles assemble into text, cycling through phrases with gold palette.
 */

(function (global) {
  'use strict';

  const GOLD = { r: 212, g: 175, b: 55 };

  function randomGoldColor() {
    return {
      r: Math.round(184 + Math.random() * 48),
      g: Math.round(140 + Math.random() * 55),
      b: Math.round(28 + Math.random() * 45),
    };
  }

  function generateRandomPos(x, y, mag, w, h) {
    const randomX = Math.random() * w;
    const randomY = Math.random() * h;
    const direction = { x: randomX - x, y: randomY - y };
    const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y) || 1;
    return {
      x: x + (direction.x / magnitude) * mag,
      y: y + (direction.y / magnitude) * mag,
    };
  }

  class Particle {
    constructor() {
      this.pos = { x: 0, y: 0 };
      this.vel = { x: 0, y: 0 };
      this.acc = { x: 0, y: 0 };
      this.target = { x: 0, y: 0 };
      this.closeEnoughTarget = 100;
      this.maxSpeed = 1;
      this.maxForce = 0.1;
      this.particleSize = 10;
      this.isKilled = false;
      this.startColor = { r: 0, g: 0, b: 0 };
      this.targetColor = { r: 0, g: 0, b: 0 };
      this.colorWeight = 0;
      this.colorBlendRate = 0.01;
    }

    move() {
      let proximityMult = 1;
      const distance = Math.hypot(this.pos.x - this.target.x, this.pos.y - this.target.y);

      if (distance < this.closeEnoughTarget) {
        proximityMult = distance / this.closeEnoughTarget;
      }

      const towardsTarget = {
        x: this.target.x - this.pos.x,
        y: this.target.y - this.pos.y,
      };

      const magnitude = Math.hypot(towardsTarget.x, towardsTarget.y) || 1;
      towardsTarget.x = (towardsTarget.x / magnitude) * this.maxSpeed * proximityMult;
      towardsTarget.y = (towardsTarget.y / magnitude) * this.maxSpeed * proximityMult;

      const steer = {
        x: towardsTarget.x - this.vel.x,
        y: towardsTarget.y - this.vel.y,
      };

      const steerMagnitude = Math.hypot(steer.x, steer.y) || 1;
      steer.x = (steer.x / steerMagnitude) * this.maxForce;
      steer.y = (steer.y / steerMagnitude) * this.maxForce;

      this.acc.x += steer.x;
      this.acc.y += steer.y;
      this.vel.x += this.acc.x;
      this.vel.y += this.acc.y;
      this.pos.x += this.vel.x;
      this.pos.y += this.vel.y;
      this.acc.x = 0;
      this.acc.y = 0;
    }

    draw(ctx, drawAsPoints) {
      if (this.colorWeight < 1) {
        this.colorWeight = Math.min(this.colorWeight + this.colorBlendRate, 1);
      }

      const currentColor = {
        r: Math.round(this.startColor.r + (this.targetColor.r - this.startColor.r) * this.colorWeight),
        g: Math.round(this.startColor.g + (this.targetColor.g - this.startColor.g) * this.colorWeight),
        b: Math.round(this.startColor.b + (this.targetColor.b - this.startColor.b) * this.colorWeight),
      };

      ctx.fillStyle = `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`;

      const pointSize = this.pointSize || 3;

      if (drawAsPoints) {
        ctx.fillRect(this.pos.x, this.pos.y, pointSize, pointSize);
      } else {
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.particleSize / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    kill(width, height) {
      if (this.isKilled) return;

      const randomPos = generateRandomPos(width / 2, height / 2, (width + height) / 2, width, height);
      this.target.x = randomPos.x;
      this.target.y = randomPos.y;

      this.startColor = {
        r: this.startColor.r + (this.targetColor.r - this.startColor.r) * this.colorWeight,
        g: this.startColor.g + (this.targetColor.g - this.startColor.g) * this.colorWeight,
        b: this.startColor.b + (this.targetColor.b - this.startColor.b) * this.colorWeight,
      };
      this.targetColor = { r: 5, g: 5, b: 5 };
      this.colorWeight = 0;
      this.isKilled = true;
    }
  }

  /**
   * @param {HTMLCanvasElement} canvas
   * @param {object} options
   */
  function initParticleTextEffect(canvas, options) {
    const {
      words = [],
      wordConfigs = [],
      pixelSteps = 5,
      drawAsPoints = true,
      pointSize = 3,
      wordInterval = 240,
      showAllAtOnce = false,
      lineGap = 18,
      settleDelay = 2000,
      settleThreshold = 0.82,
      holdAfterSettle = 1000,
      minAnimateTime = 1500,
      speedMin = 1.5,
      speedMax = 3.5,
      persistParticles = false,
      onWordChange = null,
      onSettled = null,
      onRebuild = null,
      onLayout = null,
      bgFade = 'rgba(5, 5, 5, 0.14)',
    } = options;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return { destroy: () => {} };
    }

    const ctx = canvas.getContext('2d');
    const particles = [];
    let frameCount = 0;
    let wordIndex = 0;
    let animationId = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let settled = false;
    let buildTime = 0;
    let settleTimer = null;
    let holdTimer = null;
    let inHold = false;
    let lastLayout = null;

    function getConfig(index) {
      if (wordConfigs[index]) return wordConfigs[index];
      return {
        text: words[index] || '',
        fontWeight: '500',
        fontSize: 64,
        fontFamily: "'Cormorant Garamond', Georgia, serif",
      };
    }

    function fitFontSize(offscreenCtx, text, config, maxW) {
      let size = config.fontSize;
      const minSize = config.minFontSize || 14;
      const family = config.fontFamily;
      const weight = config.fontWeight;

      while (size > minSize) {
        offscreenCtx.font = `${weight} ${size}px ${family}`;
        if (offscreenCtx.measureText(text).width <= maxW * 0.92) break;
        size -= 2;
      }
      return size;
    }

    function assignParticleTarget(particle, x, y, newColor, particleIndex) {
      if (particleIndex !== undefined && particleIndex < particles.length) {
        particle = particles[particleIndex];
        particle.isKilled = false;
      } else {
        particle = new Particle();
        const randomPos = generateRandomPos(width / 2, height / 2, (width + height) / 2, width, height);
        particle.pos.x = randomPos.x;
        particle.pos.y = randomPos.y;
        particle.maxSpeed = Math.random() * (speedMax - speedMin) + speedMin;
        particle.maxForce = particle.maxSpeed * 0.04;
        particle.particleSize = Math.random() * 8 + 8;
        particle.colorBlendRate = Math.random() * 0.014 + 0.0012;
        particle.pointSize = pointSize;
        particles.push(particle);
      }

      particle.pointSize = pointSize;
      particle.startColor = {
        r: particle.startColor.r + (particle.targetColor.r - particle.startColor.r) * particle.colorWeight,
        g: particle.startColor.g + (particle.targetColor.g - particle.startColor.g) * particle.colorWeight,
        b: particle.startColor.b + (particle.targetColor.b - particle.startColor.b) * particle.colorWeight,
      };
      particle.targetColor = newColor;
      particle.colorWeight = 0;
      particle.target.x = x;
      particle.target.y = y;
      return particle;
    }

    function samplePixels(pixels, newColor, startParticleIndex) {
      let particleIndex = startParticleIndex;
      const coordsIndexes = [];

      for (let i = 0; i < pixels.length; i += pixelSteps * 4) {
        coordsIndexes.push(i);
      }

      for (let i = coordsIndexes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [coordsIndexes[i], coordsIndexes[j]] = [coordsIndexes[j], coordsIndexes[i]];
      }

      for (const pixelIndex of coordsIndexes) {
        if (pixels[pixelIndex + 3] <= 0) continue;

        const x = (pixelIndex / 4) % width;
        const y = Math.floor(pixelIndex / 4 / width);

        if (particleIndex < particles.length) {
          assignParticleTarget(particles[particleIndex], x, y, newColor, particleIndex);
        } else {
          assignParticleTarget(null, x, y, newColor);
        }
        particleIndex++;
      }

      return particleIndex;
    }

    function buildParticles() {
      if (showAllAtOnce && (wordConfigs.length || words.length)) {
        const configs = wordConfigs.length ? wordConfigs : words.map((text) => ({ text }));
        const measureCanvas = document.createElement('canvas');
        const measureCtx = measureCanvas.getContext('2d');

        const lines = configs.map((config) => {
          const fontSize = fitFontSize(measureCtx, config.text, config, width);
          return { config, fontSize, lineHeight: fontSize * 1.3 };
        });

        const totalHeight =
          lines.reduce((sum, line) => sum + line.lineHeight, 0) + lineGap * Math.max(lines.length - 1, 0);

        const offscreen = document.createElement('canvas');
        offscreen.width = width;
        offscreen.height = height;
        const offCtx = offscreen.getContext('2d');

        let blockY = (height - totalHeight) / 2;
        let particleIndex = 0;
        const layoutLines = [];

        lines.forEach((line) => {
          const { config, fontSize, lineHeight } = line;
          const centerY = blockY + lineHeight / 2;

          layoutLines.push({
            text: config.text,
            fontSize,
            lineHeight,
            centerY,
            fontWeight: config.fontWeight || '500',
            fontFamily: config.fontFamily || "'Cormorant Garamond', Georgia, serif",
            maxWidth: width * 0.92,
          });

          offCtx.clearRect(0, 0, width, height);
          offCtx.fillStyle = 'white';
          offCtx.textAlign = 'center';
          offCtx.textBaseline = 'middle';
          offCtx.font = `${config.fontWeight || '500'} ${fontSize}px ${config.fontFamily || "'Cormorant Garamond', Georgia, serif"}`;
          offCtx.fillText(config.text, width / 2, centerY);

          const imageData = offCtx.getImageData(0, 0, width, height);
          particleIndex = samplePixels(
            imageData.data,
            config.particleColor || randomGoldColor(),
            particleIndex
          );

          blockY += lineHeight + lineGap;
        });

        for (let i = particleIndex; i < particles.length; i++) {
          particles[i].kill(width, height);
        }

        lastLayout = { width, height, lineGap, lines: layoutLines };

        if (typeof onLayout === 'function') {
          onLayout(lastLayout);
        }

        if (typeof onWordChange === 'function') {
          onWordChange(configs.map((c) => c.text).join(' · '), -1);
        }
        if (!persistParticles) scheduleSettle();
        return;
      }

      nextWord(wordIndex);
      if (!persistParticles) scheduleSettle();
    }

    function areParticlesSettled() {
      const active = particles.filter((p) => !p.isKilled);
      if (active.length < 8) return false;

      let close = 0;
      for (const p of active) {
        if (Math.hypot(p.pos.x - p.target.x, p.pos.y - p.target.y) < 5) close++;
      }
      return close / active.length >= settleThreshold;
    }

    function triggerSettle() {
      if (settled) return;
      settled = true;
      inHold = false;
      clearTimeout(settleTimer);
      clearTimeout(holdTimer);
      cancelAnimationFrame(animationId);

      if (typeof onSettled === 'function') {
        onSettled(lastLayout);
      }
    }

    function beginHoldPause() {
      if (settled || inHold) return;
      inHold = true;
      clearTimeout(settleTimer);
      holdTimer = setTimeout(triggerSettle, holdAfterSettle);
    }

    function checkAnimationComplete() {
      if (settled || inHold) return;
      if (performance.now() - buildTime >= minAnimateTime && areParticlesSettled()) {
        beginHoldPause();
      }
    }

    function scheduleSettle() {
      settled = false;
      inHold = false;
      buildTime = performance.now();
      clearTimeout(settleTimer);
      clearTimeout(holdTimer);
      settleTimer = setTimeout(beginHoldPause, settleDelay);
    }

    function nextWord(index) {
      const config = getConfig(index);
      const text = config.text;
      if (!text) return;

      const offscreen = document.createElement('canvas');
      offscreen.width = width;
      offscreen.height = height;
      const offCtx = offscreen.getContext('2d');

      const fontSize = fitFontSize(offCtx, text, config, width);
      offCtx.fillStyle = 'white';
      offCtx.font = `${config.fontWeight} ${fontSize}px ${config.fontFamily}`;
      offCtx.textAlign = 'center';
      offCtx.textBaseline = 'middle';
      offCtx.fillText(text, width / 2, height / 2);

      const imageData = offCtx.getImageData(0, 0, width, height);
      const newColor = config.particleColor || randomGoldColor();
      const particleCount = samplePixels(imageData.data, newColor, 0);

      for (let i = particleCount; i < particles.length; i++) {
        particles[i].kill(width, height);
      }

      if (typeof onWordChange === 'function') {
        onWordChange(text, index);
      }
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(Math.floor(rect.width), 320);
      height = Math.max(Math.floor(rect.height), 160);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      settled = false;
      inHold = false;
      clearTimeout(settleTimer);
      clearTimeout(holdTimer);
      canvas.style.opacity = '';
      canvas.style.visibility = '';

      if (typeof onRebuild === 'function') {
        onRebuild();
      }

      buildParticles();
      cancelAnimationFrame(animationId);
      animationId = requestAnimationFrame(animate);
    }

    function animate() {
      ctx.fillStyle = bgFade;
      ctx.fillRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.move();
        particle.draw(ctx, drawAsPoints);

        if (particle.isKilled) {
          if (
            particle.pos.x < 0 ||
            particle.pos.x > width ||
            particle.pos.y < 0 ||
            particle.pos.y > height
          ) {
            particles.splice(i, 1);
          }
        }
      }

      if (!showAllAtOnce) {
        frameCount++;
        const total = wordConfigs.length || words.length;
        if (total > 1 && frameCount % wordInterval === 0) {
          wordIndex = (wordIndex + 1) % total;
          nextWord(wordIndex);
        }
      }

      if (persistParticles || !settled) {
        if (!persistParticles) checkAnimationComplete();
        animationId = requestAnimationFrame(animate);
      }
    }

    resize();
    animationId = requestAnimationFrame(animate);

    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    };

    window.addEventListener('resize', onResize);

    return {
      destroy() {
        clearTimeout(settleTimer);
        clearTimeout(holdTimer);
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', onResize);
        particles.length = 0;
      },
    };
  }

  global.initParticleTextEffect = initParticleTextEffect;
  global.ParticleTextGold = GOLD;
})(typeof window !== 'undefined' ? window : globalThis);
