/**
 * NEXUS // HIGH-PERFORMANCE DEVELOPER HUB
 * Interactive Scripts & Micro-interactions
 * Zero-dependency, performant Vanilla JavaScript (ES6+)
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initTerminal();
  initSpotlightEffect();
  initCounterAnimation();
  initCultureTabs();
  initBentoInteractions();
  initFaqAccordion();
  initFormInteractivity();
  initCopyActions();
  initBackToTop();
});

/* ==========================================================================
   1. THEME SWITCHER (Dark / Light Mode)
   ========================================================================== */
function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const htmlRoot = document.documentElement;

  // Retrieve stored theme or default to dark
  const storedTheme = localStorage.getItem('nexus-theme');
  if (storedTheme) {
    htmlRoot.setAttribute('data-theme', storedTheme);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    htmlRoot.setAttribute('data-theme', 'light');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = htmlRoot.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      htmlRoot.setAttribute('data-theme', newTheme);
      localStorage.setItem('nexus-theme', newTheme);
      showToast(`Switched to ${newTheme} mode`);
    });
  }
}

/* ==========================================================================
   2. NAVIGATION, SCROLLSPY & MOBILE MENU
   ========================================================================== */
function initNavigation() {
  const header = document.getElementById('site-header');
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  const sections = document.querySelectorAll('section[id]');

  // Scroll Header Shadow
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    updateScrollspy();
  }, { passive: true });

  // Mobile drawer toggle
  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', () => {
      const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', !isExpanded);
      mobileNav.classList.toggle('open');
      mobileNav.setAttribute('aria-hidden', isExpanded);
    });

    // Close mobile nav when clicking a link
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileNav.classList.remove('open');
        mobileNav.setAttribute('aria-hidden', 'true');
      });
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileNav.classList.remove('open');
        mobileNav.setAttribute('aria-hidden', 'true');
      }
    });
  }

  // Active section scrollspy
  function updateScrollspy() {
    const scrollPos = window.scrollY + 140;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }
}

/* ==========================================================================
   3. INTERACTIVE CODE TERMINAL (Hero Section)
   ========================================================================== */
function initTerminal() {
  const tabs = document.querySelectorAll('.terminal-tab');
  const codeViews = document.querySelectorAll('.code-view');
  const copyBtn = document.getElementById('copy-code-btn');
  const tooltip = document.querySelector('.copied-tooltip');

  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.tab;

      tabs.forEach(t => t.classList.remove('active'));
      codeViews.forEach(v => v.classList.remove('active'));

      tab.classList.add('active');
      const targetView = document.getElementById(`tab-${targetId}`);
      if (targetView) targetView.classList.add('active');
    });
  });

  // Copy code snippet
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const activeCode = document.querySelector('.code-view.active code');
      if (activeCode) {
        // Strip line numbers for clean code copying
        const cleanText = Array.from(activeCode.querySelectorAll('.code-line'))
          .map(line => {
            const clone = line.cloneNode(true);
            const lineNum = clone.querySelector('.line-num');
            if (lineNum) lineNum.remove();
            return clone.textContent;
          })
          .join('\n');

        navigator.clipboard.writeText(cleanText).then(() => {
          if (tooltip) {
            tooltip.classList.add('show');
            setTimeout(() => tooltip.classList.remove('show'), 2000);
          }
          showToast('Code copied to clipboard!');
        }).catch(() => {
          showToast('Failed to copy code', true);
        });
      }
    });
  }
}

/* ==========================================================================
   4. SPOTLIGHT MOUSE-FOLLOWING CARDS (Bento Grid)
   ========================================================================== */
function initSpotlightEffect() {
  const spotlightCards = document.querySelectorAll('.spotlight-card');

  spotlightCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

/* ==========================================================================
   5. STATS COUNTER ANIMATION (IntersectionObserver)
   ========================================================================== */
function initCounterAnimation() {
  const statNumbers = document.querySelectorAll('.stat-number');
  if (!statNumbers.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const targetValue = parseInt(target.getAttribute('data-target'), 10);
        animateValue(target, 0, targetValue, 1600);
        obs.unobserve(target);
      }
    });
  }, { threshold: 0.4 });

  statNumbers.forEach(num => observer.observe(num));

  function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      obj.textContent = Math.floor(easeProgress * (end - start) + start);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        obj.textContent = end;
      }
    };
    window.requestAnimationFrame(step);
  }
}

/* ==========================================================================
   6. CULTURE & MANIFESTO TABS (About Section)
   ========================================================================== */
function initCultureTabs() {
  const pillTabs = document.querySelectorAll('#manifesto-tabs .pill-tab');
  const panels = document.querySelectorAll('.manifesto-panel');
  const pillarCards = document.querySelectorAll('.pillar-card');

  // Manifesto tab buttons
  pillTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      pillTabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const panel = document.getElementById(`panel-${target}`);
      if (panel) panel.classList.add('active');
    });
  });

  // Pillar cards clickable highlight
  pillarCards.forEach(card => {
    card.addEventListener('click', () => {
      pillarCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
    });
  });
}

/* ==========================================================================
   7. BENTO GRID MICRO-INTERACTIONS
   ========================================================================== */
function initBentoInteractions() {
  // Mic toggle in War Room card
  const micBtn = document.getElementById('simulate-mic-btn');
  const micText = document.getElementById('mic-status-text');
  let isMuted = true;

  if (micBtn && micText) {
    micBtn.addEventListener('click', () => {
      isMuted = !isMuted;
      if (isMuted) {
        micText.textContent = 'Mic: Muted';
        micBtn.style.color = 'inherit';
        showToast('Microphone muted in audio lounge');
      } else {
        micText.textContent = 'Mic: Live (Broadcasting)';
        micBtn.style.color = '#10b981';
        showToast('Microphone connected to #distributed-raft-cluster');
      }
    });
  }

  // Diagnostic Benchmark Bot Scan
  const scanBtn = document.getElementById('trigger-scan-btn');
  if (scanBtn) {
    scanBtn.addEventListener('click', () => {
      const btnSpan = scanBtn.querySelector('span');
      const originalText = btnSpan.textContent;
      btnSpan.textContent = 'Analyzing AST & Call Graphs...';
      scanBtn.disabled = true;

      setTimeout(() => {
        btnSpan.textContent = 'All Benchmarks Verified (0 Regressions)';
        scanBtn.style.borderColor = '#10b981';
        scanBtn.style.color = '#10b981';
        showToast('⚡ Benchmark suite completed: 0 allocations / 1.42ms p99');

        setTimeout(() => {
          btnSpan.textContent = originalText;
          scanBtn.disabled = false;
          scanBtn.style.borderColor = '';
          scanBtn.style.color = '';
        }, 3000);
      }, 1200);
    });
  }

  // Tech stack tags click
  const techTags = document.querySelectorAll('.tech-tag');
  techTags.forEach(tag => {
    tag.addEventListener('click', () => {
      const name = tag.querySelector('.tech-name').textContent;
      showToast(`Filtered open projects for: ${name}`);
    });
  });
}

/* ==========================================================================
   8. FAQ ACCORDION
   ========================================================================== */
function initFaqAccordion() {
  const accordionHeaders = document.querySelectorAll('.accordion-header');

  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const isActive = item.classList.contains('active');

      // Close all other accordion items for clean single-view
      document.querySelectorAll('.accordion-item').forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          otherItem.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle clicked item
      item.classList.toggle('active', !isActive);
      header.setAttribute('aria-expanded', !isActive);
    });
  });
}

/* ==========================================================================
   9. APPLICATION FORM INTERACTION & VALIDATION
   ========================================================================== */
function initFormInteractivity() {
  const form = document.getElementById('application-form');
  const trackButtons = document.querySelectorAll('.select-pill');
  const hiddenTracksInput = document.getElementById('selectedTracks');
  const successCard = document.getElementById('form-success-card');
  const resetBtn = document.getElementById('reset-form-btn');
  const submitBtn = document.getElementById('submit-btn');

  const selectedTracks = new Set(['systems']); // Default selected

  // Pill multi-selection
  trackButtons.forEach(btn => {
    const track = btn.dataset.track;
    if (selectedTracks.has(track)) btn.classList.add('selected');

    btn.addEventListener('click', () => {
      if (selectedTracks.has(track)) {
        selectedTracks.delete(track);
        btn.classList.remove('selected');
      } else {
        if (selectedTracks.size >= 3) {
          showToast('Maximum 3 focus areas allowed');
          return;
        }
        selectedTracks.add(track);
        btn.classList.add('selected');
      }
      hiddenTracksInput.value = Array.from(selectedTracks).join(',');
    });
  });

  if (hiddenTracksInput) {
    hiddenTracksInput.value = Array.from(selectedTracks).join(',');
  }

  // Form submit handler with validation
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      let isValid = true;

      // Inputs to validate
      const fullName = document.getElementById('fullName');
      const email = document.getElementById('email');
      const githubUrl = document.getElementById('githubUrl');
      const expLevel = document.getElementById('experienceLevel');
      const projectNote = document.getElementById('projectNote');

      // Helper validation
      const checkField = (input, condition) => {
        const group = input.closest('.form-group');
        if (!condition) {
          group.classList.add('has-error');
          isValid = false;
        } else {
          group.classList.remove('has-error');
        }
      };

      checkField(fullName, fullName.value.trim().length >= 2);
      checkField(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()));
      checkField(githubUrl, githubUrl.value.trim().length > 5 && (githubUrl.value.includes('http://') || githubUrl.value.includes('https://') || githubUrl.value.includes('github.com')));
      checkField(expLevel, expLevel.value !== '');
      checkField(projectNote, projectNote.value.trim().length >= 10);

      if (!isValid) {
        showToast('Please correct the highlighted fields.', true);
        return;
      }

      // Simulate async application dispatch
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;

        // Generate authentic cryptographic key
        const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const applicantKey = `NX-${randomNum}-${randomHex}`;

        const hashEl = document.getElementById('applicant-hash');
        if (hashEl) hashEl.textContent = applicantKey;

        // Display success card
        form.style.display = 'none';
        if (successCard) {
          successCard.classList.add('active');
          successCard.setAttribute('aria-hidden', 'false');
        }

        showToast('Application successfully queued for Peer Review!');
      }, 1400);
    });

    // Reset button
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        form.reset();
        form.style.display = 'flex';
        if (successCard) {
          successCard.classList.remove('active');
          successCard.setAttribute('aria-hidden', 'true');
        }
        // Remove error classes
        form.querySelectorAll('.form-group').forEach(fg => fg.classList.remove('has-error'));
      });
    }
  }
}

/* ==========================================================================
   10. COPY ACTIONS (Email & Links)
   ========================================================================== */
function initCopyActions() {
  const copyEmailBtn = document.getElementById('copy-email-btn');
  const hubEmailInput = document.getElementById('hub-email-input');

  if (copyEmailBtn && hubEmailInput) {
    copyEmailBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(hubEmailInput.value).then(() => {
        const textSpan = document.getElementById('copy-email-text');
        if (textSpan) {
          textSpan.textContent = 'Copied!';
          setTimeout(() => textSpan.textContent = 'Copy Email', 2000);
        }
        showToast('Email address copied to clipboard');
      }).catch(() => {
        showToast('Could not copy email', true);
      });
    });
  }
}

/* ==========================================================================
   11. BACK TO TOP
   ========================================================================== */
function initBackToTop() {
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

/* ==========================================================================
   12. TOAST NOTIFICATION HELPER
   ========================================================================== */
function showToast(message, isError = false) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  if (isError) toast.style.borderColor = '#f43f5e';

  const iconSvg = isError
    ? `<svg viewBox="0 0 24 24" width="16" height="16" stroke="#f43f5e" fill="none" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`
    : `<svg viewBox="0 0 24 24" width="16" height="16" stroke="#10b981" fill="none" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

  toast.innerHTML = `${iconSvg}<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}
