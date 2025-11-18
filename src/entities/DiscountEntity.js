import { randomUUID } from "crypto"

class DiscountEntity {
  constructor(body, id) {
    this.id = id ? id : randomUUID()
    this.idUsuario = body.idUsuario
    this.descricao = body.descricao
    this.valor = Number(body.valor) || 0
    this.data = this.formatDateForMySQL(body.data)
  }

  formatDateForMySQL(dateString) {
    if (!dateString) {
      // Se não foi fornecida data, usar data atual
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }
    
    const date = new Date(dateString)
    
    // Verificar se a data é válida
    if (isNaN(date.getTime())) {
      throw new Error('Data inválida fornecida')
    }
    
    // Converter para o formato MySQL DATETIME: 'YYYY-MM-DD HH:MM:SS'
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }
}

export {DiscountEntity}