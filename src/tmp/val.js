const validate = require("jsonschema").validate;

let email = ["joaozinho <teste@uol.com>", "fulano@localhost", "khoriati@gmail.com", "errado@uol.", "outroerrado.com", "maisUmErrado@.com"];

//let val = validate("joaozinho <teste@uol.com>", { type: "string", format: "email" });

email.forEach((e) => {
  let val = validate(e, { type: "string", format: "email" });
  console.log({ e, err: val.errors.length });
});

//
email.forEach((e) => {
  if (!/(?:(?<name>[\w\s]+)\s)?<?(?<email>\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b)>?/.exec(e)) {
    console.log("Invalid email:", e);
  } else {
    console.log("Valid email:", e);
  }
});
