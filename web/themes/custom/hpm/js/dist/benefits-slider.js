/**
 * @file
 * Benefits slider using Splide carousel.
 */
(function (Drupal) {
  'use strict';

  Drupal.behaviors.hpmBenefitsSlider = {
    attach: function (context) {
      var sliders = context.querySelectorAll('.js-benefits-slider');
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
          var last = splide.Components.Controller.getEnd();
          if (prevBtn) {
            prevBtn.classList.toggle('is-disabled', index <= 0);
          }
          if (nextBtn) {
            nextBtn.classList.toggle('is-disabled', index >= last);
          }
        }

        splide.on('move', function (newIndex) {
          updateButtons(newIndex);
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
      });
    }
  };

})(Drupal);
