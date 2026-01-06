const fs = require("fs");
const parse = require("./parse")
const tokenize = require("./lexer")

function generateNASM(ast) {
  const asm = [];
  let offset = 0;
  const vars = {}; // name -> { offset, type }
  let ifoff = 0;
  let strId = 0;
  let rptId = 0;
  let procId = 0;
  let whileId = 0;


  asm.push("bits 64");
  asm.push("default rel");

  asm.push("extern putchar");
  asm.push("extern printf");
  asm.push("extern scanf");
  asm.push("extern fopen")
  asm.push("global main");

  asm.push("section .rodata")
  asm.push('mode_r: db "r", 0');;
  asm.push('fmt_int: db "%d", 10, 0');
  asm.push('fmt_str: db "%s", 10, 0')

  asm.push("section .text");
  asm.push("main:");
  //asm.push("push rbp");
  //asm.push("mov rbp, rsp");
  //asm.push("sub rsp, 256"); // кратно 16

  function compileBlock(node){
    for(const newnode of node.body)
        asm.push(compileNode(newnode))
  }

  function compileNode(node){
    
    
    if (node.type === "Var") {
      offset += 4;
      vars[node.name] = { offset, type: node.vartype };

      if (node.vartype === "char") {
        const ch = node.value.replace(/'/g, "").charCodeAt(0);
        asm.push(`mov byte [rbp-${offset}], ${ch}; ${node.name}`);
      } else if(node.vartype === "string"){
        const lbl = `str_${strId++}`;
        const text = node.value.slice(1, -1); // убрать "

        asm.unshift(
        `section .rodata\n${lbl}: db "${text}", 0 ; for ${node.name}`
        );

        offset += 8;
        vars[node.name] = { offset, type: "string" };

        asm.push(`lea rax, [rel ${lbl}]; ${node.name}`);
        asm.push(`mov [rbp-${offset}], rax`);
        return;  
      }else {
        asm.push(`mov dword [rbp-${offset}], ${node.value}; ${node.name}`);
      }
    }

    else if(node.type === "SerevalChange"){
      const opperands = ['add', 'dec', 'mul', 'dis']
      const includesOp = opperands.some(ops => ops === node.op)
      if(!includesOp)
        throw new Error("WHERE NORMAL OPERANDS, bro!")
      asm.push(`mov edx, ${node.val}`)
      for(const valv of node.vars){
        const v = vars[valv]
        asm.push(`add dword [rbp-${v.offset}], edx`)
      }
      asm.push("xor edx, edx")
    }

    else if(node.type === "Get"){
      const v = vars[node.name]
      if(!v) throw new Error("unknown variable " + node.val);
      asm.push("sub rsp, 256")
      asm.push("lea rdi, fmt_int")
      asm.push(`lea rsi, byte [rsp-${v.offset}]`)
      asm.push("xor eax, eax")
      asm.push("call scanf")
      asm.push("add rsp, 256")
    }

    else if(node.type === "MoveVars"){
      const av = vars[node.avar];
      const bv = vars[node.bvar];
      if(!av || !bv) throw new Error("unknown variable");
      asm.push(`mov edx, dword [rbp-${bv.offset}]`)
      //asm.push(`sub rbp, ${bv.offset}`)
      asm.push(`mov dword [rbp-${av.offset}], edx` )
    }

    else if(node.type === "Repeat"){
      rptId++;
      asm.push(`mov ecx, ${node.count}`)
      asm.push(`rep${rptId}:`)
      for(const newnode of node.body)
        compileNode(newnode)
      asm.push(`dec ecx`)
      asm.push(`cmp ecx, 0`)
      asm.push(`jne rep${rptId}`)
    }

    else if (node.type === "OpenFile") {
      offset += 8; // FILE* = 8 байт
      vars[node.name] = { offset, type: "file" };

      const lbl = `file_${node.name}`;
      asm.push(`${lbl}: db ${node.filename}, 0`);

      asm.push(`lea rdi, [rel ${lbl}]`);   // filename
      asm.push(`lea rsi, [rel mode_r]`);   // "r"
      asm.push(`call fopen`);
      asm.push(`mov [rbp-${offset}], rax`);
    }

    else if(node.type === "DirectFunc"){
      for(const reg of node.args){
        compileNode(reg)
      }
      asm.push(`xor eax, eax`)
      asm.push(`call ${(node.namefunc.slice(1,-1))}`)
    }

    else if(node.type === "manually_memory_mode"){
        if(node.val === "end"){
            asm.push("xor eax, eax");
            asm.push("leave");
            asm.push("ret");
        }else{
          asm.push("push rbp");
          asm.push("mov rbp, rsp");
          asm.push(`sub rsp, ${node.val}`); // we fucked a compiler safety(if you ham-handed shitass programmer ofc) for you wish!
        }
        //fuck return!
    }

    else if(node.type === "FuncCall"){
      asm.push(`call proc${node.name}`)
    }

    else if(node.type === "Proc"){
      procId++;
      asm.push(`jmp proc${procId}`)
      asm.push(`proc${node.name}:`)
      for(const bod of node.body.body){
        compileNode(bod);
      }
      asm.push("ret")
      asm.push(`proc${procId}:`)
    }
    
    else if(node.type === "UWUoff"){

    }

    else if(node.type === "OWOon"){
      
    }

    else if(node.type === "Reg"){
      if(
        !node.reg === 'rdi' ||
        !node.reg === 'rdi' ||
        !node.reg === 'rdx' ||
        !node.reg === 'rcx' ||
        !node.reg === 'r8'  ||
        !node.reg === 'r9'){
        throw new Error(`the fuck, where registers?: ${node.register}`);
      }
      if(node.mode === "Load"){
        if(node.value === "string")
          asm.push(`lea ${node.reg}, [rel fmt_str]`)
        else
          asm.push(`lea ${node.reg}, [rel fmt_int]`)          
      }else{
        asm.push(`mov ${node.reg}, ${node.value}`)
      }
      /*
      if(node.reg === 'rdi' && node.value.slice(1,-1) === '%d'){
        asm.push(`lea ${node.reg}, [rel fmt_int]`)
      }else
        asm.push(`mov ${node.reg}, ${node.value}`)
      */
    }

    else if(node.type === "WhileLoop"){
      whileId++;
      if(!Array.isArray(node.body)){
        throw new Error("F__K YOU ITS NOT ARRAY")
      }
      const va = vars[node.a]
      const vb = vars[node.b]
      
      asm.push(`whl${whileId}:`)

      compileBlock(node);
      

      asm.push(`mov edx, dword [rbp-${vb.offset}]`)
      asm.push(`cmp dword [rbp-${va.offset}], edx`)
      if(node.op === "!=")
        asm.push(`jne whl${whileId}`)
      else if(node.op === "==")
        asm.push(`je whl${whileId}`)

    }

    else if(node.type === "If") {// { type: "If", name, val, body}
      const v = vars[node.name]
      if(!v) throw new Error("unknown variable " + node.val);
      ifoff++;
      asm.push(`cmp byte [rbp-${v.offset}], ${node.val}`)
      if(node.op === '==')
        asm.push(`jne nextmain${ifoff}`)
      else if(node.op === '!=')
        asm.push(`je nextmain${ifoff}`)
      compileBlock(node.body)
      asm.push(`nextmain${ifoff}:`)
    }
    else if (node.type === "Print") {
      const v = vars[node.val];
      if (!v) throw new Error("unknown variable " + node.val);

      if (v.type === "char") {
        asm.push(`movzx edi, byte [rbp-${v.offset}]`);
        asm.push(`call putchar`);
      }else if (v.type === "string") {
        asm.push(`lea rdi, [rel fmt_str]`);
        asm.push(`mov rsi, [rbp-${v.offset}]`);
        asm.push(`xor eax, eax`);
        asm.push(`call printf`);
      }
      else {
        asm.push(`mov edi, dword [rbp-${v.offset}]`);
        asm.push(`lea rdi, [rel fmt_int]`);
        asm.push(`mov esi, dword [rbp-${v.offset}]`);
        asm.push(`xor eax, eax`);
        asm.push(`call printf`);
      }
    }

    else if(node.type === "Cmp2Goto"){
      const v = vars[node.name];
      if(!v) throw new Error("unknown variable " + node.val);
      asm.push(`dec byte [rbp-${v.offset}]`)
      asm.push(`cmp byte [rbp-${v.offset}], ${node.val}`)
      asm.push(`jne ${node.gotopoint}`)
    }

    else if(node.type === "Include"){
      const value = fs.readFileSync(node.name.slice(1,-1), 'ascii');
      for(const iast of parse(tokenize(value)))
        compileNode(iast)
    }

    else if(node.type === "InitGoto"){
        asm.push(`jmp ${node.name}`)
    }
    else if(node.type === "Goto"){
        asm.push(`${node.name}:`)
    }

    else {
      throw new Error("invalid ast node: " + node.type);
    }
  }

  for (const node of ast) {
    compileNode(node)
  }

  asm.push("xor eax, eax");
  asm.push("leave");
  asm.push("ret");

  return asm.join("\n");
}

module.exports = generateNASM