/**
 * @file
 * Accordion – custom slide animation with hash deep-linking.
 */
(function (Drupal) {
  'use strict';

  function slideUp(target, duration) {
    duration = duration || 500;
    target.style.transitionProperty = 'height, margin, padding';
    target.style.transitionDuration = duration + 'ms';
    target.style.boxSizing = 'border-box';
    target.style.height = target.offsetHeight + 'px';
    target.offsetHeight; // reflow
    target.style.overflow = 'hidden';
    target.style.height = 0;
    target.style.paddingTop = 0;
    target.style.paddingBottom = 0;
    target.style.marginTop = 0;
    target.style.marginBottom = 0;
    window.setTimeout(function () {
      target.style.display = 'none';
      target.style.removeProperty('height');
      target.style.removeProperty('padding-top');
      target.style.removeProperty('padding-bottom');
      target.style.removeProperty('margin-top');
      target.style.removeProperty('margin-bottom');
      target.style.removeProperty('overflow');
      target.style.removeProperty('transition-duration');
      target.style.removeProperty('transition-property');
    }, duration);
  }

  function slideDown(target, duration) {
    duration = duration || 500;
    target.style.removeProperty('display');
    var display = window.getComputedStyle(target).display;
    if (display === 'none') display = 'block';
    target.style.display = display;

    var height = target.offsetHeight;
    target.style.overflow = 'hidden';
    target.style.height = 0;
    target.style.paddingTop = 0;
    target.style.paddingBottom = 0;
    target.style.marginTop = 0;
    target.style.marginBottom = 0;
    target.offsetHeight; // reflow
    target.style.boxSizing = 'border-box';
    target.style.transitionProperty = 'height, margin, padding';
    target.style.transitionDuration = duration + 'ms';
    target.style.height = height + 'px';
    target.style.removeProperty('padding-top');
    target.style.removeProperty('padding-bottom');
    target.style.removeProperty('margin-top');
    target.style.removeProperty('margin-bottom');
    window.setTimeout(function () {
      target.style.removeProperty('height');
      target.style.removeProperty('overflow');
      target.style.removeProperty('transition-duration');
      target.style.removeProperty('transition-property');
    }, duration);
  }

  function openFromHash(accordion) {
    var hash = window.location.hash;
    if (!hash) return;

    var target = document.querySelector(hash);
    if (!target) return;

    var accordionBox = target.closest('.js-accordion-item');
    if (!accordionBox) return;

    var parentAccordion = accordionBox.closest('.js-accordion');
    if (parentAccordion !== accordion) return;

    var accordionHead = accordionBox.querySelector('.js-accordion-head');
    var accordionContent = accordionBox.querySelector('.js-accordion-content');

    var openElement = accordion.querySelector('.js-accordion-content.is-open');
    if (openElement && openElement !== accordionContent) {
      openElement.classList.remove('is-open');
      slideUp(openElement);
    }
    var activeElement = accordion.querySelector('.js-accordion-head.is-active');
    if (activeElement && activeElement !== accordionHead) {
      activeElement.classList.remove('is-active');
    }

    accordionHead.classList.add('is-active');
    accordionContent.classList.add('is-open');
    slideDown(accordionContent);

    setTimeout(function () {
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    }, 500);
  }

  Drupal.behaviors.hpmAccordion = {
    attach: function (context) {
      context.querySelectorAll('.js-accordion').forEach(function (accordion) {
        if (accordion.dataset.hpmAccordionInit) return;
        accordion.dataset.hpmAccordionInit = 'true';

        accordion.addEventListener('click', function (e) {
          var accordionHeader = e.target.closest('.js-accordion-head');
          if (!accordionHeader || !accordion.contains(accordionHeader)) return;

          var accordionContent = accordionHeader
            .closest('.js-accordion-item')
            .querySelector('.js-accordion-content');

          if (accordionHeader.classList.contains('is-active')) {
            accordionHeader.classList.remove('is-active');
            accordionContent.classList.remove('is-open');
            slideUp(accordionContent);
          } else {
            var openElement = accordion.querySelector('.js-accordion-content.is-open');
            if (openElement) {
              openElement.classList.remove('is-open');
              slideUp(openElement);
            }
            var activeElement = accordion.querySelector('.js-accordion-head.is-active');
            if (activeElement) activeElement.classList.remove('is-active');

            accordionHeader.classList.add('is-active');
            accordionContent.classList.add('is-open');
            slideDown(accordionContent);
          }

          setTimeout(function () {
            if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
          }, 500);
        });

        openFromHash(accordion);
      });
    }
  };

})(Drupal);
