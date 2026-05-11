/**
 * Abre/fecha submenus: classe .open no li.start que contém ul.sub-menu.
 * DOM de referência: li.start.open (pai) + ul.sub-menu (filho).
 */
(function () {
  document.querySelectorAll(".page-sidebar-menu > li.start").forEach(function (li) {
    var sub = li.querySelector(":scope > ul.sub-menu");
    if (!sub) return;

    var anchor = li.querySelector(":scope > a");
    if (!anchor) return;

    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      li.classList.toggle("open");
      anchor.setAttribute("aria-expanded", li.classList.contains("open"));
    });

    anchor.setAttribute("aria-expanded", li.classList.contains("open"));
  });
})();
