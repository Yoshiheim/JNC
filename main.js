const tokenize = require("./lexer")
const parse = require("./parse")
const codegen = require("./codegen")
const fs = require("fs");

const code = fs.readFileSync("./example/example.jnc", 'ascii')

const result = codegen(parse(tokenize(code)))

fs.writeFileSync("out.asm", result)
