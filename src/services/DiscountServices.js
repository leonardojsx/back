import { DiscountEntity } from "../entities/DiscountEntity.js";

class DiscountServices {
  constructor(discountRepo) {
    this.discountRepo = discountRepo;
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