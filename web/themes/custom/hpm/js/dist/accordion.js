/**
 * @file
 * Accordion – animate <details> close via CSS grid transition.
 * Uses .is-open class to drive CSS animations.
 */
(function (Drupal) {
  'use strict';

  Drupal.behaviors.hpmAccordion = {
    attach: function (context) {
      context.querySelectorAll('details.accordion__box').forEach(function (el) {
        if (el.dataset.init) return;
        el.dataset.init = '1';

        el.querySelector('summary').addEventListener('click', function (e) {
          if (!el.open) return;
          e.preventDefault();
          el.classList.remove('is-open');
          var body = el.querySelector('.accordion-body');
          body.addEventListener('transitionend', function () {
            el.open = false;
          }, { once: true });
        });

        new MutationObserver(function () {
          if (el.open) el.classList.add('is-open');
        }).observe(el, { attributes: true, attributeFilter: ['open'] });
      });
    }
  };
})(Drupal);
