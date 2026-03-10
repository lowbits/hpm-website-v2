/**
 * @file
 * Stage slider – Flickity carousel with GSAP progress dots.
 */
(function (Drupal) {
  'use strict';

  var StageSlider = (function () {
    function StageSlider(elementOrSelector) {
      var self = this;

      this.root = typeof elementOrSelector === 'string'
        ? document.querySelector(elementOrSelector)
        : elementOrSelector;

      if (!this.root) {
        console.warn('StageSlider: root element not found.', elementOrSelector);
        return;
      }

      this.carouselEl = this.root.querySelector('.carousel');
      this.dotsWrap = this.root.querySelector('.js-stage-dots');

      if (!this.carouselEl) {
        console.warn('StageSlider: .carousel not found within root.', this.root);
        return;
      }
      if (!this.dotsWrap) {
        console.warn('StageSlider: .js-stage-dots not found within root.', this.root);
        return;
      }

      var SLIDE_DURATION = 3;

      this.flkty = new Flickity(this.carouselEl, {
        adaptiveHeight: false,
        cellAlign: 'left',
        draggable: true,
        pageDots: false,
        prevNextButtons: false,
        wrapAround: true,
        autoPlay: false,
        initialIndex: 0
      });

      // --- Dots bauen -------------------------------------------------
      var cellCount = this.flkty.cells.length;
      this.dotBars = [];

      for (var i = 0; i < cellCount; i++) {
        var dot = document.createElement('button');
        dot.className = 'dot';
        dot.type = 'button';
        dot.setAttribute('aria-label', 'Gehe zu Slide ' + (i + 1));
        dot.dataset.index = i;

        var track = document.createElement('span');
        track.className = 'dot__track';
        var bar = document.createElement('span');
        bar.className = 'dot__bar';
        bar.style.transformOrigin = 'left center';
        bar.style.transform = 'scaleX(0)';
        track.appendChild(bar);
        dot.appendChild(track);
        this.dotsWrap.appendChild(dot);
        this.dotBars.push(bar);

        (function (idx) {
          dot.addEventListener('click', function () {
            killProgress();
            self.flkty.select(idx, false, false);
          });
        })(i);
      }

      // --- Progress Logik ---------------------------------------------
      var progressTL = null;

      function killProgress() {
        if (progressTL) {
          progressTL.kill();
          progressTL = null;
        }
      }

      var resetBarsAndActive = function () {
        self.dotBars.forEach(function (b) {
          gsap.set(b, { scaleX: 0 });
          var dotEl = b.closest('.dot');
          if (dotEl) dotEl.classList.remove('is-active');
        });
      };

      var startProgressFor = function (index) {
        killProgress();
        resetBarsAndActive();

        var bar = self.dotBars[index];
        var dotEl = bar ? bar.closest('.dot') : null;
        if (dotEl) dotEl.classList.add('is-active');

        progressTL = gsap.fromTo(
          bar,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: 'linear',
            duration: SLIDE_DURATION,
            onComplete: function () { self.flkty.next(); }
          }
        );
      };

      var pauseProgress = function () {
        if (progressTL && progressTL.isActive()) progressTL.pause();
      };
      var resumeProgress = function () {
        if (progressTL && progressTL.paused()) progressTL.resume();
      };

      // --- Flickity Events --------------------------------------------
      this.flkty.on('select', function () {
        startProgressFor(self.flkty.selectedIndex);
      });

      this.flkty.on('dragStart', pauseProgress);
      this.flkty.on('dragEnd', function () {
        resumeProgress();
      });

      [this.root, this.dotsWrap].forEach(function (el) {
        el.addEventListener('mouseenter', pauseProgress);
        el.addEventListener('mouseleave', resumeProgress);
      });

      document.addEventListener('visibilitychange', function () {
        if (document.hidden) pauseProgress();
        else resumeProgress();
      });

      var init = function () {
        self.flkty.resize();
        startProgressFor(self.flkty.selectedIndex);
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      };
      if (document.readyState === 'complete') init();
      else window.addEventListener('load', init);

      this.refresh = function () {
        self.flkty.reloadCells();
        self.flkty.resize();
        self.flkty.reposition();
        startProgressFor(self.flkty.selectedIndex);
      };
    }

    return StageSlider;
  })();

  Drupal.behaviors.hpmStageSlider = {
    attach: function (context) {
      if (typeof Flickity === 'undefined') return;
      context.querySelectorAll('.js-stage-slider').forEach(function (el) {
        if (el.dataset.hpmSliderInit) return;
        try {
          new StageSlider(el);
          el.dataset.hpmSliderInit = 'true';
        } catch (e) {
          console.warn('StageSlider init failed:', e);
        }
      });
    }
  };

})(Drupal);
