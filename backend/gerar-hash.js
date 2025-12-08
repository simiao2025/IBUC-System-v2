const bcrypt = require('bcryptjs');

async function main() {
  const senha = '123456'; // senha em texto que você quer manter
  const saltRounds = 10;

  const hash = await bcrypt.hash(senha, saltRounds);
  console.log('Senha em texto:', senha);
  console.log('Hash bcrypt:', hash);
}

main().catch(console.error);er