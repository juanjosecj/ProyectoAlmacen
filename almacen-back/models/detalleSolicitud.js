export default (sequelize, DataTypes) => {
  const DetalleSolicitud = sequelize.define('DetalleSolicitud', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    solicitud_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'solicitudes',
        key: 'id'
      }
    },
    item_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'items',
        key: 'id'
      }
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    precio_unitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    }
  }, {
    tableName: 'detalle-solicitud',
    timestamps: true
  });

  DetalleSolicitud.associate = (models) => {
    DetalleSolicitud.belongsTo(models.Solicitud, {
      foreignKey: 'solicitud_id',
      as: 'solicitud'
    });
    DetalleSolicitud.belongsTo(models.Item, {
      foreignKey: 'item_id',
      as: 'item'
    });
  };

  return DetalleSolicitud;
};
