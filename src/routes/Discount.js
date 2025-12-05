import { Router } from "express";
import { discountController } from "../controllers/index.js";
import { authMiddleware } from "../utils/middleware/authMiddleware.js";

const router = Router();

// Todas as rotas precisam de autenticação
router.use(authMiddleware);

// GET /discount - Listar descontos
router.get('/', (req, res) => discountController.findAll(req, res));

// POST /discount - Criar desconto
router.post('/', (req, res) => discountController.save(req, res));

// GET /discount/:id - Buscar desconto por ID
router.get('/:id', (req, res) => discountController.findById(req, res));

// PUT /discount/:id - Atualizar desconto
router.put('/:id', (req, res) => discountController.update(req, res));

// DELETE /discount/:id - Remover desconto
router.delete('/:id', (req, res) => discountController.delete(req, res));

// GET /discount/user/:userId/total - Total de descontos por usuário
router.get('/user/:userId/total', (req, res) => discountController.getTotalByUser(req, res));

// GET /discount/user/:userId - Listar descontos por usuário
router.get('/user/:userId', (req, res) => discountController.findByUser(req, res));

export default router;