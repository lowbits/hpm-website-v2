/**
 * @file
 * Timeline slider using Splide carousel.
 *
 * Replicates the Flickity-based timeline slider behaviour:
 *  - overflow visible (slides extend to screen edge on the right)
 *  - passed slides fade out via .is-passed + CSS opacity transition
 *  - selected slide gets .is-selected for enlarged year + dot scale
 *  - text opacity transition on selected slide
 */
(function (Drupal) {
  'use strict';

  Drupal.behaviors.hpmTimelineSlider = {
    attach: function (context) {
      var sliders = context.querySelectorAll('.js-timeline-slider');
      sliders.forEach(function (root) {
        if (root.dataset.hpmSliderInit) return;
        root.dataset.hpmSliderInit = 'true';

        var splideEl = root.querySelector('.splide');
        if (!splideEl) return;

        var prevBtn = root.querySelector('.js-slider-button-prev');
        var nextBtn = root.querySelector('.js-slider-button-next');

        var splide = new Splide(splideEl, {
          type: 'slide',
          autoWidth: true,
          gap: '1.5rem',
          arrows: false,
          pagination: false,
          drag: true,
          speed: 600,
          easing: 'ease',
          trimSpace: false,
        });

        splide.mount();

        function updateButtons(index) {
          if (!prevBtn || !nextBtn) return;
          var end = splide.length - 1;
          if (index <= 0) {
            prevBtn.classList.add('is-disabled');
          } else {
            prevBtn.classList.remove('is-disabled');
          }
          if (index >= end) {
            nextBtn.classList.add('is-disabled');
          } else {
            nextBtn.classList.remove('is-disabled');
          }
        }

        function updatePassed(index) {
          var slides = splideEl.querySelectorAll('.splide__slide');
          slides.forEach(function (slide, i) {
            if (i < index) {
              slide.classList.add('is-passed');
            } else {
              slide.classList.remove('is-passed');
            }
            if (i === index) {
              slide.classList.add('is-selected');
            } else {
              slide.classList.remove('is-selected');
            }
          });
        }

        // Use 'move' (fires BEFORE animation) so the opacity fade
        // runs simultaneously with the slide transition.
        splide.on('move', function (newIndex) {
          updateButtons(newIndex);
          updatePassed(newIndex);
        });

        if (prevBtn) {
          prevBtn.addEventListener('click', function (e) {
            e.preventDefault();
            splide.go('<');
          });
        }

        if (nextBtn) {
          nextBtn.addEventListener('click', function (e) {
            e.preventDefault();
            splide.go('>');
          });
        }

        updateButtons(splide.index);
        updatePassed(splide.index);
      });
    }
  };

})(Drupal);
