const nodemailer = require("nodemailer");
const aws = require("@aws-sdk/client-ses");

const transporter = nodemailer.createTransport({
  SES: new aws.SES({
    apiVersion: "2010-12-01",
    region: "us-west-2",
  }),
});

module.exports = async (sendmailObject) => {
  try {
    return await transporter.sendMail(sendmailObject);
  } catch (error) {
    // handle / log / otheranyfuckingthing
    console.error(error);
    throw error;
  }
};
