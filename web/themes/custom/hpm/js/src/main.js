/**
 * @file
 * HPM Theme main entry point.
 *
 * Initializes global components: navigation, scroll behaviors, fade-ins.
 */

(function (Drupal) {
  'use strict';

  /**
   * Multi-level panel navigation.
   */
  Drupal.behaviors.hpmNavigation = {
    attach(context) {
      const navButton = context.querySelector('.js-nav-button');
      const navigation = context.querySelector('.js-navigation');
      if (!navButton || !navigation || navButton.dataset.hpmNav) return;
      navButton.dataset.hpmNav = 'true';

      const viewport = navigation.querySelector('.navigation-viewport');
      const panels = Array.from(navigation.querySelectorAll('.menu-panel'));
      let isOpen = false;
      let activePanel = 'main';

      function showPanel(name, opts) {
        const instant = opts && opts.instant;
        const next = panels.find(function (p) {
          return p.getAttribute('data-panel') === name;
        });
        if (!next) return;
        activePanel = name;

        if (instant && viewport) {
          viewport.classList.add('is-instant');
          requestAnimationFrame(function () {
            viewport.classList.remove('is-instant');
          });
        }

        panels.forEach(function (panel) {
          panel.classList.toggle('is-active', panel === next);
        });
      }

      function open() {
        isOpen = true;
        document.body.classList.add('nav-open');
        navigation.classList.add('is-open');
        navButton.classList.add('is-active');
        navButton.setAttribute('aria-expanded', 'true');
        navButton.blur();
        showPanel('main', { instant: true });
      }

      function close() {
        isOpen = false;
        document.body.classList.remove('nav-open');
        navigation.classList.remove('is-open');
        navButton.classList.remove('is-active');
        navButton.setAttribute('aria-expanded', 'false');
        navButton.blur();
      }

      navButton.addEventListener('click', function () {
        isOpen ? close() : open();
      });

      // ESC: subpanel → main, main → close
      document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape' || !isOpen) return;
        if (activePanel !== 'main') {
          showPanel('main');
        } else {
          close();
        }
      });

      // Submenu open triggers
      navigation.addEventListener('click', function (e) {
        var openBtn = e.target.closest('[data-open-panel]');
        if (!openBtn || !navigation.contains(openBtn)) return;
        e.preventDefault();
        showPanel(openBtn.getAttribute('data-open-panel'));
      });

      // Back buttons
      navigation.addEventListener('click', function (e) {
        var backBtn = e.target.closest('[data-back-panel]');
        if (!backBtn) return;
        e.preventDefault();
        showPanel(backBtn.getAttribute('data-back-panel') || 'main');
      });
    },
  };

  /**
   * Scroll direction detection for header hide/show.
   */
  Drupal.behaviors.hpmScrollDirection = {
    attach(context) {
      if (context !== document) return;

      let lastScrollY = window.scrollY;
      const header = document.querySelector('.js-header');
      if (!header) return;

      window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          document.body.classList.add('scrolling-down');
        } else {
          document.body.classList.remove('scrolling-down');
        }
        if (currentScrollY > 50) {
          document.body.classList.add('is-scrolled');
        } else {
          document.body.classList.remove('is-scrolled');
        }
        lastScrollY = currentScrollY;
      }, { passive: true });
    },
  };

})(Drupal);
