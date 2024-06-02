const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../models/db');
//const homeController = require('../controllers/homeController');
//router.get('/', homeController.getHomePage);//router.get('/search', homeController.searchMovies);

router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM movies;');
        res.render("index", {
            movies: result.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

// Movie detail route
router.get('/movie/:id', async (req, res) => {
    const movieId = req.params.id;
    try {
        const result = await db.query('SELECT * FROM movies WHERE movie_id = $1;', [movieId]);
        if (result.rows.length > 0) {
            res.render('movieDetails', {
                movie: result.rows[0]
            });
        } else {
            res.status(404).send('Movie not found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});


// Render the login/registration page
router.get('/login', (req, res) => {
    res.render('login');
  });
  
  // Handle login form submission
  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = result.rows[0];
  
      if (user && await bcrypt.compare(password, user.password)) {
        // Assuming you have session setup
        req.session.userId = user.id;
        res.redirect('/');
      } else {
        res.status(401).send('Invalid email or password');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  });
  
  // Handle registration form submission
  router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.query(
        'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)',
        [username, email, hashedPassword]
      );
      res.redirect('/login');
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  });

  router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Unable to logout');
        }
        res.redirect('/login');
    });
});

router.get('/search', async (req, res) => {
  try {
      const query = req.query.query ? req.query.query.toLowerCase() : '';
      const type = req.query.type;
      
      console.log('Performing search with query:', query, 'and type:', type); // Debug log

      // Base SQL query
      let sql = 'SELECT * FROM movies WHERE LOWER(movie_name) LIKE $1';
      let params = [`%${query}%`];

      // Modify SQL query based on the search type
      if (type && type !== 'all') {
          switch (type) {
              case 'genre':
                  sql += ' AND genre = $2';
                  params.push(query); // Pass the genre query
                  break;
              case 'director':
                  sql += ' AND director = $2';
                  params.push(query); // Pass the director query
                  break;              
                  case 'actor':
                  sql += ' AND actors = $2';
                  params.push(query); // Pass the actor query
                  break;
              default:
                  break;
          }
      }

      // Execute the SQL query
      const result = await db.query(sql, params);
      //console.log('Search results from backend:', result); // Debug log

      
      // Send the results as JSON
      
      res.json(result.rows);
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
  }
});



  
module.exports = router;