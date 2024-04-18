const normalizeParameters = require("../src/services/normalizeParameters");

describe("normalizeParameters", () => {
  it("deve falhar se nenhum destinatário for fornecido", async () => {
    await expect(normalizeParameters({})).rejects.toThrow("Nenhum destinatário informado em [to]");
  });

  it("deve falhar se o email for inválido", async () => {
    const params = {
      to: "invalidemail@",
      subject: "Test",
      text: "This is a test",
    };
    await expect(normalizeParameters(params)).rejects.toThrow("Destinatário(s) inválido(s)");
  });

  it("deve falhar se o cc for inválido", async () => {
    const params = {
      to: "validmail@hotmail.com",
      cc: "invalidemail@",
      subject: "Test",
      text: "This is a test",
    };
    await expect(normalizeParameters(params)).rejects.toThrow("CC(s) inválido(s)");
  });

  it("deve passar com apenas os parâmetros básicos (to, subject, text)", async () => {
    const params = {
      to: "validemail@example.com",
      subject: "Teste Básico",
      text: "Este é um teste de conteúdo básico",
    };

    try {
      const result = await normalizeParameters(params);
      expect(result).toHaveProperty("to", ["validemail@example.com"]);
      expect(result).toHaveProperty("subject", "Teste Básico");
      expect(result).toHaveProperty("text", "Este é um teste de conteúdo básico");
    } catch (error) {
      // Falha deliberada do teste se uma exceção é lançada
      expect(error).toThrow(error.message);
    }
  });

  it("deve falhar se o um dos emails for inválido", async () => {
    const params = {
      to: "emailvalido@gmail.com,invalidemail@",
      subject: "Test",
      text: "This is a test",
    };
    let response;
    try {
      response = normalizeParameters(params);
    } catch (error) {
      // para conferir o erro, descomente a linha abaixo
      console.log(error.message);
    }
    await expect(response).rejects.toThrow("Destinatário(s) inválido(s)");
  });

  it("deve falhar se o assunto não for fornecido", async () => {
    const params = {
      to: "validemail@example.com",
      text: "This is a test",
    };
    await expect(normalizeParameters(params)).rejects.toThrow("Assunto não informado");
  });

  it("deve falhar se attachments não for um array", async () => {
    const params = {
      to: "validemail@example.com",
      subject: "Test",
      text: "Content",
      attachments: "should be array",
    };
    await expect(normalizeParameters(params)).rejects.toThrow("Attachments deve ser um array");
  });

  it("deve passar com todos os parâmetros corretos", async () => {
    const params = {
      to: "validemail@example.com",
      cc: "anotherValidEmail@example.com",
      bcc: "yetAnotherValidEmail@example.com",
      subject: "Test",
      text: "This is a test",
      html: "<p>This is a test</p>",
      attachments: [
        {
          path: "path/to/file.pdf",
          fileName: "file.pdf",
        },
      ],
    };
    const result = await normalizeParameters(params);
    expect(result).toHaveProperty("to", ["validemail@example.com"]);
    expect(result).toHaveProperty("cc", ["anotherValidEmail@example.com"]);
    expect(result).toHaveProperty("bcc", ["yetAnotherValidEmail@example.com"]);
    expect(result).toHaveProperty("subject", "Test");
    expect(result).toHaveProperty("text", "This is a test");
    expect(result).toHaveProperty("html", "<p>This is a test</p>");
    expect(result.attachments).toHaveLength(1);
  });

  it("deve aceitar anexos com conteúdo base64", async () => {
    const params = {
      to: "example@example.com",
      subject: "Test Attachment",
      text: "Here is an attachment",
      attachments: [
        {
          content: "SGVsbG8sIFdvcmxkIQ==", // "Hello, World!" em base64
          fileName: "hello.txt",
        },
      ],
    };

    await expect(normalizeParameters(params)).resolves.toMatchObject({
      attachments: [
        {
          content: "SGVsbG8sIFdvcmxkIQ==",
          filename: "hello.txt",
        },
      ],
    });
  });

  it("deve falhar se o conteúdo base64 não for uma string", async () => {
    const params = {
      to: "example@example.com",
      subject: "Test Attachment",
      text: "Invalid base64 content",
      attachments: [
        {
          content: 12345, // Número inválido, esperado uma string
          fileName: "hello.txt",
        },
      ],
    };

    await expect(normalizeParameters(params)).rejects.toThrow("content não é uma string");
  });

  it("deve falhar se o nome do arquivo não for fornecido com o conteúdo base64", async () => {
    const params = {
      to: "example@example.com",
      subject: "Test Attachment",
      text: "Missing filename",
      attachments: [
        {
          content: "SGVsbG8sIFdvcmxkIQ==", // Conteúdo base64 sem filename
        },
      ],
    };

    await expect(normalizeParameters(params)).rejects.toThrow("fileName não é uma string");
  });

  // Aqui você pode adicionar mais testes para verificar outras regras e condições
});
