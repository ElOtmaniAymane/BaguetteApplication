document.addEventListener('DOMContentLoaded', (event) => {
    const dialog = document.getElementById('dialog');
    const dialogContent = document.getElementById('dialog-content');

    const signInForm = document.getElementById('sign-in');
    const signInBtn = document.getElementById('sign-in-btn');
    const continueBtn = document.getElementById('continue-btn');
    const updateBtn = document.getElementById("update-session-btn");
    const expiryInfo = document.getElementById('expiry-info');

    let timeoutId;

    function startTimer() {
        let expiryTimestamp = localStorage.getItem('expiryTimestamp');
        if (!expiryTimestamp) {
            expiryTimestamp = Date.now() + 30 * 60 * 1000;
            localStorage.setItem('expiryTimestamp', expiryTimestamp);
        }
    
        let remainingTime = expiryTimestamp - Date.now();
        let minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
        expiryInfo.textContent = `Your session will expire in ${minutes} minutes and ${seconds} seconds.`;
        expiryInfo.style.display = 'flex';
    
        // Clear the previous timer if there is one
        if (timeoutId) {
            clearInterval(timeoutId);
        }
    
        // Start a new timer
        timeoutId = setInterval(function() {
            remainingTime = expiryTimestamp - Date.now();
            minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
            seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
    
            if (remainingTime > 0) {
                expiryInfo.textContent = `Your session will expire in ${minutes} minutes.`;
            } else {
                expiryInfo.textContent = `Your session has expired.`;
                fetch(`/api/guestusers/${localStorage.getItem('guest_id')}`, {
                    method: 'DELETE',
                })
                localStorage.removeItem('guest_id');
                localStorage.removeItem('expiryTimestamp');
                clearInterval(timeoutId);
            }
        }, 1000);
    }

    const userId = localStorage.getItem('user_id');
    const guestId = localStorage.getItem('guest_id');

    if (!userId) {
        if (guestId) {
            startTimer();
            updateBtn.style.display = 'flex';
            updateBtn.addEventListener('click', function() {
                console.log("ghadi tfi9");
                fetch(`/api/guestusers/${localStorage.getItem('guest_id')}`, {
                    method: 'PUT',
                })
                .then(response => response.json())
                .then(data => {
                    localStorage.setItem('expiryTimestamp', Date.now() + 30 * 60 * 1000);
                    startTimer();
                });
            });
        } else {
            dialog.style.display="flex";
            signInBtn.addEventListener('click', function() {
                dialogContent.style.display="none";
                signInForm.style.display="flex";
            });

            continueBtn.addEventListener('click', function() {
                dialog.style.display="none";
                fetch('/api/guestusers', {
                  method: 'POST',
                })
                .then(response => response.json())
                .then(data => {
                    console.log(data.new_id + "ddd");
                    localStorage.setItem('guest_id', data.new_id);
                    localStorage.getItem('guest_id');
                    startTimer();
                    updateBtn.style.display = 'block';
                }).then(() => {
                    location.reload(true);
                });
            });


        }
    }
});
