import { Router } from 'express';
import { comissaoTemplateController } from '../controllers/index.js';
import { authMiddleware } from '../utils/middleware/authMiddleware.js';

const router = Router();

router.post('/', authMiddleware, (req, res) => {
  return comissaoTemplateController.save(req, res);
});

router.get('/', authMiddleware, (req, res) => {
  return comissaoTemplateController.findAll(req, res);
});

router.get('/:id', authMiddleware, (req, res) => {
  return comissaoTemplateController.findById(req, res);
});

router.put('/:id', authMiddleware, (req, res) => {
  return comissaoTemplateController.update(req, res);
});

router.delete('/:id', authMiddleware, (req, res) => {
  return comissaoTemplateController.delete(req, res);
});

export default router;