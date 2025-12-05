/**
 * Script para testar o recálculo automático de INSS
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testarRecalculo() {
  console.log('🧪 Testando recálculo automático de INSS...\n');
  
  try {
    // 1. Primeiro buscar o usuário leonardo
    console.log('1️⃣ Buscando usuários...');
    const usersResponse = await fetch(`${BASE_URL}/users`);
    const users = await usersResponse.json();
    
    const leonardo = users.find(user => user.nome.toLowerCase().includes('leonardo'));
    if (!leonardo) {
      console.error('❌ Usuário Leonardo não encontrado');
      return;
    }
    
    console.log(`✅ Usuário encontrado: ${leonardo.nome} (ID: ${leonardo.id})`);
    console.log(`   Salário atual: R$ ${leonardo.salarioBruto}`);
    console.log(`   Nível: ${leonardo.nivel}`);
    console.log(`   Percentual: ${leonardo.porcentagem_aumento}%\n`);
    
    // 2. Testar alteração de salário
    console.log('2️⃣ Alterando salário para R$ 1553,20...');
    
    const updateResponse = await fetch(`${BASE_URL}/users/${leonardo.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        salarioBruto: 1553.20
      })
    });
    
    if (updateResponse.ok) {
      console.log('✅ Salário alterado com sucesso!');
      console.log('📝 Aguarde... verificando logs do servidor...\n');
      
      // Aguardar um pouco para o recálculo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 3. Buscar descontos do usuário
      console.log('3️⃣ Verificando descontos gerados...');
      
      const discountResponse = await fetch(`${BASE_URL}/discount`);
      const discounts = await discountResponse.json();
      
      const leonardoDiscounts = discounts.filter(d => d.idUsuario === leonardo.id);
      const inssDiscount = leonardoDiscounts.find(d => d.descricao === 'INSS');
      
      if (inssDiscount) {
        console.log('✅ Desconto de INSS encontrado:');
        console.log(`   Valor: R$ ${inssDiscount.valor}`);
        console.log(`   Data: ${inssDiscount.data}`);
      } else {
        console.log('❌ Nenhum desconto de INSS encontrado');
        console.log('📋 Descontos existentes para o usuário:', leonardoDiscounts);
      }
      
    } else {
      const errorText = await updateResponse.text();
      console.error('❌ Erro ao alterar salário:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

// Executar teste
testarRecalculo();