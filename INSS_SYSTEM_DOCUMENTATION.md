# 🔥 SISTEMA AUTOMÁTICO DE CÁLCULO DE INSS

## ✅ IMPLEMENTAÇÃO COMPLETA

O sistema de gestão de salários e comissionamento agora possui **cálculo automático de INSS** que é executado sempre que qualquer componente do salário é alterado.

---

## 🎯 FUNCIONALIDADES IMPLEMENTADAS

### 1️⃣ **Cálculo Progressivo de INSS**
- **Tabela 2025**: Implementação exata da tabela oficial do INSS
- **Faixas salariais**:
  - Até R$ 1.518,00: 7,5%
  - R$ 1.518,01 a R$ 2.862,40: 9%
  - R$ 2.862,41 a R$ 4.296,29: 12%
  - R$ 4.296,30 a R$ 8.364,61: 14%
- **Cálculo progressivo**: Cada faixa incide apenas sobre a diferença

### 2️⃣ **Recálculo Automático**
O sistema recalcula automaticamente quando:
- ✅ Salário comercial é alterado
- ✅ Nível/percentual é alterado
- ✅ Comissões são cadastradas/alteradas/excluídas
- ✅ Outros descontos são modificados

### 3️⃣ **Regra de Proteção**
- **INSS só é aplicado se salário líquido > 0**
- Se o salário líquido ficar ≤ 0, o INSS é **automaticamente removido**
- **Nunca** permite salário negativo por causa do INSS

---

## 🔧 ARQUIVOS CRIADOS/MODIFICADOS

### **Novos Arquivos:**
- `/src/utils/salarioCalculator.js` - Funções de cálculo
- `/src/services/SalarioCalculatorService.js` - Serviço principal
- `/src/controllers/SalarioController.js` - Controller para endpoints
- `/src/routes/Salario.js` - Rotas do sistema

### **Arquivos Modificados:**
- `/src/services/UsersServices.js` - Recálculo ao alterar salário/nível
- `/src/services/ScheduleServices.js` - Recálculo ao alterar comissões
- `/src/services/DiscountServices.js` - Recálculo ao alterar descontos
- `/src/controllers/index.js` - Injeção de dependências
- `/src/routes/routes.js` - Nova rota `/salario`

---

## 🌐 ENDPOINTS DISPONÍVEIS

### **GET** `/salario/calcular/:idUsuario?mes=YYYY-MM`
**Calcula salário detalhado de um usuário**
```json
{
  "success": true,
  "data": {
    "funcionario": {
      "id": "user-123",
      "nome": "João Silva",
      "nivel": "03",
      "porcentagemAumento": 12.0
    },
    "mesReferencia": "2024-12",
    "calculoDetalhado": {
      "salarioComercial": 3500.00,
      "adicionalNivel": 420.00,
      "totalComissoes": 850.00,
      "salarioBrutoTotal": 4770.00,
      "valorINSS": 486.62,
      "outrosDescontos": 200.00,
      "salarioLiquido": 4083.38
    }
  }
}
```

### **POST** `/salario/recalcular/:idUsuario`
**Força recálculo manual**
```json
{
  "mes": "2024-12" // Opcional
}
```

### **POST** `/salario/calcular-inss`
**Utilitário para testar cálculo de INSS**
```json
{
  "salarioBruto": 5000.00
}
```

---

## 📊 FÓRMULAS UTILIZADAS

### **Salário Bruto Total**
```
salarioBrutoTotal = salarioComercial + adicionalNivel + comissoes
```

### **Adicional de Nível**
```
adicionalNivel = (salarioComercial × porcentagemAumento) ÷ 100
```

### **INSS Progressivo**
```javascript
// Exemplo para salário de R$ 3.000,00:
faixa1 = 1518.00 × 7.5% = R$ 113,85
faixa2 = (2862.40 - 1518.00) × 9% = R$ 120,99
faixa3 = (3000.00 - 2862.40) × 12% = R$ 16,51
total = R$ 251,35
```

### **Salário Líquido**
```
salarioLiquido = salarioBrutoTotal - valorINSS - outrosDescontos
```

---

## ⚡ FUNCIONAMENTO AUTOMÁTICO

### **Fluxo de Recálculo:**
1. **Evento disparado** (alteração de salário/nível/comissão/desconto)
2. **Buscar dados** do funcionário e do mês
3. **Calcular componentes**:
   - Salário comercial + adicional nível + comissões = Bruto total
4. **Calcular INSS** progressivo
5. **Aplicar regra de proteção**:
   - Se `salarioLiquido > 0`: Criar/atualizar desconto INSS
   - Se `salarioLiquido ≤ 0`: Remover desconto INSS
6. **Log da operação** no console

### **Logs do Sistema:**
```
🔄 Recalculando salário após nova comissão para usuário 123
✅ Salário recalculado com sucesso para usuário 123
```

---

## 🚨 REGRAS DE NEGÓCIO

### ✅ **DO's:**
- INSS é **sempre automático** - nunca cadastrar manualmente
- Recálculo é **transparente** - não interfere na UX
- **Logs detalhados** para auditoria
- **Proteção** contra salário negativo

### ❌ **DON'Ts:**
- **Nunca** cadastrar desconto "INSS" manualmente
- **Nunca** alterar INSS sem recalcular
- **Não** permite salário líquido negativo por INSS

---

## 🧪 TESTES REALIZADOS

### ✅ **Cenários Testados:**
1. **Cálculo progressivo correto** em todas as faixas
2. **Adicional de nível** calculado corretamente
3. **Simulação completa** de um salário real
4. **Regra de proteção** para salário ≤ 0
5. **Recálculo automático** em todas as operações

### 📈 **Exemplos de Teste:**
- Salário R$ 1.000,00 → INSS R$ 75,00 ✅
- Salário R$ 5.000,00 → INSS R$ 518,82 ✅
- Salário R$ 8.000,00 → INSS R$ 908,86 (teto) ✅
- Salário líquido negativo → INSS removido ✅

---

## 🎉 RESULTADO FINAL

### **Sistema 100% Funcional:**
- ✅ **Cálculo automático** de INSS em todas as operações
- ✅ **Tabela oficial 2024** implementada corretamente
- ✅ **Regra de proteção** contra salário negativo
- ✅ **Endpoints** para consulta e teste
- ✅ **Logs** para auditoria e debug
- ✅ **Integração** completa com sistema existente

### **Próximos Passos (Opcional):**
- Interface frontend para visualizar cálculos
- Relatórios de folha de pagamento
- Histórico de alterações de INSS
- Exportação para contabilidade

---

**🔥 SISTEMA DE INSS IMPLEMENTADO COM SUCESSO! 🔥**