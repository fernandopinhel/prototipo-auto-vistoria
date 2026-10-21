# Política de segurança

Este repositório é um **protótipo navegável estático** (HTML/CSS/JS). Ele não possui
back-end, banco de dados ou autenticação real, e não deve ser usado com dados reais
de clientes.

## Reportando uma vulnerabilidade

Se encontrar um problema de segurança, abra um
[security advisory privado](https://github.com/fernandopinhel/prototipo-auto-vistoria/security/advisories/new)
em vez de uma issue pública.

## Medidas adotadas

- Content Security Policy via `<meta>` (`script-src 'self'`, sem scripts inline).
- Bibliotecas de terceiros atualizadas para versões sem CVEs conhecidas
  (jQuery 3.7.1, Bootstrap 4.6.2, Popper 1.16.1).
- Nenhum dado digitado é enviado, salvo ou colocado na URL.
- Uploads de fotos são apenas pré-visualizados localmente (`URL.createObjectURL`),
  com validação de tipo e tamanho, e o nome do arquivo é inserido como texto
  (`textContent`), nunca como HTML.
- Dependabot monitora as GitHub Actions; os workflows usam permissões mínimas.
