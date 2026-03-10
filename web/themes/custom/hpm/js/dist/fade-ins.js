/**
 * @file
 * Fade-in animations – GSAP ScrollTrigger based element and image animations.
 */
(function (Drupal) {
  'use strict';

  // Register ScrollTrigger plugin (must happen before any ScrollTrigger usage)
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // --- Element Fade-Ins ---
  Drupal.behaviors.hpmElementFadeIns = {
    attach: function (context) {
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

      // elementGroupInit
      context.querySelectorAll('.js-element-group').forEach(function (item) {
        if (item.dataset.hpmFadeInit) return;
        item.dataset.hpmFadeInit = 'true';

        var baseDelay = parseFloat((item.dataset.delay || '0').replace(',', '.')) || 0;

        gsap.timeline({
          delay: baseDelay,
          scrollTrigger: {
            trigger: item,
            start: 'top 90%',
            markers: false,
            toggleActions: 'play none none none'
          }
        }).from(item.querySelectorAll(':scope > *'), {
          opacity: 0,
          y: '24px',
          duration: 1,
          ease: 'power3.out',
          stagger: 0.15
        });
      });

      // contentGroupInit
      context.querySelectorAll('.js-content-group').forEach(function (item) {
        if (item.dataset.hpmFadeInit) return;
        item.dataset.hpmFadeInit = 'true';

        gsap.timeline({
          scrollTrigger: {
            trigger: item,
            start: 'top 90%',
            markers: false,
            toggleActions: 'play none none none'
          }
        }).from(item.querySelectorAll(':scope > *'), {
          opacity: 0,
          y: '30px',
          duration: 1.4,
          ease: 'power3.out',
          stagger: 0.15
        });
      });

      // sideSlideInit
      context.querySelectorAll('.js-side-slide').forEach(function (item) {
        if (item.dataset.hpmFadeInit) return;
        item.dataset.hpmFadeInit = 'true';

        var targets = item.querySelectorAll(':scope > *');
        gsap.set(targets, { autoAlpha: 0, x: '6vw' });

        var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduceMotion) {
          gsap.set(targets, { autoAlpha: 1, x: 0 });
          return;
        }

        gsap.timeline({
          scrollTrigger: {
            trigger: item,
            start: 'top 90%',
            toggleActions: 'play none none none'
          }
        }).to(targets, {
          autoAlpha: 1,
          x: 0,
          duration: 1.5,
          ease: 'power3.out',
          stagger: 0.2
        });
      });

      // upSlideInit
      context.querySelectorAll('.js-up-slide').forEach(function (item) {
        if (item.dataset.hpmFadeInit) return;
        item.dataset.hpmFadeInit = 'true';

        var targets = item.querySelectorAll(':scope > *');
        gsap.set(targets, { autoAlpha: 0, y: '4vh' });

        var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduceMotion) {
          gsap.set(targets, { autoAlpha: 1, y: 0 });
          return;
        }

        gsap.timeline({
          scrollTrigger: {
            trigger: item,
            start: 'top 90%',
            toggleActions: 'play none none none'
          }
        }).to(targets, {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          stagger: 0.15
        });
      });

      // outsideToInsideInit
      context.querySelectorAll('.js-outside-to-inside-group').forEach(function (group) {
        if (group.dataset.hpmFadeInit) return;
        group.dataset.hpmFadeInit = 'true';

        var kids = group.querySelectorAll(':scope > *');
        if (kids.length < 2) return;

        gsap.timeline({
          scrollTrigger: {
            trigger: group,
            start: 'top 90%',
            markers: false,
            toggleActions: 'play none none none'
          }
        })
          .from(kids[0], {
            opacity: 0,
            x: '-6vw',
            duration: 1.5,
            ease: 'power3.out'
          }, 0)
          .from(kids[1], {
            opacity: 0,
            x: '6vw',
            duration: 1.5,
            ease: 'power3.out'
          }, 0.2);
      });

      // rowsFadeInit
      (function () {
        var all = Array.from(context.querySelectorAll('.js-row-fade'));
        if (!all.length) return;

        // Filter already-initialized
        all = all.filter(function (el) {
          if (el.dataset.hpmFadeInit) return false;
          el.dataset.hpmFadeInit = 'true';
          return true;
        });
        if (!all.length) return;

        gsap.set('.js-row-fade .line-inner', { x: '-100%', autoAlpha: 0 });
        gsap.set('.js-row-fade .js-row-content > *', { y: '24px', autoAlpha: 0 });

        var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduceMotion) {
          gsap.set('.js-row-fade .line-inner', { x: 0, autoAlpha: 1 });
          gsap.set('.js-row-fade .js-row-content > *', { y: 0, autoAlpha: 1 });
          return;
        }

        var groups = [];
        var i = 0;
        while (i < all.length) {
          var group = [all[i]];
          var next = all[i].nextElementSibling;
          while (next && next.classList && next.classList.contains('js-row-fade')) {
            group.push(next);
            i++;
            next = all[i] ? all[i].nextElementSibling : null;
          }
          groups.push(group);
          i++;
        }

        var groupDelay = 0.25;
        var innerStagger = 0.2;

        groups.forEach(function (group) {
          var triggerEl = group[0];

          var tl = gsap.timeline({
            scrollTrigger: {
              trigger: triggerEl,
              start: 'top 80%',
              toggleActions: 'play none none none',
              markers: false
            },
            defaults: { ease: 'power2.out' }
          });

          group.forEach(function (item, idx) {
            var at = idx * groupDelay;

            tl.to(
              item.querySelectorAll('.line-inner'),
              {
                x: 0,
                autoAlpha: 1,
                duration: 0.8,
                stagger: innerStagger
              },
              at
            );

            tl.to(
              item.querySelectorAll('.js-row-content > *'),
              {
                y: 0,
                delay: 0.2,
                autoAlpha: 1,
                duration: 0.8,
                stagger: innerStagger
              },
              at + 0.1
            );
          });
        });
      })();
    }
  };

  // --- Image Fade-Ins ---
  Drupal.behaviors.hpmImageFadeIns = {
    attach: function (context) {
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

      // zoomInit
      context.querySelectorAll('.js-zoom-image').forEach(function (item) {
        if (item.dataset.hpmFadeInit) return;
        item.dataset.hpmFadeInit = 'true';

        var baseDelay = parseFloat((item.dataset.delay || '0').replace(',', '.')) || 0;
        var baseDuration = parseFloat((item.dataset.duration || '1.4').replace(',', '.')) || 1.4;
        var credits = item.nextElementSibling && item.nextElementSibling.matches && item.nextElementSibling.matches('.credits')
          ? item.nextElementSibling
          : null;

        var tl = gsap.timeline({
          delay: baseDelay,
          scrollTrigger: {
            trigger: item,
            start: 'top 90%',
            markers: false,
            toggleActions: 'play none none none'
          }
        }).from(item.querySelector('img, video'), {
          scale: 1.1,
          opacity: 0,
          duration: baseDuration,
          ease: 'power2.out'
        });

        if (credits) {
          tl.from(credits, {
            opacity: 0,
            duration: 0.5,
            ease: 'power2.out'
          }, '.2');
        }
      });

      // slideInit
      context.querySelectorAll('.js-slide-image').forEach(function (item) {
        if (item.dataset.hpmFadeInit) return;
        item.dataset.hpmFadeInit = 'true';

        gsap.timeline({
          scrollTrigger: {
            trigger: item,
            start: 'top 90%',
            markers: false,
            toggleActions: 'play none none none'
          }
        })
          .from(item, {
            x: 400,
            opacity: 0,
            duration: 1.2,
            ease: 'power2.out'
          })
          .from(item.querySelector('img'), {
            x: -400,
            duration: 1.2,
            ease: 'power2.out'
          }, 0);
      });
    }
  };

  // --- Map Fade ---
  Drupal.behaviors.hpmMapFade = {
    attach: function (context) {
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

      context.querySelectorAll('.js-map').forEach(function (item) {
        if (item.dataset.hpmFadeInit) return;
        item.dataset.hpmFadeInit = 'true';

        gsap.timeline({
          scrollTrigger: {
            trigger: item,
            start: 'top 90%',
            markers: false,
            toggleClass: 'is-in-view',
            toggleActions: 'play none none none'
          }
        }).from(item.querySelectorAll('.svg-map'), {
          scale: 1.15,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out',
          stagger: 0.2,
          delay: 0.5
        }, 0)
          .from(item.querySelectorAll('.locations > *'), {
            opacity: 0,
            duration: 0.8,
            ease: 'power2.out',
            stagger: 0.2,
            delay: 0.4
          }, 0.4);
      });
    }
  };

})(Drupal);
