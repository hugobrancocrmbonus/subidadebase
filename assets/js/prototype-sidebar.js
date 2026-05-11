/**
 * Alterna sidebar aberta / recolhida (classe body.page-sidebar-closed).
 * Ajuste o seletor se o tema real usar outro nó além de body.
 */
(function () {
  var toggler = document.querySelector(".sidebar-toggler");
  var sidebar = document.getElementById("page-sidebar");

  if (!toggler || !sidebar) return;

  function syncAria() {
    var closed = document.body.classList.contains("page-sidebar-closed");
    toggler.setAttribute("aria-expanded", closed ? "false" : "true");
  }

  toggler.addEventListener("click", function () {
    document.body.classList.toggle("page-sidebar-closed");
    syncAria();
  });

  syncAria();
})();
