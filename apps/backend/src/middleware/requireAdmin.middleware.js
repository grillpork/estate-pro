export const requireAdmin = (req, res, next) => {
  console.log('[requireAdmin] req.user =', req.user)
  const role = req.user?.role

  if (!role) {
    return res.status(403).json({ message: 'Forbidden: no role assigned' })
  }

  if (role.toLowerCase() !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: admin only' })
  }

  next()
}

