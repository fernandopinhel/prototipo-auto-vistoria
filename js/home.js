/*
 * Auto Vistoria: tela inicial.
 * Mostra o status de cada vistoria (não iniciada, em andamento ou enviada)
 * a partir do que o fluxo salvou no sessionStorage.
 */
(function () {
  'use strict';

  function formatarData(iso) {
    try {
      return new Date(iso).toLocaleDateString('pt-BR');
    } catch (e) {
      return '';
    }
  }

  function render(card) {
    var fluxo = card.getAttribute('data-fluxo');
    var total = Number(card.getAttribute('data-total')) || 3;
    var status = window.AV.store.get('status:' + fluxo, null);

    var badge = card.querySelector('[data-status-badge]');
    var cta = card.querySelector('[data-cta]');
    var progresso = card.querySelector('[data-progress]');
    var progressoTexto = card.querySelector('[data-progress-text]');
    var barra = card.querySelector('.progressbar span');
    var recomecar = card.querySelector('[data-restart]');

    badge.className = 'badge';
    progresso.hidden = true;
    recomecar.hidden = true;

    if (status && status.estado === 'enviada') {
      badge.classList.add('badge--done');
      badge.textContent = 'Enviada';
      cta.textContent = 'Ver comprovante';
      progresso.hidden = false;
      progressoTexto.textContent = 'Protocolo ' + status.protocolo + ' · enviada em ' + formatarData(status.data);
      barra.style.setProperty('--value', '100%');
      recomecar.hidden = false;
    } else if (status && status.estado === 'andamento') {
      var etapa = Math.min(Math.max(Number(status.etapa) || 1, 1), total);
      badge.classList.add('badge--progress');
      badge.textContent = 'Em andamento';
      cta.textContent = 'Continuar';
      progresso.hidden = false;
      progressoTexto.textContent = 'Etapa ' + etapa + ' de ' + total;
      barra.style.setProperty('--value', Math.round(((etapa - 1) / total) * 100) + '%');
      recomecar.hidden = false;
    } else {
      badge.textContent = 'Não iniciada';
      cta.textContent = 'Iniciar vistoria';
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-fluxo]').forEach(function (card) {
      render(card);

      card.querySelector('[data-restart]').addEventListener('click', function () {
        var fluxo = card.getAttribute('data-fluxo');
        window.AV.store.remove('status:' + fluxo);
        window.AV.store.remove('rascunho:' + fluxo);
        render(card);
        window.AV.toast('Prontinho! Você pode começar essa vistoria do zero quando quiser.');
        card.querySelector('.choice__link').focus();
      });
    });
  });
})();
