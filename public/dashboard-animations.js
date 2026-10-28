/* =========================================================
   CollabNotes — Dashboard animations (visual only)
   Watches the page and adds motion. It never edits notes,
   folders, likes, search, login or any other app logic.
========================================================= */

(function () {
  "use strict";

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* -------------------------------------------------------
     1. Stat counters: numbers roll up when they change
  ------------------------------------------------------- */

  var counters = [];

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function setupCounter(id) {
    var el = document.getElementById(id);
    if (!el || reduceMotion || !("MutationObserver" in window)) return;

    var state = {
      shown: parseInt(el.textContent, 10) || 0, // value currently on screen
      raf: null,
      writing: false
    };

    var observer = new MutationObserver(function () {
      // ignore the changes we make ourselves
      if (state.writing) return;

      var target = parseInt(el.textContent.trim(), 10);
      if (isNaN(target)) return;

      // the app just wrote a fresh value: stop any roll in progress
      if (state.raf) {
        cancelAnimationFrame(state.raf);
        state.raf = null;
      }

      var from = state.shown;
      if (target === from) return;

      var start = null;
      var duration = Math.min(1100, 500 + Math.abs(target - from) * 25);

      var step = function (now) {
        if (start === null) start = now;

        var progress = Math.min((now - start) / duration, 1);
        var value = Math.round(from + (target - from) * easeOutCubic(progress));

        state.writing = true;
        el.textContent = value;

        // flush our own mutation so it is not mistaken for an app update
        observer.takeRecords();
        state.writing = false;

        if (progress < 1) {
          state.raf = requestAnimationFrame(step);
        } else {
          state.raf = null;
          state.shown = target;

          el.classList.remove("fx-bump");
          void el.offsetWidth;
          el.classList.add("fx-bump");
        }
      };

      // show the old value first so the roll starts from it
      state.writing = true;
      el.textContent = from;
      observer.takeRecords();
      state.writing = false;

      state.raf = requestAnimationFrame(step);
    });

    observer.observe(el, {
      childList: true,
      characterData: true,
      subtree: true
    });

    counters.push(observer);
  }

  ["totalNotes", "favoriteNotes", "folderCount", "sharedNotes"].forEach(
    setupCounter
  );

  /* -------------------------------------------------------
     2. Cursor spotlight on stat cards and note cards
  ------------------------------------------------------- */

  var finePointer =
    window.matchMedia && window.matchMedia("(pointer: fine)").matches;

  if (finePointer && !reduceMotion) {
    var pending = null;
    var queued = false;

    document.addEventListener(
      "mousemove",
      function (e) {
        var card = e.target.closest && e.target.closest(".stat-card, .note-card");
        if (!card) return;

        pending = { card: card, x: e.clientX, y: e.clientY };

        if (queued) return;
        queued = true;

        requestAnimationFrame(function () {
          queued = false;
          if (!pending) return;

          var rect = pending.card.getBoundingClientRect();
          pending.card.style.setProperty("--mx", pending.x - rect.left + "px");
          pending.card.style.setProperty("--my", pending.y - rect.top + "px");
          pending = null;
        });
      },
      { passive: true }
    );
  }

  /* -------------------------------------------------------
     3. Click ripple on main buttons
  ------------------------------------------------------- */

  if (!reduceMotion) {
    var rippleTargets =
      ".create-btn, .save-btn, .cancel-btn, .empty-create-btn, " +
      ".retry-btn, .folder-create-btn, .new-folder";

    document.addEventListener(
      "click",
      function (e) {
        var btn = e.target.closest && e.target.closest(rippleTargets);
        if (!btn || btn.disabled) return;

        var rect = btn.getBoundingClientRect();
        var size = Math.max(rect.width, rect.height) * 2;

        var ripple = document.createElement("span");
        ripple.className = "fx-ripple";
        ripple.style.width = ripple.style.height = size + "px";
        ripple.style.left = e.clientX - rect.left - size / 2 + "px";
        ripple.style.top = e.clientY - rect.top - size / 2 + "px";

        btn.appendChild(ripple);

        setTimeout(function () {
          if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
        }, 700);
      },
      true
    );
  }
})();