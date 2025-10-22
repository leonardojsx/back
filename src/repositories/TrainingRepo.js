import Knex from "knex";
import knexConfig from "../../knexfile.mjs";

const knex = Knex(knexConfig);

class TrainingRepo {
  async save(trainingEntity) {
    try {
      const toInsert = {
        id: trainingEntity.id,
        titulo: trainingEntity.titulo,
        usuario_id: trainingEntity.usuario_id,
        cnpj: trainingEntity.cnpj,
        data_inicio: trainingEntity.data_inicio,
        data_fim: trainingEntity.data_fim,
        status: trainingEntity.status
      };
      await knex('treinamentos').insert(toInsert);
      return trainingEntity.id;
    } catch (error) {
      console.log("TrainingRepo.save error:", error);
      throw error;
    }
  }

  async userExists(userId) {
    try {
      const row = await knex('usuarios').where({ id: userId }).first();
      return !!row;
    } catch (error) {
      console.log("TrainingRepo.userExists error:", error);
      throw error;
    }
  }

  async cnpjHasCommissions(cnpj) {
    try {
      const row = await knex('agenda').where({ cnpj: cnpj }).first();
      return !!row;
    } catch (error) {
      console.log("TrainingRepo.cnpjHasCommissions error:", error);
      throw error;
    }
  }

  async findAll(options = {}) {
    const { dataInicio, dataFim, usuario_id } = options;
    try {
      let query = knex('treinamentos')
        .select('treinamentos.*', 'usuarios.nome as usuario')
        .leftJoin('usuarios', 'treinamentos.usuario_id', 'usuarios.id')
        .orderBy('treinamentos.data_inicio', 'asc');

      if (dataInicio) {
        query.where('treinamentos.data_inicio', '>=', dataInicio);
      }

      if (dataFim) {
        query.where('treinamentos.data_fim', '<=', dataFim);
      }
      
      if (usuario_id) {
        query.where('treinamentos.usuario_id', usuario_id);
      }
      
      const rows = await query;
      return rows;
    } catch (error) {
      console.log("TrainingRepo.findAll error:", error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const row = await knex('treinamentos')
        .select('treinamentos.*', 'usuarios.nome as usuario')
        .leftJoin('usuarios', 'treinamentos.usuario_id', 'usuarios.id')
        .where('treinamentos.id', id)
        .first();
      return row;
    } catch (error) {
      console.log("TrainingRepo.findById error:", error);
      throw error;
    }
  }

  async update(training, id) {
    try {
      await knex('treinamentos').where({ id }).update(training);
      return true;
    } catch (error) {
      console.log("TrainingRepo.update error:", error);
      throw error;
    }
  }

  async delete(id) {
    try {
      await knex('treinamentos').where({ id }).delete();
      return true;
    } catch (error) {
      console.log("TrainingRepo.delete error:", error);
      throw error;
    }
  }
}

export { TrainingRepo };