/**
 * Validação pré-disparo no index:
 * - #btn-iniciar-disparo, #btn-menu-enviar-teste → caminho feliz
 * - #btn-iniciar-disparo-erro, #btn-menu-enviar-teste-erro → cenário erro
 */
(function () {
  "use strict";

  var COOLDOWN_SEC = 60;

  var backdrop = document.getElementById("vpd-backdrop");
  if (!backdrop) return;

  var root = backdrop;
  var footer = document.getElementById("vpd-modalFooter");
  var panels = root.querySelectorAll("[data-step-panel]");
  var dots = root.querySelectorAll("[data-step-dot]");
  var phoneInput = document.getElementById("vpd-phoneTest");
  var sendButtons = root.querySelectorAll("[data-send-test]");
  var step = 1;
  /** "feliz" | "erro" — define os textos do passo 3 */
  var activeScenario = "feliz";

  function labelEl(btn) {
    return btn.querySelector(".admin-btn-enviar-teste__label");
  }

  function hasSentTest() {
    return !!root.querySelector("[data-card].is-sent");
  }

  function syncNextButtonState() {
    var nextButton = footer.querySelector(".footer--step" + step + " [data-action=\"next\"]");
    if (!nextButton) return;
    var disabled = step === 2 && !hasSentTest();
    nextButton.classList.toggle("is-disabled", disabled);
    if (disabled) {
      nextButton.setAttribute("aria-disabled", "true");
      nextButton.setAttribute("data-disabled", "true");
      nextButton.style.opacity = "0.5";
      nextButton.style.cursor = "not-allowed";
      nextButton.removeAttribute("disabled");
    } else {
      nextButton.removeAttribute("aria-disabled");
      nextButton.removeAttribute("data-disabled");
      nextButton.style.opacity = "";
      nextButton.style.cursor = "";
      nextButton.removeAttribute("disabled");
    }
  }

  function isVpdOpen() {
    return backdrop.getAttribute("aria-hidden") === "false";
  }

  function closeVpdModal() {
    backdrop.style.display = "none";
    backdrop.setAttribute("aria-hidden", "true");
    backdrop.removeAttribute("data-vpd-scenario");
    document.body.style.overflow = "";
  }

  function closeAllActionDropdowns() {
    document.querySelectorAll(".action-dropdown-menu.show").forEach(function (menu) {
      menu.classList.remove("show");
      menu.setAttribute("aria-hidden", "true");
      var w = menu.closest(".action-dropdown");
      var b = w && w.querySelector(".action-dropdown-toggle");
      if (b) b.setAttribute("aria-expanded", "false");
    });
  }

  function setStep2VarsErro() {
    var panel = root.querySelector('[data-step-panel="2"]');
    if (!panel) return;
    var wrap = panel.querySelector(".admin-test-cards-wrap");
    if (!wrap) return;
    var cards = wrap.children;
    var n = Math.min(2, cards.length);
    for (var i = 0; i < n; i++) {
      cards[i].querySelectorAll(".admin-mini-card .msg-var").forEach(function (el) {
        el.textContent = "Erro de variável";
      });
    }
  }

  function syncStep2MiniCardVarsFull() {
    var panel = root.querySelector('[data-step-panel="2"]');
    if (!panel) return;
    if (activeScenario === "erro") {
      setStep2VarsErro();
      updFict();
      return;
    }
    var minis = panel.querySelectorAll(".admin-mini-card");
    if (minis[0]) {
      var v0 = minis[0].querySelectorAll(".msg-var");
      if (v0[0]) v0[0].textContent = "João";
      if (v0[1]) v0[1].textContent = "Arezzo Barueri";
      if (v0[2]) v0[2].textContent = "R$20,00";
    }
    if (minis[1]) {
      var v1 = minis[1].querySelectorAll(".msg-var");
      if (v1[0]) v1[0].textContent = "Maria";
      if (v1[1]) v1[1].textContent = "Arezzo Morumbi";
      if (v1[2]) v1[2].textContent = "R$15,00";
    }
    updFict();
  }

  function applyStep3Copy() {
    var t = document.getElementById("vpd-step3Title");
    var d = document.getElementById("vpd-step3Desc");
    if (!t || !d) return;
    if (activeScenario === "erro") {
      t.textContent = "Atenção: variáveis com problemas";
      d.textContent =
        "Volte ao passo anterior para verificar, ou confirme abaixo para disparar mesmo assim.";
    } else {
      t.textContent = "Teste finalizado!";
      d.textContent =
        "Agora você já pode fazer o disparo da sua base com mais segurança.";
    }
  }

  function resetModalState() {
    if (phoneInput) phoneInput.value = "";
    root.querySelectorAll("[data-card]").forEach(function (c) {
      c.classList.remove("is-sent");
    });
    sendButtons.forEach(function (btn) {
      btn.classList.remove("is-cooldown");
      var span = labelEl(btn);
      if (span) span.textContent = "Digite um número para testar";
      btn.disabled = true;
    });
    applyStep3Copy();
  }

  function openVpdModal(scenario) {
    activeScenario = scenario === "erro" ? "erro" : "feliz";
    backdrop.setAttribute("data-vpd-scenario", activeScenario);
    resetModalState();
    setStep(1);
    syncStep2MiniCardVarsFull();
    backdrop.style.display = "flex";
    backdrop.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function setStep(n) {
    step = Math.max(1, Math.min(3, n));
    footer.dataset.step = String(step);

    panels.forEach(function (p) {
      p.classList.toggle("is-active", Number(p.getAttribute("data-step-panel")) === step);
    });

    dots.forEach(function (d, i) {
      var idx = i + 1;
      d.classList.remove("is-done", "is-active");
      if (idx < step) d.classList.add("is-done");
      if (idx === step) d.classList.add("is-active");
      var badge = d.querySelector("[data-badge]");
      if (badge) {
        if (idx < step) {
          badge.textContent = "✓";
          badge.setAttribute("aria-label", "Concluído");
        } else {
          badge.textContent = String(idx);
          badge.removeAttribute("aria-label");
        }
      }
    });

    if (step === 2) syncStep2MiniCardVarsFull();
    if (step === 3) applyStep3Copy();

    syncSendButtons();
    syncNextButtonState();
  }

  function formatVpdPhoneDigits(raw) {
    var d = String(raw).replace(/\D/g, "").slice(0, 11);
    if (!d.length) return "";
    if (d.length <= 2) return "(" + d;
    var area = d.slice(0, 2);
    var s = d.slice(2);
    var head = "(" + area + ") ";
    if (!s.length) return "(" + area + ")";
    if (s.charAt(0) === "9") {
      if (s.length <= 5) return head + s;
      return head + s.slice(0, 5) + "-" + s.slice(5, 9);
    }
    if (s.length <= 4) return head + s;
    return head + s.slice(0, 4) + "-" + s.slice(4, 8);
  }

  function caretAfterNthDigit(str, n) {
    if (n <= 0) return 0;
    var c = 0;
    for (var i = 0; i < str.length; i++) {
      if (/\d/.test(str[i])) {
        c++;
        if (c === n) return i + 1;
      }
    }
    return str.length;
  }

  function onPhoneInput() {
    if (!phoneInput) return;
    var el = phoneInput;
    var before = el.value;
    var sel = typeof el.selectionStart === "number" ? el.selectionStart : before.length;
    var digitsBefore = (before.slice(0, sel).match(/\d/g) || []).length;
    var next = formatVpdPhoneDigits(before);
    el.value = next;
    var totalD = next.replace(/\D/g, "").length;
    var target = Math.min(digitsBefore, totalD);
    if (document.activeElement === el) {
      var pos = caretAfterNthDigit(next, target);
      el.setSelectionRange(pos, pos);
    }
    syncSendButtons();
  }

  function phoneFilled() {
    return (phoneInput.value || "").replace(/\D/g, "").length >= 10;
  }

  function fictFieldsFilled() {
    if (!fictStore || !fictName || !fictBonus) return false;
    var bonus = bonusInnerFromRaw(fictBonus.value);
    return fictStore.value !== "" && fictName.value.trim() !== "" && bonus !== "";
  }

  function isFictCard(btn) {
    var card = btn.closest("[data-card]");
    return !!(card && card.querySelector("[data-fict-name]"));
  }

  function syncSendButtons() {
    var phoneOk = phoneFilled();
    sendButtons.forEach(function (btn) {
      if (btn.classList.contains("is-cooldown")) return;
      var isFict = isFictCard(btn);
      var ok = phoneOk && (!isFict || fictFieldsFilled());
      var span = labelEl(btn);
      btn.disabled = !ok;
      if (!phoneOk) {
        if (span) span.textContent = "Digite um número para testar";
      } else if (isFict && !fictFieldsFilled()) {
        if (span) span.textContent = "Preencha todos os dados para testar";
      } else {
        if (span) span.textContent = "Enviar teste";
      }
    });
  }

  if (phoneInput) phoneInput.addEventListener("input", onPhoneInput);
  [fictName, fictStore, fictBonus].forEach(function (x) {
    if (x) x.addEventListener("input", syncSendButtons);
  });
  [fictName, fictStore, fictBonus].forEach(function (x) {
    if (x) x.addEventListener("change", syncSendButtons);
  });

  sendButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (btn.disabled || btn.classList.contains("is-cooldown")) return;
      var card = btn.closest("[data-card]");
      if (card) card.classList.add("is-sent");
      syncNextButtonState();

      btn.classList.add("is-cooldown");
      btn.disabled = true;
      var left = COOLDOWN_SEC;
      var span = labelEl(btn);

      function tick() {
        if (span) span.textContent = left > 0 ? "Reenviar " + left + "s" : "Reenviar";
        if (left <= 0) {
          btn.classList.remove("is-cooldown");
          syncSendButtons();
          return;
        }
        left -= 1;
        setTimeout(tick, 1000);
      }
      tick();
    });
  });

  footer.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || typeof t.getAttribute !== "function") return;
    var action = t.getAttribute("data-action");
    if (!action) return;
    if (action === "cancel") {
      closeVpdModal();
    } else if (action === "next") {
      if (step === 2 && !hasSentTest()) {
        alert("Faça pelo menos um teste antes de avançar para o próximo passo.");
        return;
      }
      setStep(step + 1);
    } else if (action === "back") {
      setStep(step - 1);
    } else if (action === "confirm") {
      alert("Disparo iniciado (simulação).");
      closeVpdModal();
      setStep(1);
    }
  });

  var btnClose = document.getElementById("vpd-btnClose");
  if (btnClose) {
    btnClose.addEventListener("click", closeVpdModal);
  }

  function openTriggerFeedbackModal(scenario) {
    if (window.closeJornadaFeedbackModals) {
      window.closeJornadaFeedbackModals();
    }
    var selector = scenario === "erro" ? "#dt-modal-gatilho-v2" : "#dt-modal-gatilho-v1";
    if (window.openJornadaFeedbackModal) {
      window.openJornadaFeedbackModal(document.querySelector(selector));
    }
  }

  function closeTriggerFeedbackModal() {
    if (window.closeJornadaFeedbackModals) {
      window.closeJornadaFeedbackModals();
    }
  }

  function bindTriggerModalButtons() {
    var triggerButtons = document.querySelectorAll(".admin-btn-iniciar-disparo");
    triggerButtons.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        var isErro = btn.id && btn.id.indexOf("erro") !== -1;
        openTriggerFeedbackModal(isErro ? "erro" : "feliz");
      });
    });

    ["v1", "v2"].forEach(function (variant) {
      var cancelBtn = document.getElementById("btn-" + variant + "-enviar-sem-testar");
      var testBtn = document.getElementById("btn-" + variant + "-fazer-teste");
      var scenario = variant === "v2" ? "erro" : "feliz";

      if (cancelBtn) {
        cancelBtn.addEventListener("click", function () {
          closeTriggerFeedbackModal();
          alert("Disparo simulado sem teste.");
        });
      }

      if (testBtn) {
        testBtn.addEventListener("click", function () {
          closeTriggerFeedbackModal();
          openVpdModal(scenario);
        });
      }
    });
  }

  bindTriggerModalButtons();

  var menuEnviarTeste = document.getElementById("btn-menu-enviar-teste");
  if (menuEnviarTeste) {
    menuEnviarTeste.addEventListener("click", function (e) {
      e.preventDefault();
      closeAllActionDropdowns();
      openVpdModal("feliz");
    });
  }

  var menuEnviarTesteErro = document.getElementById("btn-menu-enviar-teste-erro");
  if (menuEnviarTesteErro) {
    menuEnviarTesteErro.addEventListener("click", function (e) {
      e.preventDefault();
      closeAllActionDropdowns();
      openVpdModal("erro");
    });
  }

  var fictName = document.getElementById("vpd-fictName");
  var fictStore = document.getElementById("vpd-fictStore");
  var fictBonus = document.getElementById("vpd-fictBonus");
  var elN = root.querySelector("[data-fict-name]");
  var elS = root.querySelector("[data-fict-store]");
  var elB = root.querySelector("[data-fict-bonus]");

  function bonusInnerFromRaw(raw) {
    if (!raw) return "";
    return String(raw).replace(/^\s*R\$\s*/i, "").trim();
  }

  function bonusPreviewFromInput(raw) {
    var inner = bonusInnerFromRaw(raw);
    if (!inner) return "R$ 0,00";
    return "R$ " + inner;
  }

  function updFict() {
    if (elN && fictName) elN.textContent = fictName.value.trim() || "Nome";
    if (elS && fictStore) {
      var opt = fictStore.options[fictStore.selectedIndex];
      elS.textContent = opt && opt.value !== "" ? opt.text : "Loja";
    }
    if (elB && fictBonus) elB.textContent = bonusPreviewFromInput(fictBonus.value);
  }

  if (fictBonus) {
    fictBonus.addEventListener("paste", function (e) {
      var t = e.clipboardData && e.clipboardData.getData("text");
      if (t == null) return;
      e.preventDefault();
      fictBonus.value = bonusInnerFromRaw(t);
      updFict();
    });
  }

  [fictName, fictStore, fictBonus].forEach(function (x) {
    if (x) x.addEventListener("input", updFict);
  });
  [fictName, fictStore, fictBonus].forEach(function (x) {
    if (x) x.addEventListener("change", updFict);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (!isVpdOpen()) return;
    closeVpdModal();
    setStep(1);
  });
})();
