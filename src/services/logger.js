//
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { PutCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const { v4: uuidv4 } = require("uuid");

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient());
const tableName = "SendMail-logger";
const mailer = require("./mailer");

async function log(type, item) {
  let id = uuidv4();

  const params = {
    TableName: tableName,
    Item: { id, timestamp: new Date().toISOString(), data: { type, ...item, attachmentsCount: item?.attachments?.length } },
  };

  // em caso de erro, um email será enviado para um adm
  // e a exceção será "dropada"
  try {
    let docClientWriteResponse = await docClient.send(new PutCommand(params));
    console.log("stored ", JSON.stringify(docClientWriteResponse));
  } catch (e) {
    console.log("FALHA AO GRAVAFR NO DYNAMO");
    console.log(e);
    // notifyEmail(`Falha ao gravar no Dynamo ${type} `, item);
  }
}

const notifyEmail = (subject, item) => {
  let payload = {
    from: process.env.SENDER_EMAIL || "naoresponda@portlouis.inf.br",
    to: process.env.NOTIFY_EMAIL || "khoriati@gmail.com",
    subject,
    body: JSON.stringify(item, null, 2),
  };
  // send email
  mailer(item);
};

module.exports = {
  log,
  notifyEmail,
};
