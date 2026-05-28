const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

document.documentElement.classList.add("js-ready");

const header = qs(".site-header");
const menuToggle = qs(".menu-toggle");
const navLinks = qs(".nav-links");

const setHeaderState = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 8);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.classList.toggle("is-open");
    navLinks.classList.toggle("is-open", isOpen);
    document.body.classList.toggle("no-scroll", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  qsa(".nav-link", navLinks).forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.classList.remove("is-open");
      navLinks.classList.remove("is-open");
      document.body.classList.remove("no-scroll");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const currentPage = window.location.pathname.split("/").pop() || "index.html";
qsa(".nav-link").forEach((link) => {
  const href = link.getAttribute("href");
  if (href === currentPage || (currentPage === "" && href === "index.html")) {
    link.classList.add("active");
    link.setAttribute("aria-current", "page");
  }
});

qsa("img").forEach((image) => {
  const fallback = image.dataset.fallback || "assets/images/premium-office.svg";
  const applyFallback = () => {
    if (image.src.endsWith(fallback)) return;
    image.src = fallback;
  };

  image.addEventListener("error", applyFallback, { once: true });

  if (image.complete && image.naturalWidth === 0) {
    applyFallback();
  }
});

const revealElements = qsa(".reveal");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("visible"));
}

const counters = qsa("[data-count]");
const animateCounter = (element) => {
  const target = Number(element.dataset.count || 0);
  const suffix = element.dataset.suffix || "";
  const duration = 1300;
  const startTime = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);
    element.textContent = `${value.toLocaleString()}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
};

if ("IntersectionObserver" in window) {
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.45 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));
} else {
  counters.forEach(animateCounter);
}

qsa(".faq-item").forEach((item) => {
  const button = qs(".faq-question", item);
  const answer = qs(".faq-answer", item);
  if (!button || !answer) return;

  button.addEventListener("click", () => {
    const isOpen = item.classList.toggle("open");
    button.setAttribute("aria-expanded", String(isOpen));
    answer.style.maxHeight = isOpen ? `${answer.scrollHeight}px` : "0";
  });
});

const testimonialCards = qsa(".testimonial-card");
const prevButton = qs("[data-carousel='prev']");
const nextButton = qs("[data-carousel='next']");
let activeTestimonial = testimonialCards.findIndex((card) => card.classList.contains("active"));
if (activeTestimonial < 0) activeTestimonial = 0;

const showTestimonial = (index) => {
  if (!testimonialCards.length) return;
  testimonialCards[activeTestimonial].classList.remove("active");
  activeTestimonial = (index + testimonialCards.length) % testimonialCards.length;
  testimonialCards[activeTestimonial].classList.add("active");
};

if (prevButton && nextButton && testimonialCards.length) {
  prevButton.addEventListener("click", () => showTestimonial(activeTestimonial - 1));
  nextButton.addEventListener("click", () => showTestimonial(activeTestimonial + 1));
  setInterval(() => showTestimonial(activeTestimonial + 1), 6500);
}

qsa("[data-file-label]").forEach((label) => {
  const input = qs("input[type='file']", label);
  const text = qs("[data-file-name]", label);
  if (!input || !text) return;

  input.addEventListener("change", () => {
    text.textContent = input.files?.[0]?.name || "Choose resume file";
  });
});

qsa("form[data-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const button = qs("button[type='submit']", form);
    const originalText = button?.textContent || "Submit";
    if (button) {
      button.textContent = "Request received";
      button.disabled = true;
    }

    setTimeout(() => {
      form.reset();
      qsa("[data-file-name]", form).forEach((fileName) => {
        fileName.textContent = "Choose resume file";
      });
      if (button) {
        button.textContent = originalText;
        button.disabled = false;
      }
    }, 1800);
  });
});
