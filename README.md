# IMDb Movie Database Project

This project is a movie database application that allows users to browse movies, add movies to their watchlist, rate movies, comment on movies, and view popular movies based on a custom popularity algorithm.

## Features

- **Movie Browsing**: Users can browse movies and view details such as the title, rating, genre, actors, summary, and trailer.
- **User Authentication**: Users can sign up, log in, and log out.
- **Watchlist**: Logged-in users can add movies to their watchlist.
- **Movie Rating**: Users can rate movies on a scale of 1 to 10.
- **Comments**: Users can comment on movies.
- **Popularity Ranking**: Movies are ranked based on a custom popularity algorithm that considers ratings, comments, and page views.
- **Language Switching**: The home page can be viewed in English or Turkish, based on user selection or browser language.

## Getting Started

## Project Structure

- `views/`: Contains the EJS templates for rendering the HTML.
- `public/`: Contains static files like CSS, JS, and images.
- `routes/`: Contains the route handlers for the application.
- `db/`: Contains the database connection setup and queries.
- `partials/`: Contains reusable components like the header and footer.
- `app.js`: The main entry point for the application.

## Database Schema

### Tables

1. **movies**:
    - `movie_id` (SERIAL PRIMARY KEY)
    - `movie_name` (VARCHAR)
    - `img_url` (VARCHAR)
    - `release_year` (INT)
    - `movie_runtime` (INT)
    - `genre` (VARCHAR)
    - `actors` (VARCHAR)
    - `summary` (TEXT)
    - `rating` (FLOAT)
    - `page_views` (INT)

2. **users**:
    - `id` (SERIAL PRIMARY KEY)
    - `username` (VARCHAR)
    - `email` (VARCHAR)
    - `password` (VARCHAR)
    - `city` (VARCHAR)
    - `country` (VARCHAR)

3. **user_ratings**:
    - `id` (SERIAL PRIMARY KEY)
    - `user_id` (INT REFERENCES users(id))
    - `movie_id` (INT REFERENCES movies(movie_id))
    - `rating` (INT CHECK (rating >= 1 AND rating <= 10))
    - `created_at` (TIMESTAMP DEFAULT NOW())

4. **comments**:
    - `id` (SERIAL PRIMARY KEY)
    - `user_id` (INT REFERENCES users(id))
    - `movie_id` (INT REFERENCES movies(movie_id))
    - `comment` (TEXT)
    - `rating` (INT)
    - `created_at` (TIMESTAMP DEFAULT NOW())

## Custom Popularity Algorithm

The popularity of a movie is calculated based on the ratings, number of comments, and page views. The algorithm normalizes each of these factors and then combines them to compute a popularity score.

## Routes

### Home Page

- **GET /**: Renders the home page with the top 10 popular movies.
- GET /**search: This route handles the search API and returns JSON results.
- GET /**search-detail: This route handles rendering the detailed search results page

### Movie Details

- **GET /movie/:id**: Renders the movie detail page.
- **POST /rate/:movieId**: Submits a user rating for a movie.
- **POST /movie/:id/comment**: Submits a comment for a movie.

### User Authentication

- **GET /login**: Renders the login page.
- **POST /login**: Handles login form submission.
- **POST /logout**: Logs out the user.
- **POST /register**: Handles user registration.

### Watchlist

- **POST /watchlist/:movieId**: Adds a movie to the user's watchlist.
- **GET /watchlist**: Renders the user's watchlist.

## Language Switching

The home page supports language switching between English and Turkish. The default language is set based on the user's browser language or can be manually changed using the dropdown in the navigation bar.

Deployed at: https://final-project-sbwq.onrender.com/
Video: https://drive.google.com/file/d/1GQzJWevzltRRopnCs4vm0g40NWumR9G0/view?usp=sharing
