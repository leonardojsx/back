import Knex from "knex";
import knexConfig from "../../knexfile.mjs";

const knex = Knex(knexConfig);

class DiscountRepo {
  async save(discountEntity) {
    try {
      const toInsert = {
        id: discountEntity.id,
        idUsuario: discountEntity.idUsuario,
        descricao: discountEntity.descricao,
        valor: discountEntity.valor,
        data: discountEntity.data
      };
      
      await knex('descontos').insert(toInsert);
      return discountEntity.id;
    } catch (error) {
      throw error;
    }
  }

  async findAll(options = {}) {
    const { idUsuario, ano, mes } = options;
    try {
      let query = knex('descontos')
        .select('descontos.*', 'usuarios.nome as usuario')
        .leftJoin('usuarios', 'descontos.idUsuario', 'usuarios.id')
        .orderBy('descontos.data', 'desc');

      if (idUsuario) {
        query.where('descontos.idUsuario', idUsuario);
      }

      if (ano && mes) {
        query.whereRaw('YEAR(descontos.data) = ?', [ano]);
        query.whereRaw('MONTH(descontos.data) = ?', [mes]);
      }
      
      const rows = await query;
      return rows;
    } catch (error) {
      throw error;
    }
  }

  async findById(id) {
    try {
      const row = await knex('descontos')
        .select('descontos.*', 'usuarios.nome as usuario')
        .leftJoin('usuarios', 'descontos.idUsuario', 'usuarios.id')
        .where('descontos.id', id)
        .first();
      return row;
    } catch (error) {
      throw error;
    }
  }

  async update(discount, id) {
    try {
      await knex('descontos').where({ id }).update(discount);
      return true;
    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    try {
      await knex('descontos').where({ id }).delete();
      return true;
    } catch (error) {
      throw error;
    }
  }

  async getTotalByUser(idUsuario, ano = null, mes = null) {
    try {
      let query = knex('descontos')
        .sum('valor as total')
        .where('idUsuario', idUsuario);

      if (ano && mes) {
        query.whereRaw('YEAR(data) = ?', [ano]);
        query.whereRaw('MONTH(data) = ?', [mes]);
      }

      const result = await query.first();
      return Number(result.total || 0);
    } catch (error) {
      throw error;
    }
  }

  async findByUser(idUsuario, ano = null, mes = null) {
    try {
      let query = knex('descontos')
        .select('descontos.*', 'usuarios.nome as usuario')
        .leftJoin('usuarios', 'descontos.idUsuario', 'usuarios.id')
        .where('descontos.idUsuario', idUsuario)
        .orderBy('descontos.data', 'desc');

      if (ano && mes) {
        query.whereRaw('YEAR(descontos.data) = ?', [ano]);
        query.whereRaw('MONTH(descontos.data) = ?', [mes]);
      }

      const rows = await query;
      return rows;
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
}

export { DiscountRepo };