function tokenize(code) {
  return code.match(
    /"[^"]*"|'[^']*'|==|!=|=|:|<-|<~|u_u|o_o|{|}|\w+|\S/g
  );
}


module.exports = tokenize