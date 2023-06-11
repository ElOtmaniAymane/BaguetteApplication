window.onload = function() {
    const userId = localStorage.getItem('user_id');
    if (userId) {
        const username = localStorage.getItem('username');

        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('welcome-message').style.display='block'
        document.getElementById('welcome-message').innerText="Welcome " + username +" !";
    }
};

function toggleForm() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm.style.display !== 'none') {
        registerForm.style.display = 'block';
        loginForm.style.display = 'none';
    } else {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    }
}

function login(event) {
    // alert('login function called'); // Add this line
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // alert('username: ' + username); // Add this line
    // alert('password: ' + password); // Add this line

    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({username: username, password: password})
    })
    .then(response => {
        // alert('response: ' + JSON.stringify(response)); // Add this line
        return response.json();
    })
    .then(data => {
        // alert('data: ' + JSON.stringify(data)); // Add this line
        if (data.result == 'success') {
            localStorage.setItem('user_id', data.user_id);
            localStorage.setItem('nodes', JSON.stringify(data.nodes));
            localStorage.setItem('username', data.username);
            document.getElementById('welcome-message').style.display='block'
            document.getElementById('welcome-message').innerText="welcome" + username +"!";


            window.location.href = '/';
        } else {
            alert('Invalid username or password');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error: ' + error.message);
    });
}


function register(event) {
    event.preventDefault();

    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const email = document.getElementById('register-email').value;

    fetch('/api/users/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({username: username, password: password, email: email})
    })
    .then(response => response.json())
    .then(data => {
        if (data.result == 'success') {
            alert('Registration successful. You can now log in.');
            toggleForm();
        } else {
            alert('Registration failed: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Registration failed: ' + (error.message || 'Unknown error'));
    });
}

// Here you should add the event listeners for the form submission
document.getElementById('login-submit').addEventListener('click', login);
document.getElementById('register-submit').addEventListener('click', register);
document.getElementById('switch-to-login').addEventListener('click', toggleForm);
document.getElementById('switch-to-signup').addEventListener('click', toggleForm);
var logoutButton = document.getElementById('logout-button');

logoutButton.addEventListener('click', function() {
    fetch('/logout', {
        method: 'GET',
    })
    .then(response => {
        if(response.ok) {
            // Remove user_id from localStorage
            localStorage.removeItem('user_id');
            localStorage.removeItem('username');

            alert('Successfully logged out');
            // Redirect to login page or home page
            window.location.href = '/';
        } else {
            alert('Logout failed');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error: ' + error.message);
    });
});
