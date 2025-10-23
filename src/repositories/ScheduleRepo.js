import Knex from "knex";
import knexConfig from "../../knexfile.mjs";

const knex = Knex(knexConfig);

class ScheduleRepo {
  async save(scheduleEntity) {
    try {
      const toInsert = {
        id: scheduleEntity.id,
        cnpj: scheduleEntity.cnpj,
        data: scheduleEntity.data,
        idUsuario: scheduleEntity.idUsuario,
        porcentagem: scheduleEntity.porcentagem ?? null,
        temTaxa: scheduleEntity.temTaxa,
        valor: scheduleEntity.valor,
        valorPorcentagem: scheduleEntity.valorPorcentagem,
        titulo: scheduleEntity.titulo ?? null
      };
      await knex('agenda').insert(toInsert);
      return scheduleEntity.id;
    } catch (error) {
      throw error;
    }
  }

  async userExists(idUsuario) {
    try {
      const row = await knex('usuarios').where({ id: idUsuario }).first();
      return !!row;
    } catch (error) {
      throw error;
    }
  }

  async findAll(options = {}) {
    const { ano, mes, view, idUsuario } = options;
    try {
      let query;

      if (view === 'chart') {
        query = knex('agenda')
          .select(
            knex.raw('DATE(data) as data'),
            knex.raw('SUM(valorPorcentagem) as valorPorcentagem')
          )
          .groupBy(knex.raw('DATE(data)'))
          .orderBy(knex.raw('DATE(data)'), 'asc');
      } else {
        query = knex('agenda')
          .select('agenda.*', 'usuarios.nome as usuario')
          .leftJoin('usuarios', 'agenda.idUsuario', 'usuarios.id')
          .orderBy('agenda.data', 'asc');
      }

      if (ano && mes) {
        query.whereRaw('YEAR(data) = ?', [ano]);
        query.whereRaw('MONTH(data) = ?', [mes]);
      }
      
      if (idUsuario) {
        query.where('idUsuario', idUsuario);
      }
      
      const rows = await query;
      return rows;
    } catch (error) {
      throw error;
    }
  }

  async findById(id) {
    try {
      const row = await knex('agenda')
        .select('agenda.*', 'usuarios.nome as usuario')
        .leftJoin('usuarios', 'agenda.idUsuario', 'usuarios.id')
        .where('agenda.id', id)
        .first();
      return row;
    } catch (error) {
      throw error;
    }
  }

  async update(schedule, id) {
    try {
      await knex('agenda').where({ id }).update(schedule);
      return true;
    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    try {
      await knex('agenda').where({ id }).delete();
      return true;
    } catch (error) {
      throw error;
    }
  }
}

export { ScheduleRepo };