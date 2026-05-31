const header = document.querySelector("[data-header]");
const progress = document.querySelector(".scroll-progress");
const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");
const navBackdrop = document.querySelector("[data-nav-backdrop]");
const navLinks = [...document.querySelectorAll(".site-nav a")];
const revealItems = [...document.querySelectorAll(".reveal")];
const watchedSections = [...document.querySelectorAll(".section-watch")];
const projectCards = [...document.querySelectorAll(".project-card")];
let scrollTicking = false;

function updateScrollState() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const percent = max > 0 ? (window.scrollY / max) * 100 : 0;
  const heroDrift = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1);

  progress.style.setProperty("--progress", `${percent}%`);
  document.documentElement.style.setProperty("--hero-drift", heroDrift.toFixed(3));
  header.classList.toggle("is-scrolled", window.scrollY > 24);
  scrollTicking = false;
}

function requestScrollUpdate() {
  if (scrollTicking) {
    return;
  }

  scrollTicking = true;
  requestAnimationFrame(updateScrollState);
}

function closeMenu() {
  document.body.classList.remove("menu-open");
  nav.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
}

navToggle.addEventListener("click", () => {
  const isOpen = navToggle.getAttribute("aria-expanded") === "true";
  document.body.classList.toggle("menu-open", !isOpen);
  nav.classList.toggle("is-open", !isOpen);
  navToggle.setAttribute("aria-expanded", String(!isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

navBackdrop?.addEventListener("click", closeMenu);

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    rootMargin: "0px 0px -12% 0px",
    threshold: 0.16,
  },
);

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index % 4, 3) * 80}ms`;
  revealObserver.observe(item);
});

const sectionObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) {
      return;
    }

    navLinks.forEach((link) => {
      const target = new URL(link.href, window.location.href).hash.replace("#", "");
      if (target) {
        link.classList.toggle("is-active", target === visible.target.id);
      }
    });
  },
  {
    rootMargin: "-22% 0px -58% 0px",
    threshold: [0.08, 0.18, 0.32, 0.48],
  },
);

watchedSections.forEach((section) => sectionObserver.observe(section));

projectCards.forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty("--spot-x", `${x}%`);
    card.style.setProperty("--spot-y", `${y}%`);
  });
});

window.addEventListener("scroll", requestScrollUpdate, { passive: true });
window.addEventListener("resize", updateScrollState);
window.addEventListener("resize", () => {
  if (window.matchMedia("(min-width: 981px)").matches) {
    closeMenu();
  }
});
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});

updateScrollState();
