import { Router } from "express";

import ScheduleRoute from './Schedule.js'
import UsersRoute from './Users.js'
import TrainingRoute from './Training.js'
import DiscountRoute from './Discount.js'

const router = Router() 

router.use('/schedule', ScheduleRoute)
router.use('/users', UsersRoute)
router.use('/training', TrainingRoute)
router.use('/discount', DiscountRoute)

export {router}