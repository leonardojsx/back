import { Router } from "express";
import { salarioController } from "../controllers/index.js";
import { authMiddleware } from "../utils/middleware/authMiddleware.js";

const router = Router();

// Todas as rotas precisam de autenticação
router.use(authMiddleware);

// GET /salario/calcular/:idUsuario - Calcular salário detalhado
router.get('/calcular/:idUsuario', (req, res) => {
  return salarioController.calcularSalario(req, res);
});

// POST /salario/recalcular/:idUsuario - Forçar recálculo
router.post('/recalcular/:idUsuario', (req, res) => {
  return salarioController.forcarRecalculo(req, res);
});

// POST /salario/calcular-inss - Utilitário para calcular INSS
router.post('/calcular-inss', (req, res) => {
  return salarioController.calcularINSS(req, res);
});

// GET /salario/calcular-irpf - Calcular IRPF com parâmetros
router.get('/calcular-irpf', (req, res) => {
  return salarioController.calcularIRPFSimples(req, res);
});

// GET /salario/calcular-impostos - Calcular INSS e IRPF completo
router.get('/calcular-impostos', (req, res) => {
  return salarioController.calcularImpostosCompleto(req, res);
});

export default router;