"use strict";

const logger = require("./services/logger");
const mailer = require("./services/mailer");
const normalizeParameters = require("./services/normalizeParameters");

module.exports.handler = async (event) => {
  // Verifica se a versão do Node.js é a 18.x
  if (process.version.replace(/[^\d.]/g, "").split(".")[0] !== "18") {
    let message = "Versão do Node.js inválida. Utilize a versão 18.x";
    await logger.log("FATAL", message);
    throw new Error(message);
  }
  try {
    //
    let params = event?.body || event?.body?.params || event?.params;

    if (!params) {
      throw new Error("Parametro nao identificado (body, body.params ou params) em: \n" + JSON.stringify(event, null, 2));
    }
    // validate parameters schema
    let normalizedParameters = await normalizeParameters(params);

    // call mailerTransporter
    let mailerResponse = await mailer(normalizedParameters);

    let { from, to, subject } = normalizedParameters;
    // console.log(JSON.stringify(normalizedParameters));
    let status = {
      messageId: mailerResponse.messageId.replace(/[<>]/g, ""),
      from,
      to,
      subject,
    };

    await logger.log("INFO", status);

    return { statusCode: 200, body: JSON.stringify(status, null, 2) };
  } catch (error) {
    // Log do erro para futura análise
    console.error("Error:", error);

    await logger.log("ERROR", { message: error.message, payload: params });

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
