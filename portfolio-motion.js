(function () {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const body = document.body;

    body.classList.add("motion-ready");

    function setYear() {
        const currentYear = document.getElementById("currentYear");
        if (currentYear) {
            currentYear.textContent = new Date().getFullYear();
        }
    }

    function splitHeroTitle() {
        const title = document.querySelector(".hero-title");
        if (!title || title.dataset.motionSplit === "true") {
            return;
        }

        const text = title.textContent.trim().replace(/\s+/g, " ");
        title.textContent = "";
        text.split(" ").forEach((word, index, words) => {
            const span = document.createElement("span");
            span.className = "word";
            span.style.setProperty("--word-index", index);
            span.textContent = word;
            title.appendChild(span);

            if (index < words.length - 1) {
                title.appendChild(document.createTextNode(" "));
            }
        });

        title.dataset.motionSplit = "true";
        requestAnimationFrame(() => title.classList.add("hero-in"));
    }

    function setupReveals() {
        const revealSelectors = [
            ".hero-tagline",
            ".hero-copy p",
            ".hero-actions",
            ".hero-aside-item",
            ".hero-card",
            "section:not(.hero-section) > .max-w-7xl > .text-center",
            ".project-card",
            ".skill-card",
            ".timeline-item",
            ".contact-card",
            ".contact-card + .glass-card",
            ".grid.lg\\:grid-cols-2 > .glass-card",
            ".grid.lg\\:grid-cols-2 > .space-y-8 > .glass-card"
        ];

        const elements = [...document.querySelectorAll(revealSelectors.join(","))];

        elements.forEach((element, index) => {
            element.classList.add("premium-reveal");
            element.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 70}ms`);
        });

        if (reduceMotion || !("IntersectionObserver" in window)) {
            elements.forEach((element) => element.classList.add("in-view"));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in-view");
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: "0px 0px -8% 0px"
        });

        elements.forEach((element) => observer.observe(element));
    }

    function setupParallax() {
        if (reduceMotion) {
            return;
        }

        const parallaxElements = [
            ...document.querySelectorAll(".hero-card"),
            ...document.querySelectorAll(".project-card:nth-child(2n) .project-image"),
            ...document.querySelectorAll(".relative.inline-block")
        ];

        parallaxElements.forEach((element) => element.classList.add("premium-parallax"));

        let ticking = false;

        function update() {
            const viewportHeight = window.innerHeight || 1;

            parallaxElements.forEach((element, index) => {
                const rect = element.getBoundingClientRect();
                if (rect.bottom < 0 || rect.top > viewportHeight) {
                    return;
                }

                const progress = (rect.top + rect.height / 2 - viewportHeight / 2) / viewportHeight;
                const strength = index === 0 ? -18 : -10;
                element.style.transform = `translate3d(0, ${progress * strength}px, 0)`;
            });

            ticking = false;
        }

        function requestUpdate() {
            if (!ticking) {
                window.requestAnimationFrame(update);
                ticking = true;
            }
        }

        update();
        window.addEventListener("scroll", requestUpdate, { passive: true });
        window.addEventListener("resize", requestUpdate);
    }

    function setupProjectFiltering() {
        if (!document.getElementById("projectsGrid")) {
            return;
        }

        window.filterProjects = function filterProjects(category, sourceButton) {
            const cards = document.querySelectorAll(".project-card");
            const buttons = document.querySelectorAll(".filter-btn");
            const activeButton = sourceButton || window.event?.target;

            buttons.forEach((button) => button.classList.remove("active"));
            if (activeButton) {
                activeButton.classList.add("active");
            }

            cards.forEach((card) => {
                const shouldShow = category === "all" || card.dataset.category.includes(category);
                card.style.opacity = shouldShow ? "1" : "0";
                card.style.transform = shouldShow ? "" : "translateY(12px)";

                window.setTimeout(() => {
                    card.style.display = shouldShow ? "block" : "none";
                }, shouldShow ? 0 : 260);
            });
        };

        document.querySelectorAll(".filter-btn").forEach((button) => {
            button.addEventListener("click", (event) => {
                window.filterProjects(event.currentTarget.dataset.filter, event.currentTarget);
            });
        });
    }

    function setupMagneticButtons() {
        if (reduceMotion || window.matchMedia("(pointer: coarse)").matches) {
            return;
        }

        const buttons = document.querySelectorAll(".btn-primary, .btn-secondary, .filter-btn, .social-link");

        buttons.forEach((button) => {
            button.addEventListener("mousemove", (event) => {
                const rect = button.getBoundingClientRect();
                const x = event.clientX - rect.left - rect.width / 2;
                const y = event.clientY - rect.top - rect.height / 2;
                button.style.transform = `translate3d(${x * 0.08}px, ${y * 0.12}px, 0)`;
            });

            button.addEventListener("mouseleave", () => {
                button.style.transform = "";
            });
        });
    }

    function setupCvDownload() {
        window.downloadCV = function downloadCV() {
            const link = document.createElement("a");
            link.href = "Pascal-DeSouza-CV.pdf";
            link.download = "Pascal-DeSouza-CV.pdf";
            document.body.appendChild(link);
            link.click();
            link.remove();

            const existing = document.querySelector(".cv-toast");
            if (existing) {
                existing.remove();
            }

            const notification = document.createElement("div");
            notification.className = "cv-toast fixed top-4 right-4 glass-card p-4 rounded-lg z-50";
            notification.innerHTML = `
                <div class="flex items-center space-x-2">
                    <i class="fas fa-check-circle"></i>
                    <span>CV downloaded</span>
                </div>
            `;
            document.body.appendChild(notification);
            window.setTimeout(() => notification.remove(), 2600);
        };
    }

    function init() {
        setYear();
        splitHeroTitle();
        setupReveals();
        setupParallax();
        setupProjectFiltering();
        setupMagneticButtons();
        setupCvDownload();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
}());
