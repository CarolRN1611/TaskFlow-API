import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // "Bearer <token>" pega o token no headers da requisição

  if (!token) return res.status(401).json({ error: 'Token não fornecido' });//verifica se o token foi fornecido

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '123@123');
    req.user = decoded; // Adiciona o usuário decodificado ao objeto req
    next(); // Continua para o próximo middleware
  } catch (err) {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

export default authMiddleware; // Exporta o middleware de autenticação
