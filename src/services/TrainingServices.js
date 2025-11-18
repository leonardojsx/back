import { TrainingEntity } from "../entities/TrainingEntity.js";

class TrainingServices {
  constructor(trainingRepo) {
    this.trainingRepo = trainingRepo
  }

  async save(training) {
    // Validações básicas
    if (!training.titulo || training.titulo.trim().length < 3) {
      const err = new Error('Título é obrigatório e deve ter pelo menos 3 caracteres')
      err.status = 400
      throw err
    }

    if (!training.cnpj || training.cnpj.replace(/\D/g, '').length !== 14) {
      const err = new Error('CNPJ é obrigatório e deve ter 14 dígitos')
      err.status = 400
      throw err
    }

    if (!training.data_inicio || !training.data_fim) {
      const err = new Error('Data de início e fim são obrigatórias')
      err.status = 400
      throw err
    }

    const dataInicio = new Date(training.data_inicio)
    const dataFim = new Date(training.data_fim)

    if (dataInicio >= dataFim) {
      const err = new Error('Data de início deve ser anterior à data de fim')
      err.status = 400
      throw err
    }

    // Validação para impedir treinamentos em finais de semana
    // Usar apenas a parte da data para evitar problemas de timezone
    const dateStr = training.data_inicio.split('T')[0]; // 'YYYY-MM-DD'
    const [year, month, day] = dateStr.split('-').map(Number);
    const localDate = new Date(year, month - 1, day); // month é 0-indexed
    const dayOfWeekStart = localDate.getDay(); // 0 = domingo, 6 = sábado
    
    if (dayOfWeekStart === 0 || dayOfWeekStart === 6) {
      const err = new Error('Treinamentos não podem ser agendados para sábados ou domingos')
      err.status = 400
      throw err
    }

    // Verificar se usuário existe (se foi informado)
    if (training.usuario_id) {
      const userExists = await this.trainingRepo.userExists(training.usuario_id)
      if (!userExists) {
        const err = new Error('Usuário não encontrado')
        err.status = 400
        throw err
      }
    }

    // Limpar CNPJ (manter apenas números)
    training.cnpj = training.cnpj.replace(/\D/g, '')
    training.titulo = training.titulo.trim()

    const trainingEntity = new TrainingEntity(training)
    const id = await this.trainingRepo.save(trainingEntity)
    return id
  }

  async findAll(options = {}) {
    const { dataInicio, dataFim } = options;
    const filterOptions = { dataInicio, dataFim };

    // Todos os usuários podem ver todos os treinamentos
    // Removido filtro por usuario_id

    const rows = await this.trainingRepo.findAll(filterOptions);

    const items = rows.map(r => {
      // Garantir que as datas sejam retornadas no formato correto para o Brasil
      const formatDateTime = (dateTime) => {
        if (!dateTime) return null;
        if (typeof dateTime === 'string' && dateTime.includes('T') && !dateTime.includes('Z')) {
          return dateTime;
        }
        
        let date;
        if (typeof dateTime === 'string') {
          date = new Date(dateTime);
        } else {
          date = dateTime;
        }
        
        // Ajustar para timezone do Brasil (UTC-3)
        const brazilOffset = -3 * 60; // -3 horas em minutos
        const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
        const brazilTime = new Date(utc + (brazilOffset * 60000));
        
        const year = brazilTime.getFullYear();
        const month = String(brazilTime.getMonth() + 1).padStart(2, '0');
        const day = String(brazilTime.getDate()).padStart(2, '0');
        const hours = String(brazilTime.getHours()).padStart(2, '0');
        const minutes = String(brazilTime.getMinutes()).padStart(2, '0');
        const seconds = String(brazilTime.getSeconds()).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      };

      return {
        id: r.id,
        titulo: r.titulo,
        usuario_id: r.usuario_id,
        usuario: r.usuario || null,
        cnpj: r.cnpj,
        data_inicio: formatDateTime(r.data_inicio),
        data_fim: formatDateTime(r.data_fim),
        status: r.status
      };
    })

    return items
  }

  async findById(id) {
    const row = await this.trainingRepo.findById(id)
    if (!row) return null
    
    // Garantir que as datas sejam retornadas no formato correto para o Brasil
    const formatDateTime = (dateTime) => {
      if (!dateTime) return null;
      if (typeof dateTime === 'string' && dateTime.includes('T') && !dateTime.includes('Z')) {
        return dateTime;
      }
      
      let date;
      if (typeof dateTime === 'string') {
        date = new Date(dateTime);
      } else {
        date = dateTime;
      }
      
      // Ajustar para timezone do Brasil (UTC-3)
      const brazilOffset = -3 * 60; // -3 horas em minutos
      const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
      const brazilTime = new Date(utc + (brazilOffset * 60000));
      
      const year = brazilTime.getFullYear();
      const month = String(brazilTime.getMonth() + 1).padStart(2, '0');
      const day = String(brazilTime.getDate()).padStart(2, '0');
      const hours = String(brazilTime.getHours()).padStart(2, '0');
      const minutes = String(brazilTime.getMinutes()).padStart(2, '0');
      const seconds = String(brazilTime.getSeconds()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };

    return {
      id: row.id,
      titulo: row.titulo,
      usuario_id: row.usuario_id,
      usuario: row.usuario || null,
      cnpj: row.cnpj,
      data_inicio: formatDateTime(row.data_inicio),
      data_fim: formatDateTime(row.data_fim),
      status: row.status
    }
  }

  async update(training, id) {
    // Mesmas validações do save
    if (training.titulo && training.titulo.trim().length < 3) {
      const err = new Error('Título deve ter pelo menos 3 caracteres')
      err.status = 400
      throw err
    }

    if (training.cnpj && training.cnpj.replace(/\D/g, '').length !== 14) {
      const err = new Error('CNPJ deve ter 14 dígitos')
      err.status = 400
      throw err
    }

    if (training.data_inicio && training.data_fim) {
      // Comparar strings diretamente para evitar problemas de timezone
      if (training.data_inicio >= training.data_fim) {
        const err = new Error('Data de início deve ser anterior à data de fim')
        err.status = 400
        throw err
      }

      // Validação para impedir treinamentos em finais de semana
      // Usar apenas a parte da data para evitar problemas de timezone
      const dateStr = training.data_inicio.split('T')[0]; // 'YYYY-MM-DD'
      const [year, month, day] = dateStr.split('-').map(Number);
      const localDate = new Date(year, month - 1, day); // month é 0-indexed
      const dayOfWeekStart = localDate.getDay(); // 0 = domingo, 6 = sábado
      
      if (dayOfWeekStart === 0 || dayOfWeekStart === 6) {
        const err = new Error('Treinamentos não podem ser agendados para sábados ou domingos')
        err.status = 400
        throw err
      }
    }

    // Verificar se usuário existe (se foi informado)
    if (training.usuario_id) {
      const userExists = await this.trainingRepo.userExists(training.usuario_id)
      if (!userExists) {
        const err = new Error('Usuário não encontrado')
        err.status = 400
        throw err
      }
    }

    // Limpar dados se fornecidos
    if (training.cnpj) {
      training.cnpj = training.cnpj.replace(/\D/g, '')
    }
    if (training.titulo) {
      training.titulo = training.titulo.trim()
    }

    await this.trainingRepo.update(training, id)
    return true
  }

  async delete(id) {
    await this.trainingRepo.delete(id)
    return true
  }

  async checkCommissionsForCnpj(cnpj) {
    const cleanCnpj = cnpj.replace(/\D/g, '')
    return await this.trainingRepo.cnpjHasCommissions(cleanCnpj)
  }
}

export { TrainingServices };