function ensureLoggedIn(req, res, next) {
    if (req.session.userId) {
      return next();
    }
    res.redirect('/login');
  }
  
  function ensureLoggedOut(req, res, next) {
    if (!req.session.userId) {
      return next();
    }
    res.redirect('/');
  }
  
  module.exports = { ensureLoggedIn, ensureLoggedOut };
  