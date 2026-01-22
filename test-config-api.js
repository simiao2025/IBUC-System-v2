// Test script to verify PIX configuration API
const API_URL = 'http://localhost:3000/mensalidades/configuracao';

fetch(API_URL)
  .then(res => {
    console.log('Status:', res.status);
    return res.json();
  })
  .then(data => {
    console.log('\n✅ API Response:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.chave_pix && data.beneficiario_nome && data.beneficiario_cidade) {
      console.log('\n✅ Configuração completa!');
      console.log('   Chave PIX:', data.chave_pix);
      console.log('   Beneficiário:', data.beneficiario_nome);
      console.log('   Cidade:', data.beneficiario_cidade);
    } else {
      console.log('\n⚠️ Configuração incompleta. Campos faltando:');
      if (!data.chave_pix) console.log('   - chave_pix');
      if (!data.beneficiario_nome) console.log('   - beneficiario_nome');
      if (!data.beneficiario_cidade) console.log('   - beneficiario_cidade');
    }
  })
  .catch(err => {
    console.error('❌ Erro ao buscar configuração:', err.message);
    console.log('\n🔍 Verifique se:');
    console.log('   1. O backend está rodando (npm run start:dev)');
    console.log('   2. A migration create_configuracoes_financeiras.sql foi executada');
    console.log('   3. A tabela configuracoes_financeiras existe no banco');
  });
