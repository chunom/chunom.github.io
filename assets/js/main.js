(() => {
  document.documentElement.classList.add("js");

  const header = document.querySelector("[data-site-header]");
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-site-nav]");

  if (header && toggle && nav) {
    const closeNav = () => {
      header.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation");
    };

    toggle.addEventListener("click", () => {
      const isOpen = header.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    });

    nav.addEventListener("click", (event) => {
      if (event.target instanceof HTMLAnchorElement) {
        closeNav();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeNav();
      }
    });
  }

  document.querySelectorAll("[data-copy-url]").forEach((button) => {
    if (!navigator.clipboard) {
      button.hidden = true;
      return;
    }

    const label = button.textContent;
    button.addEventListener("click", () => {
      navigator.clipboard
        .writeText(button.dataset.copyUrl || window.location.href)
        .then(() => {
          button.textContent = "Copied";
          window.setTimeout(() => {
            button.textContent = label;
          }, 1800);
        })
        .catch(() => {
          button.textContent = "Copy failed";
          window.setTimeout(() => {
            button.textContent = label;
          }, 1800);
        });
    });
  });

  const fontSampleSelect = document.querySelector("[data-font-sample-select]");

  if (fontSampleSelect) {
    const sampleImage = document.querySelector("[data-font-sample-image]");
    const sampleCaption = document.querySelector("[data-font-sample-caption]");

    const updateFontSamples = () => {
      const selectedOption = fontSampleSelect.selectedOptions[0];
      const label = selectedOption?.textContent?.trim() || "Font 1";
      const imageSource = selectedOption?.dataset.imageSrc;

      if (sampleImage && imageSource) {
        sampleImage.src = imageSource;
        sampleImage.alt = `${label} sample image`;
      }

      if (sampleCaption) {
        sampleCaption.textContent = `Glyph sample - ${label}`;
      }
    };

    fontSampleSelect.addEventListener("change", updateFontSamples);
    updateFontSamples();
  }

  const resourceTabsRoot = document.querySelector("[data-resource-tabs]");

  if (resourceTabsRoot) {
    const tabs = Array.from(resourceTabsRoot.querySelectorAll("[data-resource-tab]"));
    const panels = Array.from(resourceTabsRoot.querySelectorAll("[data-resource-panel]"));
    const panelIds = new Set(panels.map((panel) => panel.id));

    const activateResourceTab = (id, options = {}) => {
      const activeId = panelIds.has(id) ? id : panels[0]?.id;

      if (!activeId) {
        return;
      }

      tabs.forEach((tab) => {
        const isActive = tab.getAttribute("aria-controls") === activeId;
        tab.setAttribute("aria-selected", String(isActive));
        tab.tabIndex = isActive ? 0 : -1;
      });

      panels.forEach((panel) => {
        const isActive = panel.id === activeId;
        panel.hidden = !isActive;

        if (isActive) {
          panel.classList.add("is-visible");
        }
      });

      if (options.updateHash) {
        window.history.pushState(null, "", `#${activeId}`);
      }
    };

    const idFromHash = () => decodeURIComponent(window.location.hash.replace(/^#/, ""));

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", (event) => {
        event.preventDefault();
        activateResourceTab(tab.getAttribute("aria-controls"), { updateHash: true });
      });

      tab.addEventListener("keydown", (event) => {
        const nextKey = event.key === "ArrowRight" || event.key === "ArrowDown";
        const previousKey = event.key === "ArrowLeft" || event.key === "ArrowUp";

        if (!nextKey && !previousKey) {
          return;
        }

        event.preventDefault();
        const direction = nextKey ? 1 : -1;
        const nextIndex = (index + direction + tabs.length) % tabs.length;
        tabs[nextIndex].focus();
        activateResourceTab(tabs[nextIndex].getAttribute("aria-controls"), { updateHash: true });
      });
    });

    window.addEventListener("hashchange", () => {
      activateResourceTab(idFromHash());
    });

    activateResourceTab(idFromHash());
  }

  const backToTopButton = document.querySelector("[data-back-to-top]");

  if (backToTopButton) {
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let ticking = false;

    const updateBackToTopButton = () => {
      const shouldShow = window.scrollY > 640;
      backToTopButton.hidden = false;
      backToTopButton.classList.toggle("is-visible", shouldShow);
      backToTopButton.tabIndex = shouldShow ? 0 : -1;
      backToTopButton.setAttribute("aria-hidden", String(!shouldShow));
      ticking = false;
    };

    const requestBackToTopUpdate = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateBackToTopButton);
        ticking = true;
      }
    };

    backToTopButton.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: reducedMotionQuery.matches ? "auto" : "smooth",
      });
    });

    window.addEventListener("scroll", requestBackToTopUpdate, { passive: true });
    updateBackToTopButton();
  }

  const revealItems = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || revealItems.length === 0) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const markVisibleItems = () => {
    revealItems.forEach((item) => {
      const rect = item.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        item.classList.add("is-visible");
      }
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
  );

  markVisibleItems();
  revealItems.forEach((item) => observer.observe(item));
})();
