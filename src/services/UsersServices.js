import { UsersEntity } from "../entities/UsersEntity.js";
// ✅ CORRETO: Importando o gerador de token do seu arquivo index.js
import Authentication from '../utils/middleware/index.js';
import { createHash } from 'crypto';
import { SalarioCalculatorService } from './SalarioCalculatorService.js';

class UsersServices {
  constructor(usersRepo, discountRepo = null, scheduleRepo = null) {
    this.usersRepo = usersRepo;
    
    console.log(`🔧 UsersServices inicializado: discountRepo=${!!discountRepo}, scheduleRepo=${!!scheduleRepo}`);
    
    // Inicializar calculator service se os repositórios estiverem disponíveis
    if (discountRepo && scheduleRepo) {
      this.salarioCalculator = new SalarioCalculatorService(discountRepo, scheduleRepo, usersRepo);
      console.log(`✅ SalarioCalculatorService inicializado com sucesso`);
    } else {
      console.log(`⚠️  SalarioCalculatorService NÃO inicializado - dependências faltando`);
    }
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
    
    // Flags para detectar mudanças que afetam o salário
    let salarioMudou = false;
    let nivelMudou = false;
    
    // Mapear apenas os campos permitidos para atualização
    if (userData.nome !== undefined) updateData.nome = userData.nome;
    if (userData.email !== undefined) updateData.email = userData.email;
    if (userData.role !== undefined) updateData.role = userData.role;
    if (userData.salarioBruto !== undefined) {
      updateData.salarioBruto = Number(userData.salarioBruto);
      salarioMudou = true;
    }
    if (userData.nivel !== undefined) {
      updateData.nivel = userData.nivel;
      nivelMudou = true;
    }
    if (userData.porcentagem_aumento !== undefined) {
      updateData.porcentagem_aumento = Number(userData.porcentagem_aumento);
      nivelMudou = true;
    }
    
    // Se senha foi fornecida, criptografar
    if (userData.senha) {
      updateData.senha = this.generatePasswordHash(userData.senha);
    }
    
    const result = await this.usersRepo.update(updateData, id);
    
    // 🔥 RECÁLCULO AUTOMÁTICO - Quando salário ou nível mudarem
    console.log(`🐛 DEBUG: salarioMudou=${salarioMudou}, nivelMudou=${nivelMudou}, salarioCalculator=${!!this.salarioCalculator}`);
    if ((salarioMudou || nivelMudou) && this.salarioCalculator) {
      try {
        console.log(`🔄 Recalculando salário automaticamente para usuário ${id}`);
        if (salarioMudou) {
          await this.salarioCalculator.recalcularAposAlteracaoSalario(id);
        } else if (nivelMudou) {
          await this.salarioCalculator.recalcularAposAlteracaoNivel(id);
        }
        console.log(`✅ Salário recalculado com sucesso para usuário ${id}`);
      } catch (error) {
        console.error(`❌ Erro ao recalcular salário para usuário ${id}:`, error.message);
        // Não falhar a operação principal por erro no cálculo
      }
    } else if (salarioMudou || nivelMudou) {
      console.log(`⚠️  AVISO: Mudança detectada mas salarioCalculator não disponível`);
    }
    
    return result;
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