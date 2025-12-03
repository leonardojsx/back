import { ComissaoTemplateEntity } from "../entities/ComissaoTemplateEntity.js"

class ComissaoTemplateServices {
  constructor(comissaoTemplateRepo) {
    this.comissaoTemplateRepo = comissaoTemplateRepo
  }

  async save(templateData) {
    // Validações
    if (!templateData.titulo || templateData.titulo.trim() === '') {
      const err = new Error('Título é obrigatório')
      err.status = 400
      throw err
    }

    // Validar porcentagem apenas se fornecida
    if (templateData.porcentagem !== undefined && templateData.porcentagem !== null && templateData.porcentagem !== '') {
      const porcentagem = Number(templateData.porcentagem)
      if (isNaN(porcentagem) || porcentagem < 0 || porcentagem > 100) {
        const err = new Error('Porcentagem deve ser um número válido entre 0 e 100')
        err.status = 400
        throw err
      }
    }

    // Preparar dados do template
    const templateDataClean = {
      titulo: templateData.titulo.trim(),
      valor: templateData.valor && templateData.valor !== '' ? Number(templateData.valor) : null,
      porcentagem: templateData.porcentagem && templateData.porcentagem !== '' && templateData.porcentagem !== null ? Number(templateData.porcentagem) : null,
      temTaxa: false // Sempre false, removido da interface
    }

    try {
      const templateEntity = new ComissaoTemplateEntity(templateDataClean)
      const id = await this.comissaoTemplateRepo.save(templateEntity)
      return id
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    const templates = await this.comissaoTemplateRepo.findAll()
    return templates.map(template => ({
      id: template.id,
      titulo: template.titulo,
      valor: template.valor ? Number(template.valor) : null,
      porcentagem: template.porcentagem ? Number(template.porcentagem) : null,
      temTaxa: template.temTaxa === 1 || template.temTaxa === true
    }))
  }

  async findById(id) {
    const template = await this.comissaoTemplateRepo.findById(id)
    if (!template) return null

    return {
      id: template.id,
      titulo: template.titulo,
      valor: template.valor ? Number(template.valor) : null,
      porcentagem: template.porcentagem ? Number(template.porcentagem) : 0,
      temTaxa: template.temTaxa === 1 || template.temTaxa === true
    }
  }

  async update(templateData, id) {
    // Validações
    if (templateData.titulo !== undefined && templateData.titulo.trim() === '') {
      const err = new Error('Título não pode estar vazio')
      err.status = 400
      throw err
    }

    if (templateData.porcentagem !== undefined && (templateData.porcentagem < 0 || templateData.porcentagem > 100)) {
      const err = new Error('Porcentagem deve estar entre 0 e 100')
      err.status = 400
      throw err
    }

    const updateData = {}
    if (templateData.titulo !== undefined) updateData.titulo = templateData.titulo
    if (templateData.valor !== undefined) updateData.valor = templateData.valor
    if (templateData.porcentagem !== undefined) updateData.porcentagem = Number(templateData.porcentagem)
    if (templateData.temTaxa !== undefined) updateData.temTaxa = templateData.temTaxa

    await this.comissaoTemplateRepo.update(updateData, id)
    return true
  }

  async delete(id) {
    await this.comissaoTemplateRepo.delete(id)
    return true
  }
}

export { ComissaoTemplateServices }