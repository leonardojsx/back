import { randomUUID } from "crypto";

class UsersEntity {
  constructor(body, id) {
    this.id = id ? id : randomUUID()
    this.nome = body.nome
    this.role = body.role
    this.email = body.email
    this.senha = body.senha
  }
}

export { UsersEntity }