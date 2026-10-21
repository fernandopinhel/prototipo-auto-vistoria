/*
 * Auto Vistoria — tela de login (protótipo).
 * Não há autenticação real: o CPF é validado apenas no navegador e nunca é
 * enviado, salvo ou colocado na URL.
 */
(function ($) {
  'use strict';

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

  $(function () {
    var $form = $('.js-login-form');
    var $cpf = $('#login-cpf');
    var $erro = $('#login-erro');

    $cpf.on('input', function () {
      this.value = formatarCpf(this.value);
      $erro.attr('hidden', true);
      this.setCustomValidity('');
    });

    $form.on('submit', function (e) {
      e.preventDefault();
      if (!cpfValido($cpf.val())) {
        $erro.removeAttr('hidden');
        $cpf[0].setCustomValidity('CPF inválido');
        $cpf.trigger('focus');
        return;
      }
      // Protótipo: segue direto para a home, sem enviar dados.
      window.location.href = 'home.html';
    });
  });
})(jQuery);
