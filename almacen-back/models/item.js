export default (sequelize, DataTypes) => {
  const Item = sequelize.define('Item', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    precio: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    imagen: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'items',
    timestamps: true
  });

  Item.associate = (models) => {
    Item.hasMany(models.DetalleSolicitud, {
      foreignKey: 'item_id',
      as: 'detalles'
    });
  };

  return Item;
};
