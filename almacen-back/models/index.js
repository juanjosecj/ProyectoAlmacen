import { Sequelize } from "sequelize";
import process from "process";
import User from "./user.js";
import Role from "./role.js";
import Item from "./item.js";
import Solicitud from "./solicitud.js";
import DetalleSolicitud from "./detalleSolicitud.js";


const env = process.env.NODE_ENV || "development";
const configFile = await import("../config/config.js", { assert: { type: "json" } });
const config = configFile.default[env];

const sequelize = new Sequelize(config.database, config.username, config.password, config);

const db = {};

// Inicializar modelos
db.Role = Role(sequelize, Sequelize.DataTypes);
db.User = User(sequelize, Sequelize.DataTypes);
db.Item = Item(sequelize, Sequelize.DataTypes);
db.Solicitud = Solicitud(sequelize, Sequelize.DataTypes);
db.DetalleSolicitud = DetalleSolicitud(sequelize, Sequelize.DataTypes);

// Asociaciones
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Exportar sequelize y modelos
db.sequelize = sequelize;


export default db;
