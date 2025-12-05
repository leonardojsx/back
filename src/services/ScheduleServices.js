import { ScheduleEntity } from "../entities/ScheduleEntity.js";
import { SalarioCalculatorService } from './SalarioCalculatorService.js';

class ScheduleServices {
  constructor(scheduleRepo, discountRepo = null, usersRepo = null) {
    this.scheduleRepo = scheduleRepo;
    
    // Inicializar calculator service se os repositórios estiverem disponíveis
    if (discountRepo && usersRepo) {
      this.salarioCalculator = new SalarioCalculatorService(discountRepo, scheduleRepo, usersRepo);
    }
  }

  async save(schedule) {
    const porcentagem = typeof schedule.porcentagem === 'number' ? schedule.porcentagem : 0.1
    const valor = Number(schedule.valor) || 0
    const valorPorcentagem = schedule.temTaxa ? Number((valor * porcentagem / 100).toFixed(2)) : 0
    schedule.porcentagem = porcentagem
    schedule.valorPorcentagem = valorPorcentagem
    schedule.valor = valor
    schedule.titulo = schedule.titulo ?? null
    
    // Validar documento (CPF ou CNPJ)
    const tipoDocumento = schedule.tipoDocumento || 'cnpj'
    if (!schedule.cnpj) {
      const err = new Error(`${tipoDocumento.toUpperCase()} é obrigatório`)
      err.status = 400
      throw err
    }
    
    const documentoLimpo = schedule.cnpj.replace(/\D/g, '')
    if (tipoDocumento === 'cnpj' && documentoLimpo.length !== 14) {
      const err = new Error('CNPJ deve ter 14 dígitos')
      err.status = 400
      throw err
    } else if (tipoDocumento === 'cpf' && documentoLimpo.length !== 11) {
      const err = new Error('CPF deve ter 11 dígitos')
      err.status = 400
      throw err
    }
    
    // Validar se a data foi fornecida
    if (!schedule.data) {
      const err = new Error('Data é obrigatória')
      err.status = 400
      throw err
    }
    
    const exists = await this.scheduleRepo.userExists(schedule.idUsuario)
    if (!exists) {
      const err = new Error('Usuário não encontrado')
      err.status = 400
      throw err
    }
    const scheduleEntity = new ScheduleEntity(schedule)
    const id = await this.scheduleRepo.save(scheduleEntity)
    
    // 🔥 RECÁLCULO AUTOMÁTICO - Após cadastrar comissão
    if (this.salarioCalculator && schedule.idUsuario) {
      try {
        console.log(`🔄 Recalculando salário após nova comissão para usuário ${schedule.idUsuario}`);
        await this.salarioCalculator.recalcularAposAlteracaoComissao(schedule.idUsuario, schedule.data);
        console.log(`✅ Salário recalculado com sucesso para usuário ${schedule.idUsuario}`);
      } catch (error) {
        console.error(`❌ Erro ao recalcular salário para usuário ${schedule.idUsuario}:`, error.message);
        // Não falhar a operação principal por erro no cálculo
      }
    }
    
    return id
  }

  async findAll(options = {}) {
    const { summary, ano, mes, view, user } = options;
    const filterOptions = { ano, mes, view };

    if (user && user.role !== 'admin') {
      filterOptions.idUsuario = user.id;
    }

    const rows = await this.scheduleRepo.findAll(filterOptions);

    const items = rows.map(r => ({
      id: r.id,
      cnpj: r.cnpj,
      tipoDocumento: r.tipoDocumento || 'cnpj',
      data: r.data,
      idUsuario: r.idUsuario,
      usuario: r.usuario || null,
      temTaxa: r.temTaxa === 1 || r.temTaxa === true,
      valor: r.valor !== null && r.valor !== undefined ? Number(r.valor) : null,
      porcentagem: (r.porcentegem ?? r.porcentagem) != null ? Number(r.porcentegem ?? r.porcentagem) : null,
      valorPorcentagem: r.valorPorcentagem != null && r.valorPorcentagem !== undefined ? Number(r.valorPorcentagem) : 0,
      titulo: r.titulo ?? null
    }))

    if (summary) {
      const totalComissoes = items.reduce((acc, row) => acc + (row.valorPorcentagem || 0), 0)
      const totalComissoesRounded = Number(totalComissoes.toFixed(2))
      
      // Se o usuário tem um ID específico, buscar seu salário bruto e descontos
      let salarioBruto = 0
      let totalDescontos = 0
      if (user && user.id) {
        const userData = await this.scheduleRepo.getUserSalario(user.id)
        salarioBruto = userData ? Number(userData.salarioBruto || 0) : 0
        
        // Buscar descontos do mês atual
        const { DiscountRepo } = await import('../repositories/DiscountRepo.js')
        const discountRepo = new DiscountRepo()
        totalDescontos = await discountRepo.getTotalByUser(user.id, ano, mes)
      }
      
      const totalFinal = Number((salarioBruto + totalComissoesRounded - totalDescontos).toFixed(2))
      
      return {
        items,
        totalComissoes: totalComissoesRounded,
        salarioBruto,
        totalDescontos: Number(totalDescontos.toFixed(2)),
        totalFinal
      }
    }
    return items
  }

  async findById(id) {
    const row = await this.scheduleRepo.findById(id)
    if (!row) return null
    return {
      id: row.id,
      cnpj: row.cnpj,
      tipoDocumento: row.tipoDocumento || 'cnpj',
      data: row.data,
      idUsuario: row.idUsuario,
      usuario: row.usuario || null,
      temTaxa: row.temTaxa === 1 || row.temTaxa === true,
      valor: row.valor !== null ? Number(row.valor) : null,
      porcentagem: (row.porcentegem ?? row.porcentagem) != null ? Number(row.porcentegem ?? row.porcentagem) : null,
      valorPorcentagem: row.valorPorcentagem != null && row.valorPorcentagem !== undefined ? Number(row.valorPorcentagem) : 0,
      titulo: row.titulo ?? null
    }
  }

  async update(schedule, id) {
    // Buscar dados originais para comparar mudanças
    const original = await this.scheduleRepo.findById(id);
    
    // Se a data estiver sendo atualizada, formatar corretamente
    if (schedule.data) {
      const scheduleEntity = new ScheduleEntity(schedule)
      schedule.data = scheduleEntity.data
    }
    
    await this.scheduleRepo.update(schedule, id);
    
    // 🔥 RECÁLCULO AUTOMÁTICO - Após atualizar comissão
    if (this.salarioCalculator && original) {
      try {
        console.log(`🔄 Recalculando salário após atualizar comissão ${id}`);
        // Usar a data original ou nova data para determinar o mês de referência
        const dataReferencia = schedule.data || original.data;
        await this.salarioCalculator.recalcularAposAlteracaoComissao(original.idUsuario, dataReferencia);
        console.log(`✅ Salário recalculado com sucesso para usuário ${original.idUsuario}`);
      } catch (error) {
        console.error(`❌ Erro ao recalcular salário para usuário ${original.idUsuario}:`, error.message);
        // Não falhar a operação principal por erro no cálculo
      }
    }
    
    return true;
  }

  async delete(id) {
    // Buscar dados antes de deletar para recálculo
    const original = await this.scheduleRepo.findById(id);
    
    await this.scheduleRepo.delete(id);
    
    // 🔥 RECÁLCULO AUTOMÁTICO - Após deletar comissão
    if (this.salarioCalculator && original) {
      try {
        console.log(`🔄 Recalculando salário após deletar comissão ${id}`);
        await this.salarioCalculator.recalcularAposAlteracaoComissao(original.idUsuario, original.data);
        console.log(`✅ Salário recalculado com sucesso para usuário ${original.idUsuario}`);
      } catch (error) {
        console.error(`❌ Erro ao recalcular salário para usuário ${original.idUsuario}:`, error.message);
        // Não falhar a operação principal por erro no cálculo
      }
    }
    
    return true;
  }

  // Método para buscar resumo de todos os usuários (admin only) - OTIMIZADO
  async getAllUsersSummary() {
    try {
      // Buscar todos os usuários e suas comissões em uma única query otimizada
      const summaryData = await this.scheduleRepo.getAllUsersSummaryOptimized()
      
      // Adicionar descontos para cada usuário
      const { DiscountRepo } = await import('../repositories/DiscountRepo.js')
      const discountRepo = new DiscountRepo()
      
      const hoje = new Date()
      const ano = hoje.getFullYear()
      const mes = hoje.getMonth() + 1
      
      for (const userData of summaryData) {
        const totalDescontos = await discountRepo.getTotalByUser(userData.id, ano, mes)
        userData.totalDescontos = Number(totalDescontos.toFixed(2))
        userData.totalFinal = Number((userData.salarioBruto + userData.totalComissoes - userData.totalDescontos).toFixed(2))
      }
      
      return summaryData
    } catch (error) {
      // Fallback para método anterior se a query otimizada falhar
      
      // Buscar todos os usuários
      const users = await this.scheduleRepo.getAllUsers()
      
      // Para cada usuário, calcular suas comissões e descontos
      const summaryData = []
      const { DiscountRepo } = await import('../repositories/DiscountRepo.js')
      const discountRepo = new DiscountRepo()
      
      for (const user of users) {
        // Buscar comissões do usuário no mês atual
        const hoje = new Date()
        const ano = hoje.getFullYear()
        const mes = hoje.getMonth() + 1
        
        const comissoes = await this.scheduleRepo.findAll({ 
          idUsuario: user.id,
          ano,
          mes 
        })
        
        const totalComissoes = comissoes.reduce((acc, row) => {
          return acc + (row.valorPorcentagem ? Number(row.valorPorcentagem) : 0)
        }, 0)
        
        const totalComissoesRounded = Number(totalComissoes.toFixed(2))
        const salarioBruto = Number(user.salarioBruto || 0)
        const totalDescontos = await discountRepo.getTotalByUser(user.id, ano, mes)
        const totalFinal = Number((salarioBruto + totalComissoesRounded - totalDescontos).toFixed(2))
        
        summaryData.push({
          id: user.id,
          nome: user.nome,
          email: user.email,
          role: user.role,
          salarioBruto,
          nivel: user.nivel,
          porcentagem_aumento: user.porcentagem_aumento ? Number(user.porcentagem_aumento) : 0,
          totalComissoes: totalComissoesRounded,
          totalDescontos: Number(totalDescontos.toFixed(2)),
          totalFinal
        })
      }
      
      return summaryData
    }
  }
}

export { ScheduleServices };