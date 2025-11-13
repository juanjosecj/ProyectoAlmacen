import express from "express";
import pool from "../db.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

/* -------- POST: CREAR SOLICITUD (CLIENTE) -------- */
router.post("/", verifyToken, async (req, res) => {
  try {
    const { items, total, metodo_pago, comentario } = req.body;
    const userId = req.userId; // Viene del middleware verifyToken

    // Log para debugging
    console.log('Solicitud recibida:', { userId, items: items?.length, total });

    // Validar datos
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "La solicitud debe contener al menos un producto" });
    }

    if (!total || total <= 0) {
      return res.status(400).json({ message: "El total debe ser mayor a 0" });
    }

    if (!userId) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    // Insertar solicitud
    const [result] = await pool.query(
      `INSERT INTO solicitudes (user_id, fecha, estado, total, metodo_pago, comentario) 
       VALUES (?, NOW(), 'pendiente', ?, ?, ?)`,
      [userId, total, metodo_pago || 'efectivo', comentario || null]
    );

    const solicitudId = result.insertId;

    // Insertar detalles de la solicitud
    for (const item of items) {
      await pool.query(
        `INSERT INTO \`detalle-solicitud\` (solicitud_id, item_id, cantidad, precio_unitario) 
         VALUES (?, ?, ?, ?)`,
        [solicitudId, item.id, item.cantidad, item.precio]
      );
    }

    res.status(201).json({
      message: "Solicitud creada correctamente",
      solicitud_id: solicitudId,
      total,
      items_count: items.length
    });
  } catch (error) {
    console.error("Error al crear solicitud:", error);
    res.status(500).json({ message: "Error al crear solicitud", error: error.message });
  }
});

/* -------- GET: TODAS LAS SOLICITUDES (ADMIN) -------- */
router.get("/", verifyToken, async (req, res) => {
  try {
    const [solicitudes] = await pool.query(`
      SELECT 
        s.id,
        s.user_id,
        u.nombre as cliente_nombre,
        u.telefono,
        u.direccion,
        s.fecha,
        s.estado,
        s.total,
        s.metodo_pago,
        s.comentario
      FROM solicitudes s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.fecha DESC
    `);

    res.json(solicitudes);
  } catch (error) {
    console.error("Error al obtener solicitudes:", error);
    res.status(500).json({ message: "Error al obtener solicitudes" });
  }
});

/* -------- GET: SOLICITUDES DEL USUARIO (CLIENTE) -------- */
router.get("/mis-solicitudes", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;

    const [solicitudes] = await pool.query(`
      SELECT 
        s.id,
        s.user_id,
        s.fecha,
        s.estado,
        s.total,
        s.metodo_pago,
        s.comentario
      FROM solicitudes s
      WHERE s.user_id = ?
      ORDER BY s.fecha DESC
    `, [userId]);

    res.json(solicitudes);
  } catch (error) {
    console.error("Error al obtener solicitudes del usuario:", error);
    res.status(500).json({ message: "Error al obtener solicitudes" });
  }
});

/* -------- GET: DETALLES DE UNA SOLICITUD -------- */
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [solicitud] = await pool.query(`
      SELECT 
        s.id,
        s.user_id,
        u.nombre as cliente_nombre,
        u.telefono,
        u.direccion,
        u.email,
        s.fecha,
        s.estado,
        s.total,
        s.metodo_pago,
        s.comentario
      FROM solicitudes s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `, [id]);

    if (solicitud.length === 0) {
      return res.status(404).json({ message: "Solicitud no encontrada" });
    }

    // Obtener detalles de la solicitud
    const [detalles] = await pool.query(`
      SELECT 
        ds.id,
        ds.item_id,
        i.nombre as item_nombre,
        ds.cantidad,
        ds.precio_unitario,
        (ds.cantidad * ds.precio_unitario) as subtotal
      FROM \`detalle-solicitud\` ds
      JOIN items i ON ds.item_id = i.id
      WHERE ds.solicitud_id = ?
    `, [id]);

    res.json({
      ...solicitud[0],
      detalles
    });
  } catch (error) {
    console.error("Error al obtener solicitud:", error);
    res.status(500).json({ message: "Error al obtener solicitud" });
  }
});

/* -------- PUT: ACTUALIZAR ESTADO DE SOLICITUD (ADMIN) -------- */
router.put("/:id/estado", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosValidos = ['pendiente', 'procesando', 'completado', 'cancelado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ message: "Estado inválido" });
    }

    const [result] = await pool.query(
      "UPDATE solicitudes SET estado = ? WHERE id = ?",
      [estado, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Solicitud no encontrada" });
    }

    res.json({ message: "Solicitud actualizada correctamente" });
  } catch (error) {
    console.error("Error al actualizar solicitud:", error);
    res.status(500).json({ message: "Error al actualizar solicitud" });
  }
});

/* -------- PUT: AGREGAR COMENTARIO A SOLICITUD (ADMIN) -------- */
router.put("/:id/comentario", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { comentario } = req.body;

    const [result] = await pool.query(
      "UPDATE solicitudes SET comentario = ? WHERE id = ?",
      [comentario, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Solicitud no encontrada" });
    }

    res.json({ message: "Comentario agregado correctamente" });
  } catch (error) {
    console.error("Error al agregar comentario:", error);
    res.status(500).json({ message: "Error al agregar comentario" });
  }
});

export default router;
