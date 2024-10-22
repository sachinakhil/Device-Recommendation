/**
 * @jest-environment jsdom
 */

// Import the script file
require('./script.js');

// Mock the Fetch API
global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({
            products: [
                {
                    title: "Phone A",
                    extracted_price: "1000",
                    thumbnail: "path/to/thumbnail.jpg",
                    link: "https://example.com/product/phone-a"
                }
            ]
        })
    })
);

describe('Product Form Submission', () => {
    beforeEach(() => {
        // Set up our DOM elements for the test
        document.body.innerHTML = `
            <form id="product-form">
                <input type="number" id="budget" name="budget" value="500" />
                <textarea id="specs" name="specs">Intel</textarea>
                <button type="submit">Get Recommendations</button>
            </form>
            <div id="results"></div>
        `;
    });

    test('should call fetch and display products', async () => {
        const form = document.getElementById('product-form');
        const resultsDiv = document.getElementById('results');

        // Simulate form submission
        const event = new Event('submit');
        form.dispatchEvent(event);

        // Wait for fetch to be called and the products to be displayed
        await new Promise(setImmediate);

        // Check that fetch was called
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith('/recommend', expect.any(Object));

        // Check that the results are displayed in the DOM
        expect(resultsDiv.innerHTML).toContain('Phone A');
        expect(resultsDiv.innerHTML).toContain('₹1000');
        expect(resultsDiv.querySelector('a').href).toBe('https://example.com/product/phone-a');
    });

    test('should display "No products found" if no products returned', async () => {
        // Modify the fetch mock to return an empty list of products
        fetch.mockImplementationOnce(() =>
            Promise.resolve({
                json: () => Promise.resolve({ products: [] })
            })
        );

        const form = document.getElementById('product-form');
        const resultsDiv = document.getElementById('results');

        // Simulate form submission
        const event = new Event('submit');
        form.dispatchEvent(event);

        // Wait for fetch to be called and for the response to be handled
        await new Promise(setImmediate);

        // Check that "No products found" is displayed
        expect(resultsDiv.innerHTML).toContain('No products found');
    });
});
