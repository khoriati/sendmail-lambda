"use strict";

const mailer = require("./services/mailer");
const normalizeParameters = require("./services/normalizeParameters");

module.exports.handler = async (event) => {
  try {
    //
    let params = event?.body || event?.body?.params || event?.params;

    // validate parameters schema
    let normalizedParameters = await normalizeParameters(params);

    // call mailerTransporter
    let mailerResponse = await mailer(normalizedParameters);

    return (sendmailResponse = { statusCode: 200, body: JSON.stringify(mailerResponse, null, 2) });
  } catch (error) {
    // Log do erro para futura análise
    console.error("Error:", error);

    // Retorno de erro
    return {
      statusCode: error.statusCode || 500, // Use um código específico do erro, se disponível
      body: JSON.stringify(
        {
          message: "Failed to process your request",
          error: error.message, // Opcional: depende do que você quer expor
        },
        null,
        2
      ),
      headers: {
        "Content-Type": "application/json",
      },
    };
  }
};
