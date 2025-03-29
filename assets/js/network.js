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
  clickGlowDuration: 1500, // Time in ms to show blue highlight
  pulseDuration: 1000,
  maxParticles: 300,
  newParticleChance: 0.9, // Increased chance to create new particles
  // Path animation parameters
  pathAnimationSpeed: 0.002, // Even slower animation speed to match williamlin.io
  pathColor: 'rgba(100, 180, 255, 0.8)', // Blue path color
  pathWidth: 1.5, // Thinner path width to match williamlin.io
  pathTrailOpacity: 0.2 // Opacity for the trail part of the animation
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
    this.visited = false; // Track if particle has been visited in pathfinding
    this.active = true; // Particle is active for pathfinding
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
    if (!this.isHighlighted) {
      this.isHighlighted = true;
      this.highlightTime = config.clickGlowDuration;
      this.pulseTime = config.pulseDuration;
    }
  }

  update(mouseX, mouseY, clicking, deltaTime) {
    // Update age
    this.age++;
    
    // Update position
    this.x += this.vx;
    this.y += this.vy;

    // Bounce off walls
    if (this.x < 0 || this.x > this.canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > this.canvas.height) this.vy *= -1;

    // Reduce highlight time - ensure it actually decreases
    if (this.highlightTime > 0) {
      this.highlightTime -= deltaTime;
      if (this.highlightTime <= 0) {
        this.isHighlighted = false;
        this.highlightTime = 0;
      }
    }

    // Update pulse time
    if (this.pulseTime > 0) {
      this.pulseTime -= deltaTime;
      if (this.pulseTime <= 0) {
        this.pulseTime = 0;
      }
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
  let pathAnimations = []; // Store active path animations
  
  // Prevent runtime errors by checking if canvas exists
  if (!canvas || !ctx) {
    console.warn('Canvas or context is not available');
    return;
  }

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
          
          if (distance < config.connectionDistance) {
            particle.connected.push(otherParticle);
          }
        }
      });
    });
  }

  // Initial connections
  updateConnections();

  // Edge class for path animations - modified to use thin lines like williamlin.io
  class AnimatedEdge {
    constructor(from, to) {
      this.from = from;
      this.to = to;
      this.progress = 0;
      this.done = false;
      
      // Calculate distance for consistent animation timing
      const dx = particles[from].x - particles[to].x;
      const dy = particles[from].y - particles[to].y;
      this.distance = Math.sqrt(dx * dx + dy * dy);
    }
    
    update(deltaTime) {
      // Fixed, slow animation speed regardless of distance
      this.progress += config.pathAnimationSpeed * (deltaTime / 16);
      
      if (this.progress >= 1) {
        this.done = true;
        // Highlight destination node when reached
        particles[this.to].highlight();
        return true;
      }
      return false;
    }
    
    draw(ctx) {
      const fromParticle = particles[this.from];
      const toParticle = particles[this.to];
      
      // Draw the thin line with no animation head (just like williamlin.io)
      ctx.beginPath();
      ctx.strokeStyle = config.pathColor;
      ctx.lineWidth = config.pathWidth;
      
      // Only draw the portion of the line that has been "traveled"
      ctx.moveTo(fromParticle.x, fromParticle.y);
      
      // Calculate current animated position
      const animX = fromParticle.x + (toParticle.x - fromParticle.x) * this.progress;
      const animY = fromParticle.y + (toParticle.y - fromParticle.y) * this.progress;
      
      ctx.lineTo(animX, animY);
      ctx.stroke();
    }
  }

  // Path finder class for animating signal propagation
  class PathFinder {
    constructor(startNodeIndex) {
      this.visited = new Set(); // Keeps track of visited nodes
      this.edges = []; // Active animated edges
      this.queue = []; // Queue of nodes to visit next
      this.active = true;
      this.startTime = Date.now();
      this.completedEdges = new Set(); // Keep track of completed edges for trail effect
      
      // Start from the given node
      this.visited.add(startNodeIndex);
      this.expandFromNode(startNodeIndex);
    }
    
    expandFromNode(nodeIndex) {
      const currentParticle = particles[nodeIndex];
      
      // Find all connected particles
      particles.forEach((particle, index) => {
        // Skip if already visited
        if (this.visited.has(index) || !particle.active) return;
        
        const dx = currentParticle.x - particle.x;
        const dy = currentParticle.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // If within connection distance, add to animations
        if (distance < config.connectionDistance) {
          this.edges.push(new AnimatedEdge(nodeIndex, index));
          this.visited.add(index); // Mark as visited immediately to avoid duplicate visits
        }
      });
    }
    
    update(deltaTime) {
      // Process all active edges
      for (let i = this.edges.length - 1; i >= 0; i--) {
        const edge = this.edges[i];
        const completed = edge.update(deltaTime);
        
        if (completed) {
          // When an edge animation completes, expand from the destination node
          this.queue.push(edge.to);
          // Store completed edge for trail effect
          this.completedEdges.add(`${edge.from}-${edge.to}`);
          // Remove the completed edge from active animations
          this.edges.splice(i, 1);
        }
      }
      
      // Process any nodes in the queue
      while (this.queue.length > 0) {
        this.expandFromNode(this.queue.shift());
      }
      
      // If no more edges, this path finder is done
      const isComplete = this.edges.length === 0;
      
      // If completed, ensure we clean up properly after a shorter delay
      if (isComplete && Date.now() - this.startTime > 5000) {
        // Animation is completely done, reset all nodes to normal state
        this.visited.forEach(index => {
          if (particles[index] && particles[index].isHighlighted) {
            particles[index].highlightTime = Math.min(particles[index].highlightTime, 300);
          }
        });
        return true;
      }
      
      return false;
    }
    
    draw(ctx) {
      // Draw active animated edges
      this.edges.forEach(edge => edge.draw(ctx));
      
      // Draw completed edges with lower opacity (trail effect)
      if (this.completedEdges.size > 0 && Date.now() - this.startTime < 3000) {
        ctx.save();
        ctx.globalAlpha = config.pathTrailOpacity;
        ctx.strokeStyle = config.pathColor;
        ctx.lineWidth = config.pathWidth * 0.8;
        
        this.completedEdges.forEach(edgeKey => {
          const [fromIdx, toIdx] = edgeKey.split('-').map(Number);
          const fromParticle = particles[fromIdx];
          const toParticle = particles[toIdx];
          
          ctx.beginPath();
          ctx.moveTo(fromParticle.x, fromParticle.y);
          ctx.lineTo(toParticle.x, toParticle.y);
          ctx.stroke();
        });
        
        ctx.restore();
      }
    }
  }

  // Function to add a new particle at a specific position
  function addParticle(x, y) {
    if (particles.length < config.maxParticles && Math.random() < config.newParticleChance) {
      const newParticle = new Particle(canvas, x, y, true);
      const newIndex = particles.length;
      particles.push(newParticle);
      
      // Create a new path animation starting from this particle
      pathAnimations.push(new PathFinder(newIndex));
      
      // Update connections
      updateConnections();
      
      return newIndex;
    }
    return -1;
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

  let lastTime = 0;
  let animationFrameId = null;

  // Safer requestAnimationFrame usage
  function safeRequestAnimationFrame(callback) {
    try {
      return requestAnimationFrame(callback);
    } catch (e) {
      console.warn('Error requesting animation frame:', e);
      return setTimeout(callback, 16);
    }
  }

  // Animation loop
  function animate(currentTime) {
    try {
      // Calculate delta time
      const deltaTime = lastTime ? Math.min(currentTime - lastTime, 100) : 16;
      lastTime = currentTime;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Process any clicks in the queue
      while (clickQueue.length > 0) {
        const click = clickQueue.shift();
        addParticle(click.x, click.y);
      }

      // Draw static connections first (normal white connections)
      particles.forEach(particle => {
        particles.forEach(otherParticle => {
          if (particle === otherParticle) return;
          
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < config.connectionDistance) {
            const opacity = 1 - (distance / config.connectionDistance);
            const strokeStyle = `rgba(255, 255, 255, ${opacity * 0.15})`;
            
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = strokeStyle;
            ctx.stroke();
          }
        });
      });

      // Update and draw path animations
      for (let i = pathAnimations.length - 1; i >= 0; i--) {
        const isComplete = pathAnimations[i].update(deltaTime);
        pathAnimations[i].draw(ctx);
        
        // Remove completed animations
        if (isComplete) {
          pathAnimations.splice(i, 1);
        }
      }

      // Update and draw particles on top of connections
      particles.forEach(particle => {
        particle.update(mouseX, mouseY, clicking, deltaTime);

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

      // Continue animation loop
      animationFrameId = safeRequestAnimationFrame(animate);
    } catch (e) {
      console.error('Animation error:', e);
      // Try to recover
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      setTimeout(() => {
        lastTime = 0;
        animationFrameId = safeRequestAnimationFrame(animate);
      }, 1000);
    }
  }

  // Start animation safely
  try {
    animationFrameId = safeRequestAnimationFrame(animate);
  } catch (e) {
    console.warn('Could not start animation:', e);
  }
  
  // Safety cleanup function
  window.addEventListener('beforeunload', () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  });
}; 