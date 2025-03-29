// Network animation configuration
const config = {
  particleCount: 120,
  connectionDistance: 150,
  particleSpeed: 0.4,
  particleSize: 3,
  highlightedParticleSize: 6,
  lineColor: 'rgba(255, 255, 255, 0.15)',
  particleColor: 'rgba(255, 255, 255, 0.6)',
  highlightedParticleColor: 'rgba(100, 180, 255, 0.8)',
  clickRadius: 200,
  clickForce: 80,
  mouseInteraction: true,
  hoverEffect: true,
  clickGlowDuration: 1500,
  pulseDuration: 1000,
  maxParticles: 300,
  newParticleChance: 0.7
};

// Particle class to manage individual nodes
class Particle {
  constructor(canvas, x, y, isNew = false) {
    this.canvas = canvas;
    if (isNew && x !== undefined && y !== undefined) {
      this.initAtPosition(x, y);
    } else {
      this.reset();
    }
    this.isHighlighted = false;
    this.highlightTime = 0;
    this.connected = [];
    this.pulseTime = 0;
    this.age = 0;
    this.isNew = isNew;
  }

  initAtPosition(x, y) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * config.particleSpeed * 2;
    this.vy = (Math.random() - 0.5) * config.particleSpeed * 2;
    this.size = config.particleSize * 1.5;
    this.color = config.highlightedParticleColor;
    this.originalSize = config.particleSize;
    this.opacity = 0.8;
    this.isHighlighted = true;
    this.highlightTime = config.clickGlowDuration;
  }

  reset() {
    this.x = Math.random() * this.canvas.width;
    this.y = Math.random() * this.canvas.height;
    this.vx = (Math.random() - 0.5) * config.particleSpeed;
    this.vy = (Math.random() - 0.5) * config.particleSpeed;
    this.size = config.particleSize;
    this.color = config.particleColor;
    this.originalSize = config.particleSize;
    this.opacity = 0.6 + Math.random() * 0.4;
    this.isHighlighted = false;
    this.highlightTime = 0;
  }

  highlight() {
    this.isHighlighted = true;
    this.highlightTime = config.clickGlowDuration;
    this.pulseTime = config.pulseDuration;
  }

  update(mouseX, mouseY, clicking) {
    // Update age
    this.age++;
    
    // Update position
    this.x += this.vx;
    this.y += this.vy;

    // Bounce off walls
    if (this.x < 0 || this.x > this.canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > this.canvas.height) this.vy *= -1;

    // Reduce highlight time
    if (this.highlightTime > 0) {
      this.highlightTime -= 16;
      if (this.highlightTime <= 0) {
        this.isHighlighted = false;
      }
    }

    // Update pulse time
    if (this.pulseTime > 0) {
      this.pulseTime -= 16;
    }

    // Mouse interaction
    if (config.mouseInteraction && mouseX !== null && mouseY !== null) {
      const dx = this.x - mouseX;
      const dy = this.y - mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Hover effect
      if (config.hoverEffect && distance < config.connectionDistance) {
        this.size = this.originalSize * (1 + (config.connectionDistance - distance) / config.connectionDistance);
      } else if (!this.isHighlighted) {
        this.size = this.originalSize;
      }

      // Click effect
      if (clicking && distance < config.clickRadius) {
        this.highlight();
        
        this.connected.forEach(particle => {
          if (Math.random() > 0.5) {
            particle.highlight();
          }
        });
        
        const force = (config.clickRadius - distance) / config.clickRadius * config.clickForce;
        const angle = Math.atan2(dy, dx);
        this.vx += Math.cos(angle) * force * 0.01;
        this.vy += Math.sin(angle) * force * 0.01;
      }
    }
  }

  getCurrentSize() {
    if (this.isHighlighted) {
      if (this.pulseTime > 0) {
        const pulseProgress = this.pulseTime / config.pulseDuration;
        const pulseFactor = Math.sin(pulseProgress * Math.PI) * 1.5;
        return config.highlightedParticleSize * (1 + pulseFactor * 0.3);
      }
      return config.highlightedParticleSize;
    }
    return this.size;
  }

  getCurrentColor() {
    if (this.isHighlighted) {
      return config.highlightedParticleColor;
    }
    return this.color;
  }
}

// Main animation function
window.startNetworkAnimation = function(canvas) {
  const ctx = canvas.getContext('2d');
  const particles = [];
  let mouseX = null;
  let mouseY = null;
  let clicking = false;
  let clickQueue = [];

  // Create particles
  for (let i = 0; i < config.particleCount; i++) {
    particles.push(new Particle(canvas));
  }

  // Function to update connections between particles
  function updateConnections() {
    particles.forEach(particle => {
      particle.connected = [];
      particles.forEach(otherParticle => {
        if (particle !== otherParticle) {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < config.connectionDistance * 1.5) {
            particle.connected.push(otherParticle);
          }
        }
      });
    });
  }

  // Initial connections
  updateConnections();

  // Function to add a new particle at a specific position
  function addParticle(x, y) {
    if (particles.length < config.maxParticles && Math.random() < config.newParticleChance) {
      const newParticle = new Particle(canvas, x, y, true);
      particles.push(newParticle);
      
      // Update connections for this new particle
      particles.forEach(otherParticle => {
        if (newParticle !== otherParticle) {
          const dx = newParticle.x - otherParticle.x;
          const dy = newParticle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < config.connectionDistance * 1.5) {
            newParticle.connected.push(otherParticle);
            otherParticle.connected.push(newParticle);
          }
        }
      });
      
      // Highlight a few random connected particles
      newParticle.connected.forEach(connectedParticle => {
        if (Math.random() > 0.7) {
          connectedParticle.highlight();
        }
      });
    }
  }

  // Mouse event listeners
  canvas.addEventListener('mousemove', function(e) {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });

  canvas.addEventListener('mouseout', function() {
    mouseX = null;
    mouseY = null;
  });

  canvas.addEventListener('mousedown', function(e) {
    clicking = true;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    clickQueue.push({x, y});
  });

  canvas.addEventListener('mouseup', function() {
    clicking = false;
  });

  // Touch events for mobile
  canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    mouseX = e.touches[0].clientX - rect.left;
    mouseY = e.touches[0].clientY - rect.top;
    clicking = true;
    clickQueue.push({x: mouseX, y: mouseY});
  });

  canvas.addEventListener('touchmove', function(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    mouseX = e.touches[0].clientX - rect.left;
    mouseY = e.touches[0].clientY - rect.top;
  });

  canvas.addEventListener('touchend', function() {
    clicking = false;
  });

  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Process any clicks in the queue
    while (clickQueue.length > 0) {
      const click = clickQueue.shift();
      addParticle(click.x, click.y);
    }

    // Draw connections first
    particles.forEach(particle => {
      particles.forEach(otherParticle => {
        if (particle === otherParticle) return;
        
        const dx = particle.x - otherParticle.x;
        const dy = particle.y - otherParticle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < config.connectionDistance) {
          const opacity = 1 - (distance / config.connectionDistance);
          let strokeStyle = `rgba(255, 255, 255, ${opacity * 0.15})`;
          
          if (particle.isHighlighted && otherParticle.isHighlighted) {
            strokeStyle = `rgba(100, 180, 255, ${opacity * 0.5})`;
          } else if (particle.isHighlighted || otherParticle.isHighlighted) {
            strokeStyle = `rgba(100, 180, 255, ${opacity * 0.3})`;
          }
          
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(otherParticle.x, otherParticle.y);
          ctx.strokeStyle = strokeStyle;
          ctx.stroke();
        }
      });
    });

    // Update and draw particles on top of connections
    particles.forEach(particle => {
      particle.update(mouseX, mouseY, clicking);

      const currentSize = particle.getCurrentSize();
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, currentSize, 0, Math.PI * 2);
      ctx.fillStyle = particle.getCurrentColor();
      
      if (particle.isHighlighted) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(100, 180, 255, 0.8)';
      } else {
        ctx.shadowBlur = 0;
      }
      
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Update connections periodically
    if (Math.random() < 0.01) {
      updateConnections();
    }

    requestAnimationFrame(animate);
  }

  animate();
}; 