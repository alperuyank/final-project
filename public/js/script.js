document.addEventListener('DOMContentLoaded', function () {
    const menuButton = document.querySelector('.menu-button');
    const dropdown = document.querySelector('.dropdown');

    menuButton.addEventListener('click', function () {
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    });

    window.addEventListener('click', function (e) {
        if (!menuButton.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });
});

// JavaScript for handling search
let searchType = 'title'; // default search type

// Dropdown functionality
document.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', function() {
        searchType = this.dataset.searchType;
        document.querySelector('.menu-button').innerText = this.innerText;
    });
});

// Search functionality
document.getElementById('search-input').addEventListener('input', async function() {
    const query = this.value;
    if (query.length >= 3) {
        try {
            const response = await fetch(`/search?query=${query}&type=${searchType}`);
            const results = await response.json();
            const searchResultsDiv = document.getElementById('search-results');
            searchResultsDiv.innerHTML = '';
            results.slice(0, 3).forEach(result => {
                const resultDiv = document.createElement('div');
                resultDiv.classList.add('search-result');
                resultDiv.innerText = result.movie_name;
                searchResultsDiv.appendChild(resultDiv);
            });
        } catch (error) {
            console.error('Error fetching search results:', error);
        }
    } else {
        document.getElementById('search-results').innerHTML = '';
    }
});
