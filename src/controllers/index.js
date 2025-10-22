import knexConfig from "../../knexfile.mjs";

import { ScheduleControllers } from "./ScheduleControllers.js";
import { UsersController } from "./UsersController.js";
import { TrainingController } from "./TrainingController.js";

import { ScheduleServices } from "../services/ScheduleServices.js";
import { UsersServices } from "../services/UsersServices.js";
import { TrainingServices } from "../services/TrainingServices.js";

import { ScheduleRepo } from "../repositories/ScheduleRepo.js";
import { UsersRepo } from "../repositories/UsersRepo.js";
import { TrainingRepo } from "../repositories/TrainingRepo.js";


const scheduleRepo = new ScheduleRepo(knexConfig)
const usersRepo = new UsersRepo(knexConfig)
const trainingRepo = new TrainingRepo(knexConfig)

const scheduleServices = new ScheduleServices(scheduleRepo)
const usersServices = new UsersServices(usersRepo)
const trainingServices = new TrainingServices(trainingRepo)

const scheduleControllers = new ScheduleControllers(scheduleServices)
const usersController = new UsersController(usersServices)
const trainingController = new TrainingController(trainingServices)

export {
  scheduleControllers,
  usersController,
  trainingController
}