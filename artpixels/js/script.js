/* ============================================================
   ART PIXELS - MAIN JAVASCRIPT
   Includes: navigation, scroll effects, portfolio filters,
   FAQ accordion, form validation, event tracking,
   scroll-to-top button.
============================================================ */

(function() {
  'use strict';

  // ============================================================
  // EVENT TRACKING SYSTEM
  // Tracks clicks and other interactions for analytics.
  // ============================================================
  var Tracking = {
    init: function() {
      // Track all elements with data-track attribute
      document.addEventListener('click', function(e) {
        var el = e.target.closest('[data-track]');
        if (!el) return;

        var eventName = el.getAttribute('data-track');
        var eventLabel = el.getAttribute('data-label') || '';

        Tracking.send(eventName, eventLabel);
      });
    },

    send: function(action, label) {
      var eventData = {
        event: 'interaction',
        event_category: 'user_action',
        event_action: action,
        event_label: label
      };

      // GA4 placeholder - uncomment when GA4 is configured
      // if (typeof gtag === 'function') {
      //   gtag('event', action, {
      //     'event_category': 'user_action',
      //     'event_label': label
      //   });
      // }

      // GTM dataLayer push placeholder
      if (typeof dataLayer !== 'undefined') {
        dataLayer.push(eventData);
      }

      // Console tracking for debugging
      console.log('[ArtPixels] Event tracked:', action, label);
    }
  };

  // ============================================================
  // MOBILE NAVIGATION TOGGLE
  // ============================================================
  var MobileNav = {
    init: function() {
      this.toggleBtn = document.getElementById('menuToggle');
      this.nav = document.getElementById('mainNav');
      this.links = this.nav.querySelectorAll('.header__link');

      if (!this.toggleBtn || !this.nav) return;

      var self = this;

      this.toggleBtn.addEventListener('click', function() {
        self.toggle();
      });

      // Close nav on link click
      this.links.forEach(function(link) {
        link.addEventListener('click', function() {
          if (window.innerWidth < 768) {
            self.close();
          }
        });
      });

      // Close nav on outside click
      document.addEventListener('click', function(e) {
        if (window.innerWidth < 768 &&
            !self.nav.contains(e.target) &&
            !self.toggleBtn.contains(e.target) &&
            self.nav.classList.contains('active')) {
          self.close();
        }
      });

      // Close nav on resize to desktop
      window.addEventListener('resize', function() {
        if (window.innerWidth >= 768) {
          self.nav.classList.remove('active');
          self.toggleBtn.classList.remove('active');
          self.toggleBtn.setAttribute('aria-expanded', 'false');
        }
      });
    },

    toggle: function() {
      this.nav.classList.toggle('active');
      this.toggleBtn.classList.toggle('active');
      var expanded = this.nav.classList.contains('active');
      this.toggleBtn.setAttribute('aria-expanded', expanded);
      // Track navigation toggle
      Tracking.send('navigation_toggle', expanded ? 'menu_open' : 'menu_close');
    },

    close: function() {
      this.nav.classList.remove('active');
      this.toggleBtn.classList.remove('active');
      this.toggleBtn.setAttribute('aria-expanded', 'false');
    }
  };

  // ============================================================
  // STICKY HEADER SCROLL EFFECT
  // ============================================================
  var HeaderScroll = {
    init: function() {
      this.header = document.getElementById('header');
      if (!this.header) return;

      var self = this;

      window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
          self.header.classList.add('scrolled');
        } else {
          self.header.classList.remove('scrolled');
        }
      }, { passive: true });
    }
  };

  // ============================================================
  // ACTIVE NAV LINK HIGHLIGHT
  // ============================================================
  var ActiveNav = {
    init: function() {
      this.sections = document.querySelectorAll('section[id]');
      this.links = document.querySelectorAll('.header__link');
      if (!this.sections.length || !this.links.length) return;

      var self = this;

      window.addEventListener('scroll', function() {
        var scrollPos = window.scrollY + 120;

        var currentId = '';
        self.sections.forEach(function(section) {
          var top = section.offsetTop;
          var height = section.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            currentId = section.getAttribute('id');
          }
        });

        self.links.forEach(function(link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + currentId) {
            link.classList.add('active');
          }
        });
      }, { passive: true });
    }
  };

  // ============================================================
  // PORTFOLIO FILTER
  // ============================================================
  var PortfolioFilter = {
    init: function() {
      this.filters = document.querySelectorAll('.portfolio__filter');
      this.items = document.querySelectorAll('.portfolio__item');
      if (!this.filters.length || !this.items.length) return;

      var self = this;

      this.filters.forEach(function(btn) {
        btn.addEventListener('click', function() {
          var filter = btn.getAttribute('data-filter');

          // Update active filter button
          self.filters.forEach(function(f) {
            f.classList.remove('active');
            f.setAttribute('aria-selected', 'false');
          });
          btn.classList.add('active');
          btn.setAttribute('aria-selected', 'true');

          // Filter items
          self.items.forEach(function(item) {
            if (filter === 'all' || item.getAttribute('data-category') === filter) {
              item.style.display = 'block';
            } else {
              item.style.display = 'none';
            }
          });

          // Track filter event
          Tracking.send('portfolio_filter', filter);
        });
      });
    }
  };

  // ============================================================
  // FAQ ACCORDION
  // ============================================================
  var FAQ = {
    init: function() {
      var items = document.querySelectorAll('.faq__item');
      if (!items.length) return;

      items.forEach(function(item) {
        var summary = item.querySelector('.faq__question');
        if (!summary) return;

        summary.addEventListener('click', function(e) {
          // Close other open items
          items.forEach(function(other) {
            if (other !== item && other.hasAttribute('open')) {
              other.removeAttribute('open');
            }
          });

          // Track FAQ toggle
          var question = summary.textContent.trim();
          Tracking.send('faq_toggle', question);
        });
      });
    }
  };

  // ============================================================
  // LEAD FORM - VALIDATION & SUBMISSION
  // ============================================================
  var LeadForm = {
    init: function() {
      this.form = document.getElementById('leadForm');
      if (!this.form) return;

      var self = this;

      this.form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (self.validate()) {
          self.submit();
        }
      });

      // Real-time validation on blur
      var inputs = this.form.querySelectorAll('.contact__input');
      inputs.forEach(function(input) {
        input.addEventListener('blur', function() {
          self.validateField(input);
        });

        input.addEventListener('input', function() {
          if (input.classList.contains('error')) {
            self.validateField(input);
          }
        });
      });
    },

    validate: function() {
      var isValid = true;
      var inputs = this.form.querySelectorAll('.contact__input[required]');
      var self = this;

      inputs.forEach(function(input) {
        if (!self.validateField(input)) {
          isValid = false;
        }
      });

      return isValid;
    },

    validateField: function(input) {
      var errorEl = input.parentNode.querySelector('.contact__error-text');
      if (errorEl) {
        errorEl.remove();
      }
      input.classList.remove('error');

      var value = input.value.trim();
      var isValid = true;
      var errorMsg = '';

      if (!value) {
        isValid = false;
        errorMsg = 'This field is required';
      } else if (input.type === 'email' && value) {
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          isValid = false;
          errorMsg = 'Please enter a valid email address';
        }
      } else if (input.type === 'tel' && value) {
        var phoneRegex = /^[\d\s\+\-\(\)]{7,15}$/;
        if (!phoneRegex.test(value)) {
          isValid = false;
          errorMsg = 'Please enter a valid phone number';
        }
      }

      if (!isValid) {
        input.classList.add('error');
        var error = document.createElement('span');
        error.className = 'contact__error-text';
        error.textContent = errorMsg;
        input.parentNode.appendChild(error);
      }

      return isValid;
    },

    submit: function() {
      var formData = new FormData(this.form);
      var data = {};
      formData.forEach(function(value, key) {
        data[key] = value;
      });

      // Track form submission event
      Tracking.send('form_submit', 'Request Free Quote');

      // Track lead_generated event
      var leadData = {
        event: 'lead_generated',
        event_category: 'form',
        event_label: 'form_submission',
        value: 1
      };

      // GA4 placeholder
      // if (typeof gtag === 'function') {
      //   gtag('event', 'lead_generated', leadData);
      // }

      // GTM dataLayer push
      if (typeof dataLayer !== 'undefined') {
        dataLayer.push(leadData);
      }

      console.log('[ArtPixels] Lead form submitted:', data);

      // ============================================================
      // FORM SUBMISSION SUCCESS - REDIRECT TO THANK YOU PAGE
      // Replace the alert with actual API call in production.
      // ============================================================
      window.location.href = 'thank-you.html';
    }
  };

  // ============================================================
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // ============================================================
  var SmoothScroll = {
    init: function() {
      var links = document.querySelectorAll('a[href^="#"]');
      links.forEach(function(link) {
        link.addEventListener('click', function(e) {
          var targetId = link.getAttribute('href');
          if (targetId === '#') return;

          var target = document.querySelector(targetId);
          if (!target) return;

          e.preventDefault();

          var headerHeight = document.getElementById('header').offsetHeight || 70;
          var targetPos = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

          window.scrollTo({
            top: targetPos,
            behavior: 'smooth'
          });

          // Track navigation click
          Tracking.send('navigation_click', targetId.replace('#', ''));
        });
      });
    }
  };

  // ============================================================
  // SCROLL ENTRANCE ANIMATIONS
  // ============================================================
  var Animations = {
    init: function() {
      var els = document.querySelectorAll('.anim');
      if (!('IntersectionObserver' in window)) {
        els.forEach(function(el) { el.style.opacity = '1'; });
        return;
      }
      var obs = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) {
          if (e.isIntersecting) {
            e.target.style.animationPlayState = 'running';
            obs.unobserve(e.target);
          }
        });
      }, { threshold: 0.15 });
      els.forEach(function(el) {
        el.style.animationPlayState = 'paused';
        obs.observe(el);
      });
    }
  };

  // ============================================================
  // SCROLL TO TOP BUTTON
  // ============================================================
  var ScrollToTop = {
    init: function() {
      var btn = document.getElementById('scrollTopBtn');
      if (!btn) return;
      window.addEventListener('scroll', function() {
        if (window.scrollY > 300) { btn.classList.add('visible'); }
        else { btn.classList.remove('visible'); }
      });
      btn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  };

  var LazyLoad = {
    init: function() {
      var imgs = document.querySelectorAll('.lazy');
      if (!('IntersectionObserver' in window)) return;
      var obs = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) {
          if (e.isIntersecting) {
            e.target.classList.add('loaded');
            obs.unobserve(e.target);
          }
        });
      }, { rootMargin: '200px' });
      imgs.forEach(function(i) { obs.observe(i); });
    }
  };

  /* ---------- HERO CAROUSEL ---------- */
  var HeroCarousel = {
    current: 0,
    slides: [],
    dots: [],
    timer: null,
    interval: 6000,

    init: function() {
      this.slides = document.querySelectorAll('.hero__slide');
      this.dots = document.querySelectorAll('.hero__dot');
      if (!this.slides.length) return;
      this.prevBtn = document.getElementById('heroArrowPrev');
      this.nextBtn = document.getElementById('heroArrowNext');
      this.counterEl = document.getElementById('heroCounter');
      this.counterCurrent = this.counterEl ? this.counterEl.querySelector('.hero__counter-current') : null;
      this.bindEvents();
      this.startAutoPlay();
      this.updateCounter();
    },

    goTo: function(index) {
      if (index === this.current) return;
      this.slides.forEach(function(s, i) {
        s.classList.toggle('active', i === index);
      });
      this.dots.forEach(function(d, i) {
        d.classList.toggle('active', i === index);
        d.setAttribute('aria-selected', i === index);
      });
      this.current = index;
      this.updateCounter();
    },

    prev: function() {
      var prev = (this.current - 1 + this.slides.length) % this.slides.length;
      this.goTo(prev);
    },

    next: function() {
      var next = (this.current + 1) % this.slides.length;
      this.goTo(next);
    },

    updateCounter: function() {
      if (this.counterCurrent) {
        this.counterCurrent.textContent = ('0' + (this.current + 1)).slice(-2);
      }
    },

    bindEvents: function() {
      var self = this;
      this.dots.forEach(function(dot) {
        dot.addEventListener('click', function() {
          self.goTo(parseInt(this.getAttribute('data-slide')));
          self.resetAutoPlay();
        });
      });
      if (this.prevBtn) {
        this.prevBtn.addEventListener('click', function() {
          self.prev();
          self.resetAutoPlay();
        });
      }
      if (this.nextBtn) {
        this.nextBtn.addEventListener('click', function() {
          self.next();
          self.resetAutoPlay();
        });
      }
      var carousel = document.getElementById('heroCarousel');
      if (carousel) {
        carousel.addEventListener('mouseenter', function() { self.stopAutoPlay(); });
        carousel.addEventListener('mouseleave', function() { self.startAutoPlay(); });
      }
    },

    startAutoPlay: function() {
      var self = this;
      if (this.timer) return;
      this.timer = setInterval(function() { self.next(); }, this.interval);
    },

    stopAutoPlay: function() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },

    resetAutoPlay: function() {
      this.stopAutoPlay();
      this.startAutoPlay();
    }
  };

  /* ---------- INIT ---------- */
  document.addEventListener('DOMContentLoaded', function() {
    MobileNav.init();
    HeaderScroll.init();
    Tracking.init();
    Animations.init();
    PortfolioFilter.init();
    FAQ.init();
    LeadForm.init();
    SmoothScroll.init();
    ScrollToTop.init();
    LazyLoad.init();
    HeroCarousel.init();

    console.log('[ArtPixels] All modules initialized successfully.');
  });

})();
