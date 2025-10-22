import { randomUUID } from "crypto"

class TrainingEntity {
  constructor(body, id) {
    this.id = id ? id : randomUUID()
    this.titulo = body.titulo
    this.usuario_id = body.usuario_id
    this.cnpj = body.cnpj
    this.data_inicio = body.data_inicio
    this.data_fim = body.data_fim
    this.status = body.status || 'planejado'
  }
}

export { TrainingEntity }