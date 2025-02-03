const roleMiddleware = (allowedRoles) => (req, res, next) => {
  // Verifica se o usuário está autenticado
  if (!req.user) {
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }

  const userRole = req.user.roles; // extrai as roles do usuário autenticado

  // Verifica se o usuário tem permissão para acessar a rota
  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  next();
};

export default roleMiddleware;
