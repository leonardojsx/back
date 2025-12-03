import knex from '../../knexfile.mjs'

class ComissaoTemplateRepo {
  async save(template) {
    try {
      await knex('comissao_templates').insert(template)
      return template.id
    } catch (error) {
      throw error
    }
  }

  async findAll() {
    try {
      return await knex('comissao_templates')
        .select('*')
        .orderBy('titulo', 'asc')
    } catch (error) {
      throw error
    }
  }

  async findById(id) {
    try {
      return await knex('comissao_templates')
        .select('*')
        .where({ id })
        .first()
    } catch (error) {
      throw error
    }
  }

  async update(templateData, id) {
    try {
      const result = await knex('comissao_templates')
        .where({ id })
        .update(templateData)
      return result
    } catch (error) {
      throw error
    }
  }

  async delete(id) {
    try {
      await knex('comissao_templates').where({ id }).delete()
      return true
    } catch (error) {
      throw error
    }
  }
}

export { ComissaoTemplateRepo }