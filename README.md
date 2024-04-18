# SendMail

## Pré-requisitos para uso local e deployment

### Node versão >18<19

```bash
## Instalação do nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash

## Instalação do node v18
nvm install 18
```

### Instalação do serverless globalmente

```bash
npm install -g serverless
```

### O package.json provocará um warning o uso de versões do node diferentes de 20

```json
"engines": {
    "node": "20.x"
  }
```



# Documentação dos Parâmetros para Envio de Email

Este documento descreve os parâmetros aceitos pelo método `sendMail`, que são normalizados pelo método `normalizeParameters`. Estes parâmetros são usados para configurar e enviar emails via AWS SES.

## Parâmetros

A seguir estão os parâmetros que você pode passar para o método `sendMail`:

### `to` (Obrigatório)

-**Tipo:**`string` ou `array`
-**Descrição:** Endereços de email dos destinatários principais.
-**Validação:** Todos os emails devem ser válidos. Emails inválidos serão rejeitados.

### `cc`

-**Tipo:**`string` ou `array`
-**Descrição:** Endereços de email dos destinatários em cópia.
-**Validação:** Todos os emails devem ser válidos. Emails inválidos serão rejeitados.

### `bcc`

-**Tipo:**`string` ou `array`
-**Descrição:** Endereços de email dos destinatários em cópia oculta.
-**Validação:** Todos os emails devem ser válidos. Emails inválidos serão rejeitados.

### `subject` (Obrigatório)

-**Tipo:**`string`
-**Descrição:** Assunto do email.
-**Validação:** O assunto não pode ser vazio.

### `text`

-**Tipo:**`string`
-**Descrição:** Corpo do email em texto plano.
-**Validação:** Pelo menos um dos campos `text` ou `html` deve estar presente.

### `html`

-**Tipo:**`string`
-**Descrição:** Corpo do email em HTML.
-**Validação:** Pelo menos um dos campos `text` ou `html` deve estar presente.

### `attachments`

-**Tipo:**`array`
-**Descrição:** Anexos do email. Cada anexo pode ser especificado como um objeto contendo `path` e `fileName`, ou como um objeto contendo `bucket`, `key`, e `fileName` para arquivos hospedados no S3.
-**Validação:**

- Se especificado, cada anexo deve ser um objeto.
- Cada anexo deve incluir `path` e `fileName` se for um arquivo local, ou `bucket`, `key`, e `fileName` se for um arquivo do S3.
- Todos os campos devem ser strings.

## Exemplo de Uso

```javascript
const emailParams = {
  to: ["example@example.com"],
  cc: ["cc@example.com"],
  bcc: ["bcc@example.com"],
  subject: "Your Subject Here",
  text: "This is a plain text body",
  html: "<p>This is an HTML body</p>",
  attachments: [
    { path: "/path/to/file.pdf", fileName: "file.pdf" },
    { bucket: "your-s3-bucket", key: "path/to/s3file", fileName: "s3file.pdf" }
  ]
};
```
