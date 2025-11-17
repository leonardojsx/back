class ScheduleControllers {
  constructor(scheduleServices) {
    this.scheduleServices = scheduleServices
  }

  async save(req, res) {
    const schedule = req.body
    try {
      const id = await this.scheduleServices.save(schedule)
      return res.status(201).json({ id })
    } catch (err) {

      return res.status(err.status || 500).json({ message: err.message || 'Erro interno' })
    }
  }

  async update(req, res) {
    const schedule = req.body
    const { id } = req.params
    try {
      await this.scheduleServices.update(schedule, id)
      return res.status(204).send()
    } catch (err) {

      return res.status(err.status || 500).json({ message: err.message || 'Erro interno' })
    }
  }

  async findAll(req, res) {
    try {
      const { user } = req;
      const { summary, ano, mes, view } = req.query;

      const result = await this.scheduleServices.findAll({
        summary: String(summary || '').toLowerCase() === 'true',
        ano,
        mes,
        view,
        user
      });
      return res.status(200).json(result)
    } catch (err) {

      return res.status(err.status || 500).json({ message: err.message || 'Erro interno' })
    }
  }

  async delete(req, res) {
    const { id } = req.params
    try {
      await this.scheduleServices.delete(id)
      return res.status(204).send()
    } catch (err) {

      return res.status(err.status || 500).json({ message: err.message || 'Erro interno' })
    }
  }

  async findById(req, res) {
    const { id } = req.params
    try {
      const schedule = await this.scheduleServices.findById(id)
      if (!schedule) return res.status(404).json({ message: 'Agendamento não encontrado' })
      return res.status(200).json(schedule)
    } catch (err) {

      return res.status(err.status || 500).json({ message: err.message || 'Erro interno' })
    }
  }

  async getAllUsersSummary(req, res) {
    try {
      // Verificar se o usuário tem permissão (apenas admin)
      const { user } = req;
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem acessar este recurso.' })
      }

      const summaryData = await this.scheduleServices.getAllUsersSummary()
      
      return res.status(200).json(summaryData)
    } catch (err) {
      return res.status(err.status || 500).json({ message: err.message || 'Erro interno' })
    }
  }
}

export { ScheduleControllers };