/* =========================================================
   CollabNotes — Landing page animations (visual only)
   Does not touch login, signup, Google or reset logic.
========================================================= */

(function () {
    "use strict";

    var reduceMotion =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var hero = document.querySelector(".hero-section");

    /* -----------------------------------------------------
       1. Decorative background layer (orbs, grid, particles)
    ----------------------------------------------------- */

    if (hero) {
        var layer = document.createElement("div");
        layer.className = "fx-layer";
        layer.setAttribute("aria-hidden", "true");

        layer.innerHTML =
            '<div class="fx-grid"></div>' +
            '<div class="fx-orb one"></div>' +
            '<div class="fx-orb two"></div>';

        if (!reduceMotion) {
            for (var i = 0; i < 16; i++) {
                var dot = document.createElement("span");
                var size = 2 + Math.random() * 3;

                dot.className = "fx-dot";
                dot.style.width = size + "px";
                dot.style.height = size + "px";
                dot.style.left = Math.random() * 100 + "%";
                dot.style.animationDuration = 12 + Math.random() * 14 + "s";
                dot.style.animationDelay = -Math.random() * 20 + "s";
                dot.style.setProperty("--sway", Math.random() * 80 - 40 + "px");

                layer.appendChild(dot);
            }
        }

        hero.insertBefore(layer, hero.firstChild);

        /* -------------------------------------------------
           2. Cursor spotlight + gentle orb parallax
        ------------------------------------------------- */

        var finePointer =
            window.matchMedia && window.matchMedia("(pointer: fine)").matches;

        if (finePointer && !reduceMotion) {
            var orbOne = layer.querySelector(".fx-orb.one");
            var orbTwo = layer.querySelector(".fx-orb.two");
            var ticking = false;
            var px = 0;
            var py = 0;
            var rect = null;

            hero.addEventListener("mouseenter", function () {
                rect = hero.getBoundingClientRect();
            });

            hero.addEventListener("mousemove", function (e) {
                if (!rect) rect = hero.getBoundingClientRect();

                px = e.clientX - rect.left;
                py = e.clientY - rect.top;

                if (ticking) return;
                ticking = true;

                requestAnimationFrame(function () {
                    hero.style.setProperty("--mx", px + "px");
                    hero.style.setProperty("--my", py + "px");

                    var dx = (px / rect.width - 0.5) * 2;
                    var dy = (py / rect.height - 0.5) * 2;

                    // translate is a separate property from the CSS transform
                    // animation, so the two never fight each other
                    orbOne.style.translate = dx * -26 + "px " + dy * -26 + "px";
                    orbTwo.style.translate = dx * 22 + "px " + dy * 22 + "px";

                    ticking = false;
                });
            });

            hero.addEventListener("mouseleave", function () {
                rect = null;
            });
        }
    }

    /* -----------------------------------------------------
       3. Headline: split into words for the mask reveal
    ----------------------------------------------------- */

    var headline = document.querySelector(".hero-content h1");

    if (headline && !reduceMotion) {
        var wordIndex = 0;
        var baseDelay = 0.35;
        var step = 0.08;

        var wrapText = function (node) {
            var parts = node.textContent.split(/(\s+)/);
            var frag = document.createDocumentFragment();

            parts.forEach(function (part) {
                if (!part) return;

                if (/^\s+$/.test(part)) {
                    frag.appendChild(document.createTextNode(" "));
                    return;
                }

                var outer = document.createElement("em");
                var inner = document.createElement("em");

                outer.className = "fx-word";
                inner.className = "fx-word-in";
                inner.style.setProperty(
                    "--d",
                    (baseDelay + wordIndex * step).toFixed(2) + "s"
                );
                inner.textContent = part;

                outer.appendChild(inner);
                frag.appendChild(outer);
                wordIndex++;
            });

            node.parentNode.replaceChild(frag, node);
        };

        var walk = function (el) {
            Array.prototype.slice.call(el.childNodes).forEach(function (child) {
                if (child.nodeType === 3) {
                    if (child.textContent.trim()) wrapText(child);
                } else if (child.nodeType === 1) {
                    walk(child);
                }
            });
        };

        walk(headline);
    }

    /* -----------------------------------------------------
       4. Replay the title animation on login <-> signup
    ----------------------------------------------------- */

    var formTitle = document.getElementById("formTitle");
    var formHeader = document.querySelector(".form-header");

    if (formTitle && formHeader && "MutationObserver" in window) {
        new MutationObserver(function () {
            formHeader.classList.remove("fx-swap");
            void formHeader.offsetWidth; // restart animation
            formHeader.classList.add("fx-swap");
        }).observe(formTitle, { childList: true, characterData: true, subtree: true });
    }

    /* After the intro finishes, make mode switches snappy */
    setTimeout(function () {
        document.body.classList.add("fx-ready");
    }, 2200);
})();