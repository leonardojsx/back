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
      role: existUser.role,
      salarioBruto: existUser.salarioBruto ? Number(existUser.salarioBruto) : 0,
      nivel: existUser.nivel,
      porcentagem_aumento: existUser.porcentagem_aumento ? Number(existUser.porcentagem_aumento) : 0
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
    // Criar objeto apenas com os campos que podem ser atualizados
    const updateData = {};
    
    // Mapear apenas os campos permitidos para atualização
    if (userData.nome !== undefined) updateData.nome = userData.nome;
    if (userData.email !== undefined) updateData.email = userData.email;
    if (userData.role !== undefined) updateData.role = userData.role;
    if (userData.salarioBruto !== undefined) updateData.salarioBruto = Number(userData.salarioBruto);
    if (userData.nivel !== undefined) updateData.nivel = userData.nivel;
    if (userData.porcentagem_aumento !== undefined) updateData.porcentagem_aumento = Number(userData.porcentagem_aumento);
    
    // Se senha foi fornecida, criptografar
    if (userData.senha) {
      updateData.senha = this.generatePasswordHash(userData.senha);
    }
    
    return await this.usersRepo.update(updateData, id);
  }

  async findById(id) {
    const user = await this.usersRepo.findById(id);
    if (!user) return null;
    
    // Remover senha dos dados retornados
    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role,
      salarioBruto: user.salarioBruto ? Number(user.salarioBruto) : 0,
      nivel: user.nivel,
      porcentagem_aumento: user.porcentagem_aumento ? Number(user.porcentagem_aumento) : 0
    };
  }

  async findAll() { 
    const users = await this.usersRepo.findAll();
    // Remover senhas dos dados retornados
    return users.map(user => ({
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role,
      salarioBruto: user.salarioBruto ? Number(user.salarioBruto) : 0,
      nivel: user.nivel,
      porcentagem_aumento: user.porcentagem_aumento ? Number(user.porcentagem_aumento) : 0
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