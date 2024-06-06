// Include the JavaScript provided above here
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const menuButton = document.querySelector('.menu-button');
    const searchResults = document.getElementById('search-results');
    let searchType = 'all';

    // Handle dropdown item click
    document.querySelectorAll('.dropdown a').forEach(item => {
        item.addEventListener('click', event => {
            event.preventDefault();
            searchType = event.target.getAttribute('data-type');
            menuButton.textContent = event.target.textContent;
        });
    });

    // Perform search
    const performSearch = async (query, type) => {
        if (query.length < 3) {
            searchResults.style.display = 'none';
            return;
        }

        console.log('Performing search with query:', query, 'and type:', type); // Debug log

        try {
            const response = await fetch(`/search?query=${encodeURIComponent(query)}&type=${encodeURIComponent(type)}`);
            const results = await response.json();
            if (results.length > 0) {
                searchResults.innerHTML = results.map(result => `
                        <a href="movie/${result.movie_id}">
                            <img src="${result.img_url}" alt="${result.movie_name}">
                            <div class="movie-info">
                                <div class="title">${result.movie_name}</div>
                                <div class="details">${result.release_year}<br>${result.actors}</div>
                            </div>
                        </a>
                    `).join('');
                searchResults.style.display = 'block';
            } else {
                searchResults.innerHTML = '<p>No results found</p>';
                searchResults.style.display = 'block';
            }
        } catch (error) {
            console.error('Error fetching search results:', error);
        }
    };

    // Handle input change
    searchInput.addEventListener('input', () => {
        performSearch(searchInput.value, searchType);
    });

    // Handle search button click
    searchButton.addEventListener('click', (event) => {
        event.preventDefault();
        performSearch(searchInput.value, searchType);
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');
    const dropdownLinks = document.querySelectorAll('.dropdown a');
    let selectedType = 'all';

    // Update the selected type based on dropdown click
    dropdownLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            selectedType = this.getAttribute('data-type');
            document.querySelector('.menu-button').innerText = this.innerText;
        });
    });

    // Handle search button click
    searchButton.addEventListener('click', function() {
        const query = searchInput.value.trim();
        if (query) {
            window.location.href = `/search-detail?query=${encodeURIComponent(query)}&type=${encodeURIComponent(selectedType)}`;
        }
    });

    // Optionally, handle enter key press for the search input
    searchInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            searchButton.click();
        }
    });
});