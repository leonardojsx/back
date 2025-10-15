import { Router } from 'express';
import { scheduleControllers } from '../controllers/index.js';

// ✅ CORRETO: Importando a função de verificação do seu arquivo authMiddleware.js
import { authMiddleware } from '../utils/middleware/authMiddleware.js';

const router = Router();

router.post('/', authMiddleware, (req, res) => {
  return scheduleControllers.save(req, res);
});

router.get('/:id', authMiddleware, (req, res) => {
  return scheduleControllers.findById(req, res);
});

router.get('/', authMiddleware, (req, res) => {
  return scheduleControllers.findAll(req, res);
});

router.put('/:id', authMiddleware, (req, res) => {
  return scheduleControllers.update(req, res);
});

router.delete('/:id', authMiddleware, (req, res) => {
  return scheduleControllers.delete(req, res);
});

export default router;