/*
 * Auto Vistoria — telas de vistoria (automóvel e residencial).
 * Reúne os scripts que antes ficavam inline nas páginas.
 */
(function ($) {
  'use strict';

  // ---------------------------------------------------------------------------
  // Etapas (nav-tabs) — marca etapa ativa/visitada e navega com Próximo/Anterior
  // ---------------------------------------------------------------------------
  function initEtapas() {
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
      var href = $(e.target).attr('href');
      var $curr = $('.process-model a[href="' + href + '"]').parent();

      $('.process-model li').removeClass('active visited');
      $curr.addClass('active');
      $curr.prevAll().addClass('visited');
    });

    $(document).on('show.bs.tab', '.nav-tabs-responsive [data-toggle="tab"]', function (e) {
      var $target = $(e.target);
      var $tabs = $target.closest('.nav-tabs-responsive');
      var $current = $target.closest('li');
      var $parent = $current.closest('li.dropdown');
      $current = $parent.length > 0 ? $parent : $current;

      var updateDropdownMenu = function ($el, position) {
        $el.find('.dropdown-menu')
          .removeClass('pull-xs-left pull-xs-center pull-xs-right')
          .addClass('pull-xs-' + position);
      };

      $tabs.find('>li').removeClass('next prev');
      $current.prev().addClass('prev');
      $current.next().addClass('next');

      updateDropdownMenu($current.prev(), 'left');
      updateDropdownMenu($current, 'center');
      updateDropdownMenu($current.next(), 'right');
    });

    // Animação de transição entre etapas
    $('button.next').on('click', function () {
      $('.tab-pane').addClass('animation-to-left').removeClass('animation-to-right');
      var $next = $('.process-model li.active').next('li');
      $next.removeClass('disabled');
      $next.find('a').attr('data-toggle', 'tab').trigger('click');
    });

    $('button.prev').on('click', function () {
      $('.tab-pane').addClass('animation-to-right').removeClass('animation-to-left');
      $('.process-model li.active').prev('li').find('a').trigger('click');
    });
  }

  // ---------------------------------------------------------------------------
  // Tooltips e popovers (Bootstrap 4.6 sanitiza o HTML por padrão)
  // ---------------------------------------------------------------------------
  function initTooltips() {
    $('[data-toggle="tooltip"]').tooltip();
    $('[data-toggle="popover"]').popover({ html: true });
  }

  // ---------------------------------------------------------------------------
  // Upload de fotos — apenas pré-visualização local.
  // Nada é enviado a servidor: o protótipo não tem back-end.
  // ---------------------------------------------------------------------------
  var TIPOS_PERMITIDOS = /^image\/(jpeg|png|webp|heic|heif)$/;
  var TAMANHO_MAXIMO = 10 * 1024 * 1024; // 10 MB

  function initUpload() {
    $(document).on('click', '.js-upload-trigger', function () {
      $(this).closest('.upload-field').find('.js-upload-input').trigger('click');
    });

    $(document).on('keydown', '.js-upload-trigger', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        $(this).trigger('click');
      }
    });

    $(document).on('change', '.js-upload-input', function () {
      var arquivo = this.files && this.files[0];
      var $field = $(this).closest('.upload-field');
      var $trigger = $field.find('.js-upload-trigger');
      if (!arquivo) return;

      if (!TIPOS_PERMITIDOS.test(arquivo.type) || arquivo.size > TAMANHO_MAXIMO) {
        window.alert('Envie uma imagem JPG, PNG, WEBP ou HEIC de até 10 MB.');
        this.value = '';
        return;
      }

      // Botões "RECIBO"/"DOCUMENTO": mostra o nome do arquivo (textContent, nunca innerHTML)
      var $label = $trigger.find('span').first();
      if ($label.length) {
        $label.text(arquivo.name);
      }

      // Cards da galeria: troca a imagem de referência pela foto escolhida
      var $card = $field.closest('.animation');
      if ($card.length) {
        var $img = $card.children('img').first();
        var anterior = $img.data('preview-url');
        if (anterior) URL.revokeObjectURL(anterior);
        var url = URL.createObjectURL(arquivo);
        $img.attr('src', url).attr('alt', 'Foto enviada: ' + arquivo.name).data('preview-url', url);
        $card.addClass('active');
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Data: máscara dd/mm/aaaa + datepicker
  // ---------------------------------------------------------------------------
  function mascaraData(valor) {
    var d = String(valor || '').replace(/\D/g, '').slice(0, 8);
    if (d.length > 4) return d.slice(0, 2) + '/' + d.slice(2, 4) + '/' + d.slice(4);
    if (d.length > 2) return d.slice(0, 2) + '/' + d.slice(2);
    return d;
  }

  function initDatas() {
    $(document).on('input', '.js-mask-date', function () {
      this.value = mascaraData(this.value);
    });

    if ($.fn.datetimepicker) {
      $('.form_date').datetimepicker({
        language: 'pt-BR',
        autoclose: 1,
        minView: 2,
        format: 'dd/mm/yyyy'
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Exibe a lista de itens ao adicionar
  // ---------------------------------------------------------------------------
  function initItens() {
    $('.add-mais').on('click', function () {
      $('.box-item').removeClass('display-none-box');
    });
  }

  $(function () {
    initEtapas();
    initTooltips();
    initUpload();
    initDatas();
    initItens();
  });
})(jQuery);
