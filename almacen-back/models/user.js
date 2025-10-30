import pool from "../db.js";

// 🔹 Crear usuario (el password YA debe venir encriptado)
export async function createUser({ nombre, email, password, roleId }) {
  const [result] = await pool.query(
    "INSERT INTO users (nombre, email, password, roleId) VALUES (?, ?, ?, ?)",
    [nombre, email, password, roleId] // 👈 aquí se guarda el hash
  );
  return { id: result.insertId, nombre, email, roleId };
}

// 🔹 Buscar usuario por email (incluye role name)
export async function findUserByEmail(email) {
  const [rows] = await pool.query(
    `SELECT u.*, r.name as role 
     FROM users u 
     LEFT JOIN roles r ON u.roleId = r.id 
     WHERE u.email = ?`,
    [email]
  );
  return rows[0];
}

// 🔹 Buscar usuario por id (incluye role name)
export async function findUserById(id) {
  const [rows] = await pool.query(
    `SELECT u.*, r.name as role 
     FROM users u 
     LEFT JOIN roles r ON u.roleId = r.id 
     WHERE u.id = ?`,
    [id]
  );
  return rows[0];
}
