const { exec } = require('child_process');

// Run the Python script to generate the JSON file
exec('python3 test.py', (err, stdout, stderr) => {
    if (err) {
        console.error(`Error running Python script: ${stderr}`);
        return;
    }
    console.log(stdout);

    // After Python script finishes, run the Node.js server
    exec('npm start', (err, stdout, stderr) => {
        if (err) {
            console.error(`Error running Node.js server: ${stderr}`);
            return;
        }
        console.log(stdout);
    });
});
