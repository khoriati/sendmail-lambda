const h = require(__dirname + "/../index.js");

h.handler({
  body: {
    from: "naoresponda@portlouis.inf.br",
    to: ["khoriati@gmail.com"],
    subject: "Hello from Serverless",
    text: "This is a test email.",
  },
});
