document.getElementById('register-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ username, password })
        });

        if (response.redirected) {
            window.location.href = response.url; // Redirect to login page if successful
        } else {
            const text = await response.text();
            document.body.innerHTML = text; // Display registration error message
        }
    } catch (error) {
        console.error('Error registering:', error);
    }
});
