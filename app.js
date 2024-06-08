const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const i18n = require('i18n');
const ejs = require('ejs');
const PORT = process.env.PORT || 3000;

const homeRoutes = require("./routes/homeRoutes");


// Set up express app
const app = express();

// View engine setup
app.set('view engine', 'ejs');
app.use(express.static('public'));


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // JSON verilerini ayrıştırmak için

// Oturum yönetimi middleware'i kullanın
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
}));

// Oturum bilgilerini tüm şablonlara gönderin
app.use((req, res, next) => {
  res.locals.user = req.session.userId ? { 
    id: req.session.userId,
    username: req.session.username
  } : null;
  next();
});

app.use(homeRoutes);





// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
