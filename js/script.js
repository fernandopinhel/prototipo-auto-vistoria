/*
 * Auto Vistoria — componentes de seleção múltipla.
 * type#1: <select> + botão "+" que adiciona itens em uma caixa (#sel / #box)
 * type#2: duas listas com botões para mover itens (#l_box / #r_box)
 */
(function ($) {
  'use strict';

  /* ---------------------------- type#1 ---------------------------------- */
  function MultiSel(params) {
    this.sel = params.sel;
    this.box = params.box;
    this.data = {};
    for (var i = 0; i < params.btn.length; i++) {
      params.btn[i].addEventListener('click', this, false);
    }
  }

  MultiSel.prototype = {
    handleEvent: function (event) {
      var action = $(event.target).attr('data-ms');
      if (action === 'add') {
        this.data.v = this.sel.val();
        this.data.t = this.sel.find('option:selected').text();
        if (!this.data.v || this.data.v === 'default') return;
        this._addToBox();
        this._hideOption();
      } else if (action === 'remove') {
        this.target = $(event.target).parent();
        this._removeFromBox();
        this._showOption();
      }
    },

    _addToBox: function () {
      var spn = $('.sltd-box span.sltd-item.sample').first().clone(true, true);
      // Insere o texto como nó de texto (sem interpretar HTML)
      spn.prepend(document.createTextNode(this.data.t));
      spn.removeClass('sample');
      spn.data('id', this.data.v);
      spn[0].addEventListener('click', this, false);
      this.box.append(spn);
    },

    _hideOption: function () {
      this.sel.find('option').filter(this._byValue(this.data.v)).hide();
      this.sel.val('default');
    },

    _showOption: function () {
      this.sel.find('option').filter(this._byValue(this.data.v)).show();
      this.sel.val('default');
    },

    _removeFromBox: function () {
      this.data.v = this.target.data('id');
      this.target.remove();
    },

    // Compara pelo valor em vez de montar seletor com string (evita injeção de seletor)
    _byValue: function (valor) {
      return function () { return this.value === String(valor); };
    }
  };

  /* ---------------------------- type#2 ---------------------------------- */
  function QuickMultiSel(params) {
    this.bl = params.bl;
    this.br = params.br;
    this.data = {};
    for (var i = 0; i < params.btn.length; i++) {
      params.btn[i].addEventListener('click', this, false);
    }
  }

  QuickMultiSel.prototype = {
    handleEvent: function (event) {
      var action = $(event.target).attr('data-qml');
      if (action === 'left') {
        this.data.from = this.br;
        this.data.to = this.bl;
        this._shiftItems();
      } else if (action === 'right') {
        this.data.from = this.bl;
        this.data.to = this.br;
        this._shiftItems();
      } else if (action === 'item') {
        $(event.target).toggleClass('locked');
      }
    },

    _shiftItems: function () {
      this.data.from.find('.locked').appendTo(this.data.to).removeClass('locked');
    }
  };

  $(function () {
    if ($('#sel').length) {
      new MultiSel({ sel: $('#sel'), box: $('#box'), btn: $('.ms-actn') });
    }
    if ($('#l_box').length) {
      new QuickMultiSel({
        bl: $('#l_box'),
        br: $('#r_box'),
        btn: $('#set2 .ctrl-box, #set2 .open-item')
      });
    }
  });
})(jQuery);
