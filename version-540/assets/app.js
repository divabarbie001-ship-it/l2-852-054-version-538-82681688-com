import { H as Hls } from "./hls-vendor-dru42stk.js";

const ready = (callback) => {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback, { once: true });
        return;
    }
    callback();
};

const normalize = (value) => String(value || "").trim().toLowerCase();

const setActiveSlide = (hero, index) => {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
        return 0;
    }
    const nextIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, current) => slide.classList.toggle("active", current === nextIndex));
    dots.forEach((dot, current) => dot.classList.toggle("active", current === nextIndex));
    hero.dataset.activeIndex = String(nextIndex);
    return nextIndex;
};

const bootHero = () => {
    document.querySelectorAll(".js-hero").forEach((hero) => {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        if (slides.length < 2) {
            return;
        }
        let activeIndex = 0;
        const next = () => {
            activeIndex = setActiveSlide(hero, activeIndex + 1);
        };
        const previous = () => {
            activeIndex = setActiveSlide(hero, activeIndex - 1);
        };
        hero.querySelector("[data-hero-next]")?.addEventListener("click", next);
        hero.querySelector("[data-hero-prev]")?.addEventListener("click", previous);
        hero.querySelectorAll("[data-hero-dot]").forEach((dot, index) => {
            dot.addEventListener("click", () => {
                activeIndex = setActiveSlide(hero, index);
            });
        });
        window.setInterval(next, 5200);
    });
};

const bootMenu = () => {
    document.querySelectorAll(".js-menu-toggle").forEach((button) => {
        const header = button.closest(".site-header");
        button.addEventListener("click", () => {
            header?.classList.toggle("menu-open");
        });
    });
};

const bootFilters = () => {
    const params = new URLSearchParams(window.location.search);
    const incomingQuery = params.get("q") || "";
    document.querySelectorAll("[data-filter-scope]").forEach((scope) => {
        const search = scope.querySelector(".js-search-input");
        const region = scope.querySelector(".js-region-filter");
        const type = scope.querySelector(".js-type-filter");
        const container = scope.nextElementSibling || document;
        const cards = Array.from(container.querySelectorAll("[data-card]"));
        if (search && incomingQuery) {
            search.value = incomingQuery;
        }
        const apply = () => {
            const q = normalize(search?.value);
            const selectedRegion = normalize(region?.value);
            const selectedType = normalize(type?.value);
            cards.forEach((card) => {
                const haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.keywords,
                    card.textContent
                ].join(" "));
                const matchesQuery = !q || haystack.includes(q);
                const matchesRegion = !selectedRegion || normalize(card.dataset.region).includes(selectedRegion);
                const matchesType = !selectedType || normalize(card.dataset.type).includes(selectedType);
                card.classList.toggle("is-hidden", !(matchesQuery && matchesRegion && matchesType));
            });
        };
        [search, region, type].forEach((control) => {
            control?.addEventListener("input", apply);
            control?.addEventListener("change", apply);
        });
        apply();
    });
    document.querySelectorAll(".js-category-jump").forEach((select) => {
        select.addEventListener("change", () => {
            if (select.value) {
                window.location.href = `category-${select.value}.html`;
            }
        });
    });
};

const attachSource = (video, source) => {
    if (!source) {
        return null;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return null;
    }
    if (Hls && Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        return hls;
    }
    video.src = source;
    return null;
};

const bootPlayers = () => {
    document.querySelectorAll(".js-video-player").forEach((shell) => {
        const video = shell.querySelector("video");
        const button = shell.querySelector(".play-button");
        if (!video || !button) {
            return;
        }
        let attached = false;
        let hlsInstance = null;
        const start = async () => {
            if (!attached) {
                hlsInstance = attachSource(video, video.dataset.video);
                attached = true;
            }
            video.controls = true;
            shell.classList.add("is-playing");
            try {
                await video.play();
            } catch (error) {
                shell.classList.remove("is-playing");
            }
        };
        button.addEventListener("click", start);
        video.addEventListener("click", () => {
            if (video.paused) {
                start();
            } else {
                video.pause();
            }
        });
        video.addEventListener("play", () => shell.classList.add("is-playing"));
        video.addEventListener("pause", () => {
            if (!video.ended) {
                shell.classList.remove("is-playing");
            }
        });
        window.addEventListener("pagehide", () => {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        }, { once: true });
    });
};

ready(() => {
    bootMenu();
    bootHero();
    bootFilters();
    bootPlayers();
});
