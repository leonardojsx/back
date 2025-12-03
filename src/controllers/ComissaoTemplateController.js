class ComissaoTemplateController {
  constructor(comissaoTemplateServices) {
    this.comissaoTemplateServices = comissaoTemplateServices
  }

  async save(req, res) {
    const templateData = req.body
    try {
      const id = await this.comissaoTemplateServices.save(templateData)
      return res.status(201).json({ id })
    } catch (error) {
      return res.status(error.status || 400).json({ message: error.message })
    }
  }

  async findAll(req, res) {
    try {
      const templates = await this.comissaoTemplateServices.findAll()
      return res.status(200).json(templates)
    } catch (error) {
      return res.status(error.status || 500).json({ message: error.message || 'Erro interno' })
    }
  }

  async findById(req, res) {
    const { id } = req.params
    try {
      const template = await this.comissaoTemplateServices.findById(id)
      if (!template) {
        return res.status(404).json({ message: 'Template não encontrado' })
      }
      return res.status(200).json(template)
    } catch (error) {
      return res.status(error.status || 500).json({ message: error.message || 'Erro interno' })
    }
  }

  async update(req, res) {
    const { id } = req.params
    const templateData = req.body
    try {
      await this.comissaoTemplateServices.update(templateData, id)
      return res.status(204).send()
    } catch (error) {
      return res.status(error.status || 400).json({ message: error.message })
    }
  }

  async delete(req, res) {
    const { id } = req.params
    try {
      await this.comissaoTemplateServices.delete(id)
      return res.status(204).send()
    } catch (error) {
      return res.status(error.status || 500).json({ message: error.message || 'Erro interno' })
    }
  }
}

export { ComissaoTemplateController }