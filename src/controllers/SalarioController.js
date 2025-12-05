import { SalarioCalculatorService } from '../services/SalarioCalculatorService.js';
import { calcularINSS, calcularIRPF } from '../utils/salarioCalculator.js';

class SalarioController {
  constructor(salarioCalculatorService) {
    this.salarioCalculatorService = salarioCalculatorService;
  }

  /**
   * GET /salario/calcular/:idUsuario?mes=YYYY-MM
   * Calcula e retorna o salário detalhado de um usuário
   */
  async calcularSalario(req, res) {
    try {
      const { idUsuario } = req.params;
      const { mes } = req.query;

      if (!idUsuario) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID do usuário é obrigatório' 
        });
      }

      const resultado = await this.salarioCalculatorService.recalcularSalarioFuncionario(
        idUsuario, 
        mes || null
      );

      return res.json({
        success: true,
        message: 'Salário calculado com sucesso',
        data: resultado
      });
    } catch (error) {
      console.error('Erro ao calcular salário:', error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  /**
   * POST /salario/recalcular/:idUsuario
   * Força o recálculo do salário de um usuário
   */
  async forcarRecalculo(req, res) {
    try {
      const { idUsuario } = req.params;
      const { mes } = req.body;

      if (!idUsuario) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID do usuário é obrigatório' 
        });
      }

      const resultado = await this.salarioCalculatorService.recalcularSalarioFuncionario(
        idUsuario, 
        mes || null
      );

      return res.json({
        success: true,
        message: 'Salário recalculado com sucesso',
        data: resultado
      });
    } catch (error) {
      console.error('Erro ao recalcular salário:', error);
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  /**
   * POST /salario/calcular-inss
   * Endpoint utilitário para testar cálculo de INSS
   */
  async calcularINSS(req, res) {
    try {
      const { salarioBruto } = req.body;

      if (!salarioBruto || salarioBruto <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Salário bruto deve ser maior que zero' 
        });
      }

      const valorINSS = calcularINSS(Number(salarioBruto));

      return res.json({
        success: true,
        data: {
          salarioBruto: Number(salarioBruto),
          valorINSS: valorINSS,
          salarioLiquido: Number(salarioBruto) - valorINSS
        }
      });
    } catch (error) {
      console.error('Erro ao calcular INSS:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * GET /salario/calcular-irpf?salario=X&inss=Y&outros=Z
   * Calcula IRPF baseado nos parâmetros informados
   */
  async calcularIRPFSimples(req, res) {
    try {
      const { salario, inss = 0, outros = 0 } = req.query;

      if (!salario || isNaN(salario) || Number(salario) <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Salário bruto deve ser maior que zero' 
        });
      }

      const salarioBruto = Number(salario);
      const valorINSS = Number(inss);
      const outrosDescontos = Number(outros);
      
      // Calcular INSS automaticamente se não informado
      const inssCalculado = valorINSS > 0 ? valorINSS : calcularINSS(salarioBruto);
      
      // Calcular IRPF
      const valorIRPF = calcularIRPF(salarioBruto, inssCalculado, outrosDescontos);

      return res.json({
        success: true,
        data: {
          salarioBruto,
          valorINSS: inssCalculado,
          valorIRPF,
          outrosDescontos,
          totalDescontos: inssCalculado + valorIRPF + outrosDescontos,
          salarioLiquido: salarioBruto - inssCalculado - valorIRPF - outrosDescontos
        }
      });
    } catch (error) {
      console.error('Erro ao calcular IRPF:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * GET /salario/calcular-impostos?salario=X
   * Calcula INSS e IRPF automaticamente
   */
  async calcularImpostosCompleto(req, res) {
    try {
      const { salario } = req.query;

      if (!salario || isNaN(salario) || Number(salario) <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Salário bruto deve ser maior que zero' 
        });
      }

      const salarioBruto = Number(salario);
      
      // Calcular INSS
      const valorINSS = calcularINSS(salarioBruto);
      
      // Calcular IRPF
      const valorIRPF = calcularIRPF(salarioBruto, valorINSS, 0);
      
      // Calcular salário líquido
      const salarioLiquido = salarioBruto - valorINSS - valorIRPF;

      return res.json({
        success: true,
        data: {
          salarioBruto,
          descontos: {
            inss: valorINSS,
            irpf: valorIRPF,
            total: valorINSS + valorIRPF
          },
          salarioLiquido,
          tabelas: {
            inss: '2025',
            irpf: '2025'
          }
        }
      });
    } catch (error) {
      console.error('Erro ao calcular impostos:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

export { SalarioController };