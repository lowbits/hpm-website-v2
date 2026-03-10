/**
 * @file
 * Gallery slider – Flickity carousel with geometric is-passed tracking.
 */
(function (Drupal) {
  'use strict';

  var GallerySlider = (function () {
    function GallerySlider(elementOrSelector) {
      var self = this;

      this.root = typeof elementOrSelector === 'string'
        ? document.querySelector(elementOrSelector)
        : elementOrSelector;

      if (!this.root) {
        console.warn('GallerySlider: root element not found.', elementOrSelector);
        return;
      }

      this.carouselEl = this.root.querySelector('.gallery-slider');
      if (!this.carouselEl) {
        console.warn('GallerySlider: .gallery-slider not found within root.', this.root);
        return;
      }

      this.nextArrow = this.root.querySelector('.js-slider-button-next');
      this.prevArrow = this.root.querySelector('.js-slider-button-prev');

      if (!this.nextArrow || !this.prevArrow) {
        console.warn('GallerySlider: missing prev/next arrow buttons.', this.root);
      }

      this.flkty = new Flickity(this.carouselEl, {
        adaptiveHeight: false,
        cellAlign: 'left',
        draggable: true,
        contain: false,
        pageDots: false,
        prevNextButtons: false,
        initialIndex: 0,
        wrapAround: false
      });

      this.slideCount = 0;

      this.flkty.on('ready', function () {
        self.slideCount = self.flkty.slides.length;
        var index = self.flkty.selectedIndex;
        self.setCurrentSlide(index);
        self.updatePassedSlides();
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      });

      this.flkty.on('change', function (index) { self.onSlideChange(index); });
      this.flkty.on('settle', function () {
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      });

      if (this.prevArrow) {
        this.prevArrow.addEventListener('click', function (event) {
          event.preventDefault();
          self.flkty.previous();
        });
      }

      if (this.nextArrow) {
        this.nextArrow.addEventListener('click', function (event) {
          event.preventDefault();
          self.flkty.next();
        });
      }

      var init = function () { self.refresh(); };

      if (document.readyState === 'complete') init();
      else window.addEventListener('load', init);

      window.addEventListener('resize', function () {
        self.updatePassedSlides();
      });
    }

    GallerySlider.prototype.onSlideChange = function (index) {
      this.setCurrentSlide(index);
      this.updatePassedSlides();
    };

    GallerySlider.prototype.updatePassedSlides = function () {
      if (!this.flkty || !this.flkty.cells || this.flkty.cells.length === 0) return;

      var selectedIndex = this.flkty.selectedIndex;
      var activeCell = this.flkty.cells[selectedIndex];
      if (!activeCell) return;

      var activeEl = activeCell.element;
      var activeRect = activeEl.getBoundingClientRect();

      if (activeRect.width === 0) {
        this.flkty.cells.forEach(function (cell) {
          cell.element.classList.remove('is-passed');
        });
        return;
      }

      var activeCenterX = activeRect.left + activeRect.width / 2;

      this.flkty.cells.forEach(function (cell) {
        var el = cell.element;
        var rect = el.getBoundingClientRect();
        var centerX = rect.left + rect.width / 2;
        var isLeftOfActive = centerX < activeCenterX - 1;

        if (isLeftOfActive) el.classList.add('is-passed');
        else el.classList.remove('is-passed');
      });
    };

    GallerySlider.prototype.setCurrentSlide = function (index) {
      if (!this.prevArrow || !this.nextArrow) return;

      if (typeof index !== 'number') {
        index = this.flkty ? this.flkty.selectedIndex : 0;
      }

      if (index === 0) {
        this.prevArrow.classList.add('is-disabled');
      } else {
        this.prevArrow.classList.remove('is-disabled');
      }

      if (index === this.slideCount - 1) {
        this.nextArrow.classList.add('is-disabled');
      } else {
        this.nextArrow.classList.remove('is-disabled');
      }
    };

    GallerySlider.prototype.refresh = function () {
      if (!this.flkty) return;

      this.flkty.reloadCells();
      this.flkty.resize();
      this.flkty.reposition();
      this.slideCount = this.flkty.slides.length;

      var index = this.flkty.selectedIndex;
      this.setCurrentSlide(index);
      this.updatePassedSlides();

      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    };

    return GallerySlider;
  })();

  Drupal.behaviors.hpmGallerySlider = {
    attach: function (context) {
      if (typeof Flickity === 'undefined') return;
      context.querySelectorAll('.js-gallery-slider').forEach(function (el) {
        if (el.dataset.hpmSliderInit) return;
        try {
          new GallerySlider(el);
          el.dataset.hpmSliderInit = 'true';
        } catch (e) {
          console.error('GallerySlider init failed:', e);
        }
      });
    }
  };

})(Drupal);
