/**
 * admin.js — Lógicas transversais de protótipos
 *
 * Este arquivo cresce com os projetos do framework Delivery-GB.
 * Cada módulo tem cabeçalho indicando origem do projeto e o que faz.
 *
 * MÓDULOS:
 * - Disparo de Teste: cliques que abrem modais de gatilho e modal grande
 * - Disparo de Teste: ações dentro dos modais V1 e V2
 * - Disparo de Teste: validação inline do telefone
 * - Disparo de Teste: orquestração dos 7 estados (A-G) do modal grande
 * - Disparo de Teste: cooldown de reenvio (60s)
 *
 * CONVENÇÕES:
 * - Cada componente em IIFE separado para evitar conflito de escopo
 * - Verificar existência de elementos antes de adicionar listeners
 */

/* ========================================================================== */
/* DISPARO DE TESTE — utilitário: fechar modal de feedback                    */
/* ========================================================================== */

function dtFecharModalFeedback(modalId) {
  var modal = document.getElementById(modalId);
  var backdrop = document.getElementById("jornada-feedback-backdrop");
  if (modal) {
    modal.classList.remove("in");
    modal.setAttribute("aria-hidden", "true");
  }
  if (backdrop) backdrop.classList.remove("in");
  document.body.classList.remove("modal-open");
}

/* ========================================================================== */
/* DISPARO DE TESTE — utilitário: abrir modal grande no estado X              */
/* ========================================================================== */

function dtAbrirModalGrande(estado) {
  var modal = document.getElementById("dt-modal-grande");
  var backdrop = document.getElementById("jornada-feedback-backdrop");
  if (!modal || !backdrop) return;

  // Define o estado
  modal.setAttribute("data-dt-state", estado || "A");

  // Aplica visualizações específicas que precisam de JS
  dtAplicarEstadoModalGrande(estado || "A");

  // Abre
  modal.classList.add("in");
  modal.setAttribute("aria-hidden", "false");
  backdrop.classList.add("in");
  document.body.classList.add("modal-open");
}

function dtFecharModalGrande() {
  var modal = document.getElementById("dt-modal-grande");
  var backdrop = document.getElementById("jornada-feedback-backdrop");
  if (modal) {
    modal.classList.remove("in");
    modal.setAttribute("aria-hidden", "true");
  }
  if (backdrop) backdrop.classList.remove("in");
  document.body.classList.remove("modal-open");
  dtPararCountdown();
}

/* ========================================================================== */
/* DISPARO DE TESTE — Aplicar visualizações de cada estado A-G                */
/* (Origem: Disparo de Teste — Abril/2026)                                    */
/* ========================================================================== */

function dtAplicarEstadoModalGrande(estado) {
  var modal = document.getElementById("dt-modal-grande");
  if (!modal) return;

  var input = document.getElementById("dt-input-telefone");
  var inputErro = document.getElementById("dt-input-telefone-erro");
  var btnsTestar = modal.querySelectorAll(".admin-btn-testar");
  var card1 = modal.querySelector('[data-dt-card="primeiro"]');

  // Reset visual padrão
  if (input) {
    input.classList.remove("is-invalid");
  }
  if (inputErro) {
    inputErro.hidden = true;
  }
  btnsTestar.forEach(function (b) { b.disabled = true; });

  // Resetar texto dos campos com erro de variável (caso esteja vindo do estado E)
  if (card1) {
    var nomeField = card1.querySelector('[data-dt-error-field]:nth-of-type(1)');
    var camposErro = card1.querySelectorAll('[data-dt-error-field]');
    var valoresOriginais = ["João da Silva", "R$20,00", "R$0,00"];
    camposErro.forEach(function (el, i) {
      el.textContent = valoresOriginais[i] || "";
    });
  }

  // Configurações por estado
  if (estado === "A") {
    // Default: input vazio, botões disabled
    if (input) input.value = "";
  } else if (estado === "B") {
    // Telefone preenchido válido
    if (input) input.value = "(11) 94554-9009";
    btnsTestar.forEach(function (b) { b.disabled = false; });
  } else if (estado === "C") {
    // Telefone com formato inválido
    if (input) input.value = "123";
    if (input) input.classList.add("is-invalid");
    if (inputErro) inputErro.hidden = false;
  } else if (estado === "D") {
    // Pós-envio (Card 1 enviado, com countdown)
    if (input) input.value = "(11) 94554-9009";
    // Card 2 ainda pode disparar
    var btnTestar2 = modal.querySelector('[data-dt-card-test="ultimo"]');
    if (btnTestar2) btnTestar2.disabled = false;
    // Inicia countdown no Card 1
    dtIniciarCountdown("primeiro");
  } else if (estado === "E") {
    // Erro de variável (campos vermelhos + ambos cards desabilitados — M4)
    if (input) input.value = "(11) 94554-9009";
    if (card1) {
      var camposErro2 = card1.querySelectorAll('[data-dt-error-field]');
      camposErro2.forEach(function (el) { el.textContent = "Erro de variável"; });
    }
    // M4: ambos os cards ficam desabilitados
    btnsTestar.forEach(function (b) { b.disabled = true; });
  } else if (estado === "F") {
    // Falha de carregamento Card 1 (banner local + Card 2 funcional)
    if (input) input.value = "(11) 94554-9009";
    var btnTestar2_F = modal.querySelector('[data-dt-card-test="ultimo"]');
    if (btnTestar2_F) btnTestar2_F.disabled = false;
  } else if (estado === "G") {
    // Falha técnica de envio (banner vermelho no Card 1)
    if (input) input.value = "(11) 94554-9009";
    var btnTestar2_G = modal.querySelector('[data-dt-card-test="ultimo"]');
    if (btnTestar2_G) btnTestar2_G.disabled = false;
  }
}

/* ========================================================================== */
/* DISPARO DE TESTE — ações dentro dos modais de gatilho V1 e V2              */
/* (Origem: Disparo de Teste — Abril/2026)                                    */
/* ========================================================================== */

(function () {
  "use strict";

  // V1
  var btnV1FazerTeste = document.getElementById("btn-v1-fazer-teste");
  if (btnV1FazerTeste) {
    btnV1FazerTeste.addEventListener("click", function () {
      console.log("[Disparo de Teste] V1 → Fazer teste de mensagem");
      dtFecharModalFeedback("dt-modal-gatilho-v1");
      dtAbrirModalGrande("A");
    });
  }

  var btnV1EnviarSemTestar = document.getElementById("btn-v1-enviar-sem-testar");
  if (btnV1EnviarSemTestar) {
    btnV1EnviarSemTestar.addEventListener("click", function () {
      console.log("[Disparo de Teste] V1 → Enviar sem testar");
      dtFecharModalFeedback("dt-modal-gatilho-v1");
      alert("Disparo confirmado (simulação). No fluxo real, o sistema dispararia para a base inteira.");
    });
  }

  // V2
  var btnV2FazerTeste = document.getElementById("btn-v2-fazer-teste");
  if (btnV2FazerTeste) {
    btnV2FazerTeste.addEventListener("click", function () {
      console.log("[Disparo de Teste] V2 → Fazer teste de mensagem");
      dtFecharModalFeedback("dt-modal-gatilho-v2");
      dtAbrirModalGrande("A");
    });
  }

  var btnV2EnviarSemTestar = document.getElementById("btn-v2-enviar-sem-testar");
  if (btnV2EnviarSemTestar) {
    btnV2EnviarSemTestar.addEventListener("click", function () {
      console.log("[Disparo de Teste] V2 → Enviar sem testar");
      dtFecharModalFeedback("dt-modal-gatilho-v2");
      alert("Disparo confirmado (simulação). No fluxo real, o sistema dispararia para a base inteira.");
    });
  }
})();

/* ========================================================================== */
/* DISPARO DE TESTE — Modal grande: fechar (× ou Esc)                         */
/* (Origem: Disparo de Teste — Abril/2026)                                    */
/* ========================================================================== */

(function () {
  "use strict";

  document.querySelectorAll("[data-dt-close-modal-grande]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      dtFecharModalGrande();
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var modal = document.getElementById("dt-modal-grande");
    if (modal && modal.classList.contains("in")) {
      dtFecharModalGrande();
    }
  });
})();

/* ========================================================================== */
/* DISPARO DE TESTE — Validação inline do telefone                            */
/* (Origem: Disparo de Teste — Abril/2026)                                    */
/* Regras: padrão simples — aceita 10 ou 11 dígitos numéricos (sem DDI).      */
/* Conforme PRD-Erros: validação INLINE durante digitação.                    */
/* ========================================================================== */

(function () {
  "use strict";

  var input = document.getElementById("dt-input-telefone");
  var inputErro = document.getElementById("dt-input-telefone-erro");
  if (!input) return;

  function validar() {
    var modal = document.getElementById("dt-modal-grande");
    var btnsTestar = modal ? modal.querySelectorAll(".admin-btn-testar") : [];
    var valor = input.value.trim();
    var apenasDigitos = valor.replace(/\D/g, "");
    var vazio = valor === "";
    var valido = apenasDigitos.length === 10 || apenasDigitos.length === 11;

    if (vazio) {
      // Campo vazio: sem mensagem de erro, botões disabled
      input.classList.remove("is-invalid");
      if (inputErro) inputErro.hidden = true;
      btnsTestar.forEach(function (b) { b.disabled = true; });
    } else if (valido) {
      // Válido: limpa erro, habilita botões (se não houver outra restrição)
      input.classList.remove("is-invalid");
      if (inputErro) inputErro.hidden = true;
      // Só habilita se o estado atual permitir (não habilitar em E)
      var estado = modal ? modal.getAttribute("data-dt-state") : "A";
      if (estado !== "E") {
        // Se há banner de erro no Card 1 (estado F/G), só habilita o Card 2
        if (estado === "F" || estado === "G") {
          var btnTestar2 = modal.querySelector('[data-dt-card-test="ultimo"]');
          if (btnTestar2) btnTestar2.disabled = false;
        } else {
          btnsTestar.forEach(function (b) { b.disabled = false; });
        }
      }
    } else {
      // Inválido: mostra erro inline, botões disabled
      input.classList.add("is-invalid");
      if (inputErro) inputErro.hidden = false;
      btnsTestar.forEach(function (b) { b.disabled = true; });
    }
  }

  input.addEventListener("input", validar);
})();

/* ========================================================================== */
/* DISPARO DE TESTE — Cooldown de reenvio (60s)                              */
/* (Origem: Disparo de Teste — Abril/2026)                                    */
/* Lógica: ao clicar Testar, vai para Estado D e inicia countdown de 60s.    */
/* Após zerar, o botão "Reenviar" fica habilitado.                            */
/* ========================================================================== */

var dtCountdownInterval = null;

function dtIniciarCountdown(card) {
  dtPararCountdown();
  var modal = document.getElementById("dt-modal-grande");
  if (!modal) return;
  var elCountdown = modal.querySelector('[data-dt-countdown="' + card + '"]');
  var btnResend = modal.querySelector('[data-dt-card-resend="' + card + '"]');
  if (!elCountdown || !btnResend) return;

  var segundos = 60;
  elCountdown.textContent = segundos;
  btnResend.disabled = true;

  dtCountdownInterval = setInterval(function () {
    segundos--;
    elCountdown.textContent = segundos;
    if (segundos <= 0) {
      clearInterval(dtCountdownInterval);
      dtCountdownInterval = null;
      btnResend.disabled = false;
      btnResend.innerHTML = "Reenviar";
    }
  }, 1000);
}

function dtPararCountdown() {
  if (dtCountdownInterval) {
    clearInterval(dtCountdownInterval);
    dtCountdownInterval = null;
  }
}

/* ========================================================================== */
/* DISPARO DE TESTE — Clique no botão "Testar mensagem" → simula envio        */
/* (Origem: Disparo de Teste — Abril/2026)                                    */
/* No protótipo: clicar leva para Estado D (pós-envio com countdown).         */
/* ========================================================================== */

(function () {
  "use strict";

  document.querySelectorAll("[data-dt-card-test]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var card = btn.getAttribute("data-dt-card-test");
      console.log("[Disparo de Teste] Testar mensagem → Card", card);
      dtAbrirModalGrande("D");
    });
  });

  // Reenvio: reinicia o countdown
  document.querySelectorAll("[data-dt-card-resend]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var card = btn.getAttribute("data-dt-card-resend");
      console.log("[Disparo de Teste] Reenviar → Card", card);
      btn.innerHTML = 'Reenviar (<span data-dt-countdown="' + card + '">60</span>s)';
      dtIniciarCountdown(card);
    });
  });

  // Tentar novamente em falha de envio (Estado G) → volta para A
  document.querySelectorAll("[data-dt-card-retry-send]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      console.log("[Disparo de Teste] Retry envio → volta para Estado B");
      dtAbrirModalGrande("B");
    });
  });

  // Tentar novamente em falha de carregamento (Estado F) → volta para A
  document.querySelectorAll("[data-dt-card-retry]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      console.log("[Disparo de Teste] Retry carregamento → volta para Estado A");
      dtAbrirModalGrande("A");
    });
  });
})();
