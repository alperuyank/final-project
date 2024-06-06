const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../models/db');


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
          sql = 'SELECT * FROM movies WHERE LOWER(genre) LIKE $1';
          params = [`%${query}%`];
          break;
        case 'director':
          sql = 'SELECT * FROM movies WHERE LOWER(director) LIKE $1';
          params = [`%${query}%`];
          break;
        case 'actor':
          sql = 'SELECT * FROM movies WHERE LOWER(actors) LIKE $1';
          params = [`%${query}%`];
          break;
        default:
          break;
      }
    }

    console.log('Executing SQL query:', sql, 'with params:', params); // Debug log

    // Execute the SQL query
    const result = await db.query(sql, params);
    //console.log('Search results from backend:', result.rows); // Debug log

    // Send the results as JSON
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }

});

router.get('/search-detail', async (req, res) => {
  try {
    const query = req.query.query ? req.query.query.toLowerCase() : '';
    const type = req.query.type;

    console.log('Performing search with query:', query, 'and type:', type); // Debug log

    // Base SQL query
    let sql = 'SELECT * FROM movies WHERE LOWER(movie_name) LIKE $1';
    let params = [`%${query}%`];

    // Modify SQL query based on the search type
    // Modify SQL query based on the search type
    if (type && type !== 'all') {
      switch (type) {
        case 'genre':
          sql = 'SELECT * FROM movies WHERE LOWER(genre) LIKE $1';
          params = [`%${query}%`];
          break;
        case 'director':
          sql = 'SELECT * FROM movies WHERE LOWER(director) LIKE $1';
          params = [`%${query}%`];
          break;
        case 'actor':
          sql = 'SELECT * FROM movies WHERE LOWER(actors) LIKE $1';
          params = [`%${query}%`];
          break;
        default:
          break;
      }
    }

    console.log('Executing SQL query:', sql, 'with params:', params); // Debug log

    // Execute the SQL query
    const result = await db.query(sql, params);
    console.log('Search results from backend:', result.rows); // Debug log

    // Render the search results page
    res.render("search", {
      movies: result.rows,
      query: req.query.query,
      type: req.query.type
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});






module.exports = router;