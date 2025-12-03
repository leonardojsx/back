import { v4 as uuidv4 } from 'uuid'

class ComissaoTemplateEntity {
  constructor(template) {
    this.id = template.id || uuidv4()
    this.titulo = template.titulo
    this.valor = template.valor || null
    this.porcentagem = template.porcentagem !== undefined && template.porcentagem !== null && template.porcentagem !== '' ? Number(template.porcentagem) : null
    this.temTaxa = template.temTaxa !== undefined ? template.temTaxa : false
  }
}

export { ComissaoTemplateEntity }