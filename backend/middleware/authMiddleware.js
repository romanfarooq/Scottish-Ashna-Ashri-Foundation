export function isAuthenticatedAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === "admin") {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

export function isAuthenticatedUser(req, res, next) {
  if (req.isAuthenticated() && req.user.role === "user") {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}
