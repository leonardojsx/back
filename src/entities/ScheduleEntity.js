import { randomUUID } from "crypto"

class ScheduleEntity {
  constructor(body, id) {
    this.id = id ? id : randomUUID()
    this.cnpj = body.cnpj
    this.tipoDocumento = body.tipoDocumento || 'cnpj' // 'cpf' ou 'cnpj'
    // Converter a data para o formato aceito pelo MySQL
    this.data = this.formatDateForMySQL(body.data)
    this.idUsuario = body.idUsuario
    this.temTaxa = body.temTaxa || false
    this.valor = body.valor
    this.porcentagem = body.porcentagem
    this.valorPorcentagem = body.valorPorcentagem
    this.titulo = body.titulo
  }

  formatDateForMySQL(dateString) {
    if (!dateString) return null
    
    const date = new Date(dateString)
    
    // Verificar se a data é válida
    if (isNaN(date.getTime())) {
      throw new Error('Data inválida fornecida')
    }
    
    // Converter para o formato MySQL DATETIME: 'YYYY-MM-DD HH:MM:SS'
    // Usar getFullYear, getMonth, etc. para preservar a hora local
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }
}

export {ScheduleEntity}