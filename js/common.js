/*
 * Auto Vistoria: utilitários compartilhados por todas as telas.
 * JavaScript puro (sem dependências). Nada aqui é enviado a servidor:
 * o estado do protótipo fica apenas no sessionStorage do navegador.
 */
(function () {
  'use strict';

  var PREFIXO = 'av:';

  // sessionStorage pode lançar exceção (modo privado, cota, bloqueio de cookies).
  var store = {
    get: function (chave, padrao) {
      try {
        var bruto = window.sessionStorage.getItem(PREFIXO + chave);
        return bruto === null ? padrao : JSON.parse(bruto);
      } catch (e) {
        return padrao;
      }
    },
    set: function (chave, valor) {
      try {
        window.sessionStorage.setItem(PREFIXO + chave, JSON.stringify(valor));
      } catch (e) { /* sem persistência: o protótipo segue funcionando */ }
    },
    remove: function (chave) {
      try { window.sessionStorage.removeItem(PREFIXO + chave); } catch (e) { /* idem */ }
    },
    clear: function () {
      try {
        Object.keys(window.sessionStorage)
          .filter(function (k) { return k.indexOf(PREFIXO) === 0; })
          .forEach(function (k) { window.sessionStorage.removeItem(k); });
      } catch (e) { /* idem */ }
    }
  };

  // Região viva única para anúncios a leitores de tela.
  var regiao;
  function announce(mensagem) {
    if (!regiao) {
      regiao = document.getElementById('anuncios');
      if (!regiao) {
        regiao = document.createElement('div');
        regiao.id = 'anuncios';
        regiao.className = 'visually-hidden';
        regiao.setAttribute('role', 'status');
        regiao.setAttribute('aria-live', 'polite');
        document.body.appendChild(regiao);
      }
    }
    // Limpa antes para que a mesma mensagem repetida seja anunciada de novo.
    regiao.textContent = '';
    window.setTimeout(function () { regiao.textContent = mensagem; }, 60);
  }

  // Toast visual. O texto também vai para a região viva, então o toast em si fica aria-hidden.
  var toastTimer;
  function toast(mensagem, tipo) {
    var atual = document.querySelector('.toast');
    if (atual) atual.remove();
    window.clearTimeout(toastTimer);

    var el = document.createElement('div');
    el.className = 'toast' + (tipo === 'error' ? ' toast--error' : '');
    el.setAttribute('aria-hidden', 'true');
    el.appendChild(icon(tipo === 'error' ? 'alert' : 'check'));
    var texto = document.createElement('span');
    texto.textContent = mensagem;
    el.appendChild(texto);
    document.body.appendChild(el);
    announce(mensagem);

    toastTimer = window.setTimeout(function () { el.remove(); }, 4500);
  }

  function icon(nome) {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'icon');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    var use = document.createElementNS(ns, 'use');
    use.setAttribute('href', 'img/icons.svg#i-' + nome);
    svg.appendChild(use);
    return svg;
  }

  document.addEventListener('DOMContentLoaded', function () {
    // "Sair" encerra a sessão do protótipo (limpa rascunhos e status).
    document.querySelectorAll('[data-logout]').forEach(function (link) {
      link.addEventListener('click', function () { store.clear(); });
    });

    document.querySelectorAll('[data-ano]').forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  });

  window.AV = { store: store, announce: announce, toast: toast, icon: icon };
})();
