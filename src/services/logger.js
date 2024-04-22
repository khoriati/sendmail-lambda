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
    Item: {
      id,
      timestamp: new Date().getTime(),
      type,
      ...item,
      attachmentsCount: item?.attachments?.length || 0,
    },
  };

  // em caso de erro, um email será enviado para um adm
  // e a exceção será "dropada"
  try {
    let docClientWriteResponse = await docClient.send(new PutCommand(params));
    // await new Promise((resolve) => setTimeout(resolve, 6000));
  } catch (e) {
    console.log(e);
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
