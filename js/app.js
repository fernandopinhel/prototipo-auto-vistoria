/*
 * Auto Vistoria — comportamentos compartilhados por todas as telas.
 * Sem handlers inline: tudo é ligado aqui para permitir uma CSP sem 'unsafe-inline'.
 */
(function ($) {
  'use strict';

  $(function () {
    // Menu off-canvas (mobile) + animação do ícone hambúrguer
    $('[data-toggle="offcanvas"]').on('click', function () {
      $('.offcanvas-collapse').toggleClass('open');
      $(this).find('.navbar-toggler-icon').toggleClass('change');
      $(this).attr('aria-expanded', $('.offcanvas-collapse').hasClass('open'));
    });
  });
})(jQuery);
