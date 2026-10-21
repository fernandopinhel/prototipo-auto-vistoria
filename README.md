<div align="center">

<img src="img/favicon.svg" alt="" width="72" height="72">

# Auto Vistoria

**Case de UX/UI e front-end: autovistoria de seguro de automóvel e residência pelo celular.**

[![CI](https://github.com/fernandopinhel/prototipo-auto-vistoria/actions/workflows/ci.yml/badge.svg)](https://github.com/fernandopinhel/prototipo-auto-vistoria/actions/workflows/ci.yml)
![HTML, CSS e JS puros](https://img.shields.io/badge/stack-HTML%20·%20CSS%20·%20JS%20puros-1667c4)
![WCAG 2.2 AA](https://img.shields.io/badge/acessibilidade-WCAG%202.2%20AA-1b7a43)
![Sem dependências](https://img.shields.io/badge/dependências%20de%20runtime-0-5b6779)

[Ver o protótipo](https://fernandopinhel.github.io/prototipo-auto-vistoria/) ·
[Como rodar](#como-rodar-localmente) ·
[O case](#o-case)

![Tela inicial do Auto Vistoria](docs/screenshots/home.jpg)

</div>

> **Este é um case de portfólio.** O projeto nasceu em 2020, numa empresa onde trabalhei,
> e foi recriado aqui para mostrar o processo e o resultado. Para preservar a empresa e o
> cliente, a interface usa a marca fictícia **Lar&Via Seguros**. Nomes, CPFs e protocolos
> são de exemplo, e nenhum dado digitado sai do seu navegador.

---

## Sumário

- [O case](#o-case)
  - [Contexto e problema](#contexto-e-problema)
  - [Objetivo](#objetivo)
  - [Decisões de design](#decisões-de-design)
  - [A marca fictícia](#a-marca-fictícia)
  - [Revisitando o case](#revisitando-o-case)
- [A jornada, tela a tela](#a-jornada-tela-a-tela)
- [O que funciona no protótipo](#o-que-funciona-no-protótipo)
- [Acessibilidade](#acessibilidade)
- [Tecnologias e arquitetura](#tecnologias-e-arquitetura)
- [Como rodar localmente](#como-rodar-localmente)
- [Publicação no GitHub Pages](#publicação-no-github-pages)
- [Segurança e privacidade](#segurança-e-privacidade)
- [Limitações](#limitações)
- [Próximos passos](#próximos-passos)
- [Histórico](#histórico)
- [Autor](#autor)

---

## O case

### Contexto e problema

Para contratar ou renovar um seguro de automóvel ou residencial, a seguradora precisa
conferir o estado do bem. No modelo tradicional, isso é uma **vistoria presencial**: o
cliente agenda um horário, espera um vistoriador ou leva o carro até um posto, e só depois
a análise começa. Para o cliente, é tempo perdido. Para a seguradora, é custo de
deslocamento e uma etapa que atrasa a emissão da apólice.

### Objetivo

Criar uma **autovistoria**: o próprio segurado faz a vistoria pelo celular, no horário que
quiser, informando alguns dados e tirando as fotos pedidas. O protótipo serviu para validar
a jornada, a interface e as interações com usuários e stakeholders antes do
desenvolvimento do produto real.

### Decisões de design

| Decisão | Por quê |
| --- | --- |
| **Uma jornada para dois produtos** | Automóvel e residência seguem o mesmo esqueleto (seus dados, dados do bem, fotos). Quem aprende um fluxo já sabe usar o outro, e o time mantém um único padrão. |
| **Etapas curtas com progresso visível** | Dividir em 3 etapas reduz a sensação de formulário longo. O indicador mostra onde a pessoa está e permite voltar a qualquer etapa já visitada. |
| **Foto com imagem de referência** | Cada pedido de foto mostra um exemplo do enquadramento esperado. Isso reduz fotos inúteis e retrabalho na análise. |
| **Feito para o celular** | Botões grandes, teclado certo para cada campo (`inputmode`), câmera ou galeria direto do botão de foto e layout que funciona a partir de 320 px. |
| **Progresso salvo** | Se a pessoa sair no meio, ao voltar o fluxo continua de onde parou, e a home mostra o status de cada vistoria. |
| **Erros que ajudam** | As mensagens dizem o que fazer ("Coloque o celular com DDD, assim: (11) 91234-5678"), aparecem no campo e num resumo com links. |
| **Linguagem próxima** | Textos curtos, em tom de conversa ("É rapidinho", "Falta pouco!"), sem jargão de seguradora. |
| **Acessível desde o início** | Seguro é um serviço essencial: a vistoria precisa funcionar com teclado, leitor de tela, zoom e alto contraste. |

### A marca fictícia

<img src="img/favicon.svg" alt="Símbolo da Lar&Via Seguros: um carro sob um telhado" width="56" align="left">

**Lar&Via Seguros** representa a empresa onde o projeto nasceu. O nome junta **lar** (a
casa) e **via** (o carro), os dois produtos da autovistoria. O símbolo é um carro
protegido sob um telhado, e também é o favicon do site.

<br clear="left">

### Revisitando o case

Em 2026 o protótipo foi revisitado para refletir o que eu faria hoje:

- **Visual novo**: design system próprio em CSS, com tema claro de cores suaves, login
  escuro, cards com foto e ícones em SVG.
- **Fluxos que funcionam de verdade**: validação, máscaras, upload com pré-visualização,
  rascunho automático, confirmação e protocolo.
- **Acessibilidade revisada** para a WCAG 2.2 AA e auditada com axe-core.
- **Zero dependências**: saíram jQuery, Bootstrap, Popper e o datetimepicker. Ficou só
  HTML, CSS e JavaScript.
- **Segurança**: Content Security Policy sem `'unsafe-inline'` e nenhum dado enviado a servidor.

---

## A jornada, tela a tela

```
index.html ──► login.html ──► home.html ─┬─► vistoria-automovel.html
                 (CPF)       (escolha)    └─► vistoria-residencial.html
```

| Tela | O que acontece |
| --- | --- |
| **Login** (`login.html`) | A pessoa digita o CPF do titular. O campo formata sozinho e valida os dígitos verificadores. Um botão preenche um CPF de exemplo. |
| **Início** (`home.html`) | Dois cards, automóvel e residência, mostram o status de cada vistoria: *não iniciada*, *em andamento* (com a etapa) ou *enviada* (com o protocolo). Abaixo, "Como funciona" e dicas para as fotos. |
| **Vistoria de automóvel** (`vistoria-automovel.html`) | 1. **Dados pessoais**: identificação e endereço. 2. **Dados do veículo**: CRLV, CNH e recibo, placa, Renavam, chassi, características e equipamentos. 3. **Fotos**: 8 fotos (laterais, porta-malas, painel, motor e chassi). |
| **Vistoria residencial** (`vistoria-residencial.html`) | 1. **Dados pessoais**. 2. **Dados da residência**: endereço, tipo de imóvel e quantidade de cômodos. 3. **Fotos**: sala, quarto, cozinha e banheiro. |

Ao finalizar, uma janela pede confirmação e, em seguida, aparece a tela de sucesso com o
número de protocolo.

| Login | Dados pessoais |
| --- | --- |
| ![Tela de login escura com a marca Lar&Via Seguros](docs/screenshots/login.jpg) | ![Etapa de dados pessoais da vistoria de automóvel](docs/screenshots/vistoria-automovel.jpg) |

| Etapa de fotos | Celular |
| --- | --- |
| ![Etapa de fotos com progresso de 5 de 8 fotos](docs/screenshots/vistoria-fotos.jpg) | ![Vistoria residencial no celular](docs/screenshots/mobile-residencial.jpg) |

---

## O que funciona no protótipo

- **Etapas** com estados *atual*, *concluída* e *não iniciada*. Dá para voltar a qualquer etapa já visitada.
- **Validação por etapa**, com mensagem em cada campo e um resumo de erros com links. O resumo se atualiza conforme os itens são corrigidos.
- **Regras de validação**: CPF (dígitos verificadores), e-mail, celular com DDD, CEP, idade mínima de 18 anos, placa (Mercosul ou antiga), chassi (17 caracteres, sem I, O e Q), Renavam, anos de fabricação e modelo, e números dentro de um intervalo.
- **Máscaras** de CPF, telefone, CEP, placa, chassi e quilometragem.
- **Upload** de documentos (imagem ou PDF) e fotos, com pré-visualização local, troca, remoção, barra de progresso e validação de tipo e tamanho (até 10 MB).
- **Rascunho automático**: recarregou a página ou voltou à home? O fluxo continua de onde parou.
- **Confirmação** em `<dialog>` nativo e **tela de sucesso** com protocolo.
- **Responsivo**, com animações suaves que respeitam a preferência por menos movimento.

> Para testar rápido: no login, use o botão **Usar um CPF de exemplo**. Na etapa de fotos,
> qualquer imagem do seu computador ou celular serve.

---

## Acessibilidade

O protótipo segue a **WCAG 2.2 nível AA**. Todas as telas e estados (erros, diálogo,
sucesso e celular) foram auditados com [axe-core](https://github.com/dequelabs/axe-core),
sem violações.

- **Estrutura**: `lang="pt-BR"`, link "Pular para o conteúdo", landmarks (`header`, `nav`, `main`, `footer`), um `h1` por página e hierarquia de títulos correta. A página atual do menu usa `aria-current="page"`.
- **Formulários**: rótulos visíveis ligados aos campos, dicas com `aria-describedby` e campos obrigatórios com `required`. O asterisco é explicado no topo do formulário. Os campos usam `autocomplete` e `inputmode`.
- **Erros**: cada campo mostra a própria mensagem (`aria-invalid` + `aria-describedby`). O resumo de erros recebe o foco e tem links para cada campo. Grupos usam `fieldset` e `legend`.
- **Etapas**: o indicador usa `aria-current="step"` e informa o estado de cada etapa. Ao trocar de etapa, o foco vai para o título e o título da aba muda ("Etapa 2 de 3: Dados do veículo").
- **Uploads**: campos `input type="file"` nativos, com nome acessível por foto ("Enviar foto Dianteira esquerda") e progresso anunciado ("3 de 8 fotos enviadas").
- **Diálogo**: `<dialog>` nativo com `showModal()`. O foco fica preso no diálogo, Esc fecha e o foco volta ao botão que o abriu.
- **Anúncios**: uma região `aria-live` informa ações que não movem o foco, como foto adicionada ou arquivo inválido.
- **Visual**: contraste mínimo de 4,5:1 no texto e 3:1 nas bordas dos campos, foco sempre visível e alvos de toque com pelo menos 24 px. Não há rolagem horizontal a 320 px. O CSS respeita `prefers-reduced-motion` e `forced-colors` (alto contraste do Windows).

---

## Tecnologias e arquitetura

| Camada | Tecnologia | Uso |
| --- | --- | --- |
| Marcação | HTML5 | Páginas estáticas, sem build. `<dialog>` e `<input type="date">` nativos. |
| Estilo | CSS3, sem framework | `css/app.css`: tokens de cor, tipografia e espaçamento, grid e componentes. O login redefine os tokens para a versão escura. |
| Comportamento | JavaScript puro | Um arquivo por tela, sem jQuery nem Bootstrap. |
| Ícones | Sprite SVG próprio | `img/icons.svg`, com ícones de traço que herdam a cor do texto. |
| Tipografia | Montserrat e Open Sans | Google Fonts, com fallback para as fontes do sistema. |
| Qualidade | HTMLHint + GitHub Actions | Valida o HTML e barra scripts e estilos inline. |
| Deploy | GitHub Pages via Actions | Publica a cada push na `master`. |

O projeto **não tem dependências de runtime**: abre direto no navegador, sem `npm install`.

```
.
├── index.html                  # Redireciona para o login
├── login.html                  # Login (CPF)
├── home.html                   # Escolha do tipo de vistoria e status
├── vistoria-automovel.html     # Fluxo de vistoria de automóvel
├── vistoria-residencial.html   # Fluxo de vistoria residencial
├── css/
│   └── app.css                 # Design system do protótipo
├── js/
│   ├── common.js               # Sessão (sessionStorage), anúncios, avisos e "Sair"
│   ├── login.js                # Máscara e validação de CPF
│   ├── home.js                 # Status de cada vistoria nos cards
│   └── vistoria.js             # Etapas, validação, máscaras, uploads, rascunho e envio
├── img/                        # Símbolo da marca, ícones e fotos de referência
├── docs/screenshots/           # Capturas usadas neste README
└── .github/
    ├── workflows/ci.yml        # Validação de HTML
    ├── workflows/pages.yml     # Deploy no GitHub Pages
    └── dependabot.yml          # Atualização das GitHub Actions
```

**Como o fluxo funciona por dentro.** `js/vistoria.js` lê a estrutura do HTML: cada
`<section class="step">` é uma etapa, e cada campo declara suas regras por atributos
(`required`, `data-mask="cpf"`, `data-validate="placa"`, `data-min`/`data-max`). Assim,
para criar um campo novo basta escrever o HTML, sem mexer no JavaScript. O rascunho e o
status ficam no `sessionStorage`, com as chaves `av:rascunho:<fluxo>` e `av:status:<fluxo>`.

---

## Como rodar localmente

O projeto é estático: basta servir a pasta com qualquer servidor HTTP. Prefira um servidor
ao `file://`, porque a CSP e o sprite de ícones se comportam de forma diferente com
arquivos locais.

```bash
git clone https://github.com/fernandopinhel/prototipo-auto-vistoria.git
cd prototipo-auto-vistoria

# Opção 1: Python
python3 -m http.server 8080

# Opção 2: Node
npx serve .
```

Depois, acesse <http://localhost:8080>.

Para validar o HTML (o mesmo check do CI):

```bash
npx htmlhint@1 "*.html"
```

---

## Publicação no GitHub Pages

O workflow `.github/workflows/pages.yml` publica o site a cada push na `master`. Para ativar:

1. No GitHub, abra **Settings → Pages**.
2. Em **Build and deployment → Source**, escolha **GitHub Actions**.
3. Faça um push na `master` ou rode o workflow em **Actions → Deploy GitHub Pages**.

O endereço será <https://fernandopinhel.github.io/prototipo-auto-vistoria/>.

---

## Segurança e privacidade

- **Nenhum dado sai do navegador.** Não há back-end. O rascunho fica no `sessionStorage` e é apagado ao fechar a aba, ao clicar em **Sair** e depois do envio. Fotos e documentos só geram pré-visualização local (`URL.createObjectURL`).
- **Content Security Policy** em todas as páginas: `script-src 'self'`, `style-src` sem `'unsafe-inline'`, `object-src 'none'`, `base-uri 'self'` e `form-action 'self'`. Só o Google Fonts é liberado como origem externa.
- **Sem JavaScript nem CSS inline.** O CI barra `<script>` inline, handlers `on*=` e atributos `style=`.
- **Sem injeção de HTML.** Textos dinâmicos entram com `textContent`, nunca com `innerHTML`.
- **Sem bibliotecas de terceiros no runtime**, o que reduz a superfície de ataque.
- **Referrer Policy** `strict-origin-when-cross-origin` e `noindex` para buscadores.
- **CI com permissões mínimas** (`contents: read`) e Dependabot para as Actions.

O GitHub Pages não permite definir cabeçalhos HTTP, por isso a CSP vai em `<meta>` e
`frame-ancestors` não se aplica. Veja também o [SECURITY.md](SECURITY.md).

---

## Limitações

- É um **protótipo**: não há back-end nem envio real da vistoria. O protocolo é gerado no navegador.
- A usuária "Carolina Santos" e a foto dela são fixas, apenas para demonstração.
- Fotos e documentos não entram no rascunho. Se a página recarregar, é preciso anexá-los de novo.
- Arquivos HEIC são aceitos, mas só o Safari mostra a pré-visualização. Nos outros navegadores, o card continua com a imagem de referência.
- A marca Lar&Via Seguros é fictícia. As fotos de veículos e cômodos vêm do projeto original e são de terceiros. Por isso o repositório **não tem licença de código aberto**, e as imagens não devem ser reutilizadas sem autorização.

---

## Próximos passos

- [ ] Rodar os testes de fluxo (Playwright) e a auditoria de acessibilidade (axe) no CI.
- [ ] Preencher o endereço a partir do CEP, avisando a pessoa de que o CEP será enviado a um serviço externo.
- [ ] Componentizar o cabeçalho e os campos repetidos (Web Components ou um gerador estático).
- [ ] Integrar com uma API de vistoria: upload real, geolocalização e data e hora da foto.

---

## Histórico

### 2026-10: Case revisitado

- Marca fictícia Lar&Via Seguros, com símbolo que une carro e casa, no lugar da marca da empresa original.
- Visual novo, textos mais próximos e humanos, e home com o status de cada vistoria.
- Fluxos funcionais: validação, máscaras, upload, rascunho, confirmação e protocolo.
- Acessibilidade revisada para a WCAG 2.2 AA.
- Saíram jQuery, Bootstrap, Popper, o datetimepicker, a fonte de ícones e o CSS antigo.
- Correções de conteúdo: "Ano do veículo" usava um seletor de data, "Complemento" era obrigatório, "Combustível" e "Tipo de veículo" não tinham opções, e os cômodos ficavam na etapa de fotos.
- Imagens otimizadas: o fundo do login caiu de 2,5 MB para cerca de 100 KB.
- CSP mais restrita, sem `'unsafe-inline'` em `style-src`.

### 2026-10: Segurança e manutenção

- Bibliotecas atualizadas, CSP adicionada e scripts inline extraídos.
- Upload corrigido (IDs duplicados e `POST` para `#type your action here`).
- Correções de sintaxe, acentuação (GB18030 para UTF-8) e HTML.
- Limpeza de cerca de 19 MB de arquivos sem uso. CI, deploy no Pages, Dependabot e `SECURITY.md` adicionados.

### 2020-04: Versão inicial

Protótipo original, criado na empresa onde o projeto nasceu.

---

## Autor

**Fernando Pinhel**, Fullstack Designer (UX/UI, Design Systems e Front-end)
[fernandopinhel.com.br](https://fernandopinhel.com.br) · [GitHub](https://github.com/fernandopinhel)
