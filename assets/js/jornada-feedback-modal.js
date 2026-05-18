/**
 * Modais de feedback (.jornada-feedback-modal) + #jornada-feedback-backdrop
 * Abrir: elemento com data-jornada-feedback-open="#id-do-modal"
 * Fechar: [data-dismiss="modal"], backdrop, Escape, clique fora do .modal-dialog
 */
(function () {
  var backdrop = document.getElementById("jornada-feedback-backdrop");
  if (!backdrop) return;

  function feedbackModals() {
    return document.querySelectorAll(".jornada-feedback-modal");
  }

  function openModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.add("in");
    modalEl.setAttribute("aria-hidden", "false");
    backdrop.classList.add("in");
    document.body.classList.add("modal-open");
    var focusable = modalEl.querySelector(
      'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable) focusable.focus();
  }

  function closeAll() {
    feedbackModals().forEach(function (m) {
      m.classList.remove("in");
      m.setAttribute("aria-hidden", "true");
    });
    backdrop.classList.remove("in");
    document.body.classList.remove("modal-open");
  }

  document.querySelectorAll("[data-jornada-feedback-open]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var sel = btn.getAttribute("data-jornada-feedback-open");
      if (!sel) return;
      var modal = document.querySelector(sel);
      openModal(modal);
    });
  });

  document.querySelectorAll(".jornada-feedback-modal [data-dismiss='modal']").forEach(function (el) {
    el.addEventListener("click", function () {
      closeAll();
    });
  });

  backdrop.addEventListener("click", function () {
    closeAll();
  });

  feedbackModals().forEach(function (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeAll();
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var any = document.querySelector(".jornada-feedback-modal.in");
    if (any) closeAll();
  });

  window.openJornadaFeedbackModal = openModal;
  window.closeJornadaFeedbackModals = closeAll;
})();
