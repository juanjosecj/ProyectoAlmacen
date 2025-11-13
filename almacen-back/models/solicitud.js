export default (sequelize, DataTypes) => {
  const Solicitud = sequelize.define('Solicitud', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    estado: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pendiente'
    },
    comentario: {
      type: DataTypes.STRING,
      allowNull: true
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    metodo_pago: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'efectivo'
    }
  }, {
    tableName: 'solicitudes',
    timestamps: true
  });

  Solicitud.associate = (models) => {
    Solicitud.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    Solicitud.hasMany(models.DetalleSolicitud, {
      foreignKey: 'solicitud_id',
      as: 'detalles'
    });
  };

  return Solicitud;
};
