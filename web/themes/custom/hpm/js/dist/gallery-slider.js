/**
 * @file
 * Gallery slider using Splide carousel.
 *
 * Horizontal auto-width slider with prev/next buttons.
 * Targets .js-gallery-slider sections containing a .carousel element.
 */
(function (Drupal) {
  'use strict';

  Drupal.behaviors.hpmGallerySlider = {
    attach: function (context) {
      var sliders = context.querySelectorAll('.js-gallery-slider');
      sliders.forEach(function (root) {
        if (root.dataset.hpmSliderInit) return;
        root.dataset.hpmSliderInit = 'true';

        var carousel = root.querySelector('.carousel');
        if (!carousel) return;

        // Wrap carousel content in Splide markup.
        var items = carousel.querySelectorAll('.gallery-item');
        if (!items.length) return;

        carousel.classList.add('splide');
        var track = document.createElement('div');
        track.className = 'splide__track';
        var list = document.createElement('div');
        list.className = 'splide__list';

        items.forEach(function (item) {
          item.classList.add('splide__slide');
          list.appendChild(item);
        });

        track.appendChild(list);
        carousel.appendChild(track);

        var prevBtn = root.querySelector('.js-slider-button-prev');
        var nextBtn = root.querySelector('.js-slider-button-next');

        var splide = new Splide(carousel, {
          type: 'slide',
          autoWidth: true,
          gap: '1.25rem',
          arrows: false,
          pagination: false,
          drag: true,
          speed: 600,
          easing: 'ease',
          trimSpace: false,
          mediaQuery: 'min',
          breakpoints: {
            640: { gap: '1.5rem' },
            1024: { gap: '1.75rem' },
          },
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