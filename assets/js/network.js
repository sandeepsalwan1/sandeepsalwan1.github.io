// Network animation configuration
const config = {
  particleCount: 120,
  connectionDistance: 150,
  particleSpeed: 1.2, // Increased speed for more linear movement
  particleSize: 3,
  highlightedParticleSize: 6,
  lineColor: 'rgba(255, 255, 255, 0.15)',
  particleColor: 'rgba(255, 255, 255, 0.6)',
  highlightedParticleColor: 'rgba(100, 180, 255, 0.8)',
  clickRadius: 200,
  clickForce: 80,
  mouseInteraction: true,
  hoverEffect: true,
  clickGlowDuration: 1000, // Duration for highlight time
  pulseDuration: 800,
  maxParticles: 300,
  newParticleChance: 0.9, // Increased chance to create new particles
  // Path animation parameters
  pathAnimationSpeed: 0.6, // Fixed animation speed
  pathColor: 'rgba(100, 180, 255, 0.8)', // Blue path color
  pathWidth: 1.5, // Thinner path width
  pathLineLength: 0.2, // Length of the moving line segment (0.2 = 20% of total distance)
  pathTrailOpacity: 0.0, // No trail (williamlin.io doesn't use trails)
  movementFactor: 0.2, // Reduced for straighter paths
  directionChangeChance: 0.002 // Much lower chance of random direction change
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
    this.directionTimer = Math.random() * 100; // Timer for direction changes
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
    
    // Create initial straight-line velocities with consistent speed
    const angle = Math.random() * Math.PI * 2;
    this.vx = Math.cos(angle) * config.particleSpeed;
    this.vy = Math.sin(angle) * config.particleSpeed;
    
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

  unhighlight() {
    this.isHighlighted = false;
    this.highlightTime = 0;
    this.pulseTime = 0;
  }

  update(mouseX, mouseY, clicking, deltaTime) {
    // Update age
    this.age++;
    
    // Greatly reduced random direction changes for straighter paths
    this.directionTimer -= deltaTime;
    if (this.directionTimer <= 0 || Math.random() < config.directionChangeChance) {
      // Apply a very slight change to direction
      this.vx += (Math.random() - 0.5) * config.particleSpeed * config.movementFactor;
      this.vy += (Math.random() - 0.5) * config.particleSpeed * config.movementFactor;
      
      // Normalize velocity to maintain constant speed for straight paths
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed !== 0) {
        this.vx = (this.vx / speed) * config.particleSpeed;
        this.vy = (this.vy / speed) * config.particleSpeed;
      }
      
      // Set a longer timer for more sustained straight movement
      this.directionTimer = Math.random() * 300 + 200;
    }
    
    // Update position
    this.x += this.vx;
    this.y += this.vy;

    // Clean bounce off walls with minimal randomness
    if (this.x < 0 || this.x > this.canvas.width) {
      this.vx = -this.vx;
      // Ensure particle is inside bounds
      if (this.x < 0) this.x = 1;
      if (this.x > this.canvas.width) this.x = this.canvas.width - 1;
    }
    if (this.y < 0 || this.y > this.canvas.height) {
      this.vy = -this.vy;
      // Ensure particle is inside bounds
      if (this.y < 0) this.y = 1;
      if (this.y > this.canvas.height) this.y = this.canvas.height - 1;
    }

    // Reduce highlight time - ensure it actually decreases
    if (this.highlightTime > 0) {
      this.highlightTime -= deltaTime;
      if (this.highlightTime <= 0) {
        this.isHighlighted = false;
        this.highlightTime = 0;
        // Explicitly reset color to non-highlighted state
        this.color = config.particleColor;
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

      // Click effect - but don't change speed
      if (clicking && distance < config.clickRadius) {
        this.highlight();
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

  // Initialize particles with a better distribution of straight-line motion
  function initializeMovementPatterns() {
    // Create particles moving in various directions covering 360 degrees
    const angleStep = (Math.PI * 2) / particles.length;
    
    particles.forEach((particle, index) => {
      // Assign a specific angle to each particle for better distribution
      const angle = angleStep * index;
      particle.vx = Math.cos(angle) * config.particleSpeed;
      particle.vy = Math.sin(angle) * config.particleSpeed;
      
      // Ensure constant speed
      const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
      if (speed !== 0) {
        particle.vx = (particle.vx / speed) * config.particleSpeed;
        particle.vy = (particle.vy / speed) * config.particleSpeed;
      }
    });
  }
  
  // Call the initialization
  initializeMovementPatterns();

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

  // Edge class for path animations - completely revamped to match williamlin.io
  class AnimatedEdge {
    constructor(from, to) {
      this.from = from;
      this.to = to;
      this.progress = 0;
      this.done = false;
      
      // Calculate distance for animation timing
      const dx = particles[from].x - particles[to].x;
      const dy = particles[from].y - particles[to].y;
      this.distance = Math.sqrt(dx * dx + dy * dy);
      
      // Highlight the source node immediately
      particles[from].highlight();
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
      
      // Calculate the current position of the moving line segment
      const lineLength = config.pathLineLength; // Length of the animated line segment
      
      // Calculate start and end points of the visible segment
      let startPoint = this.progress - lineLength;
      let endPoint = this.progress;
      
      // Only draw if the line segment is visible
      if (startPoint < 0) startPoint = 0;
      if (endPoint > 1) endPoint = 1;
      
      // Only draw if there's a visible segment
      if (endPoint > startPoint) {
        const startX = fromParticle.x + (toParticle.x - fromParticle.x) * startPoint;
        const startY = fromParticle.y + (toParticle.y - fromParticle.y) * startPoint;
        const endX = fromParticle.x + (toParticle.x - fromParticle.x) * endPoint;
        const endY = fromParticle.y + (toParticle.y - fromParticle.y) * endPoint;
        
        // Draw the line segment
        ctx.beginPath();
        ctx.strokeStyle = config.pathColor;
        ctx.lineWidth = config.pathWidth;
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
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
      this.completedEdges = new Set(); // Keep track of completed edges
      this.cleanupScheduled = false;
      
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
      
      // If no edges were created, ensure this node gets unhighlighted eventually
      if (this.edges.length === 0 && !this.cleanupScheduled) {
        this.cleanupScheduled = true;
        setTimeout(() => {
          this.cleanupHighlights();
        }, 1500);
      }
    }
    
    cleanupHighlights() {
      // Force unhighlight all visited nodes
      this.visited.forEach(index => {
        if (particles[index]) {
          particles[index].unhighlight();
          // Explicitly reset color to ensure it's not stuck blue
          particles[index].color = config.particleColor;
          particles[index].isHighlighted = false;
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
          // Track completed edges
          this.completedEdges.add(`${edge.from}-${edge.to}`);
          // Remove the completed edge from active animations
          this.edges.splice(i, 1);
        }
      }
      
      // Process any nodes in the queue
      while (this.queue.length > 0) {
        this.expandFromNode(this.queue.shift());
      }
      
      // Check if all animations are done
      const isComplete = this.edges.length === 0;
      
      // If completed and enough time has passed, schedule cleanup
      if (isComplete && !this.cleanupScheduled && Date.now() - this.startTime > 2000) {
        this.cleanupScheduled = true;
        setTimeout(() => {
          this.cleanupHighlights();
        }, 1000);
        return true;
      }
      
      return false;
    }
    
    draw(ctx) {
      // Draw only active animated edges
      this.edges.forEach(edge => edge.draw(ctx));
    }
  }

  // Function to add a new particle at a specific position
  function addParticle(x, y) {
    if (particles.length < config.maxParticles && Math.random() < config.newParticleChance) {
      const newParticle = new Particle(canvas, x, y, true);
      const newIndex = particles.length;
      particles.push(newParticle);
      
      // Create a new path animation starting from this particle
      const pathFinder = new PathFinder(newIndex);
      pathAnimations.push(pathFinder);
      
      // Update connections
      updateConnections();
      
      // Ensure the highlight is temporary
      setTimeout(() => {
        if (newParticle && newParticle.isHighlighted) {
          newParticle.unhighlight();
          newParticle.color = config.particleColor;
        }
      }, config.clickGlowDuration + 500);
      
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
      
      // Clear canvas completely for crisp lines (no trails for straighter movement)
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Process any clicks in the queue
      while (clickQueue.length > 0) {
        const click = clickQueue.shift();
        addParticle(click.x, click.y);
      }

      // Apply GPU acceleration if available
      if (typeof ctx.imageSmoothingEnabled !== 'undefined') {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
      }

      // First update all particles' positions
      particles.forEach(particle => {
        particle.update(mouseX, mouseY, clicking, deltaTime);
      });

      // Then draw all connections to avoid flicker
      particles.forEach(particle => {
        particles.forEach(otherParticle => {
          if (particle === otherParticle) return;
          
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < config.connectionDistance) {
            // Always draw connections, even for highlighted nodes
            const opacity = 1 - (distance / config.connectionDistance);
            const strokeStyle = `rgba(255, 255, 255, ${opacity * 0.15})`;
            
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = strokeStyle;
            ctx.lineWidth = 1;
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

      // Finally draw all particles on top
      particles.forEach(particle => {
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

      // Update connections periodically but not every frame (performance optimization)
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