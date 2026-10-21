# Política de segurança

Este repositório é um **protótipo navegável estático** (HTML/CSS/JS). Ele não possui
back-end, banco de dados ou autenticação real, e não deve ser usado com dados reais
de clientes.

## Reportando uma vulnerabilidade

Se encontrar um problema de segurança, abra um
[security advisory privado](https://github.com/fernandopinhel/prototipo-auto-vistoria/security/advisories/new)
em vez de uma issue pública.

## Medidas adotadas

- Content Security Policy via `<meta>` (`script-src 'self'` e `style-src` sem
  `'unsafe-inline'`, ou seja, sem scripts nem estilos inline).
- Nenhuma biblioteca de terceiros no runtime: só HTML, CSS e JavaScript próprios.
- Nenhum dado digitado é enviado a servidor ou colocado na URL. O rascunho do
  formulário fica só no `sessionStorage` do navegador e é apagado ao fechar a aba,
  ao clicar em "Sair" e após o envio.
- Uploads de fotos são apenas pré-visualizados localmente (`URL.createObjectURL`),
  com validação de tipo e tamanho, e o nome do arquivo é inserido como texto
  (`textContent`), nunca como HTML.
- Dependabot monitora as GitHub Actions; os workflows usam permissões mínimas.
