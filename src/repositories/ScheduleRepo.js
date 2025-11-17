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
      
      // Validar se a data está no formato correto para MySQL
      if (toInsert.data && typeof toInsert.data === 'string' && toInsert.data.includes('T')) {
        const error = new Error('Formato de data inválido. Use o formato YYYY-MM-DD HH:MM:SS')
        error.status = 400
        throw error
      }
      
      await knex('agenda').insert(toInsert);
      return scheduleEntity.id;
    } catch (error) {
      // Se for erro de formato de data do MySQL, dar uma mensagem mais clara
      if (error.message && error.message.includes('Incorrect datetime value')) {
        const formatError = new Error('Formato de data inválido. A data deve estar no formato correto para o banco de dados.')
        formatError.status = 400
        throw formatError
      }
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

  async getUserSalario(userId) {
    try {
      return await knex.select('salarioBruto').from('usuarios').where('id', userId).first()
    } catch (error) {
      throw error
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

  // Método para buscar todos os usuários com seus dados básicos
  async getAllUsers() {
    try {
      const users = await knex('usuarios')
        .select('id', 'nome', 'email', 'role', 'salarioBruto')
      
      return users
    } catch (error) {
      throw error
    }
  }

  // Método otimizado para buscar resumo dos usuários com comissões em uma única query
  async getAllUsersSummaryOptimized() {
    try {
      const hoje = new Date()
      const ano = hoje.getFullYear()
      const mes = hoje.getMonth() + 1
      
      // Query otimizada que junta usuários com suas comissões do mês atual
      const result = await knex('usuarios')
        .select(
          'usuarios.id',
          'usuarios.nome',
          'usuarios.email', 
          'usuarios.role',
          'usuarios.salarioBruto',
          knex.raw('COALESCE(SUM(agenda.valorPorcentagem), 0) as totalComissoes')
        )
        .leftJoin('agenda', function() {
          this.on('usuarios.id', '=', 'agenda.idUsuario')
            .andOn(knex.raw('YEAR(agenda.data) = ?', [ano]))
            .andOn(knex.raw('MONTH(agenda.data) = ?', [mes]))
        })
        .groupBy('usuarios.id', 'usuarios.nome', 'usuarios.email', 'usuarios.role', 'usuarios.salarioBruto')
        .orderBy('usuarios.nome')

      // Processar os resultados
      const summaryData = result.map(row => {
        const salarioBruto = Number(row.salarioBruto || 0)
        const totalComissoes = Number(row.totalComissoes || 0)
        const totalFinal = Number((salarioBruto + totalComissoes).toFixed(2))
        
        return {
          id: row.id,
          nome: row.nome,
          email: row.email,
          role: row.role,
          salarioBruto,
          totalComissoes: Number(totalComissoes.toFixed(2)),
          totalFinal
        }
      })

      return summaryData
    } catch (error) {
      throw error
    }
  }
}

export { ScheduleRepo };