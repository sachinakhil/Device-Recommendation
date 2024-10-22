const request = require('supertest');
const app = require('./server');  // Your Express server file
let server;

beforeAll(() => {
    server = app.listen(4000);  // Use a different port for testing
});

afterAll(() => {
    server.close();  // Close the server after tests
});
describe('POST /recommend', () => {
    // Mock the exec function to simulate Python script execution
    const exec = require('child_process').exec;
    jest.mock('child_process');

    beforeEach(() => {
        // Reset any mocks before each test
        jest.clearAllMocks();
    });

    it('should return recommended products based on budget and specs', async () => {
        // Mock exec to simulate successful execution of the Python script
        exec.mockImplementation((command, callback) => {
            callback(null, 'Python script output');
        });

        // Simulate the reading of the JSON file with mock data
        jest.mock('fs', () => ({
            readFile: (path, encoding, callback) => {
                callback(null, JSON.stringify([
                    { title: "Phone A", extracted_price: "1000", specs: "OLED display", link: "https://example.com/product/phone-a" }
                ]));
            }
        }));

        const response = await request(app)
            .post('/recommend')
            .send({ budget: 1500, specs: 'OLED' });

        expect(response.status).toBe(200);
        expect(response.body.products.length).toBe(1);
        expect(response.body.products[0].title).toBe('Phone A');
    });

    it('should return 500 if there is an error running the Python script', async () => {
        // Simulate an error with the Python script execution
        exec.mockImplementation((command, callback) => {
            callback(new Error('Python script error'), '', 'stderr output');
        });

        const response = await request(app)
            .post('/recommend')
            .send({ budget: 1500, specs: 'OLED' });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Failed to execute Python script');
    });
});
