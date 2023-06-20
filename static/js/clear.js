document.addEventListener('DOMContentLoaded', (event) => {

const userId = localStorage.getItem('user_id') || localStorage.getItem('guest_id');  // Retrieve the user_id or guest_id from localStorage
document.getElementById('clear-button').addEventListener('click', function() {
    console.log("clicked");
    // Use the fetch API to send the DELETE request
    fetch(`/api/nodes/user/${userId}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (response.ok) {
            // If the response was successful, clear the nodes on the page
            console.log(`Nodes for user_id ${userId} successfully deleted`);
            data.nodes.clear();
            data.edges.clear();
            network.setData(data);
            // Here you might need to add code to clear the nodes visually from the page
        } else {
            console.error(`Error: ${response.statusText}`);
        }
    });
});
// document.getElementById('export').addEventListener('click', function() {
//     $.get("/api/users/export/"+userId, function(data) {
//         console.log(data);  // Do something with the data
//     });
// });

document.getElementById('export').addEventListener('click', function() {
    fetch("/api/users/export/" + userId)
        .then(response => response.json())
        .then(data => {
            document.getElementById('exportData').textContent = JSON.stringify(data, null, 2);
            $('#exportModal').modal('show');
        });
});

document.getElementById('copyBtn').addEventListener('click', function() {
    copyToClipboard(document.getElementById('exportData'));
});

// function copyToClipboard(element) {
//     // let textArea = document.createElement('textarea');
//     // textArea.value = element.textContent;
//     // document.body.appendChild(textArea);
//     // textArea.select();
//     // document.execCommand('copy');
    
//     // document.body.removeChild(textArea);

//     // var copyText = document.getElementById("myInput");

//     // Select the text field
//     element.select();
//     element.setSelectionRange(0, 99999); // For mobile devices
  
//      // Copy the text inside the text field
//     navigator.clipboard.writeText(element.value);
  
//     // Alert the copied text
//     alert("Copied the text: " + element.value);
// }
function copyToClipboard(element) {
    let textArea = document.createElement('textarea');
    textArea.value = element.textContent;
    document.body.appendChild(textArea);
    textArea.select();
    navigator.clipboard.writeText(textArea.value)
        .then(() => {
            alert('Copied the text: ' + textArea.value);
        })
        .catch(err => {
            console.error('Could not copy text: ', err);
        });
    document.body.removeChild(textArea);
}




});