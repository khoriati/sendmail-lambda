const { SESClient, SendRawEmailCommand } = require("@aws-sdk/client-ses");
const nodemailer = require("nodemailer");
const fs = require("fs");
const sesClientModule = require("@aws-sdk/client-ses");

async function sendEmail() {
  // Configuração do cliente SES
  const client = new SESClient({
    region: "us-east-2",
    apiVersion: "2010-12-01",
  });

  // Criar o transporte utilizando nodemailer
  let transporter = nodemailer.createTransport({
    SES: { ses: client, aws: require("@aws-sdk/client-ses") },
  });

  // Preparar a mensagem de e-mail
  let message = await transporter.sendMail({
    to: "khoriati@gmail.com, khoriati@hotmail.com", // Corrigido para remover o '.com' duplicado
    from: '"Teste PortData" naoresponda@portlouis.inf.br',
    subject: "Email with Embedded Image and PDF",
    html: `<h1>Hello</h1><p>This is an embedded image:</p><img src="cid:codigounico@portlouis.inf.br"/>`,
    attachments: [
      {
        filename: "image.png",
        path: "/tmp/image.png",
        cid: "codigounico@portlouis.inf.br", // mesmo CID usado no src da imagem no HTML
      },
      {
        filename: "assinatura.sql",
        path: "/tmp/gogogo/assinatura.sql",
      },
    ],
  });

  /*
  fs.writeFileSync("/tmp/raw.txt", message.raw.toString());
  // Enviar o e-mail
  const rawEmail = { RawMessage: { Data: message.raw.toString("base64") } };
  const command = new SendRawEmailCommand(rawEmail);

  // Garanta que os arquivos existem e obtenha o tamanho deles
  const imageSize = fs.statSync("/tmp/image.png").size;
  const sqlSize = fs.statSync("/tmp/gogogo/assinatura.sql").size;
  console.log(`Tamanhos dos arquivos: Image - ${imageSize} bytes, SQL - ${sqlSize} bytes`);

  try {
    const data = await client.send(command);
    console.log("Email enviado!", data);
  } catch (error) {
    console.error("Erro ao enviar o e-mail:", error);
  }
  */
}

sendEmail();
