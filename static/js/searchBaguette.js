document.addEventListener("DOMContentLoaded", (event) => {
    document.getElementById("searchBaguette").addEventListener('click', function() {
        console.log("yes");
        let modal = document.getElementById("myModal");
        let userId = localStorage.getItem("user_id") || localStorage.getItem("guest_id");
        modal.style.display = "block";

        fetch('/api/users/convert/' + userId, {method: 'POST'})
        .then(response => response.json())
        .then(response => {
            document.getElementById('modal-text').innerText = "Here are the files that contain matches:";
            let resultsList = document.getElementById('results-list');

            // Clear previous results
            while (resultsList.firstChild) {
                resultsList.removeChild(resultsList.firstChild);
            }

            // Add new results
            for (let key in response) {
                if (response.hasOwnProperty(key)) {
                    let listItem = document.createElement('li');
                    listItem.innerText = `${key}: ${response[key]}`;
                    resultsList.appendChild(listItem);
                }
            }

            // Show the modal
        })
        .catch(error => console.error('Error:', error));
    });

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        let modal = document.getElementById('myModal');
        let modalText = document.getElementById('modal-text');
        let resultsList = document.getElementById('results-list');
        if (event.target == modal) {
            modal.style.display = "none";
            modalText.innerText = "The results take on average one minute...";
            // Clear previous results
            while (resultsList.firstChild) {
                resultsList.removeChild(resultsList.firstChild);
            }
        }
    }
});

