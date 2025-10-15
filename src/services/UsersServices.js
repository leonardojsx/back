import { UsersEntity } from "../entities/UsersEntity.js";
// ✅ CORRETO: Importando o gerador de token do seu arquivo index.js
import Authentication from '../utils/middleware/index.js';
import { createHash } from 'crypto';

class UsersServices {
  constructor(usersRepo) {
    this.usersRepo = usersRepo;
  }

  async login(payload) {
    const existUser = await this.usersRepo.findEmail(payload.email);
    if (!existUser) {
      const err = new Error('Usuário não encontrado!');
      err.status = 404;
      throw err;
    }

    const passwordHash = this.generatePasswordHash(payload.senha);
    if (passwordHash !== existUser.senha) {
      const err = new Error('Senha inválida!');
      err.status = 401;
      throw err;
    }

    const tokenPayload = {
      id: existUser.id,
      role: existUser.role
    };
    const token = Authentication.generateToken(tokenPayload);

    const userResponse = {
      id: existUser.id,
      nome: existUser.nome,
      email: existUser.email,
      role: existUser.role
    };

    return { token, user: userResponse };
  }

  async save(user) {
    const userEntity = new UsersEntity(user);
    const existUsers = await this.findAll();
    if (!existUsers.length) {
      userEntity.role = "admin";
    } else {
      userEntity.role = "sup";
    }
    const existEmail = await this.findEmail(userEntity.email);
    if (existEmail) {
      throw new Error('E-mail já existente!');
    }
    await this.usersRepo.save({ ...userEntity, senha: this.generatePasswordHash(userEntity.senha) });
    return userEntity.id;
  }

  async update(userData, id) {
    const userEntity = new UsersEntity(userData);
    if (userEntity.senha) {
      userEntity.senha = this.generatePasswordHash(userEntity.senha);
    }
    return await this.usersRepo.update(userEntity, id);
  }

  async findById(id) {
    const user = await this.usersRepo.findById(id);
    if (!user) return null;
    
    // Remover senha dos dados retornados
    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role
    };
  }

  async findAll() { 
    const users = await this.usersRepo.findAll();
    // Remover senhas dos dados retornados
    return users.map(user => ({
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role
    }));
  }
  
  async findEmail(email) { 
    return await this.usersRepo.findEmail(email); 
  }
  
  async delete(id) {
    return await this.usersRepo.delete(id);
  }

  generatePasswordHash(password) {
    return createHash('md5').update(password).digest('hex');
  }
}

export { UsersServices };