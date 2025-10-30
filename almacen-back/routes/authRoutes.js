import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createUser, findUserByEmail } from "../models/user.js";
import pool from "../db.js";

const router = express.Router();

/* =========================
   📌 Registro
========================= */
router.post("/register", async (req, res) => {
  try {
    const { nombre, email, password, roleId } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    // Verificar si ya existe
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "El correo ya está registrado" });
    }

    // Encriptar password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario en DB
    const newUser = await createUser({
      nombre,
      email,
      password: hashedPassword, // 👈 guardamos el hash
      roleId: roleId || 2, // por defecto cliente
    });

    res.status(201).json({
      message: "Usuario registrado con éxito",
      user: newUser,
    });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

/* =========================
   📌 Login
========================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Correo y contraseña requeridos" });
    }

    // Buscar usuario con su rol (consulta directa)
    const [[user]] = await pool.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    // Si existe el usuario, obtener su rol
    if (user) {
      const [[role]] = await pool.execute(
        "SELECT name FROM roles WHERE id = ?",
        [user.roleId]
      );
      const roleName = role ? role.name : 'cliente';
      user.role = roleName;
    }
    
    if (!user) {
      return res.status(400).json({ error: "Usuario no encontrado" });
    }

    // Comparar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Contraseña incorrecta" });
    }

    // Crear token JWT con role name (no roleId)
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role, // usar role name guardado en el objeto user
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login exitoso",
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        role: user.role || 'cliente', // enviar role name al cliente también
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

export default router;
