const userModel = require('../models');

exports.getUsers = (req, res) => {
  const users = userModel.findAll();
  res.render('users', { title: 'Users', users });
};

exports.getUserById = (req, res) => {
  const user = userModel.findById(parseInt(req.params.id));
  if (user) {
    res.render('user', { title: 'User Details', user });
  } else {
    res.status(404).send('User not found');
  }
};
