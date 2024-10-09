require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');  // To read the JSON file
const { exec } = require('child_process');  // To run Python scripts

const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());

// Initialize Google Generative AI with the API key from the environment variables
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// POST route for recommendations
app.post('/recommend', async (req, res) => {
    const { budget, specs } = req.body;

    // Path to your Python script
    const pythonScriptPath = '/Users/akhilsachin/Gemini/test.py';  
    // Command to run Python script with the user inputs
    const pythonCommand = `/Users/akhilsachin/Gemini/env/bin/python ${pythonScriptPath} "${specs}" "${budget}"`;

    // Execute the Python script
    exec(pythonCommand, (error, stdout, stderr) => {
        // If there’s an error, but it’s not critical, continue processing
        if (error) {
            console.warn('Warning: Python script returned an error:', error.message);
        }

        // Log any standard error output from the Python script (can be ignored if non-critical)
        if (stderr) {
            console.warn('Python script stderr (may be non-critical):', stderr);
        }

        // If the Python script executed successfully or we want to ignore errors, continue
        console.log('Python script output (stdout):', stdout);

        try {
            // Step 2: Now that the Python script has generated the JSON, read the JSON file
            const shoppingResults = JSON.parse(fs.readFileSync('/Users/akhilsachin/laptop-recommendation-system/shopping_results.json', 'utf-8'));

            // Step 3: Prepare the final prompt for Google Gemini with raw shopping results
            const finalPrompt = `Could you suggest me top 5 things based on these shopping results, considering ${specs} and a budget of ${budget}? Also, provide me their links as well. Here are the shopping results:\n\n${JSON.stringify(shoppingResults, null, 2)}`;

            // Step 4: Send the prompt to the Gemini model
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            model.generateContent(finalPrompt).then(response => {
                console.log('API Response:', response);

                // Assuming the response contains the generated content in `response.text()`
                const laptops = response.response.text();

                // Send the recommendations back to the client
                res.json({ laptops: laptops.split('\n') });
            }).catch(apiError => {
                console.error('Error fetching recommendations from Gemini:', apiError);
                res.status(500).json({ error: 'Failed to fetch recommendations from Gemini.' });
            });
        } catch (error) {
            console.error('Error reading JSON file:', error);
            res.status(500).json({ error: 'Failed to read shopping results from JSON.' });
        }
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
