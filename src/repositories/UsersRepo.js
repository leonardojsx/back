import knex from "../../knexfile.mjs";

class UsersRepo {
  async save(users) {
    try {
      await knex.insert(users).into('usuarios')
    } catch (error) {
      throw error;
    }
  }

  async update(userData, id) {
    try {
      const result = await knex('usuarios').where('id', id).update(userData);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async findById(id) {
    try {
      return await knex.select().table('usuarios').where('id', '=', id).first();
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    return await knex.select().table('usuarios')
  }

  async findEmail(email) {
    return await knex.select().table('usuarios').where('email', '=', email).first()
  }

  async delete(id) {
    try {
      return await knex('usuarios').where('id', id).del();
    } catch (error) {
      throw error;
    }
  }
}

export { UsersRepo }