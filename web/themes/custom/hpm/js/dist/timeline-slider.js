/**
 * @file
 * Timeline slider – Flickity carousel with is-passed/is-selected states.
 */
(function (Drupal) {
  'use strict';

  var TimelineSlider = (function () {
    function TimelineSlider(elementOrSelector) {
      var self = this;

      this.root = typeof elementOrSelector === 'string'
        ? document.querySelector(elementOrSelector)
        : elementOrSelector;

      if (!this.root) {
        console.warn('TimelineSlider: root element not found.', elementOrSelector);
        return;
      }

      this.carouselEl = this.root.querySelector('.timeline-slider');
      if (!this.carouselEl) {
        console.warn('TimelineSlider: .timeline-slider not found within root.', this.root);
        return;
      }

      this.nextArrow = this.root.querySelector('.js-slider-button-next');
      this.prevArrow = this.root.querySelector('.js-slider-button-prev');

      if (!this.nextArrow || !this.prevArrow) {
        console.warn('TimelineSlider: missing arrow buttons.', this.root);
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
        self.refresh();
      });
    }

    TimelineSlider.prototype.onSlideChange = function (index) {
      this.setCurrentSlide(index);
      this.updatePassedSlides(index);
    };

    TimelineSlider.prototype.updatePassedSlides = function (activeIndex) {
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

    TimelineSlider.prototype.setCurrentSlide = function (index) {
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

    TimelineSlider.prototype.refresh = function () {
      if (!this.flkty) return;

      this.flkty.reloadCells();
      this.flkty.resize();
      this.flkty.reposition();
      this.slideCount = this.flkty.slides.length;

      this.setCurrentSlide(this.flkty.selectedIndex);
      this.updatePassedSlides(this.flkty.selectedIndex);
    };

    return TimelineSlider;
  })();

  Drupal.behaviors.hpmTimelineSlider = {
    attach: function (context) {
      if (typeof Flickity === 'undefined') return;
      context.querySelectorAll('.js-timeline-slider').forEach(function (el) {
        if (el.dataset.hpmSliderInit) return;
        try {
          new TimelineSlider(el);
          el.dataset.hpmSliderInit = 'true';
        } catch (e) {
          console.error('TimelineSlider init failed:', e);
        }
      });
    }
  };

})(Drupal);
