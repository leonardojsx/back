class TrainingController {
  constructor(trainingServices) {
    this.trainingServices = trainingServices
  }

  async save(req, res) {
    const training = req.body
    try {
      const id = await this.trainingServices.save(training)
      return res.status(201).json({ id })
    } catch (err) {
      return res.status(err.status || 500).json({ message: err.message || 'Erro interno' })
    }
  }

  async update(req, res) {
    const training = req.body
    const { id } = req.params
    try {
      await this.trainingServices.update(training, id)
      return res.status(204).send()
    } catch (err) {
      return res.status(err.status || 500).json({ message: err.message || 'Erro interno' })
    }
  }

  async findAll(req, res) {
    try {
      const { dataInicio, dataFim } = req.query;

      const result = await this.trainingServices.findAll({
        dataInicio,
        dataFim
      });
      return res.status(200).json(result)
    } catch (err) {
      return res.status(err.status || 500).json({ message: err.message || 'Erro interno' })
    }
  }

  async delete(req, res) {
    const { id } = req.params
    try {
      await this.trainingServices.delete(id)
      return res.status(204).send()
    } catch (err) {
      return res.status(err.status || 500).json({ message: err.message || 'Erro interno' })
    }
  }

  async findById(req, res) {
    const { id } = req.params
    try {
      const training = await this.trainingServices.findById(id)
      if (!training) return res.status(404).json({ message: 'Treinamento não encontrado' })
      return res.status(200).json(training)
    } catch (err) {
      return res.status(err.status || 500).json({ message: err.message || 'Erro interno' })
    }
  }

  async checkCommissions(req, res) {
    const { cnpj } = req.params
    try {
      const hasCommissions = await this.trainingServices.checkCommissionsForCnpj(cnpj)
      return res.status(200).json({ hasCommissions })
    } catch (err) {
      return res.status(err.status || 500).json({ message: err.message || 'Erro interno' })
    }
  }
}

export { TrainingController };