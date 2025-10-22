import { Router } from "express";

import ScheduleRoute from './Schedule.js'
import UsersRoute from './Users.js'
import TrainingRoute from './Training.js'

const router = Router() 

router.use('/schedule', ScheduleRoute)
router.use('/users', UsersRoute)
router.use('/training', TrainingRoute)

export {router}