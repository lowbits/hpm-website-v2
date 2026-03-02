/**
 * @file
 * Quotes slider using Splide carousel.
 *
 * Uses Splide's built-in .is-active class for showing the active slide.
 * Image + content fade is handled via CSS transitions on .is-active.
 */
(function (Drupal) {
  'use strict';

  Drupal.behaviors.hpmQuotesSlider = {
    attach: function (context) {
      var sliders = context.querySelectorAll('.js-quotes-slider');
      sliders.forEach(function (root) {
        if (root.dataset.hpmSliderInit) return;
        root.dataset.hpmSliderInit = 'true';

        var splideEl = root.querySelector('.splide');
        if (!splideEl) return;

        var prevBtn = root.querySelector('.js-slider-button-prev');
        var nextBtn = root.querySelector('.js-slider-button-next');

        var splide = new Splide(splideEl, {
          type: 'loop',
          autoWidth: false,
          perPage: 1,
          gap: 0,
          arrows: false,
          pagination: false,
          drag: true,
          speed: 600,
          easing: 'ease',
        });

        splide.mount();

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
      });
    }
  };

})(Drupal);
