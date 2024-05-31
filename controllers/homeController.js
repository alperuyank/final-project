const { Movie } = require('../models');

exports.getHomePage = async (req, res) => {
  const movies = await Movie.findAll({ limit: 10, order: [['rating', 'DESC']] });
  res.render('index', {
    title: res.__('Home'),
    movies,
    user: req.user,
    messages: req.flash('info')
  });
};

exports.searchMovies = async (req, res) => {
  const { q } = req.query;
  const movies = await Movie.findAll({
    where: {
      title: {
        [Op.iLike]: `%${q}%`
      }
    },
    limit: 3
  });
  res.json(movies);
};
