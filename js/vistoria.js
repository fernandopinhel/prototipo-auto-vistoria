/*
 * Auto Vistoria: fluxo em etapas (automóvel e residencial).
 *
 * - Etapas com indicador acessível (aria-current="step"), foco movido para o
 *   título de cada etapa e título da página atualizado.
 * - Validação por etapa com mensagens no campo (aria-invalid + aria-describedby)
 *   e resumo de erros com links para cada campo.
 * - Máscaras (CPF, telefone, CEP, placa, chassi, números).
 * - Upload de documentos e fotos com pré-visualização local e validação.
 * - Rascunho salvo automaticamente no sessionStorage (arquivos não são salvos).
 * - Confirmação em <dialog> nativo e tela de sucesso com protocolo.
 *
 * Nada é enviado a servidor: o protótipo não tem back-end.
 */
(function () {
  'use strict';

  var AV = window.AV;
  var TIPOS_IMAGEM = /^image\/(jpeg|png|webp|heic|heif)$/;
  var TAMANHO_MAXIMO = 10 * 1024 * 1024; // 10 MB
  var ANO_ATUAL = new Date().getFullYear();

  /* ------------------------------------------------------------ Utilitários */
  function digitos(v) { return String(v || '').replace(/\D/g, ''); }
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function textoDoRotulo(el) {
    if (el.hasAttribute('data-nome')) return el.getAttribute('data-nome');
    var label = el.id ? $('label[for="' + el.id + '"]') : null;
    if (!label) return el.getAttribute('aria-label') || el.name || 'campo';
    var copia = label.cloneNode(true);
    $all('.req, .opt, .visually-hidden', copia).forEach(function (n) { n.remove(); });
    return copia.textContent.replace(/\s+/g, ' ').trim();
  }

  /* --------------------------------------------------------------- Máscaras */
  var mascaras = {
    cpf: function (v) {
      return digitos(v).slice(0, 11)
        .replace(/^(\d{3})(\d)/, '$1.$2')
        .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2');
    },
    telefone: function (v) {
      var d = digitos(v).slice(0, 11);
      if (d.length <= 2) return d.length ? '(' + d : '';
      if (d.length <= 6) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
      if (d.length <= 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
      return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
    },
    cep: function (v) {
      var d = digitos(v).slice(0, 8);
      return d.length > 5 ? d.slice(0, 5) + '-' + d.slice(5) : d;
    },
    placa: function (v) {
      return String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
    },
    chassi: function (v) {
      return String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 17);
    },
    digitos: function (v, el) {
      var max = Number(el.getAttribute('maxlength')) || 20;
      return digitos(v).slice(0, max);
    },
    milhar: function (v) {
      var d = digitos(v).replace(/^0+(?=\d)/, '').slice(0, 7);
      return d.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
  };

  /* ------------------------------------------------------------- Validações */
  function cpfValido(valor) {
    var cpf = digitos(valor);
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    for (var t = 9; t < 11; t++) {
      var soma = 0;
      for (var i = 0; i < t; i++) soma += Number(cpf[i]) * (t + 1 - i);
      if (((soma * 10) % 11) % 10 !== Number(cpf[t])) return false;
    }
    return true;
  }

  // Cada regra devolve uma mensagem de erro ou '' quando o valor é válido.
  var regras = {
    nome: function (v) {
      return v.trim().split(/\s+/).length < 2 ? 'Coloque nome e sobrenome, por favor.' : '';
    },
    cpf: function (v) {
      return cpfValido(v) ? '' : 'Esse CPF não parece válido. Pode conferir os números?';
    },
    email: function (v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Esse e-mail parece incompleto. Use o formato nome@exemplo.com.';
    },
    telefone: function (v) {
      var d = digitos(v);
      return d.length === 10 || d.length === 11 ? '' : 'Coloque o celular com DDD, assim: (11) 91234-5678.';
    },
    cep: function (v) {
      return digitos(v).length === 8 ? '' : 'O CEP tem 8 números. Confira se faltou algum.';
    },
    nascimento: function (v) {
      var data = new Date(v + 'T00:00:00');
      if (isNaN(data.getTime())) return 'Essa data não parece válida.';
      var hoje = new Date();
      if (data > hoje) return 'Essa data ainda não chegou. Pode conferir o ano?';
      var idade = hoje.getFullYear() - data.getFullYear();
      var m = hoje.getMonth() - data.getMonth();
      if (m < 0 || (m === 0 && hoje.getDate() < data.getDate())) idade--;
      if (idade < 18) return 'O titular do seguro precisa ter 18 anos ou mais.';
      if (idade > 120) return 'Confira o ano de nascimento, acho que algo saiu errado.';
      return '';
    },
    placa: function (v) {
      return /^[A-Z]{3}\d[A-Z0-9]\d{2}$/.test(v) ? '' : 'A placa segue o modelo ABC1D23 (Mercosul) ou ABC1234.';
    },
    chassi: function (v) {
      return /^[A-HJ-NPR-Z0-9]{17}$/.test(v) ? '' : 'O chassi tem 17 letras e números (sem I, O e Q).';
    },
    renavam: function (v) {
      return digitos(v).length === 11 ? '' : 'O Renavam tem 11 números.';
    },
    intervalo: function (v, el) {
      var n = Number(digitos(v));
      var min = Number(el.getAttribute('data-min'));
      var max = el.getAttribute('data-max') === 'ano+1' ? ANO_ATUAL + 1 : Number(el.getAttribute('data-max'));
      return n >= min && n <= max ? '' : 'Use um número entre ' + min + ' e ' + max + '.';
    },
    anomodelo: function (v, el) {
      var erro = regras.intervalo(v, el);
      if (erro) return erro;
      var fab = Number(digitos(($('#' + el.getAttribute('data-ref')) || {}).value));
      var mod = Number(digitos(v));
      if (fab && (mod < fab || mod > fab + 1)) return 'O ano do modelo costuma ser o mesmo da fabricação ou 1 ano depois.';
      return '';
    }
  };

  /* ---------------------------------------------------- Erros de cada campo */
  function alvoDoErro(el) {
    // Onde a mensagem é inserida e quem recebe aria-describedby.
    if (el.type === 'radio' || el.type === 'checkbox') {
      return { depois: el.closest('fieldset').querySelector('.chips'), campos: $all('input[name="' + el.name + '"]') };
    }
    if (el.type === 'file' && el.closest('.doc-upload')) {
      return { depois: el.closest('.doc-upload'), campos: [el] };
    }
    return { depois: el, campos: [el] };
  }

  function idDoErro(el) {
    return (el.type === 'radio' ? el.name : el.id) + '-erro';
  }

  function definirDescricao(campo, id, adicionar) {
    var ids = (campo.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
    ids = ids.filter(function (x) { return x !== id; });
    if (adicionar) ids.push(id);
    if (ids.length) campo.setAttribute('aria-describedby', ids.join(' '));
    else campo.removeAttribute('aria-describedby');
  }

  function mostrarErro(el, mensagem) {
    var alvo = alvoDoErro(el);
    var id = idDoErro(el);
    var p = document.getElementById(id);
    if (!p) {
      p = document.createElement('p');
      p.id = id;
      p.className = 'field-error';
      alvo.depois.insertAdjacentElement('afterend', p);
    }
    p.textContent = '';
    p.appendChild(AV.icon('alert'));
    p.appendChild(document.createTextNode(mensagem));
    alvo.campos.forEach(function (c) {
      c.setAttribute('aria-invalid', 'true');
      definirDescricao(c, id, true);
    });
  }

  // Quando um item é corrigido, ele sai do resumo de erros; sem itens, o resumo some.
  function removerDoResumo(id) {
    var resumo = $('.error-summary');
    if (!resumo || resumo.hidden) return;
    var link = $('a[href="#' + id + '"]', resumo);
    if (link) link.parentNode.remove();
    var restantes = $all('li', resumo).length;
    if (!restantes) resumo.hidden = true;
    else $('h3 span', resumo).textContent = restantes === 1
      ? 'Falta acertar 1 item para continuar'
      : 'Faltam acertar ' + restantes + ' itens para continuar';
  }

  function limparErro(el) {
    var alvo = alvoDoErro(el);
    removerDoResumo(alvo.campos[0].id);
    var id = idDoErro(el);
    var p = document.getElementById(id);
    if (p) p.remove();
    alvo.campos.forEach(function (c) {
      c.removeAttribute('aria-invalid');
      definirDescricao(c, id, false);
    });
  }

  function mensagemDeErro(el) {
    if (el.type === 'radio') {
      var marcado = $all('input[name="' + el.name + '"]').some(function (r) { return r.checked; });
      var legenda = el.closest('fieldset').querySelector('legend');
      return marcado ? '' : 'Escolha uma opção em “' + legenda.textContent.replace(/\*/g, '').trim() + '”, por favor.';
    }
    if (el.type === 'file') {
      return el.files && el.files.length ? '' : 'Falta anexar “' + textoDoRotulo(el) + '”.';
    }

    var valor = String(el.value || '').trim();
    if (!valor) {
      if (!el.required) return '';
      return el.tagName === 'SELECT'
        ? 'Escolha uma opção em “' + textoDoRotulo(el) + '”.'
        : 'Faltou preencher “' + textoDoRotulo(el) + '”.';
    }
    var regra = regras[el.getAttribute('data-validate')];
    return regra ? regra(valor, el) : '';
  }

  // Valida um campo comum (não foto). Devolve a mensagem ('' quando válido).
  function validarCampo(el) {
    var msg = mensagemDeErro(el);
    if (msg) mostrarErro(el, msg);
    else limparErro(el);
    return msg;
  }

  /* ================================================================ Wizard */
  function Wizard(form) {
    this.form = form;
    this.fluxo = form.getAttribute('data-fluxo');
    this.nomeFluxo = form.getAttribute('data-nome-fluxo');
    this.etapas = $all('.step', form);
    this.indicadores = $all('.stepper li');
    this.resumo = $('.error-summary', form);
    this.btnAnterior = $('[data-prev]', form);
    this.btnProximo = $('[data-next]', form);
    this.btnFinalizar = $('[data-finish]', form);
    this.dialogo = document.getElementById('confirmar');
    this.sucesso = $('[data-success]');
    this.area = $('[data-wizard-area]');
    this.tituloBase = document.title;
    this.atual = 0;
    this.maxVisitada = 0;
    this.salvarTimer = null;

    this.ligarCampos();
    this.ligarFotos();
    this.ligarNavegacao();
    this.ligarDialogo();
    this.restaurar();
  }

  Wizard.prototype = {
    /* ---------------------------------------------------------- Campos */
    ligarCampos: function () {
      var self = this;

      this.form.addEventListener('input', function (e) {
        var el = e.target;
        var mascara = mascaras[el.getAttribute('data-mask')];
        if (mascara) el.value = mascara(el.value, el);
        // Só revalida enquanto digita se o campo já estava com erro (não interrompe quem está digitando).
        if (el.getAttribute('aria-invalid') === 'true' && el.type !== 'file') validarCampo(el);
        if (el.type !== 'file') self.agendarRascunho();
      });

      this.form.addEventListener('change', function (e) {
        var el = e.target;
        if (el.type === 'radio' || el.tagName === 'SELECT') {
          if (el.getAttribute('aria-invalid') === 'true') validarCampo(el);
        }
        if (el.type !== 'file') self.agendarRascunho();
      });

      // Valida ao sair de um campo preenchido (ou que já tinha erro).
      this.form.addEventListener('focusout', function (e) {
        var el = e.target;
        if (!el.matches('.input, .select')) return;
        if (el.value.trim() || el.getAttribute('aria-invalid') === 'true') validarCampo(el);
      });

      // Documentos (CRLV, CNH...): mostra o nome do arquivo escolhido.
      $all('.doc-upload input[type="file"]', this.form).forEach(function (input) {
        input.addEventListener('change', function () {
          var box = input.closest('.doc-upload');
          var nome = $('.doc-upload__file', box);
          var arquivo = input.files && input.files[0];
          if (arquivo && !self.arquivoAceito(arquivo, true)) {
            input.value = '';
            arquivo = null;
          }
          box.classList.toggle('is-done', !!arquivo);
          nome.textContent = arquivo ? arquivo.name : nome.getAttribute('data-vazio');
          var icone = $('.doc-upload__icon use', box);
          icone.setAttribute('href', 'img/icons.svg#i-' + (arquivo ? 'check' : 'file'));
          if (arquivo) {
            limparErro(input);
            AV.announce(textoDoRotulo(input) + ': arquivo ' + arquivo.name + ' anexado.');
          }
        });
      });

      // Links do resumo de erros levam o foco ao campo.
      this.resumo.addEventListener('click', function (e) {
        var link = e.target.closest('a[href^="#"]');
        if (!link) return;
        var campo = document.getElementById(link.getAttribute('href').slice(1));
        if (!campo) return;
        e.preventDefault();
        var bloco = campo.closest('.photo, .doc-upload, .field, fieldset') || campo;
        bloco.scrollIntoView({ block: 'center', behavior: 'smooth' });
        campo.focus({ preventScroll: true });
      });
    },

    arquivoAceito: function (arquivo, avisar) {
      if (TIPOS_IMAGEM.test(arquivo.type) || (arquivo.type === 'application/pdf' && avisar === true)) {
        if (arquivo.size <= TAMANHO_MAXIMO) return true;
        AV.toast('“' + arquivo.name + '” passou de 10 MB. Tente um arquivo menor.', 'error');
        return false;
      }
      AV.toast(avisar === true
        ? 'Esse arquivo não serve. Envie uma imagem (JPG, PNG, WEBP ou HEIC) ou um PDF de até 10 MB.'
        : 'Esse arquivo não serve. Envie uma imagem JPG, PNG, WEBP ou HEIC de até 10 MB.', 'error');
      return false;
    },

    /* ----------------------------------------------------------- Fotos */
    ligarFotos: function () {
      var self = this;
      this.fotos = $all('.photo', this.form);

      this.fotos.forEach(function (card) {
        var input = $('input[type="file"]', card);
        var img = $('.photo__media img', card);
        var remover = $('.photo__remove', card);
        img.setAttribute('data-ref-src', img.getAttribute('src'));
        img.setAttribute('data-ref-alt', img.getAttribute('alt'));

        // HEIC/HEIF não é exibível na maioria dos navegadores: volta para a referência.
        img.addEventListener('error', function () {
          if (img.getAttribute('src') !== img.getAttribute('data-ref-src')) {
            img.setAttribute('src', img.getAttribute('data-ref-src'));
          }
        });

        input.addEventListener('change', function () {
          var arquivo = input.files && input.files[0];
          if (!arquivo) return;
          if (!self.arquivoAceito(arquivo, false)) {
            input.value = '';
            return;
          }
          self.definirFoto(card, arquivo);
        });

        remover.addEventListener('click', function () {
          self.definirFoto(card, null);
          input.focus();
        });
      });
      this.atualizarProgressoFotos();
    },

    definirFoto: function (card, arquivo) {
      var input = $('input[type="file"]', card);
      var img = $('.photo__media img', card);
      var estado = $('.photo__state', card);
      var acao = $('.photo__pick .btn span', card);
      var remover = $('.photo__remove', card);
      var titulo = $('.photo__title', card).textContent;

      var anterior = img.getAttribute('data-preview');
      if (anterior) URL.revokeObjectURL(anterior);
      img.removeAttribute('data-preview');

      if (arquivo) {
        var url = URL.createObjectURL(arquivo);
        img.setAttribute('data-preview', url);
        img.setAttribute('src', url);
        img.setAttribute('alt', 'Sua foto: ' + titulo);
        estado.textContent = 'Foto adicionada';
        acao.textContent = 'Trocar foto';
        remover.hidden = false;
        card.classList.add('is-done');
        card.classList.remove('is-invalid');
        input.removeAttribute('aria-invalid');
        removerDoResumo(input.id);
      } else {
        input.value = '';
        img.setAttribute('src', img.getAttribute('data-ref-src'));
        img.setAttribute('alt', img.getAttribute('data-ref-alt'));
        estado.textContent = 'Aguardando foto';
        acao.textContent = 'Enviar foto';
        remover.hidden = true;
        card.classList.remove('is-done');
      }

      var n = this.atualizarProgressoFotos();
      AV.announce((arquivo ? 'Foto “' + titulo + '” adicionada. ' : 'Foto “' + titulo + '” removida. ')
        + n + ' de ' + this.fotos.length + ' fotos enviadas.');
    },

    atualizarProgressoFotos: function () {
      var feitas = this.fotos.filter(function (c) { return c.classList.contains('is-done'); }).length;
      var total = this.fotos.length;
      var texto = $('[data-photo-count]', this.form);
      var barra = $('.photo-progress .progressbar span', this.form);
      if (texto) texto.textContent = feitas + ' de ' + total + ' fotos';
      if (barra) barra.style.setProperty('--value', (total ? Math.round(feitas / total * 100) : 0) + '%');
      return feitas;
    },

    /* ------------------------------------------------------ Navegação */
    ligarNavegacao: function () {
      var self = this;

      this.form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!self.validarEtapa(self.atual)) return;
        if (self.atual < self.etapas.length - 1) {
          self.irPara(self.atual + 1);
        } else {
          self.abrirConfirmacao();
        }
      });

      this.btnAnterior.addEventListener('click', function () {
        if (self.atual > 0) self.irPara(self.atual - 1);
      });

      this.indicadores.forEach(function (li, i) {
        $('button', li).addEventListener('click', function () {
          if (i === self.atual || i > self.maxVisitada) return;
          // Avançar pelo indicador exige a etapa atual válida; voltar é sempre livre.
          if (i > self.atual && !self.validarEtapa(self.atual)) return;
          self.irPara(i);
        });
      });

      var nova = $('[data-new]');
      if (nova) {
        nova.addEventListener('click', function () {
          AV.store.remove('status:' + self.fluxo);
          AV.store.remove('rascunho:' + self.fluxo);
          window.location.reload();
        });
      }
    },

    irPara: function (indice, semFoco) {
      var self = this;
      this.ocultarResumo();
      this.atual = indice;
      this.maxVisitada = Math.max(this.maxVisitada, indice);

      this.etapas.forEach(function (sec, i) { sec.hidden = i !== indice; });

      this.indicadores.forEach(function (li, i) {
        var btn = $('button', li);
        var estado = $('[data-step-state]', li);
        li.classList.toggle('is-current', i === indice);
        // Concluída = já foi validada: qualquer etapa antes da mais avançada visitada.
        li.classList.toggle('is-done', i !== indice && i < self.maxVisitada);
        btn.disabled = i > self.maxVisitada;
        if (i === indice) {
          btn.setAttribute('aria-current', 'step');
          estado.textContent = ', etapa atual';
        } else {
          btn.removeAttribute('aria-current');
          estado.textContent = li.classList.contains('is-done') ? ', concluída' : ', não iniciada';
        }
      });

      var ultima = indice === this.etapas.length - 1;
      this.btnAnterior.hidden = indice === 0;
      this.btnProximo.hidden = ultima;
      this.btnFinalizar.hidden = !ultima;

      var titulo = $('h2', this.etapas[indice]);
      document.title = 'Etapa ' + (indice + 1) + ' de ' + this.etapas.length + ': '
        + titulo.textContent.trim() + ' | ' + this.tituloBase;

      this.salvarRascunho();

      if (!semFoco) {
        this.area.scrollIntoView({ block: 'start', behavior: 'smooth' });
        titulo.focus({ preventScroll: true });
      }
    },

    /* ------------------------------------------------------- Validação */
    validarEtapa: function (indice) {
      var etapa = this.etapas[indice];
      var erros = [];
      var gruposVistos = {};

      $all('input, select, textarea', etapa).forEach(function (el) {
        if (el.disabled || el.closest('.photo')) return;
        if (el.type === 'checkbox') return;
        if (el.type === 'radio') {
          if (!el.required || gruposVistos[el.name]) return;
          gruposVistos[el.name] = true;
        }
        if (el.type === 'file' && !el.required) return;
        var msg = validarCampo(el);
        if (msg) erros.push({ id: el.id, msg: msg });
      });

      $all('.photo', etapa).forEach(function (card) {
        var input = $('input[type="file"]', card);
        var estado = $('.photo__state', card);
        if (card.classList.contains('is-done')) return;
        var titulo = $('.photo__title', card).textContent;
        card.classList.add('is-invalid');
        input.setAttribute('aria-invalid', 'true');
        estado.textContent = 'Essa foto é obrigatória';
        erros.push({ id: input.id, msg: 'Falta a foto “' + titulo + '”.' });
      });

      if (erros.length) {
        this.mostrarResumo(erros);
        return false;
      }
      return true;
    },

    mostrarResumo: function (erros) {
      var titulo = $('h3 span', this.resumo);
      var lista = $('ul', this.resumo);
      titulo.textContent = erros.length === 1
        ? 'Falta acertar 1 item para continuar'
        : 'Faltam acertar ' + erros.length + ' itens para continuar';
      lista.textContent = '';
      erros.forEach(function (erro) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = '#' + erro.id;
        a.textContent = erro.msg;
        li.appendChild(a);
        lista.appendChild(li);
      });
      // Coloca o resumo no topo da etapa atual.
      var cabecalho = $('.step__head', this.etapas[this.atual]);
      cabecalho.insertAdjacentElement('afterend', this.resumo);
      this.resumo.hidden = false;
      this.resumo.scrollIntoView({ block: 'start', behavior: 'smooth' });
      this.resumo.focus({ preventScroll: true });
    },

    ocultarResumo: function () {
      this.resumo.hidden = true;
    },

    /* ---------------------------------------------- Confirmação e envio */
    ligarDialogo: function () {
      var self = this;
      var confirmar = $('[data-dialog-confirm]', this.dialogo);
      var cancelar = $('[data-dialog-cancel]', this.dialogo);

      cancelar.addEventListener('click', function () { self.dialogo.close(); });

      this.dialogo.addEventListener('close', function () {
        if (!self.enviando) self.btnFinalizar.focus();
      });

      // Clique fora do conteúdo (no backdrop) fecha o diálogo.
      this.dialogo.addEventListener('click', function (e) {
        if (e.target === self.dialogo && !self.enviando) self.dialogo.close();
      });

      confirmar.addEventListener('click', function () {
        if (self.enviando) return;
        self.enviando = true;
        confirmar.setAttribute('aria-disabled', 'true');
        cancelar.disabled = true;
        $('span', confirmar).textContent = 'Enviando…';
        AV.announce('Enviando vistoria…');

        // Simula o tempo de envio. No produto real, aqui entraria a chamada à API.
        window.setTimeout(function () {
          self.dialogo.close();
          self.concluir();
        }, 1200);
      });
    },

    abrirConfirmacao: function () {
      // Garante que todas as etapas estão válidas (ex.: documento perdido ao recarregar a página).
      for (var i = 0; i < this.etapas.length - 1; i++) {
        if (!this.validarEtapa(i)) {
          this.irPara(i, true);
          this.validarEtapa(i);
          return;
        }
      }
      var resumo = $('[data-dialog-summary]', this.dialogo);
      if (resumo) {
        resumo.textContent = 'Vamos enviar suas ' + this.fotos.length + ' fotos e os dados que você preencheu para análise.';
      }
      this.dialogo.showModal();
    },

    gerarProtocolo: function () {
      var agora = new Date();
      var data = String(agora.getFullYear()).slice(2)
        + String(agora.getMonth() + 1).padStart(2, '0')
        + String(agora.getDate()).padStart(2, '0');
      var n = new Uint32Array(1);
      (window.crypto || window.msCrypto).getRandomValues(n);
      var sufixo = String(n[0] % 100000).padStart(5, '0');
      return 'AV-' + data + '-' + sufixo;
    },

    concluir: function () {
      var status = {
        estado: 'enviada',
        protocolo: this.gerarProtocolo(),
        data: new Date().toISOString(),
        fotos: this.fotos.length
      };
      AV.store.set('status:' + this.fluxo, status);
      // Os dados pessoais não ficam guardados depois do envio.
      AV.store.remove('rascunho:' + this.fluxo);
      this.fotos.forEach(function (card) {
        var url = $('.photo__media img', card).getAttribute('data-preview');
        if (url) URL.revokeObjectURL(url);
      });
      this.mostrarSucesso(status, true);
    },

    mostrarSucesso: function (status, focar) {
      var toast = $('.toast');
      if (toast) toast.remove();
      this.area.hidden = true;
      this.sucesso.hidden = false;
      $('[data-protocol]', this.sucesso).textContent = status.protocolo;
      var quando = new Date(status.data);
      $('[data-sent-at]', this.sucesso).textContent = isNaN(quando.getTime()) ? ''
        : 'Enviada em ' + quando.toLocaleDateString('pt-BR') + ' às '
          + quando.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + '.';
      document.title = 'Vistoria enviada | ' + this.tituloBase;
      if (focar) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        $('h2', this.sucesso).focus({ preventScroll: true });
      }
    },

    /* --------------------------------------------------------- Rascunho */
    agendarRascunho: function () {
      var self = this;
      window.clearTimeout(this.salvarTimer);
      this.salvarTimer = window.setTimeout(function () { self.salvarRascunho(true); }, 400);
    },

    salvarRascunho: function (houveEdicao) {
      var campos = {};
      $all('input, select, textarea', this.form).forEach(function (el) {
        if (!el.name || el.type === 'file') return;
        if (el.type === 'checkbox') {
          campos[el.name] = campos[el.name] || [];
          if (el.checked) campos[el.name].push(el.value);
        } else if (el.type === 'radio') {
          if (el.checked) campos[el.name] = el.value;
        } else {
          campos[el.name] = el.value;
        }
      });

      var status = AV.store.get('status:' + this.fluxo, null);
      var iniciou = houveEdicao || this.atual > 0 || (status && status.estado === 'andamento');
      if (!iniciou) return;

      AV.store.set('rascunho:' + this.fluxo, { campos: campos, etapa: this.atual, max: this.maxVisitada });
      AV.store.set('status:' + this.fluxo, { estado: 'andamento', etapa: this.atual + 1 });
    },

    restaurar: function () {
      var status = AV.store.get('status:' + this.fluxo, null);
      if (status && status.estado === 'enviada') {
        this.irPara(0, true);
        this.mostrarSucesso(status, false);
        return;
      }

      var rascunho = AV.store.get('rascunho:' + this.fluxo, null);
      if (rascunho && rascunho.campos) {
        var form = this.form;
        Object.keys(rascunho.campos).forEach(function (nome) {
          var valor = rascunho.campos[nome];
          $all('[name="' + CSS.escape(nome) + '"]', form).forEach(function (el) {
            if (el.type === 'checkbox') el.checked = Array.isArray(valor) && valor.indexOf(el.value) !== -1;
            else if (el.type === 'radio') el.checked = el.value === valor;
            else if (el.type !== 'file') el.value = valor;
          });
        });
        this.maxVisitada = Math.min(Number(rascunho.max) || 0, this.etapas.length - 1);
        this.irPara(Math.min(Number(rascunho.etapa) || 0, this.etapas.length - 1), true);
        var temDados = Object.keys(rascunho.campos).some(function (k) {
          var v = rascunho.campos[k];
          return Array.isArray(v) ? v.length : String(v || '').trim();
        });
        if (this.atual > 0 || temDados) {
          AV.toast('Que bom te ver de volta! Continuamos de onde você parou.');
        }
      } else {
        this.irPara(0, true);
      }
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('wizard');
    if (form) new Wizard(form);
  });
})();
