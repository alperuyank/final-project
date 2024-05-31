const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'postgres'
});

const User = sequelize.define('User', {
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  country: { type: DataTypes.STRING, allowNull: false },
  city: { type: DataTypes.STRING, allowNull: false }
});

const Movie = sequelize.define('Movie', {
  title: { type: DataTypes.STRING, allowNull: false },
  summary: { type: DataTypes.TEXT },
  actors: { type: DataTypes.STRING },
  rating: { type: DataTypes.FLOAT },
  imageUrl: { type: DataTypes.STRING },
  trailerUrl: { type: DataTypes.STRING }
});

sequelize.sync();

module.exports = { User, Movie, sequelize };
