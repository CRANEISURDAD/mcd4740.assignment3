const body = document.body;
body.classList.add("js-enabled");
const header = document.querySelector("[data-header]");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".nav-list a");
const revealItems = document.querySelectorAll(".reveal");
const filterButtons = document.querySelectorAll("[data-filter]");
const menuItems = document.querySelectorAll(".menu-item");
const galleryCards = document.querySelectorAll(".gallery-card");
const timeButtons = document.querySelectorAll("[data-time]");
const bookingForm = document.querySelector("#booking-form");
const partySize = document.querySelector("#party-size");
const occasion = document.querySelector("#occasion");
const bookingResult = document.querySelector("#booking-result");
const formStatus = document.querySelector("#form-status");
const tiltItems = document.querySelectorAll("[data-tilt]");
const motionAllowed = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;

let selectedTime = "12:30pm";

const seatingCopy = {
  date: {
    room: "Jade window table",
    note: "Best for two shared plates, quiet conversation, and a lighter tea pairing."
  },
  family: {
    room: "Lantern booth",
    note: "Best for shared yum cha plates, tea refills, and a relaxed 90-minute seating."
  },
  business: {
    room: "Pearl dining alcove",
    note: "Best for calm service, clear conversation, and a polished banquet sequence."
  },
  celebration: {
    room: "Golden round table",
    note: "Best for toasts, dessert trolley service, and a longer group celebration."
  }
};

function setHeaderState() {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 20);
}

function closeMobileNav() {
  body.classList.remove("nav-open");
  if (navToggle) {
    navToggle.setAttribute("aria-expanded", "false");
  }
}

function updateBookingResult() {
  if (!bookingResult || !partySize || !occasion) return;
  const guests = partySize.value;
  const choice = seatingCopy[occasion.value] || seatingCopy.family;
  const groupNote = Number(guests) >= 6
    ? " We will prepare a shared banquet pacing for the larger table."
    : "";

  bookingResult.innerHTML = `
    <span>Recommended table</span>
    <strong>${choice.room} for ${guests} at ${selectedTime}</strong>
    <p>${choice.note}${groupNote}</p>
  `;
}

function setActiveTime(button) {
  timeButtons.forEach((item) => item.classList.remove("is-active"));
  button.classList.add("is-active");
  selectedTime = button.dataset.time || selectedTime;
  updateBookingResult();
}

function setupRevealAnimation() {
  if (!revealItems.length) return;

  if (!("IntersectionObserver" in window) || !motionAllowed) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 45, 260)}ms`;
    observer.observe(item);
  });
}

function setupMenuFilters() {
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      filterButtons.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");

      menuItems.forEach((item) => {
        const isMatch = filter === "all" || item.dataset.category === filter;
        item.classList.toggle("is-hidden", !isMatch);
      });
    });
  });
}

function setupGalleryPreview() {
  if (!galleryCards.length) return;

  const lightbox = document.createElement("div");
  lightbox.className = "gallery-lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-label", "Gallery image preview");
  lightbox.innerHTML = `
    <button class="lightbox-close" type="button" aria-label="Close gallery preview">Close</button>
    <figure>
      <img src="" alt="">
      <figcaption></figcaption>
    </figure>
  `;
  document.body.append(lightbox);

  const previewImage = lightbox.querySelector("img");
  const previewCaption = lightbox.querySelector("figcaption");
  const closeButton = lightbox.querySelector(".lightbox-close");

  function closePreview() {
    lightbox.classList.remove("is-open");
    body.classList.remove("lightbox-open");
  }

  galleryCards.forEach((card) => {
    card.addEventListener("click", () => {
      const image = card.querySelector("img");
      if (!image || !previewImage || !previewCaption) return;
      previewImage.src = image.currentSrc || image.src;
      previewImage.alt = image.alt;
      previewCaption.textContent = card.dataset.galleryTitle || "";
      lightbox.classList.add("is-open");
      body.classList.add("lightbox-open");
      closeButton.focus();
    });
  });

  closeButton.addEventListener("click", closePreview);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closePreview();
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox.classList.contains("is-open")) closePreview();
  });
}

function setupTilt() {
  if (!motionAllowed || window.matchMedia("(pointer: coarse)").matches) return;

  tiltItems.forEach((item) => {
    item.addEventListener("pointermove", (event) => {
      const rect = item.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      item.style.setProperty("--tilt-x", `${x * 7}deg`);
      item.style.setProperty("--tilt-y", `${y * -7}deg`);
    });

    item.addEventListener("pointerleave", () => {
      item.style.setProperty("--tilt-x", "0deg");
      item.style.setProperty("--tilt-y", "0deg");
    });
  });
}

function setupReservationForm() {
  if (!bookingForm) return;

  timeButtons.forEach((button) => {
    button.addEventListener("click", () => setActiveTime(button));
  });

  [partySize, occasion].forEach((field) => {
    if (field) field.addEventListener("change", updateBookingResult);
  });

  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(bookingForm);
    const name = String(data.get("name") || "").trim();
    const phone = String(data.get("phone") || "").trim();

    if (!name || !phone) {
      formStatus.textContent = "Please add your name and phone number so our team can confirm your booking.";
      return;
    }

    formStatus.textContent = `Thank you, ${name}. We have noted a ${partySize.value}-guest table request for ${selectedTime}.`;
  });

  updateBookingResult();
}

function setupParallax() {
  if (!motionAllowed) return;

  const hero = document.querySelector(".hero-media img");
  if (!hero) return;

  const update = () => {
    const shift = Math.min(window.scrollY * 0.08, 36);
    hero.style.setProperty("--hero-shift", `${shift}px`);
  };

  window.addEventListener("scroll", update, { passive: true });
  update();
}

if (navToggle) {
  navToggle.addEventListener("click", () => {
    const nextState = !body.classList.contains("nav-open");
    body.classList.toggle("nav-open", nextState);
    navToggle.setAttribute("aria-expanded", String(nextState));
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", closeMobileNav);
});

window.addEventListener("scroll", setHeaderState, { passive: true });

setHeaderState();
setupRevealAnimation();
setupMenuFilters();
setupGalleryPreview();
setupTilt();
setupReservationForm();
setupParallax();
