export const isAdmin = (req, res, next) => {
    if (req.user.rol !== 'ADMINISTRADOR') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    next();
  };