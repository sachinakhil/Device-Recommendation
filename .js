require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GoogleSearch } = require('serpapi');

const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());

// Initialize Google Generative AI with the API key from the environment variables
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// POST route for recommendations
app.post('/recommend', async (req, res) => {
    const { budget, specs } = req.body;

    // Fetch shopping results from SerpAPI
    const fetchShoppingResults = (prompt) => {
        return new Promise((resolve, reject) => {
            const params = {
                q: prompt,  // Set the query as the prompt received
                location: "India",
                hl: "en",
                gl: "in",
                api_key: process.env.SERPAPI_API_KEY  // Replace with actual SerpAPI key
            };

            const search = new GoogleSearch(params);
            search.json((results) => {
                if (results.shopping_results) {
                    resolve(results.shopping_results);  // Resolve with raw shopping results
                } else {
                    resolve([]);  // Resolve with an empty array if no results
                }
            });
        });
    };

    try {
        // Step 1: Build the search query for SerpAPI based on the budget and specs
        const prompt = `Top 5 jeans with ${specs} under ${budget} budget`;

        // Step 2: Fetch shopping results from SerpAPI
        const shoppingResults = await fetchShoppingResults(prompt);

        // Check if we got any shopping results
        if (shoppingResults.length === 0) {
            return res.status(404).json({ error: 'No shopping results found.' });
        }

        // Step 3: Prepare the final prompt for Google Gemini with raw shopping results
        const finalPrompt = `Could you suggest me top 5 jeans based on these raw shopping results, considering ${specs} and a budget of ${budget}? Also, provide me their links as well. Here are the shopping results:\n\n${shoppingResults}`;

        // Step 4: Send the prompt to the Gemini model
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const response = await model.generateContent(finalPrompt);

        // Log the API response for debugging purposes
        console.log('API Response:', response);

        // Assuming the response contains the generated content in `response.text()`
        const recommendations = response.response.text();

        // Send the recommendations back to the client
        res.json({ recommendations: recommendations.split('\n') });
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
