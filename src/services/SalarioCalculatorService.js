import { calcularINSS, calcularIRPF, calcularAdicionalNivel, formatarMesReferencia, obterMesAtual } from '../utils/salarioCalculator.js';
import { DiscountEntity } from '../entities/DiscountEntity.js';
import knex from '../../knexfile.mjs';

class SalarioCalculatorService {
  constructor(discountRepo, scheduleRepo, usersRepo) {
    this.discountRepo = discountRepo;
    this.scheduleRepo = scheduleRepo;
    this.usersRepo = usersRepo;
  }

  /**
   * Recalcula automaticamente o salário completo de um funcionário
   * @param {string} idFuncionario - ID do funcionário
   * @param {string} mesReferencia - Mês de referência no formato YYYY-MM (opcional, padrão: mês atual)
   * @returns {Object} - Dados do salário calculado
   */
  async recalcularSalarioFuncionario(idFuncionario, mesReferencia = null) {
    const mes = mesReferencia || obterMesAtual();
    
    try {
      // 1. Buscar dados básicos do funcionário
      const funcionario = await this.usersRepo.findById(idFuncionario);
      if (!funcionario) {
        throw new Error('Funcionário não encontrado');
      }

      const salarioComercial = Number(funcionario.salarioBruto || 0);
      const porcentagemAumento = Number(funcionario.porcentagem_aumento || 0);

      // 2. Calcular adicional do nível
      const adicionalNivel = calcularAdicionalNivel(salarioComercial, porcentagemAumento);

      // 3. Buscar total de comissões do mês
      const totalComissoes = await this.buscarComissoesMes(idFuncionario, mes);

      // 4. Calcular salário bruto total
      const salarioBrutoTotal = salarioComercial + adicionalNivel + totalComissoes;

      // 5. Buscar outros descontos (exceto INSS e IRPF)
      const outrosDescontos = await this.buscarOutrosDescontos(idFuncionario, mes);

      // 6. Calcular INSS
      const valorINSS = calcularINSS(salarioBrutoTotal);

      // 7. Calcular IRPF
      const valorIRPF = calcularIRPF(salarioBrutoTotal, valorINSS, outrosDescontos);

      // 8. Calcular salário líquido
      const salarioLiquido = salarioBrutoTotal - valorINSS - valorIRPF - outrosDescontos;

      // 9. Gerenciar descontos de INSS e IRPF baseados na regra
      await this.gerenciarDescontoINSS(idFuncionario, mes, valorINSS, salarioLiquido);
      await this.gerenciarDescontoIRPF(idFuncionario, mes, valorIRPF, salarioLiquido);

      const resultado = {
        funcionario: {
          id: funcionario.id,
          nome: funcionario.nome,
          nivel: funcionario.nivel,
          porcentagemAumento: porcentagemAumento
        },
        mesReferencia: mes,
        calculoDetalhado: {
          salarioComercial: Number(salarioComercial.toFixed(2)),
          adicionalNivel: Number(adicionalNivel.toFixed(2)),
          totalComissoes: Number(totalComissoes.toFixed(2)),
          salarioBrutoTotal: Number(salarioBrutoTotal.toFixed(2)),
          valorINSS: Number(valorINSS.toFixed(2)),
          valorIRPF: Number(valorIRPF.toFixed(2)),
          outrosDescontos: Number(outrosDescontos.toFixed(2)),
          salarioLiquido: Number(salarioLiquido.toFixed(2))
        }
      };

      return resultado;
    } catch (error) {
      throw new Error(`Erro ao recalcular salário: ${error.message}`);
    }
  }

  /**
   * Busca total de comissões de um funcionário no mês
   */
  async buscarComissoesMes(idFuncionario, mesReferencia) {
    try {
      const [ano, mes] = mesReferencia.split('-');
      
      const result = await knex('agenda')
        .sum('valorPorcentagem as total')
        .where('idUsuario', idFuncionario)
        .whereRaw('YEAR(data) = ?', [ano])
        .whereRaw('MONTH(data) = ?', [mes])
        .first();

      return Number(result.total || 0);
    } catch (error) {
      throw new Error(`Erro ao buscar comissões: ${error.message}`);
    }
  }

  /**
   * Busca total de outros descontos (excluindo INSS e IRPF)
   */
  async buscarOutrosDescontos(idFuncionario, mesReferencia) {
    try {
      const [ano, mes] = mesReferencia.split('-');
      
      const result = await knex('descontos')
        .sum('valor as total')
        .where('idUsuario', idFuncionario)
        .whereNotIn('descricao', ['INSS', 'IRPF'])
        .whereRaw('YEAR(data) = ?', [ano])
        .whereRaw('MONTH(data) = ?', [mes])
        .first();

      return Number(result.total || 0);
    } catch (error) {
      throw new Error(`Erro ao buscar outros descontos: ${error.message}`);
    }
  }

  /**
   * Gerencia o desconto de INSS (cria, atualiza ou remove baseado nas regras)
   */
  async gerenciarDescontoINSS(idFuncionario, mesReferencia, valorINSS, salarioLiquido) {
    try {
      // Buscar desconto de INSS existente no mês
      const inssExistente = await this.buscarDescontoINSSMes(idFuncionario, mesReferencia);

      // Regra: só manter INSS se salário líquido > 0
      if (salarioLiquido <= 0) {
        // Se existe INSS e salário líquido <= 0, remover o desconto
        if (inssExistente) {
          await this.discountRepo.delete(inssExistente.id);
          console.log(`INSS removido para funcionário ${idFuncionario} - salário líquido: ${salarioLiquido}`);
        }
        return;
      }

      // Se salário líquido > 0 e há valor de INSS para descontar
      if (valorINSS > 0) {
        const dataReferencia = `${mesReferencia}-01 00:00:00`;

        if (inssExistente) {
          // Atualizar INSS existente
          await this.discountRepo.update({
            valor: valorINSS,
            data: dataReferencia
          }, inssExistente.id);
          console.log(`INSS atualizado para funcionário ${idFuncionario} - valor: ${valorINSS}`);
        } else {
          // Criar novo desconto de INSS
          const novoINSS = new DiscountEntity({
            idUsuario: idFuncionario,
            descricao: 'INSS',
            valor: valorINSS,
            data: dataReferencia
          });
          
          await this.discountRepo.save(novoINSS);
          console.log(`INSS criado para funcionário ${idFuncionario} - valor: ${valorINSS}`);
        }
      }
    } catch (error) {
      throw new Error(`Erro ao gerenciar desconto INSS: ${error.message}`);
    }
  }

  /**
   * Busca desconto de INSS existente no mês
   */
  async buscarDescontoINSSMes(idFuncionario, mesReferencia) {
    try {
      const [ano, mes] = mesReferencia.split('-');
      
      // Buscar todos os registros de INSS do mês
      const inssRegistros = await knex('descontos')
        .where('idUsuario', idFuncionario)
        .where('descricao', 'INSS')
        .whereRaw('YEAR(data) = ?', [ano])
        .whereRaw('MONTH(data) = ?', [mes]);

      // Se houver duplicados, remover os extras
      if (inssRegistros.length > 1) {
        console.log(`AVISO: Encontrados ${inssRegistros.length} registros duplicados de INSS para funcionário ${idFuncionario}`);
        
        // Manter apenas o primeiro e deletar os demais
        for (let i = 1; i < inssRegistros.length; i++) {
          await this.discountRepo.delete(inssRegistros[i].id);
          console.log(`Registro duplicado de INSS removido: ${inssRegistros[i].id}`);
        }
        
        return inssRegistros[0];
      }

      return inssRegistros[0] || null;
    } catch (error) {
      throw new Error(`Erro ao buscar INSS existente: ${error.message}`);
    }
  }

  /**
   * Gerencia o desconto de IRPF (cria, atualiza ou remove baseado nas regras)
   */
  async gerenciarDescontoIRPF(idFuncionario, mesReferencia, valorIRPF, salarioLiquido) {
    try {
      // Buscar desconto de IRPF existente no mês
      const irpfExistente = await this.buscarDescontoIRPFMes(idFuncionario, mesReferencia);

      // Regra: só manter IRPF se salário líquido > 0 e valor IRPF > 0
      if (salarioLiquido <= 0 || valorIRPF <= 0) {
        // Se existe IRPF e não deve mais ter, remover o desconto
        if (irpfExistente) {
          await this.discountRepo.delete(irpfExistente.id);
          console.log(`IRPF removido para funcionário ${idFuncionario} - salário líquido: ${salarioLiquido}, IRPF: ${valorIRPF}`);
        }
        return;
      }

      // Se salário líquido > 0 e há valor de IRPF para descontar
      if (valorIRPF > 0) {
        const dataReferencia = `${mesReferencia}-01 00:00:00`;

        if (irpfExistente) {
          // Atualizar IRPF existente
          await this.discountRepo.update({
            valor: valorIRPF,
            data: dataReferencia
          }, irpfExistente.id);
          console.log(`IRPF atualizado para funcionário ${idFuncionario} - valor: ${valorIRPF}`);
        } else {
          // Criar novo desconto de IRPF
          const novoIRPF = new DiscountEntity({
            idUsuario: idFuncionario,
            descricao: 'IRPF',
            valor: valorIRPF,
            data: dataReferencia
          });
          
          await this.discountRepo.save(novoIRPF);
          console.log(`IRPF criado para funcionário ${idFuncionario} - valor: ${valorIRPF}`);
        }
      }
    } catch (error) {
      throw new Error(`Erro ao gerenciar desconto IRPF: ${error.message}`);
    }
  }

  /**
   * Busca desconto de IRPF existente no mês
   */
  async buscarDescontoIRPFMes(idFuncionario, mesReferencia) {
    try {
      const [ano, mes] = mesReferencia.split('-');
      
      // Buscar todos os registros de IRPF do mês
      const irpfRegistros = await knex('descontos')
        .where('idUsuario', idFuncionario)
        .where('descricao', 'IRPF')
        .whereRaw('YEAR(data) = ?', [ano])
        .whereRaw('MONTH(data) = ?', [mes]);

      // Se houver duplicados, remover os extras
      if (irpfRegistros.length > 1) {
        console.log(`AVISO: Encontrados ${irpfRegistros.length} registros duplicados de IRPF para funcionário ${idFuncionario}`);
        
        // Manter apenas o primeiro e deletar os demais
        for (let i = 1; i < irpfRegistros.length; i++) {
          await this.discountRepo.delete(irpfRegistros[i].id);
          console.log(`Registro duplicado de IRPF removido: ${irpfRegistros[i].id}`);
        }
        
        return irpfRegistros[0];
      }

      return irpfRegistros[0] || null;
    } catch (error) {
      throw new Error(`Erro ao buscar desconto IRPF: ${error.message}`);
    }
  }

  /**
   * Recalcula salários quando comissões são alteradas
   */
  async recalcularAposAlteracaoComissao(idFuncionario, dataComissao) {
    const mesReferencia = formatarMesReferencia(dataComissao);
    return await this.recalcularSalarioFuncionario(idFuncionario, mesReferencia);
  }

  /**
   * Recalcula salários quando salário base é alterado
   */
  async recalcularAposAlteracaoSalario(idFuncionario) {
    const mesReferencia = obterMesAtual();
    return await this.recalcularSalarioFuncionario(idFuncionario, mesReferencia);
  }

  /**
   * Recalcula salários quando nível é alterado
   */
  async recalcularAposAlteracaoNivel(idFuncionario) {
    const mesReferencia = obterMesAtual();
    return await this.recalcularSalarioFuncionario(idFuncionario, mesReferencia);
  }

  /**
   * Calcula IRPF manualmente com valores específicos (para testes)
   */
  async calcularIRPFManual(idFuncionario, salarioBruto, valorINSSManual) {
    try {
      // Buscar outros descontos (exceto INSS e IRPF)
      const mesReferencia = obterMesAtual();
      const outrosDescontos = await this.buscarOutrosDescontos(idFuncionario, mesReferencia);

      // Calcular IRPF com valores manuais
      const valorIRPF = calcularIRPF(salarioBruto, valorINSSManual, outrosDescontos);

      // Atualizar apenas o IRPF (não mexer no INSS)
      await this.gerenciarDescontoIRPF(idFuncionario, mesReferencia, valorIRPF, salarioBruto - valorINSSManual - valorIRPF - outrosDescontos);

      return {
        salarioBruto,
        valorINSS: valorINSSManual,
        valorIRPF,
        outrosDescontos,
        salarioLiquido: salarioBruto - valorINSSManual - valorIRPF - outrosDescontos
      };
    } catch (error) {
      throw new Error(`Erro no cálculo manual: ${error.message}`);
    }
  }

  /**
   * Remove registros duplicados de INSS e IRPF para todos os funcionários
   */
  async limparDuplicacoesImpostos() {
    try {
      console.log('Iniciando limpeza de duplicações de INSS e IRPF...');
      
      // Buscar duplicações de INSS e IRPF
      const duplicacoes = await knex('descontos')
        .select('idUsuario', 
                'descricao',
                knex.raw('YEAR(data) as ano'),
                knex.raw('MONTH(data) as mes'),
                knex.raw('COUNT(*) as total'),
                knex.raw('GROUP_CONCAT(id) as ids'))
        .whereIn('descricao', ['INSS', 'IRPF'])
        .groupBy('idUsuario', 'descricao', knex.raw('YEAR(data)'), knex.raw('MONTH(data)'))
        .having('total', '>', 1);

      let totalRemovidos = 0;
      
      for (const dup of duplicacoes) {
        const ids = dup.ids.split(',');
        console.log(`Funcionário ${dup.idUsuario} - ${dup.descricao} ${dup.ano}/${dup.mes}: ${dup.total} registros duplicados`);
        
        // Manter apenas o primeiro ID, remover os demais
        for (let i = 1; i < ids.length; i++) {
          await this.discountRepo.delete(ids[i]);
          totalRemovidos++;
        }
      }
      
      console.log(`Limpeza concluída. Total de registros duplicados removidos: ${totalRemovidos}`);
      return totalRemovidos;
    } catch (error) {
      throw new Error(`Erro na limpeza de duplicações: ${error.message}`);
    }
  }

  /**
   * Remove registros duplicados de INSS para todos os funcionários (mantido para compatibilidade)
   */
  async limparDuplicacoesINSS() {
    return await this.limparDuplicacoesImpostos();
  }
}

export { SalarioCalculatorService };