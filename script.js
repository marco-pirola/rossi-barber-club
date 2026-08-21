(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var nav = document.getElementById("primary-nav");
  var toggle = document.querySelector(".menu-toggle");
  var backdrop = document.querySelector(".nav-backdrop");
  var navLinks = document.querySelectorAll('#primary-nav a[href^="#"]');
  var sections = document.querySelectorAll("main section[id]");
  var toast = document.getElementById("toast");
  var toastTimer;
  var year = document.getElementById("year");
  var form = document.getElementById("booking-form");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  function setMenu(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Chiudi menu" : "Apri menu");
    if (backdrop) {
      backdrop.hidden = !open;
    }
    document.body.style.overflow = open ? "hidden" : "";
    if (open) {
      var firstLink = nav.querySelector("a");
      if (firstLink) firstLink.focus();
    } else if (document.activeElement && nav.contains(document.activeElement)) {
      toggle.focus();
    }
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      setMenu(!nav.classList.contains("is-open"));
    });
  }

  if (backdrop) {
    backdrop.addEventListener("click", function () {
      setMenu(false);
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      setMenu(false);
      return;
    }
    if (event.key !== "Tab" || !nav || !nav.classList.contains("is-open")) return;
    var focusable = nav.querySelectorAll("a");
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      setMenu(false);
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (event) {
      var id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      var offset = header ? header.offsetHeight + 8 : 0;
      var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: top, behavior: reduceMotion ? "auto" : "smooth" });
      if (id !== "#home") {
        history.pushState(null, "", id);
      } else {
        history.pushState(null, "", window.location.pathname);
      }
    });
  });

  function updateActiveNav() {
    var scrollPos = window.scrollY + (header ? header.offsetHeight + 24 : 80);
    var current = "home";

    sections.forEach(function (section) {
      if (section.offsetTop <= scrollPos) {
        current = section.id;
      }
    });

    var map = {
      home: "home",
      servizi: "servizi",
      "chi-siamo": "chi-siamo",
      galleria: "galleria",
      "perche-noi": "galleria",
      recensioni: "recensioni",
      orari: "contatti",
      faq: "contatti",
      contatti: "contatti"
    };
    var mapped = map[current] || current;

    navLinks.forEach(function (link) {
      var href = link.getAttribute("href") || "";
      link.classList.toggle("is-active", href === "#" + mapped);
    });
  }

  window.addEventListener("scroll", updateActiveNav, { passive: true });
  updateActiveNav();

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.hidden = true;
    }, 4200);
  }

  document.querySelectorAll("[data-book]").forEach(function (button) {
    button.addEventListener("click", function () {
      var service = button.getAttribute("data-book");
      var select = document.getElementById("service");
      if (select && service) {
        select.value = service;
      }
      showToast("Richiesta per «" + service + "» pronta. Completa il modulo in Contatti oppure chiamaci.");
      var contact = document.getElementById("contatti");
      if (contact) {
        var offset = header ? header.offsetHeight + 8 : 0;
        var top = contact.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: reduceMotion ? "auto" : "smooth" });
        var name = document.getElementById("name");
        if (name) {
          window.setTimeout(function () {
            name.focus();
          }, reduceMotion ? 0 : 450);
        }
      }
    });
  });

  document.querySelectorAll(".faq-trigger").forEach(function (button) {
    button.addEventListener("click", function () {
      var expanded = button.getAttribute("aria-expanded") === "true";
      var panelId = button.getAttribute("aria-controls");
      var panel = panelId ? document.getElementById(panelId) : null;

      document.querySelectorAll(".faq-trigger").forEach(function (other) {
        if (other !== button) {
          other.setAttribute("aria-expanded", "false");
          var otherPanel = document.getElementById(other.getAttribute("aria-controls"));
          if (otherPanel) otherPanel.hidden = true;
        }
      });

      button.setAttribute("aria-expanded", expanded ? "false" : "true");
      if (panel) panel.hidden = expanded;
    });
  });

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var name = form.querySelector("#name");
      var phone = form.querySelector("#phone");
      var service = form.querySelector("#service");
      var valid = true;

      [name, phone, service].forEach(function (field) {
        var row = field.closest(".form-row");
        var ok = field.value.trim() !== "";
        if (row) row.classList.toggle("is-invalid", !ok);
        if (!ok) valid = false;
      });

      if (!valid) {
        showToast("Compila nome, telefono e servizio per inviare la richiesta.");
        return;
      }

      showToast("Grazie, " + name.value.trim() + ". Ti ricontattiamo a breve per confermare «" + service.value + "».");
      form.reset();
      form.querySelectorAll(".is-invalid").forEach(function (row) {
        row.classList.remove("is-invalid");
      });
    });
  }

  if (!reduceMotion && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    document.querySelectorAll(".reveal").forEach(function (el) {
      observer.observe(el);
    });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("is-visible");
    });
  }
})();
