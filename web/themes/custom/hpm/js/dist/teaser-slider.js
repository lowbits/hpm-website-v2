/**
 * @file
 * Teaser slider – Flickity carousel with is-passed tracking.
 */
(function (Drupal) {
  'use strict';

  var TeaserSlider = (function () {
    function TeaserSlider(elementOrSelector) {
      var self = this;

      this.root = typeof elementOrSelector === 'string'
        ? document.querySelector(elementOrSelector)
        : elementOrSelector;

      if (!this.root) {
        console.warn('TeaserSlider: root element not found.', elementOrSelector);
        return;
      }

      this.isBenefits = this.root.classList.contains('benefits');

      this.carouselEl = this.root.querySelector('.carousel');
      if (!this.carouselEl) {
        console.warn('TeaserSlider: .carousel not found within root.', this.root);
        return;
      }

      // Unwrap Drupal's views-element-container so slides are
      // direct children of .carousel as Flickity requires.
      var viewsWrapper = this.carouselEl.querySelector('.views-element-container');
      if (viewsWrapper) {
        while (viewsWrapper.firstChild) {
          this.carouselEl.appendChild(viewsWrapper.firstChild);
        }
        viewsWrapper.remove();
      }

      this.nextArrow = this.root.querySelector('.js-slider-button-next');
      this.prevArrow = this.root.querySelector('.js-slider-button-prev');

      if (!this.nextArrow || !this.prevArrow) {
        console.warn('TeaserSlider: missing prev/next arrow buttons.', this.root);
      }

      this.flkty = new Flickity(this.carouselEl, {
        adaptiveHeight: false,
        cellAlign: 'left',
        draggable: true,
        pageDots: false,
        prevNextButtons: false,
        initialIndex: 0,
        wrapAround: false
      });

      this.slideCount = 0;

      this.flkty.on('ready', function () {
        self.slideCount = self.flkty.slides.length;

        if (self.isBenefits) {
          self.equalizeHeights();
        }

        self.setCurrentSlide(self.flkty.selectedIndex);
        self.updatePassedSlides(self.flkty.selectedIndex);
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      });

      this.flkty.on('settle', function () {
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      });

      this.flkty.on('change', function (index) { self.onSlideChange(index); });

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
        if (self.isBenefits) {
          self.equalizeHeights();
        }
      });
    }

    TeaserSlider.prototype.onSlideChange = function (index) {
      this.setCurrentSlide(index);
      this.updatePassedSlides(index);
    };

    TeaserSlider.prototype.updatePassedSlides = function (activeIndex) {
      if (!this.flkty || !this.flkty.cells) return;

      this.flkty.cells.forEach(function (cell, i) {
        var slide = cell.element;
        if (!slide) return;

        if (i < activeIndex) {
          slide.classList.add('is-passed');
        } else {
          slide.classList.remove('is-passed');
        }
      });
    };

    TeaserSlider.prototype.setCurrentSlide = function (index) {
      if (!this.prevArrow || !this.nextArrow) return;

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

    TeaserSlider.prototype.refresh = function () {
      if (!this.flkty) return;

      this.flkty.reloadCells();
      this.flkty.resize();
      this.flkty.reposition();
      this.slideCount = this.flkty.slides.length;

      if (this.isBenefits) {
        this.equalizeHeights();
      }

      this.setCurrentSlide(this.flkty.selectedIndex);
      this.updatePassedSlides(this.flkty.selectedIndex);
    };

    TeaserSlider.prototype.equalizeHeights = function () {
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

    return TeaserSlider;
  })();

  Drupal.behaviors.hpmTeaserSlider = {
    attach: function (context) {
      if (typeof Flickity === 'undefined') return;
      context.querySelectorAll('.js-teaser-slider').forEach(function (el) {
        if (el.dataset.hpmSliderInit) return;
        try {
          new TeaserSlider(el);
          el.dataset.hpmSliderInit = 'true';
        } catch (e) {
          console.error('TeaserSlider init failed:', e);
        }
      });
    }
  };

})(Drupal);
