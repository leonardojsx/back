import { Router } from 'express';
import { trainingController } from '../controllers/index.js';
import { authMiddleware } from '../utils/middleware/authMiddleware.js';

const router = Router();

router.post('/', authMiddleware, (req, res) => {
  return trainingController.save(req, res);
});

router.get('/check-commissions/:cnpj', authMiddleware, (req, res) => {
  return trainingController.checkCommissions(req, res);
});

router.get('/:id', authMiddleware, (req, res) => {
  return trainingController.findById(req, res);
});

router.get('/', authMiddleware, (req, res) => {
  return trainingController.findAll(req, res);
});

router.put('/:id', authMiddleware, (req, res) => {
  return trainingController.update(req, res);
});

router.delete('/:id', authMiddleware, (req, res) => {
  return trainingController.delete(req, res);
});

export default router;