const passport = require('passport');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

exports.getLoginPage = (req, res) => {
  res.render('login', { title: res.__('Login'), messages: req.flash('error') });
};

exports.postLogin = passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/auth/login',
  failureFlash: true
});

exports.getRegisterPage = (req, res) => {
  res.render('register', { title: res.__('Register') });
};

exports.postRegister = async (req, res) => {
  const { email, password, country, city } = req.body;
  const hash = await bcrypt.hash(password, 10);
  await User.create({ email, password: hash, country, city });
  res.redirect('/auth/login');
};

exports.logout = (req, res) => {
  req.logout();
  res.redirect('/');
};
