/*
 * Auto Vistoria: tela de login (protótipo).
 * Não há autenticação real: o CPF é validado apenas no navegador e nunca é
 * enviado, salvo ou colocado na URL.
 */
(function () {
  'use strict';

  var CPF_DEMO = '529.982.247-25';

  function somenteDigitos(valor) {
    return String(valor || '').replace(/\D/g, '');
  }

  function formatarCpf(valor) {
    var d = somenteDigitos(valor).slice(0, 11);
    return d
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2');
  }

  function cpfValido(valor) {
    var cpf = somenteDigitos(valor);
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    for (var t = 9; t < 11; t++) {
      var soma = 0;
      for (var i = 0; i < t; i++) soma += Number(cpf[i]) * (t + 1 - i);
      var digito = ((soma * 10) % 11) % 10;
      if (digito !== Number(cpf[t])) return false;
    }
    return true;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('login-form');
    var cpf = document.getElementById('login-cpf');
    var erro = document.getElementById('login-cpf-erro');

    function mostrarErro(mensagem) {
      erro.textContent = '';
      erro.appendChild(window.AV.icon('alert'));
      erro.appendChild(document.createTextNode(mensagem));
      erro.hidden = false;
      cpf.setAttribute('aria-invalid', 'true');
    }

    function limparErro() {
      erro.hidden = true;
      cpf.removeAttribute('aria-invalid');
    }

    cpf.addEventListener('input', function () {
      cpf.value = formatarCpf(cpf.value);
      if (cpf.getAttribute('aria-invalid') === 'true' && cpfValido(cpf.value)) limparErro();
    });

    document.getElementById('login-demo').addEventListener('click', function () {
      cpf.value = CPF_DEMO;
      limparErro();
      cpf.focus();
      window.AV.announce('Preenchemos um CPF de exemplo para você.');
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var digitos = somenteDigitos(cpf.value);
      if (!digitos) {
        mostrarErro('Digite seu CPF para continuar.');
      } else if (digitos.length < 11) {
        mostrarErro('O CPF tem 11 números. Confira se faltou algum.');
      } else if (!cpfValido(digitos)) {
        mostrarErro('Esse CPF não parece válido. Pode conferir os números?');
      } else {
        // Protótipo: segue direto para a home, sem enviar o CPF.
        window.AV.store.set('sessao', { inicio: Date.now() });
        window.location.href = 'home.html';
        return;
      }
      cpf.focus();
    });
  });
})();
