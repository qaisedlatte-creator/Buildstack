/* ===========================
   PLAYMAKERS SOCCER FIELD
   script.js
=========================== */

// ===== NAVBAR SCROLL EFFECT =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ===== HAMBURGER MENU =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});

// Close nav when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ===== SCROLL TO BOOKING =====
function scrollToBooking() {
  document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
}

// ===== SET MINIMUM DATE TO TODAY =====
const dateInput = document.getElementById('date');
if (dateInput) {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  dateInput.min = `${yyyy}-${mm}-${dd}`;
}

// ===== BOOKING FORM HANDLER =====
function handleBooking(event) {
  event.preventDefault();

  const form = document.getElementById('booking-form');
  const btn = document.getElementById('submit-btn');

  // Simple validation
  const name = form.name.value.trim();
  const phone = form.phone.value.trim();
  const sport = form.sport.value;
  const date = form.date.value;
  const time = form.time.value;

  if (!name || !phone || !sport || !date || !time) {
    showFormError('Please fill in all required fields.');
    return;
  }

  // Show loading state
  btn.textContent = 'Sending…';
  btn.disabled = true;

  // Simulate async submission (replace with real backend/email service)
  setTimeout(() => {
    btn.textContent = 'Submit Booking Request';
    btn.disabled = false;
    form.reset();
    showModal();
  }, 1200);
}

function showFormError(msg) {
  // Remove existing error
  const existing = document.querySelector('.form-error');
  if (existing) existing.remove();

  const err = document.createElement('p');
  err.className = 'form-error';
  err.style.cssText = 'color:#ff5252;font-size:0.85rem;margin-top:8px;text-align:center;';
  err.textContent = msg;

  const btn = document.getElementById('submit-btn');
  btn.parentNode.insertBefore(err, btn.nextSibling);

  setTimeout(() => err.remove(), 3000);
}

// ===== MODAL =====
function showModal() {
  document.getElementById('modal-overlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
  document.body.style.overflow = '';
}

// Close modal on overlay click
document.getElementById('modal-overlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('modal-overlay')) {
    closeModal();
  }
});

// ===== INTERSECTION OBSERVER – FADE IN ON SCROLL =====
const fadeElements = document.querySelectorAll(
  '.facility-card, .gallery-item, .pricing-card, .testimonial-card, .contact-card, .about-grid'
);

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = entry.target.style.transform.replace('translateY(24px)', 'translateY(0)');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

fadeElements.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = (el.style.transform || '') + ' translateY(24px)';
  el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
  observer.observe(el);
});

// ===== ACTIVE NAV LINK ON SCROLL =====
const sections = document.querySelectorAll('section[id]');
const navLinkItems = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinkItems.forEach(link => {
        link.style.color = '';
        if (link.getAttribute('href') === '#' + entry.target.id) {
          link.style.color = 'var(--green)';
        }
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(sec => sectionObserver.observe(sec));
