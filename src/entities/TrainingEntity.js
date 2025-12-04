import { randomUUID } from "crypto"

class TrainingEntity {
  constructor(body, id) {
    this.id = id ? id : randomUUID()
    this.titulo = body.titulo
    this.usuario_id = body.usuario_id
    this.cnpj = body.cnpj
    this.tipoDocumento = body.tipoDocumento || (body.cnpj && body.cnpj.replace(/\D/g, '').length <= 11 ? 'cpf' : 'cnpj')
    this.data_inicio = body.data_inicio
    this.data_fim = body.data_fim
    this.status = body.status || 'planejado'
    this.observacao = body.observacao || null
  }
}

export { TrainingEntity }