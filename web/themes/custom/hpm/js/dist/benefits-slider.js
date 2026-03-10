/**
 * @file
 * Benefits slider – Flickity carousel without wrapAround.
 */
(function (Drupal) {
  'use strict';

  var BenefitsSlider = (function () {
    function BenefitsSlider(elementOrSelector) {
      var self = this;

      this.root = typeof elementOrSelector === 'string'
        ? document.querySelector(elementOrSelector)
        : elementOrSelector;

      if (!this.root) {
        console.warn('BenefitsSlider: root element not found.', elementOrSelector);
        return;
      }

      this.carouselEl = this.root.querySelector('.carousel');
      if (!this.carouselEl) {
        console.warn('BenefitsSlider: .carousel not found within root.', this.root);
        return;
      }

      this.nextArrow = this.root.querySelector('.js-slider-button-next');
      this.prevArrow = this.root.querySelector('.js-slider-button-prev');

      if (!this.nextArrow || !this.prevArrow) {
        console.warn('BenefitsSlider: missing prev/next arrow buttons.', this.root);
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
        self.setCurrentSlide(self.flkty.selectedIndex);
        self.updatePassedSlides(self.flkty.selectedIndex);
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      });

      this.flkty.on('settle', function () {
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      });

      this.flkty.on('change', function (index) { self.onSlideChange(index); });

      if (this.prevArrow) {
        this.prevArrow.addEventListener('click', function (e) {
          e.preventDefault();
          self.flkty.previous();
        });
      }

      if (this.nextArrow) {
        this.nextArrow.addEventListener('click', function (e) {
          e.preventDefault();
          self.flkty.next();
        });
      }

      var init = function () { self.refresh(); };
      if (document.readyState === 'complete') init();
      else window.addEventListener('load', init);
    }

    BenefitsSlider.prototype.onSlideChange = function (index) {
      this.setCurrentSlide(index);
      this.updatePassedSlides(index);
    };

    BenefitsSlider.prototype.updatePassedSlides = function (activeIndex) {
      if (!this.flkty || !this.flkty.cells) return;

      this.flkty.cells.forEach(function (cell, i) {
        var el = cell.element;
        if (i < activeIndex) {
          el.classList.add('is-passed');
        } else {
          el.classList.remove('is-passed');
        }
      });
    };

    BenefitsSlider.prototype.setCurrentSlide = function (index) {
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

    BenefitsSlider.prototype.refresh = function () {
      if (!this.flkty) return;

      this.flkty.reloadCells();
      this.flkty.resize();
      this.flkty.reposition();

      this.slideCount = this.flkty.slides.length;

      this.setCurrentSlide(this.flkty.selectedIndex);
      this.updatePassedSlides(this.flkty.selectedIndex);

      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    };

    return BenefitsSlider;
  })();

  Drupal.behaviors.hpmBenefitsSlider = {
    attach: function (context) {
      if (typeof Flickity === 'undefined') return;
      context.querySelectorAll('.js-benefits-slider').forEach(function (el) {
        if (el.dataset.hpmSliderInit) return;
        try {
          new BenefitsSlider(el);
          el.dataset.hpmSliderInit = 'true';
        } catch (e) {
          console.error('BenefitsSlider init failed:', e);
        }
      });
    }
  };

})(Drupal);
