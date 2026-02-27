/* ============================================================
   URSTUD BUD — ANIMATION RUNTIME  v2.0
   Handles: page exit transitions, ripple, scroll reveal,
            navbar shadow, dynamic stagger, magnetic buttons
============================================================ */

(function () {
  'use strict';

  /* ─── 1. PAGE EXIT TRANSITION ──────────────────────────────
     Intercept every goTo() call and fade the page out first   */
  var origGoTo = window.goTo;
  window.goTo = function (dest) {
    var $page = $('[class^="page-"]').first();
    if (!$page.length) { origGoTo(dest); return; }
    $page.addClass('page-exit');
    setTimeout(function () { origGoTo(dest); }, 200);
  };

  $(document).ready(function () {

    /* ─── 2. RIPPLE ON CLICK ─────────────────────────────────
       Material-style expanding circle from exact click point  */
    var RIPPLE_TARGETS = [
      '.cta-btn', '.sign-in-btn', '.po-start-btn',
      '.po-submit-answer-btn', '.po-next-btn',
      '.po-retry-btn', '.po-edit-btn',
      '.fs-next-phase-btn', '.ml-modal-retry-btn',
      '.yn-btn', '.menu-card', '.submit-quiz-btn',
      '.rw-other-btn', '#sr-check-btn', '#sr-next-btn',
      '#sr-retry-btn', '#sr-edit-btn', '.fs-skip-btn',
      '.ml-tab', '.fs-preset-btn', '.result-item'
    ].join(',');

    $(document).on('click', RIPPLE_TARGETS, function (e) {
      var $el     = $(this);
      var offset  = $el.offset();
      var x       = e.pageX - offset.left;
      var y       = e.pageY - offset.top;
      var $ripple = $('<span class="btn-ripple"></span>').css({ left: x - 4, top: y - 4 });
      $el.append($ripple);
      setTimeout(function () { $ripple.remove(); }, 620);
    });

    /* ─── 3. NAVBAR SCROLL SHADOW ────────────────────────────
       Elevates navbar when scrollable content moves beneath  */
    var SCROLL_BODIES = [
      '.po-add-body', '.po-practice-body', '.po-score-body',
      '.sr-setup-body', '.sr-quiz-body',
      '.fs-setup-body', '.fs-phase-body', '.fs-study-body', '.fs-choose-body',
      '.ml-body', '.rw-body', '.about-scroll',
      '.contact-card', '.sr-phase-body'
    ].join(',');

    $(document).on('scroll', SCROLL_BODIES, function () {
      var scrolled = $(this).scrollTop() > 8;
      $(this).closest('[class^="page-"]').find('.navbar')
             .toggleClass('navbar-scrolled', scrolled);
    });
    // Also handle window scroll for pages where body scrolls
    $(window).on('scroll', function () {
      $('.navbar').toggleClass('navbar-scrolled', $(window).scrollTop() > 8);
    });

    /* ─── 4. SCROLL REVEAL (IntersectionObserver) ────────────
       Elegantly reveals elements as they enter the viewport   */
    if ('IntersectionObserver' in window) {
      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            $(entry.target).addClass('is-visible').removeClass('will-reveal');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -24px 0px' });

      // Tag children of scrollable containers for reveal
      var REVEAL_CONTAINERS = [
        '.about-scroll', '.ml-body', '.sr-setup-body', '.fs-setup-body'
      ];
      REVEAL_CONTAINERS.forEach(function (sel) {
        var $c = $(sel);
        if (!$c.length) return;
        $c.children().each(function (i) {
          if (!$(this).is('.navbar, .rw-title-bar, .fs-phase-strip')) {
            $(this).addClass('will-reveal')
                   .css('animation-delay', (i * 0.08) + 's');
            revealObserver.observe(this);
          }
        });
      });
    }

    /* ─── 5. DYNAMIC STAGGER — newly appended cards ──────────
       Watches key lists for new children and animates them in */
    if ('MutationObserver' in window) {
      var STAGGER_CLASSES = [
        'ml-history-card', 'po-review-item', 'po-question-card',
        'sr-topic-card', 'ml-modal-qa-card', 'ml-modal-topic-card',
        'ml-modal-fs-row', 'fs-break-tip', 'about-method-item',
        'contact-item', 'result-item'
      ];

      var mutObs = new MutationObserver(function (mutations) {
        mutations.forEach(function (mut) {
          mut.addedNodes.forEach(function (node) {
            if (node.nodeType !== 1) return;
            var $n  = $(node);
            var hit = STAGGER_CLASSES.some(function (c) { return $n.hasClass(c); });
            if (!hit) return;
            var siblings = $n.siblings().length;
            var delay    = Math.min(siblings * 65, 400);
            $n.css({ opacity: 0, transform: 'translateY(14px) scale(0.97)' });
            setTimeout(function () {
              $n.css({
                transition : 'opacity 380ms cubic-bezier(0.22,0.61,0.36,1), transform 380ms cubic-bezier(0.22,0.61,0.36,1)',
                opacity    : 1,
                transform  : 'translateY(0) scale(1)'
              });
            }, delay + 16);
          });
        });
      });

      var WATCH_LISTS = [
        '#ml-history-list', '#po-questions-list', '#sr-topics-list',
        '#ml-modal-body',   '#po-review-list',    '#sr-review-list',
        '#results-list',    '.fs-break-tips',      '.about-methods-grid',
        '.about-steps',     '.contact-card'
      ];
      WATCH_LISTS.forEach(function (sel) {
        var el = document.querySelector(sel);
        if (el) mutObs.observe(el, { childList: true });
      });
    }

    /* ─── 6. FOCUS RING POLISH ───────────────────────────────
       Remove default focus outline; add gold ring instead     */
    $(document).on('keydown', function (e) {
      if (e.key === 'Tab') $('body').addClass('kb-nav');
    });
    $(document).on('mousedown', function () {
      $('body').removeClass('kb-nav');
    });

    /* ─── 7. BUTTON PRESS SCALE ──────────────────────────────
       Universal active-state scale for satisfying click feel  */
    $(document).on('mousedown touchstart', 'button, .menu-card, .result-item, .fs-choose-card, .ml-history-card', function () {
      $(this).css('transition', 'transform 80ms ease');
      $(this).css('transform', 'scale(0.96)');
    });
    $(document).on('mouseup touchend mouseleave', 'button, .menu-card, .result-item, .fs-choose-card, .ml-history-card', function () {
      var $el = $(this);
      // Let CSS animation handle the "release" spring
      setTimeout(function () { $el.css('transform', ''); }, 20);
    });

    /* ─── 8. QUIZ ANSWER TOGGLE ANIMATION ───────────────────
       Pop feedback when YES/NO toggled                        */
    $(document).on('click', '.quiz-yn', function () {
      var $this = $(this);
      $this.css('animation', 'none');
      // Force reflow
      void $this[0].offsetWidth;
      $this.css('animation', '');
    });

    /* ─── 9. PROGRESS BAR SMOOTH INIT ───────────────────────
       Ensures bars start at 0 and animate to their value      */
    function animateProgressBars() {
      $('.po-progress-bar-fill, #sr-progress-fill').each(function () {
        var $bar = $(this);
        var target = $bar.css('width');
        $bar.css({ width: '0%', transition: 'none' });
        setTimeout(function () {
          $bar.css({ transition: 'width 650ms cubic-bezier(0.16,1,0.3,1)', width: target });
        }, 80);
      });
    }
    // Run once on load
    setTimeout(animateProgressBars, 300);

    /* ─── 10. PHASE STEP TRANSITION ─────────────────────────
       When a phase step becomes active, pulse the strip       */
    var lastActivePhase = null;
    setInterval(function () {
      var $active = $('.fs-phase-step.active');
      if ($active.length && $active.text() !== lastActivePhase) {
        lastActivePhase = $active.text();
        $active.css('animation', 'none');
        void $active[0].offsetWidth;
        $active.css('animation', '');
      }
    }, 400);

  }); // end document.ready

})();
