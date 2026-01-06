function parse(tokens){
  let pos = 0;
  function peek() { return tokens[pos] }
  function consume(type) {
    const val = peek()
    if(val !== type)
      throw new Error(`want '${type}', got '${val}'`) 
    pos++;
    return val;
  }
  function get() { const val = peek(); pos++; return val; }

  function parseDirectArgs(){
    let mode;
    const reg = get();
    consume(":")
    const value = get();
    if(peek() === "load"){
      pos++;
      mode = "Load"
    }
    return {type: "Reg", reg, value, mode}
  }

  function parseBlock(){
    const body = [];
    consume("{");
    while(peek() !== "}"){
      body.push(parseStatement());
    }
    consume("}")
    return {type: "Block", body};
  }

  function parseStatement(){
    if(peek() === "print"){
        pos++;
        const val = get();
        return {type: "Print", val}
    }
    else if(peek() === "add"){
      pos++;
      if(peek() === '{'){
        pos++  
        let vars = [];
        while(peek() !== '}'){
          vars.push(get())
        }
        consume("}")
        consume("the")
        const val = get();
        console.log({type: "SerevalInc", vars, val})
        return {type: "SerevalInc", vars, val}
      }else{
        const name = get();
        const val = get();
        return {type: "Inc", name, val}
      }
    }
    else if(peek() === "manually"){
      pos++;
      const val = get();
      return {type: "manually_memory_mode", val}
    }
    else if(peek() === "include"){
      pos++;
      const name = get();
      return {type: "Include", name}
    }
    else if(peek() === 'uwu'){
      pos++;
      consume('<-')
      consume("owo")
      return { type: "UWUoff"}
    }
    else if(peek() === 'owo'){
      pos++;
      consume('<-')
      consume("uwu")
      return { type: "OWOon"}
    }

    else if(peek() === "procedure"){
      pos++;
      const name = get();
      const body = parseBlock();
      return { type: "Proc", name, body}
    }
    
    else if(peek() === "asm"){
      pos++;
      const tokens = [];
      while(peek() !== 'end'){
        tokens.push(get());
      }
      return {type: "AsmInline", tokens}
    }
    else if (peek() === "open") {
      pos++;
      const filename = get(); // "file.txt"
      consume("as");
      const name = get();
      return { type: "OpenFile", filename, name };
    }
    else if(peek() === "goto"){
        pos++
        const name = get();
        return { type: "InitGoto", name}
    }
    else if(peek() === "input"){
      pos++;
      consume("as")
      const name = get();
      return {type: "Get", name}
    }

    /*
    fuck the 'move' keyword
    else if(peek() === "move"){
      pos++;
      const avar = get();
      consume("<");
      const bvar = get();
      return {
        type: "MoveVars",
        avar,bvar
      }
    }
    */

    else if(peek() === "repeat"){
      const body = [];
      pos++;
      while(peek() !== "until")
        body.push(parseStatement())
      consume("until");
      const count = get();
      return {type: "Repeat", body, count}
    }

    else if(peek() === "if"){
      pos++;
      const name = get();
      const op = get();
      const val = get();
      const body = parseBlock();
      //while(peek() !== "end")
//        body.push((parseStatement()));
//      consume("end")
      return { type: "If", name,op, val, body}
    }
    else if(peek() === "when"){
      pos++;
      const varname = get();
      consume("=")
      const val = get();
      consume("loop")
      const gotopoint = get()
      return {type: "Cmp2Goto", name: varname, val, gotopoint}
    }
    else if(peek() === "direct"){
      pos++;
      const args = [];
      const namefunc = get();
      consume('(')
      while(peek() != ')'){
        args.push(parseDirectArgs());
      }
      consume(")")
      return { type: "DirectFunc", namefunc, args}
    }
    else if(peek() === "range"){
     pos++;
     const value = get();
     return {type: "Range", value} 
    }else{
        const vartype = get();
        const name = get()
        if(name === ":"){
            return {type: "Goto", name: vartype}
        }
        if(vartype === "call"){
            return {type: "FuncCall", name}
        }
        if(name === '<~'){
        const bvar = get();
        return {
          type: "MoveVars",
          avar:vartype,bvar
        }
        }
        consume("=")
        const value = get();
        return {type: "Var", name, vartype, value}
    }
  }
  
  const ast = []
  
  while(pos < tokens.length){
    ast.push(parseStatement())
  }
  return ast
}

module.exports = parse