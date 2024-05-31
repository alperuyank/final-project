document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('#search-input');
    searchInput.addEventListener('input', () => {
        const query = searchInput.value;
        if (query.length >= 3) {
            fetch(`/search?q=${query}`)
                .then(response => response.json())
                .then(data => {
                    // Render the search results
                    const resultsContainer = document.querySelector('#search-results');
                    resultsContainer.innerHTML = '';
                    data.forEach(item => {
                        const resultItem = document.createElement('div');
                        resultItem.innerHTML = item.title;
                        resultsContainer.appendChild(resultItem);
                    });
                });
        }
    });
});
