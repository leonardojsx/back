import { ScheduleControllers } from "./ScheduleControllers.js";
import { UsersController } from "./UsersController.js";
import { TrainingController } from "./TrainingController.js";
import { ComissaoTemplateController } from "./ComissaoTemplateController.js";
import { DiscountController } from "./DiscountController.js";
import { SalarioController } from "./SalarioController.js";

import { ScheduleServices } from "../services/ScheduleServices.js";
import { UsersServices } from "../services/UsersServices.js";
import { TrainingServices } from "../services/TrainingServices.js";
import { ComissaoTemplateServices } from "../services/ComissaoTemplateServices.js";
import { DiscountServices } from "../services/DiscountServices.js";
import { SalarioCalculatorService } from "../services/SalarioCalculatorService.js";

import { ScheduleRepo } from "../repositories/ScheduleRepo.js";
import { UsersRepo } from "../repositories/UsersRepo.js";
import { TrainingRepo } from "../repositories/TrainingRepo.js";
import { ComissaoTemplateRepo } from "../repositories/ComissaoTemplateRepo.js";
import { DiscountRepo } from "../repositories/DiscountRepo.js";


const scheduleRepo = new ScheduleRepo()
const usersRepo = new UsersRepo()
const trainingRepo = new TrainingRepo()
const comissaoTemplateRepo = new ComissaoTemplateRepo()
const discountRepo = new DiscountRepo()

// 🔥 INJEÇÃO DE DEPENDÊNCIAS - Passando repositórios necessários para cálculo automático de INSS
const scheduleServices = new ScheduleServices(scheduleRepo, discountRepo, usersRepo)
const usersServices = new UsersServices(usersRepo, discountRepo, scheduleRepo)
const trainingServices = new TrainingServices(trainingRepo)
const comissaoTemplateServices = new ComissaoTemplateServices(comissaoTemplateRepo)
const discountServices = new DiscountServices(discountRepo, scheduleRepo, usersRepo)
const salarioCalculatorService = new SalarioCalculatorService(discountRepo, scheduleRepo, usersRepo)

const scheduleControllers = new ScheduleControllers(scheduleServices)
const usersController = new UsersController(usersServices)
const trainingController = new TrainingController(trainingServices)
const comissaoTemplateController = new ComissaoTemplateController(comissaoTemplateServices)
const discountController = new DiscountController(discountServices)
const salarioController = new SalarioController(salarioCalculatorService)

export {
  scheduleControllers,
  usersController,
  trainingController,
  comissaoTemplateController,
  discountController,
  salarioController
}