import { Router } from "express";

import ScheduleRoute from './Schedule.js'

import UsersRoute from './Users.js'

const router = Router() 

router.use('/schedule', ScheduleRoute)

router.use('/users', UsersRoute)

export {router}