const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { Readable } = require("stream");

const os = require("os");
const s3Client = new S3Client({});

const invalidEmails = (emailArray) => {
  // se não houver emails ou undefined, retorna array vazio
  if (!emailArray) return [];

  // retorna array contendo apenas emails inválidos
  return (
    emailArray
      .map((e) => {
        // checa se o email é inválido
        if (!/(?:(?<name>[\w\s]+)\s)?<?(?<email>\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b)>?/.exec(e)) {
          return { email: e, valid: false };
        }
      })
      // remove elementos undefined
      .filter((e) => e)
  );
};

const streamToString = (stream) => {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });
};

const bucketObjectToTempFile = async ({ bucket, key }) => {
  const tempFile = `${os.tmpdir()}`;
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const { Body } = await s3Client.send(command);
  const data = await streamToString(Body);
  fs.writeFileSync(tempFile, data);
  return tempFile;
};

module.exports = async (parameters) => {
  //
  const normalizedParameters = {};

  // retorna array contendo apenas emails inválidos
  // inicializa array de falhas
  let failures = [];

  // **** PARAMETRO TO
  //
  // separa para ter certeza de que todos os emails são válidos (caso sep. por vírgula)
  if (typeof parameters.to === "string") {
    parameters.to = parameters.to.split(",");
  }
  // checa se há destinatários
  if (!parameters.to || parameters.to.length < 1) {
    failures.push({ to: "Nenhum destinatário informado em [to]" });
  } else {
    // obtém lista dos emails inválidos em [to]
    let invalidTo = invalidEmails(parameters.to);
    if (invalidTo.length > 0) {
      failures.push({ to: "Destinatário(s) inválido(s)", invalidTo });
    }
  }

  // **** PARAMETRO CC
  if (typeof parameters.cc === "string") {
    parameters.cc = parameters.cc.split(",");
  }
  // obtém lista dos emails inválidos em [cc]
  let invalidCC = invalidEmails(parameters.cc);
  if (invalidCC.length > 0) {
    failures.push({ cc: "CC(s) inválido(s)", invalidCC });
  }

  // **** PARAMETRO BCC
  if (typeof parameters.bcc === "string") {
    parameters.bcc = parameters.bcc.split(",");
  }
  // obtém lista dos emails inválidos em [bcc]
  let invalidBCC = invalidEmails(parameters.bcc);
  if (invalidBCC.length > 0) {
    failures.push({ bcc: "BCC(s) inválido(s)", invalidBCC });
  }

  // **** PARAMETRO SUBJECT
  if (typeof parameters.subject !== "string") {
    failures.push({ subject: "Assunto não informado" });
  }

  // **** PARAMETRO TEXT (ou HTML)
  if (!parameters.text && !parameters.html) {
    failures.push({ body: "Corpo do e-mail não informado" });
  }

  normalizedParameters.attachments = [];

  // **** PARAMETRO ATTACHMENTS
  if (parameters.attachments) {
    // checa se é um array
    if (!Array.isArray(parameters.attachments)) {
      failures.push({ attachments: "Attachments deve ser um array" });
    } else {
      // checa se cada elemento é um objeto
      parameters.attachments.forEach(async (a, i) => {
        if (typeof a !== "object") {
          failures.push({ attachments: `Attachment [${i}] não é um objeto` });
        } else {
          // checa se o objeto tem bucket, key e fileName
          // se tiver, converte o objeto para um arquivo temporário
          if (a.bucket) {
            if (typeof a.bucket !== "string") {
              failures.push({ attachments: `Attachment [${i}]: bucket não é uma string` });
            } else if (typeof a.key !== "string") {
              failures.push({ attachments: `Attachment [${i}]: key não é uma string` });
            } else if (typeof a.fileName !== "string") {
              failures.push({ attachments: `Attachment [${i}]: fileName não é uma string` });
            }
            // se não houver falhas, converte o objeto para um arquivo temporário
            if (failures.length == 0) {
              let tempFile = await bucketObjectToTempFile(a);
              normalizedParameters.attachments.push({ path: tempFile, filename: a.fileName, cid: a.cid });
            }
          } else if (a.content) {
            if (typeof a.content !== "string") {
              failures.push({ attachments: `Attachment [${i}]: content não é uma string` });
            } else if (typeof a.fileName !== "string") {
              failures.push({ attachments: `Attachment [${i}]: fileName não é uma string` });
            } else {
              normalizedParameters.attachments.push({ content: a.content, filename: a.fileName, cid: a.cid });
            }
          } else {
            // se não tiver bucket, key e fileName, checa se tem path e filename
            if (typeof a.path !== "string") {
              failures.push({ attachments: `Attachment [${i}]: path não é uma string` });
            } else if (typeof a.fileName !== "string") {
              failures.push({ attachments: `Attachment [${i}]: fileName não é uma string` });
            } else {
              normalizedParameters.attachments.push({ path: a.path, filename: a.fileName, cid: a.cid });
            }
          }
        }
      });
    }
  }

  // se houver falhas, retorna as falhas
  if (failures.length > 0) {
    throw new Error("Falhas ocorreram: \n" + JSON.stringify({ failures }, null, 2) + "\noriginal: " + JSON.stringify(parameters));
  } else {
    // se não houver falhas, retorna os parâmetros normalizados
    return {
      ...normalizedParameters,
      to: parameters.to,
      cc: parameters.cc,
      bcc: parameters.bcc,
      subject: parameters.subject,
      text: parameters.text,
      html: parameters.html,
    };
  }
};
