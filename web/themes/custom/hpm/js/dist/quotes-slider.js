/**
 * @file
 * Quotes slider – Flickity carousel with equalizeHeights and geometric is-passed.
 */
(function (Drupal) {
  'use strict';

  var QuotesSlider = (function () {
    function QuotesSlider(elementOrSelector) {
      var self = this;

      this.root = typeof elementOrSelector === 'string'
        ? document.querySelector(elementOrSelector)
        : elementOrSelector;

      if (!this.root) {
        console.warn('QuotesSlider: root element not found.', elementOrSelector);
        return;
      }

      this.carouselEl = this.root.querySelector('.quotes-slider');
      if (!this.carouselEl) {
        console.warn('QuotesSlider: .quotes-slider not found within root.', this.root);
        return;
      }

      this.nextArrow = this.root.querySelector('.js-slider-button-next');
      this.prevArrow = this.root.querySelector('.js-slider-button-prev');

      if (!this.nextArrow || !this.prevArrow) {
        console.warn('QuotesSlider: missing prev/next arrow buttons.', this.root);
      }

      this.flkty = new Flickity(this.carouselEl, {
        adaptiveHeight: false,
        cellAlign: 'left',
        draggable: true,
        pageDots: false,
        prevNextButtons: false,
        initialIndex: 0,
        wrapAround: true
      });

      this.slideCount = 0;

      this.flkty.on('ready', function () {
        self.slideCount = self.flkty.slides.length;
        self.equalizeHeights();
        self.setCurrentSlide(self.flkty.selectedIndex);
        self.updatePassedSlides();
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      });

      this.flkty.on('settle', function () {
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      });

      this.flkty.on('change', function () { self.onSlideChange(); });

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
        self.equalizeHeights();
        self.updatePassedSlides();
      });
    }

    QuotesSlider.prototype.onSlideChange = function () {
      this.setCurrentSlide(this.flkty.selectedIndex);
      this.updatePassedSlides();
    };

    QuotesSlider.prototype.updatePassedSlides = function () {
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

        if (isLeftOfActive) {
          el.classList.add('is-passed');
        } else {
          el.classList.remove('is-passed');
        }
      });
    };

    QuotesSlider.prototype.setCurrentSlide = function () {
      if (!this.prevArrow || !this.nextArrow) return;
      // Im Loop-Modus nie disabled darstellen
      this.prevArrow.classList.remove('is-disabled');
      this.nextArrow.classList.remove('is-disabled');
    };

    QuotesSlider.prototype.refresh = function () {
      if (!this.flkty) return;

      this.flkty.reloadCells();
      this.flkty.resize();
      this.flkty.reposition();
      this.slideCount = this.flkty.slides.length;

      this.equalizeHeights();
      this.setCurrentSlide(this.flkty.selectedIndex);
      this.updatePassedSlides();
    };

    QuotesSlider.prototype.equalizeHeights = function () {
      if (!this.flkty || !this.flkty.cells || this.flkty.cells.length === 0) return;

      this.flkty.cells.forEach(function (cell) {
        cell.element.style.height = 'auto';
      });

      var maxHeight = 0;
      this.flkty.cells.forEach(function (cell) {
        var h = cell.element.offsetHeight;
        if (h > maxHeight) maxHeight = h;
      });

      this.flkty.cells.forEach(function (cell) {
        cell.element.style.height = maxHeight + 'px';
      });

      this.flkty.resize();
    };

    return QuotesSlider;
  })();

  Drupal.behaviors.hpmQuotesSlider = {
    attach: function (context) {
      context.querySelectorAll('.js-quotes-slider').forEach(function (el) {
        if (el.dataset.hpmSliderInit) return;
        el.dataset.hpmSliderInit = 'true';
        new QuotesSlider(el);
      });
    }
  };

})(Drupal);
