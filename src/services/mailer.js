const nodemailer = require("nodemailer");
const { SESClient, SendRawEmailCommand } = require("@aws-sdk/client-ses");

const client = new SESClient({
  region: "us-east-2",
  apiVersion: "2010-12-01",
});

// Criar o transporte utilizando nodemailer
// considerará as credenciais e region do ambiente
let transporter = nodemailer.createTransport({
  SES: { ses: client, aws: require("@aws-sdk/client-ses") },
});

module.exports = async (sendmailObject) => {
  try {
    // console.log({ sendmailObject });
    return await transporter.sendMail(sendmailObject);
  } catch (error) {
    // handle / log / otheranyfuckingthing
    console.error(error);
    throw error;
  }
};
