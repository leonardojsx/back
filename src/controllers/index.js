import { ScheduleControllers } from "./ScheduleControllers.js";
import { UsersController } from "./UsersController.js";
import { TrainingController } from "./TrainingController.js";
import { ComissaoTemplateController } from "./ComissaoTemplateController.js";

import { ScheduleServices } from "../services/ScheduleServices.js";
import { UsersServices } from "../services/UsersServices.js";
import { TrainingServices } from "../services/TrainingServices.js";
import { ComissaoTemplateServices } from "../services/ComissaoTemplateServices.js";

import { ScheduleRepo } from "../repositories/ScheduleRepo.js";
import { UsersRepo } from "../repositories/UsersRepo.js";
import { TrainingRepo } from "../repositories/TrainingRepo.js";
import { ComissaoTemplateRepo } from "../repositories/ComissaoTemplateRepo.js";


const scheduleRepo = new ScheduleRepo()
const usersRepo = new UsersRepo()
const trainingRepo = new TrainingRepo()
const comissaoTemplateRepo = new ComissaoTemplateRepo()

const scheduleServices = new ScheduleServices(scheduleRepo)
const usersServices = new UsersServices(usersRepo)
const trainingServices = new TrainingServices(trainingRepo)
const comissaoTemplateServices = new ComissaoTemplateServices(comissaoTemplateRepo)

const scheduleControllers = new ScheduleControllers(scheduleServices)
const usersController = new UsersController(usersServices)
const trainingController = new TrainingController(trainingServices)
const comissaoTemplateController = new ComissaoTemplateController(comissaoTemplateServices)

export {
  scheduleControllers,
  usersController,
  trainingController,
  comissaoTemplateController
}