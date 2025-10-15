import { ScheduleEntity } from "../entities/ScheduleEntity.js";

class ScheduleServices {
  constructor(scheduleRepo) {
    this.scheduleRepo = scheduleRepo
  }

  async save(schedule) {
    const porcentagem = typeof schedule.porcentagem === 'number' ? schedule.porcentagem : 0.1
    const valor = Number(schedule.valor) || 0
    const valorPorcentagem = schedule.temTaxa ? Number((valor * porcentagem / 100).toFixed(2)) : 0
    schedule.porcentagem = porcentagem
    schedule.valorPorcentagem = valorPorcentagem
    schedule.valor = valor
    schedule.titulo = schedule.titulo ?? null
    const exists = await this.scheduleRepo.userExists(schedule.idUsuario)
    if (!exists) {
      const err = new Error('Usuário não encontrado')
      err.status = 400
      throw err
    }
    const scheduleEntity = new ScheduleEntity(schedule)
    const id = await this.scheduleRepo.save(scheduleEntity)
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
      return {
        items,
        totalComissoes: totalComissoesRounded
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
    await this.scheduleRepo.update(schedule, id)
    return true
  }

  async delete(id) {
    await this.scheduleRepo.delete(id)
    return true
  }
}

export { ScheduleServices };