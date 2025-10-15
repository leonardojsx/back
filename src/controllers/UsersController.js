class UsersController {
  constructor (usersServices) {
    this.usersServices = usersServices
  }

  async login (req, res) {
    try {
      const payload = req.body;

      // 1. O serviço irá retornar o objeto { token, user } ou lançar um erro.
      const result = await this.usersServices.login(payload);

      // 2. ✅ A CORREÇÃO: Retorna 200 OK com o resultado completo no corpo do JSON.
      return res.status(200).json(result);

    } catch (error) {
      // 3. ✅ Captura os erros do serviço e retorna uma resposta apropriada.
      return res.status(error.status || 401).json({ message: error.message || 'Falha na autenticação' });
    }
  }

  async save (req, res) {
    // seu método save continua igual
    const users = req.body;
    try {
      const id = await this.usersServices.save(users);
      // É uma boa prática retornar o ID em um JSON.
      return res.status(201).json({ id });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  // ... outros métodos ...
  async update(req, res) {
    const { id } = req.params;
    const userData = req.body;
    try {
      await this.usersServices.update(userData, id);
      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    const { id } = req.params;
    try {
      await this.usersServices.delete(id);
      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async findById(req, res) {
    const { id } = req.params;
    try {
      const user = await this.usersServices.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      return res.status(200).json(user);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async findAll(req, res) {
    try {
      const users = await this.usersServices.findAll();
      return res.status(200).json(users);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
}

export { UsersController };