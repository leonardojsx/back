import knexConfig from "../../knexfile.mjs";

import { ScheduleControllers } from "./ScheduleControllers.js";
import { UsersController } from "./UsersController.js";

import { ScheduleServices } from "../services/ScheduleServices.js";
import { UsersServices } from "../services/UsersServices.js";

import { ScheduleRepo } from "../repositories/ScheduleRepo.js";
import { UsersRepo } from "../repositories/UsersRepo.js";


const scheduleRepo = new ScheduleRepo(knexConfig)
const usersRepo = new UsersRepo(knexConfig)

const scheduleServices = new ScheduleServices(scheduleRepo)
const usersServices = new UsersServices(usersRepo)

const scheduleControllers = new ScheduleControllers(scheduleServices)
const usersController = new UsersController(usersServices)

export {
  scheduleControllers,
  usersController
}