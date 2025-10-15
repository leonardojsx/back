import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido.' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || !/^Bearer$/i.test(parts[0])) {
    return res.status(401).json({ message: 'Erro no formato do token.' });
  }

  const [, token] = parts;

  try {
    const decoded = jwt.verify(token, process.env.SECRET_JWT);
    req.user = decoded; // Ex: { id: '...', role: 'admin' }
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
};