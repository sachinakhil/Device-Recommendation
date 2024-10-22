document.getElementById('product-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const budget = document.getElementById('budget').value;
    const specs = document.getElementById('specs').value;

    try {
        const response = await fetch('/recommend', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ budget, specs })
        });

        const data = await response.json();
        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = '';  // Clear previous results

        // Check if any products are returned
        if (data.products.length === 0) {
            resultsDiv.innerHTML = '<p>No products found matching your criteria.</p>';
            return;
        }

        // Loop through the results and display each product with title, price, thumbnail, and link
        data.products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');

            // Create thumbnail image
            const thumbnail = document.createElement('img');
            thumbnail.src = product.thumbnail;
            thumbnail.alt = product.title;
            thumbnail.classList.add('thumbnail');

            // Create title
            const title = document.createElement('h3');
            title.textContent = product.title;

            // Create price
            const price = document.createElement('p');
            price.textContent = `Price: ₹${product.extracted_price}`;

            // Create link
            const link = document.createElement('a');
            link.href = product.link;
            link.textContent = 'View Product';
            link.target = '_blank';  // Open the link in a new tab

            // Append elements to the product card
            productCard.appendChild(thumbnail);
            productCard.appendChild(title);
            productCard.appendChild(price);
            productCard.appendChild(link);

            // Append the product card to the results div
            resultsDiv.appendChild(productCard);
        });
    } catch (error) {
        document.getElementById('results').innerText = 'Failed to fetch recommendations.';
        console.error('Error:', error);
    }
});
