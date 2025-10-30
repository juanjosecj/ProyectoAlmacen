import jwt from "jsonwebtoken";

export function generarToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
}

export function verificarToken(token) {
  // Usar la misma clave JWT_SECRET para firmar y verificar
  return jwt.verify(token, process.env.JWT_SECRET);
}
