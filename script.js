/* ==========================================================================
   Modern Portfolio Interactive Logic - script.js
   ========================================================================== */

// EmailJS Credentials - Fill these in to receive email notifications directly to your Gmail
const EMAILJS_PUBLIC_KEY = "9Wdk1euxmBq8NlxAH";
const EMAILJS_SERVICE_ID = "service_cb6ozwh";
const EMAILJS_TEMPLATE_ID = "template_dcki41g";

document.addEventListener('DOMContentLoaded', () => {
  
  // Initialize EmailJS
  if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }
  
  // Update current year in footer
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* --------------------------------------------------------------------------
     1. Theme Switcher (Dark/Light Mode)
     -------------------------------------------------------------------------- */
  const themeToggleBtn = document.getElementById('theme-toggle');
  const currentTheme = localStorage.getItem('theme');

  // Set default theme (Light mode default or check system preferred)
  if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
  } else {
    // Optional: Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  }

  themeToggleBtn.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme');
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
      showToast('☀️ Light mode enabled!');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      showToast('🌙 Dark mode enabled!');
    }
  });

  /* --------------------------------------------------------------------------
     2. Header Scroll Styling
     -------------------------------------------------------------------------- */
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  /* --------------------------------------------------------------------------
     3. Mobile Menu Toggle
     -------------------------------------------------------------------------- */
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
  });

  // Close menu when a link is clicked
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !menuToggle.contains(e.target) && navMenu.classList.contains('open')) {
      navMenu.classList.remove('open');
    }
  });

  /* --------------------------------------------------------------------------
     4. Portfolio Filter System
     -------------------------------------------------------------------------- */
  const filterButtons = document.querySelectorAll('.filter-btn');
  const portfolioCards = document.querySelectorAll('.portfolio-card');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons
      filterButtons.forEach(btn => btn.classList.remove('active'));
      // Add active class to clicked button
      button.classList.add('active');

      const filterValue = button.getAttribute('data-filter');

      portfolioCards.forEach(card => {
        const category = card.getAttribute('data-category');
        
        // Hide with scale & opacity transition
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        if (filterValue === 'all' || category === filterValue) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });

  /* --------------------------------------------------------------------------
     5. Scroll-driven Active Navigation Highlight
     -------------------------------------------------------------------------- */
  const sections = document.querySelectorAll('section');
  
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px', // triggers when section occupies main window area
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));

  /* --------------------------------------------------------------------------
     6. Contact Form EmailJS Submission & Mailto Fallback
     -------------------------------------------------------------------------- */
  const contactForm = document.getElementById('contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const formData = new FormData(contactForm);
      const name = formData.get('name');
      const email = formData.get('email');
      const message = formData.get('message');

      // Check if EmailJS is properly configured
      if (EMAILJS_PUBLIC_KEY && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
        showToast('📨 Sending message...');
        
        emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, contactForm, EMAILJS_PUBLIC_KEY)
          .then(() => {
            showToast('🚀 Message sent successfully!', 'success');
            contactForm.reset();
          })
          .catch((error) => {
            console.error('EmailJS Error:', error);
            const errorText = error?.text || error?.message || 'Check credentials';
            showToast(`⚠️ Send failed: ${errorText}`, 'default');
            // Slight delay before opening fallback to let user read the error
            setTimeout(() => {
              triggerMailtoFallback(name, email, message);
            }, 2000);
          });
      } else {
        // Fallback to mailto link immediately
        showToast('✉️ Opening email client...');
        triggerMailtoFallback(name, email, message);
        contactForm.reset();
      }
    });
  }

  function triggerMailtoFallback(name, email, message) {
    const emailRecipient = 'anandamirtharaj.vsb@gmail.com';
    const subject = encodeURIComponent('New Contact Message from Portfolio');
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
    window.location.href = `mailto:${emailRecipient}?subject=${subject}&body=${body}`;
  }

  /* --------------------------------------------------------------------------
     7. Toast Notification Utility
     -------------------------------------------------------------------------- */
  function showToast(message, type = 'default') {
    const toastContainer = document.getElementById('toast-container');
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'success' ? 'toast-success' : ''}`;
    
    // Setup Icon
    const iconSpan = document.createElement('span');
    iconSpan.textContent = type === 'success' ? '✅' : '🔔';
    
    // Setup Message
    const textSpan = document.createElement('span');
    textSpan.textContent = message;
    
    toast.appendChild(iconSpan);
    toast.appendChild(textSpan);
    toastContainer.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);
    
    // Remove toast after 4 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 400);
    }, 4000);
  }

  /* --------------------------------------------------------------------------
     8. Interactive Skills Graph (Physics Simulation)
     -------------------------------------------------------------------------- */
  const graphContainer = document.getElementById('skills-graph-container');
  if (graphContainer) {
    const nodes = Array.from(graphContainer.querySelectorAll('.skill-node'));
    let containerWidth = graphContainer.clientWidth;
    let containerHeight = graphContainer.clientHeight;
    
    // Dynamically retrieve node radius based on CSS layout (fallback to 65)
    const getNodeRadius = () => {
      if (nodes.length > 0) {
        const offsetW = nodes[0].offsetWidth;
        if (offsetW > 0) return offsetW / 2;
      }
      return 65;
    };
    
    let currentRadius = getNodeRadius();
    let radiusInitialized = false;

    const nodeState = nodes.map((nodeEl, idx) => {
      // Grid positioning layout for initial spacing based on viewport width
      const cols = containerWidth > 768 ? 4 : (containerWidth > 480 ? 3 : 2);
      const r = idx % cols;
      const c = Math.floor(idx / cols);
      
      const x = currentRadius + r * ((containerWidth - 2 * currentRadius) / (cols - 1 || 1)) + (Math.random() - 0.5) * 15;
      const y = currentRadius + c * ((containerHeight - 2 * currentRadius) / 2) + (Math.random() - 0.5) * 15;

      return {
        element: nodeEl,
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 1.6,
        vy: (Math.random() - 0.5) * 1.6,
        radius: currentRadius,
        mass: 1,
        isDragging: false
      };
    });

    let activeNode = null;
    let dragOffset = { x: 0, y: 0 };
    let lastMousePos = { x: 0, y: 0 };

    // Update dimensions on resize
    window.addEventListener('resize', () => {
      containerWidth = graphContainer.clientWidth;
      containerHeight = graphContainer.clientHeight;
      currentRadius = getNodeRadius();
      nodeState.forEach(node => {
        node.radius = currentRadius;
        // Clamp bounds immediately to prevent flying off screen
        node.x = Math.max(node.radius, Math.min(containerWidth - node.radius, node.x));
        node.y = Math.max(node.radius, Math.min(containerHeight - node.radius, node.y));
      });
    });

    // Touch and mouse handlers
    nodes.forEach((nodeEl, idx) => {
      const state = nodeState[idx];

      const startDrag = (clientX, clientY) => {
        state.isDragging = true;
        activeNode = state;
        const rect = graphContainer.getBoundingClientRect();
        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;
        dragOffset.x = state.x - mouseX;
        dragOffset.y = state.y - mouseY;
        lastMousePos.x = mouseX;
        lastMousePos.y = mouseY;
        state.vx = 0;
        state.vy = 0;
      };

      nodeEl.addEventListener('mousedown', (e) => {
        e.preventDefault();
        startDrag(e.clientX, e.clientY);
      });

      nodeEl.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
          startDrag(e.touches[0].clientX, e.touches[0].clientY);
        }
      }, { passive: true });
    });

    const moveDrag = (clientX, clientY) => {
      if (activeNode) {
        const rect = graphContainer.getBoundingClientRect();
        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;
        
        activeNode.x = mouseX + dragOffset.x;
        activeNode.y = mouseY + dragOffset.y;

        // Bounded boundaries
        activeNode.x = Math.max(activeNode.radius, Math.min(containerWidth - activeNode.radius, activeNode.x));
        activeNode.y = Math.max(activeNode.radius, Math.min(containerHeight - activeNode.radius, activeNode.y));

        // Track user throwing velocity
        activeNode.vx = mouseX - lastMousePos.x;
        activeNode.vy = mouseY - lastMousePos.y;

        lastMousePos.x = mouseX;
        lastMousePos.y = mouseY;
      }
    };

    window.addEventListener('mousemove', (e) => {
      moveDrag(e.clientX, e.clientY);
    });

    window.addEventListener('touchmove', (e) => {
      if (activeNode && e.touches.length > 0) {
        moveDrag(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: false });

    const endDrag = () => {
      if (activeNode) {
        activeNode.isDragging = false;
        // Cap physical release velocity
        activeNode.vx = Math.max(-10, Math.min(10, activeNode.vx * 0.8));
        activeNode.vy = Math.max(-10, Math.min(10, activeNode.vy * 0.8));
        activeNode = null;
      }
    };

    window.addEventListener('mouseup', endDrag);
    window.addEventListener('touchend', endDrag);

    // Collision handler
    function resolveCollisions() {
      for (let i = 0; i < nodeState.length; i++) {
        const n1 = nodeState[i];
        for (let j = i + 1; j < nodeState.length; j++) {
          const n2 = nodeState[j];

          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = n1.radius + n2.radius;

          if (dist < minDist) {
            const overlap = minDist - dist;
            const nx = dx / (dist || 1);
            const ny = dy / (dist || 1);

            // Separate overlapping balls
            if (!n1.isDragging && !n2.isDragging) {
              n1.x -= nx * (overlap * 0.5);
              n1.y -= ny * (overlap * 0.5);
              n2.x += nx * (overlap * 0.5);
              n2.y += ny * (overlap * 0.5);
            } else if (n1.isDragging && !n2.isDragging) {
              n2.x += nx * overlap;
              n2.y += ny * overlap;
            } else if (!n1.isDragging && n2.isDragging) {
              n1.x -= nx * overlap;
              n1.y -= ny * overlap;
            }

            // Relative velocities
            const rvx = n2.vx - n1.vx;
            const rvy = n2.vy - n1.vy;
            const velAlongNormal = rvx * nx + rvy * ny;

            if (velAlongNormal < 0) {
              const restitution = 0.7; // bounce level
              let impulse = -(1 + restitution) * velAlongNormal;
              impulse /= (1 / n1.mass + 1 / n2.mass);

              const ix = impulse * nx;
              const iy = impulse * ny;

              if (!n1.isDragging) {
                n1.vx -= ix / n1.mass;
                n1.vy -= iy / n1.mass;
              }
              if (!n2.isDragging) {
                n2.vx += ix / n2.mass;
                n2.vy += iy / n2.mass;
              }
            }
          }
        }
      }
    }

    // Animation execution loops
    function updatePhysics() {
      // Lazy initialize computed radius once elements are fully rendered/measured
      if (!radiusInitialized && nodes.length > 0) {
        const measuredRadius = getNodeRadius();
        if (measuredRadius !== 65 || nodes[0].offsetWidth > 0) {
          currentRadius = measuredRadius;
          nodeState.forEach(node => {
            node.radius = currentRadius;
          });
          radiusInitialized = true;
        }
      }

      nodeState.forEach(node => {
        if (node.isDragging) return;

        // Apply friction
        node.vx *= 0.985;
        node.vy *= 0.985;

        // Keep them from standing completely still
        const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
        if (speed < 0.1) {
          node.vx += (Math.random() - 0.5) * 0.05;
          node.vy += (Math.random() - 0.5) * 0.05;
        }

        // Limit top velocity
        const maxVel = 6;
        const currentSpeed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
        if (currentSpeed > maxVel) {
          node.vx = (node.vx / currentSpeed) * maxVel;
          node.vy = (node.vy / currentSpeed) * maxVel;
        }

        node.x += node.vx;
        node.y += node.vy;

        // Wall collisions
        const restitution = 0.8;
        if (node.x - node.radius < 0) {
          node.x = node.radius;
          node.vx = -node.vx * restitution;
        } else if (node.x + node.radius > containerWidth) {
          node.x = containerWidth - node.radius;
          node.vx = -node.vx * restitution;
        }

        if (node.y - node.radius < 0) {
          node.y = node.radius;
          node.vy = -node.vy * restitution;
        } else if (node.y + node.radius > containerHeight) {
          node.y = containerHeight - node.radius;
          node.vy = -node.vy * restitution;
        }
      });

      resolveCollisions();

      // Render styles coordinates
      nodeState.forEach(node => {
        node.element.style.left = `${node.x - node.radius}px`;
        node.element.style.top = `${node.y - node.radius}px`;
      });

      requestAnimationFrame(updatePhysics);
    }

    requestAnimationFrame(updatePhysics);
  }

});
