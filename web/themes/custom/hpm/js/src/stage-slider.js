/**
 * @file
 * Stage slider component using Splide + GSAP.
 */
import Splide from '@splidejs/splide';
import { gsap } from 'gsap';

(function (Drupal) {
  'use strict';

  Drupal.behaviors.hpmStageSlider = {
    attach(context) {
      const sliders = context.querySelectorAll('.js-stage-slider');
      sliders.forEach((root) => {
        if (root.dataset.hpmSliderInit) return;
        root.dataset.hpmSliderInit = 'true';

        const splideEl = root.querySelector('.js-splide-stage');
        const dotsWrap = root.querySelector('.js-stage-dots');

        if (!splideEl || !dotsWrap) return;

        const SLIDE_DURATION = 3; // seconds

        // Initialize Splide on pre-built markup
        const splide = new Splide(splideEl, {
          type: 'loop',
          perPage: 1,
          arrows: false,
          pagination: false,
          autoplay: false,
          drag: true,
          speed: 600,
          easing: 'ease',
        });

        splide.mount();

        // --- Build dots with progress bars ---
        const cellCount = splide.length;
        const dotBars = [];

        for (let i = 0; i < cellCount; i++) {
          const dot = document.createElement('button');
          dot.className = 'dot';
          dot.type = 'button';
          dot.setAttribute('aria-label', 'Gehe zu Slide ' + (i + 1));
          dot.dataset.index = i;

          const dotTrack = document.createElement('span');
          dotTrack.className = 'dot__track';
          const bar = document.createElement('span');
          bar.className = 'dot__bar';
          bar.style.transformOrigin = 'left center';
          bar.style.transform = 'scaleX(0)';
          dotTrack.appendChild(bar);
          dot.appendChild(dotTrack);
          dotsWrap.appendChild(dot);
          dotBars.push(bar);

          dot.addEventListener('click', function () {
            killProgress();
            splide.go(i);
          });
        }

        // --- Progress logic ---
        var progressTL = null;

        function killProgress() {
          if (progressTL) {
            progressTL.kill();
            progressTL = null;
          }
        }

        function resetBarsAndActive() {
          dotBars.forEach(function (b) {
            gsap.set(b, { scaleX: 0 });
            var dot = b.closest('.dot');
            if (dot) dot.classList.remove('is-active');
          });
        }

        function startProgressFor(index) {
          killProgress();
          resetBarsAndActive();

          var bar = dotBars[index];
          if (bar) {
            var dot = bar.closest('.dot');
            if (dot) dot.classList.add('is-active');
          }

          progressTL = gsap.fromTo(
            bar,
            { scaleX: 0 },
            {
              scaleX: 1,
              ease: 'linear',
              duration: SLIDE_DURATION,
              onComplete: function () { splide.go('>'); },
            }
          );
        }

        function pauseProgress() {
          if (progressTL && progressTL.isActive()) progressTL.pause();
        }
        function resumeProgress() {
          if (progressTL && progressTL.paused()) progressTL.resume();
        }

        // --- Splide events ---
        splide.on('moved', function (newIndex) {
          startProgressFor(newIndex);
        });

        splide.on('drag', pauseProgress);

        [root, dotsWrap].forEach(function (el) {
          el.addEventListener('mouseenter', pauseProgress);
          el.addEventListener('mouseleave', resumeProgress);
        });

        document.addEventListener('visibilitychange', function () {
          if (document.hidden) pauseProgress();
          else resumeProgress();
        });

        // Start autoplay progress
        startProgressFor(splide.index);
      });
    },
  };
})(Drupal);
