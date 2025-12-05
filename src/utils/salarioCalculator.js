/**
 * Funções utilitárias para cálculos de salário e INSS
 */

/**
 * Calcula o INSS progressivo baseado na tabela oficial 2025
 * @param {number} salarioBruto - Salário bruto para cálculo
 * @returns {number} - Valor do INSS calculado
 */
export function calcularINSS(salarioBruto) {
  if (!salarioBruto || salarioBruto <= 0) {
    return 0;
  }

  const faixasINSS = [
    { limite: 1518.00, aliquota: 0.075 },     // 7,5%
    { limite: 2862.40, aliquota: 0.09 },      // 9%
    { limite: 4296.29, aliquota: 0.12 },      // 12%
    { limite: 8364.61, aliquota: 0.14 }       // 14%
  ];

  let inssTotal = 0;
  let salarioRestante = salarioBruto;
  let faixaAnterior = 0;

  for (const faixa of faixasINSS) {
    if (salarioRestante <= 0) break;

    const baseCalculo = Math.min(salarioRestante, faixa.limite - faixaAnterior);
    inssTotal += baseCalculo * faixa.aliquota;
    
    salarioRestante -= baseCalculo;
    faixaAnterior = faixa.limite;
  }

  // Arredondar para 2 casas decimais
  return Math.round(inssTotal * 100) / 100;
}

/**
 * Calcula o IRPF (Imposto de Renda Pessoa Física) baseado na tabela oficial 2025
 * @param {number} salarioBruto - Salário bruto para cálculo
 * @param {number} valorINSS - Valor do INSS para dedução
 * @param {number} outrosDescontos - Outros descontos dedutíveis (opcional)
 * @returns {number} - Valor do IRPF calculado
 */
export function calcularIRPF(salarioBruto, valorINSS = 0, outrosDescontos = 0) {
  if (!salarioBruto || salarioBruto <= 0) {
    return 0;
  }

  // Base de cálculo = Salário Bruto - INSS - Outros descontos dedutíveis
  const baseCalculo = salarioBruto - valorINSS - outrosDescontos;

  if (baseCalculo <= 0) {
    return 0;
  }

  const faixasIRPF = [
    { limite: 2428.80, aliquota: 0.00, deducao: 0.00 },        // Isento
    { limite: 2826.65, aliquota: 0.075, deducao: 182.16 },     // 7,5%
    { limite: 3751.05, aliquota: 0.15, deducao: 394.65 },      // 15%
    { limite: 4664.68, aliquota: 0.225, deducao: 675.41 },     // 22,5%
    { limite: Infinity, aliquota: 0.275, deducao: 908.74 }     // 27,5%
  ];

  let irpfCalculado = 0;

  // Encontrar a faixa correta
  for (const faixa of faixasIRPF) {
    if (baseCalculo <= faixa.limite) {
      irpfCalculado = (baseCalculo * faixa.aliquota) - faixa.deducao;
      break;
    }
  }

  // IRPF não pode ser negativo
  irpfCalculado = Math.max(0, irpfCalculado);

  // Arredondar para 2 casas decimais
  return Math.round(irpfCalculado * 100) / 100;
}

/**
 * Calcula o adicional do nível sobre o salário bruto
 * @param {number} salarioBruto - Salário bruto base
 * @param {number} porcentagemAumento - Percentual de aumento (ex: 10.5 para 10,5%)
 * @returns {number} - Valor do adicional
 */
export function calcularAdicionalNivel(salarioBruto, porcentagemAumento) {
  if (!salarioBruto || !porcentagemAumento || porcentagemAumento <= 0) {
    return 0;
  }

  const adicional = (salarioBruto * porcentagemAumento) / 100;
  return Math.round(adicional * 100) / 100;
}

/**
 * Formata data para o padrão MySQL YYYY-MM
 * @param {string|Date} data - Data para formatação
 * @returns {string} - Data formatada YYYY-MM
 */
export function formatarMesReferencia(data) {
  const date = new Date(data);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Obter mês atual no formato YYYY-MM
 * @returns {string} - Mês atual formatado
 */
export function obterMesAtual() {
  return formatarMesReferencia(new Date());
}