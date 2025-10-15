import { randomUUID } from "crypto"

class ScheduleEntity {
  constructor(body, id) {
    this.id = id ? id : randomUUID()
    this.cnpj = body.cnpj
    this.data = body.data
    this.idUsuario = body.idUsuario
    this.temTaxa = body.temTaxa || false
    this.valor = body.valor
    this.porcentagem = body.porcentagem
    this.valorPorcentagem = body.valorPorcentagem
    this.titulo = body.titulo
  }
}

export {ScheduleEntity}