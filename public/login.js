document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ username, password })
        });

        if (response.redirected) {
            window.location.href = "/Users/akhilsachin/laptop-recommendation-system/public/index.html"; // Redirect to homepage if successful
        } else {
            const text = await response.text();
            document.body.innerHTML = text; // Display login error message
        }
        window.location.href = "/Users/akhilsachin/laptop-recommendation-system/public/index.html";
    } catch (error) {
        console.error('Error logging in:', error);
    }
});
