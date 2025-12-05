import { DiscountEntity } from "../entities/DiscountEntity.js";
import { SalarioCalculatorService } from './SalarioCalculatorService.js';

class DiscountServices {
  constructor(discountRepo, scheduleRepo = null, usersRepo = null) {
    this.discountRepo = discountRepo;
    
    // Inicializar calculator service se os repositórios estiverem disponíveis
    if (scheduleRepo && usersRepo) {
      this.salarioCalculator = new SalarioCalculatorService(discountRepo, scheduleRepo, usersRepo);
    }
  }

  async save(discount) {
    // Validar se o usuário existe
    const exists = await this.discountRepo.userExists(discount.idUsuario);
    if (!exists) {
      const err = new Error('Usuário não encontrado');
      err.status = 400;
      throw err;
    }

    // Validar campos obrigatórios
    if (!discount.descricao || !discount.descricao.trim()) {
      const err = new Error('Descrição é obrigatória');
      err.status = 400;
      throw err;
    }

    if (!discount.valor || Number(discount.valor) <= 0) {
      const err = new Error('Valor deve ser maior que zero');
      err.status = 400;
      throw err;
    }

    const discountEntity = new DiscountEntity(discount);
    const id = await this.discountRepo.save(discountEntity);
    
    // 🔥 RECÁLCULO AUTOMÁTICO - Após cadastrar desconto (exceto INSS e IRPF que são automáticos)
    if (this.salarioCalculator && !['INSS', 'IRPF'].includes(discount.descricao)) {
      try {
        console.log(`🔄 Recalculando salário após novo desconto para usuário ${discount.idUsuario}`);
        await this.salarioCalculator.recalcularAposAlteracaoComissao(discount.idUsuario, discount.data);
        console.log(`✅ Salário recalculado com sucesso para usuário ${discount.idUsuario}`);
      } catch (error) {
        console.error(`❌ Erro ao recalcular salário para usuário ${discount.idUsuario}:`, error.message);
        // Não falhar a operação principal por erro no cálculo
      }
    }
    
    return id;
  }

  async findAll(options = {}) {
    const { user, ano, mes } = options;
    const filterOptions = { ano, mes };

    // Se não for admin, filtrar apenas os descontos do próprio usuário
    if (user && user.role !== 'admin') {
      filterOptions.idUsuario = user.id;
    }

    const rows = await this.discountRepo.findAll(filterOptions);

    return rows.map(r => ({
      id: r.id,
      idUsuario: r.idUsuario,
      usuario: r.usuario || null,
      descricao: r.descricao,
      valor: r.valor !== null && r.valor !== undefined ? Number(r.valor) : 0,
      data: r.data
    }));
  }

  async findById(id) {
    const row = await this.discountRepo.findById(id);
    if (!row) return null;
    
    return {
      id: row.id,
      idUsuario: row.idUsuario,
      usuario: row.usuario || null,
      descricao: row.descricao,
      valor: row.valor !== null ? Number(row.valor) : 0,
      data: row.data
    };
  }

  async update(discount, id) {
    // Validar se existe
    const existing = await this.findById(id);
    if (!existing) {
      const err = new Error('Desconto não encontrado');
      err.status = 404;
      throw err;
    }

    // Validar campos se fornecidos
    if (discount.descricao !== undefined && (!discount.descricao || !discount.descricao.trim())) {
      const err = new Error('Descrição é obrigatória');
      err.status = 400;
      throw err;
    }

    if (discount.valor !== undefined && Number(discount.valor) <= 0) {
      const err = new Error('Valor deve ser maior que zero');
      err.status = 400;
      throw err;
    }

    const updateData = {};
    if (discount.descricao !== undefined) updateData.descricao = discount.descricao;
    if (discount.valor !== undefined) updateData.valor = Number(discount.valor);
    if (discount.data !== undefined) {
      const entity = new DiscountEntity({ data: discount.data });
      updateData.data = entity.data;
    }

    await this.discountRepo.update(updateData, id);
    
    // 🔥 RECÁLCULO AUTOMÁTICO - Após atualizar desconto (exceto INSS que é automático)
    if (this.salarioCalculator && existing.descricao !== 'INSS') {
      try {
        console.log(`🔄 Recalculando salário após atualizar desconto ${id}`);
        const dataReferencia = updateData.data || existing.data;
        await this.salarioCalculator.recalcularAposAlteracaoComissao(existing.idUsuario, dataReferencia);
        console.log(`✅ Salário recalculado com sucesso para usuário ${existing.idUsuario}`);
      } catch (error) {
        console.error(`❌ Erro ao recalcular salário para usuário ${existing.idUsuario}:`, error.message);
        // Não falhar a operação principal por erro no cálculo
      }
    }
    
    return true;
  }

  async delete(id) {
    // Validar se existe
    const existing = await this.findById(id);
    if (!existing) {
      const err = new Error('Desconto não encontrado');
      err.status = 404;
      throw err;
    }

    await this.discountRepo.delete(id);
    
    // 🔥 RECÁLCULO AUTOMÁTICO - Após deletar desconto (exceto INSS e IRPF que são automáticos)
    if (this.salarioCalculator && !['INSS', 'IRPF'].includes(existing.descricao)) {
      try {
        console.log(`🔄 Recalculando salário após deletar desconto ${id}`);
        await this.salarioCalculator.recalcularAposAlteracaoComissao(existing.idUsuario, existing.data);
        console.log(`✅ Salário recalculado com sucesso para usuário ${existing.idUsuario}`);
      } catch (error) {
        console.error(`❌ Erro ao recalcular salário para usuário ${existing.idUsuario}:`, error.message);
        // Não falhar a operação principal por erro no cálculo
      }
    }
    
    return true;
  }

  async getTotalByUser(idUsuario, ano = null, mes = null) {
    return await this.discountRepo.getTotalByUser(idUsuario, ano, mes);
  }

  async findByUser(idUsuario, ano = null, mes = null) {
    const rows = await this.discountRepo.findByUser(idUsuario, ano, mes);

    return rows.map(r => ({
      id: r.id,
      idUsuario: r.idUsuario,
      usuario: r.usuario || null,
      descricao: r.descricao,
      valor: r.valor !== null && r.valor !== undefined ? Number(r.valor) : 0,
      data: r.data
    }));
  }
}

export { DiscountServices };