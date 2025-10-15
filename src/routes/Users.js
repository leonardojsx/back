import { Router } from "express";
import { usersController } from "../controllers/index.js";
import { authMiddleware } from '../utils/middleware/authMiddleware.js';

const router = Router()

router.post('/', (req, res) => {
  return usersController.save(req, res)
})

router.post('/login', (req, res) => {
  return usersController.login(req, res)
})

router.get('/', authMiddleware, (req, res) => {
  return usersController.findAll(req, res)
})

router.get('/:id', authMiddleware, (req, res) => {
  return usersController.findById(req, res)
})

router.put('/:id', (req, res) => {
  return usersController.update(req, res)
})

router.delete('/:id', (req, res) => {
  return usersController.delete(req, res)
})

export default router