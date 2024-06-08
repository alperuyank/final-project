const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../models/db');
const { ensureLoggedIn, ensureLoggedOut } = require('../public/js/auth'); // Adjust the path to your middleware


function normalize(value, min, max) {
  return (value - min) / (max - min);
}

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM movies;');
    const movies = result.rows;

    // Find min and max values for normalization
    const minRating = Math.min(...movies.map(movie => movie.rating));
    const maxRating = Math.max(...movies.map(movie => movie.rating));
    const minComments = Math.min(...movies.map(movie => movie.comments_count));
    const maxComments = Math.max(...movies.map(movie => movie.comments_count));
    const minPageViews = Math.min(...movies.map(movie => movie.page_views));
    const maxPageViews = Math.max(...movies.map(movie => movie.page_views));

    // Calculate popularity score for each movie
    movies.forEach(movie => {
      const normalizedRating = normalize(movie.rating, minRating, maxRating);
      const normalizedComments = normalize(movie.comments_count, minComments, maxComments);
      const normalizedPageViews = normalize(movie.page_views, minPageViews, maxPageViews);
      movie.popularity_score = (normalizedRating + normalizedComments + normalizedPageViews) / 3;
    });

    // Sort movies by popularity score
    movies.sort((a, b) => b.popularity_score - a.popularity_score);

    res.render('index', {
      movies
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Route to submit a rating
router.post('/rate/:movieId', async (req, res) => {
  const movieId = req.params.movieId;
  const userId = req.session.userId; // Assuming user is logged in and userId is stored in session
  const { rating } = req.body;

  if (!userId) {
    return res.status(401).send('You must be logged in to rate a movie');
  }

  try {
    // Check if the user has already rated the movie
    const existingRating = await db.query('SELECT * FROM comments WHERE user_id = $1 AND movie_id = $2', [userId, movieId]);

    if (existingRating.rows.length > 0) {
      // Update the existing rating
      await db.query('UPDATE comments SET rating = $1, created_at = NOW() WHERE user_id = $2 AND movie_id = $3', [rating, userId, movieId]);
    } else {
      // Insert a new rating
      await db.query('INSERT INTO comments (user_id, movie_id, rating) VALUES ($1, $2, $3)', [userId, movieId, rating]);
    }

    // Calculate the new average rating
    const averageResult = await db.query('SELECT AVG(rating) as avg_rating FROM comments WHERE movie_id = $1', [movieId]);
    const newAverageRating = parseFloat(averageResult.rows[0].avg_rating).toFixed(1);

    // Update the average rating in the movies table
    await db.query('UPDATE movies SET rating = $1 WHERE movie_id = $2', [newAverageRating, movieId]);

    res.redirect(`/movie/${movieId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Movie detail route
/*router.get('/movie/:id', async (req, res) => {
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
});*/

// Movie detail route
router.get('/movie/:id', async (req, res) => {
  const movieId = req.params.id;
  const message = req.session.message;
  delete req.session.message;

  try {
    const movieResult = await db.query('SELECT * FROM movies WHERE movie_id = $1;', [movieId]);
    const commentsResult = await db.query(
      'SELECT comments.*, users.username FROM comments JOIN users ON comments.user_id = users.id WHERE movie_id = $1 ORDER BY comments.created_at DESC;',
      [movieId]
    );

    if (movieResult.rows.length > 0) {
      res.render('movieDetails', {
        movie: movieResult.rows[0],
        comments: commentsResult.rows,
        message: message // Pass the message to the template
      });
    } else {
      res.status(404).send('Movie not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});


// Login Route
router.get('/login', ensureLoggedOut, (req, res) => {
  res.render('login');
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (user && await bcrypt.compare(password, user.password)) {
      req.session.userId = user.id;
      req.session.username = user.username;
      res.redirect('/');
    } else {
      res.status(401).send('Invalid email or password');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});
// Register Route
router.get('/register', ensureLoggedOut, (req, res) => {
  res.render('register');
});

// Handle registration form submission
router.post('/register', async (req, res) => {
  const { username, email, password, city, country } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO users (username, email, password, city, country) VALUES ($1, $2, $3, $4, $5)',
      [username, email, hashedPassword, city, country]
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
// Add to Watchlist Route
router.post('/watchlist/:movieId', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }

  const userId = req.session.userId;
  const movieId = req.params.movieId;

  try {
    // Check if the movie is already in the watchlist
    const checkResult = await db.query(
      'SELECT * FROM watchlist WHERE user_id = $1 AND movie_id = $2',
      [userId, movieId]
    );

    if (checkResult.rows.length > 0) {
      req.session.message = 'Movie is already in your watchlist';
      return res.redirect(`/movie/${movieId}`);
    }

    // Add movie to the watchlist
    await db.query(
      'INSERT INTO watchlist (user_id, movie_id) VALUES ($1, $2)',
      [userId, movieId]
    );

    req.session.message = 'Movie added to your watchlist';
    res.redirect(`/movie/${movieId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Add Comment and Rating Route
router.post('/movie/:movieId/comment', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }

  const userId = req.session.userId;
  const movieId = req.params.movieId;
  const { rating, comment } = req.body;

  try {
    await db.query(
      'INSERT INTO comments (user_id, movie_id, rating, comment) VALUES ($1, $2, $3, $4)',
      [userId, movieId, rating, comment]
    );
    res.redirect(`/movie/${movieId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});



// Get Watchlist Route
router.get('/watchlist', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }

  const userId = req.session.userId;

  try {
    const result = await db.query(
      'SELECT movies.* FROM watchlist JOIN movies ON watchlist.movie_id = movies.movie_id WHERE watchlist.user_id = $1;',
      [userId]
    );
    res.render('watchlist', {
      watchlist: result.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});




module.exports = router;