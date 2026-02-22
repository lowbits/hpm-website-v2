/**
 * @file
 * Teaser slider using Splide carousel.
 *
 * Replicates the Flickity-based teaser slider behaviour:
 *  - overflow visible (slides extend to screen edge on the right)
 *  - passed slides fade out via .is-passed + CSS opacity transition
 *  - fade fires at the START of the slide animation (not after)
 */
(function (Drupal) {
  'use strict';

  Drupal.behaviors.hpmTeaserSlider = {
    attach: function (context) {
      var sliders = context.querySelectorAll('.js-teaser-slider');
      sliders.forEach(function (root) {
        if (root.dataset.hpmSliderInit) return;
        root.dataset.hpmSliderInit = 'true';

        var splideEl = root.querySelector('.splide');
        if (!splideEl) return;

        // Unwrap Drupal's views-element-container so slides are
        // direct children of .splide__list as Splide requires.
        var list = splideEl.querySelector('.splide__list');
        if (list) {
          var viewsWrapper = list.querySelector('.views-element-container');
          if (viewsWrapper) {
            while (viewsWrapper.firstChild) {
              list.appendChild(viewsWrapper.firstChild);
            }
            viewsWrapper.remove();
          }
        }

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