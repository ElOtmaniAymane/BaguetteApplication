let isDeletingEdge = false;

// Bouton pour entrer en mode "delete edge"
document.getElementById('edgeDeleteButton').addEventListener('click', function() {
    isDeletingEdge = true;

    document.body.style.cursor = 'crosshair';  // Change cursor
    network.once("click", function(params) {
        if (params.edges.length > 0) {
            var edgeId = params.edges[0];  // Get selected edge ID
    
            if (isDeletingEdge) {
                // Sortir du mode "delete edge"
                isDeletingEdge = false;
                document.body.style.cursor = 'auto';  // Revert cursor
    
                // Supprimer le edge de votre réseau vis.js

    
                // Envoyez une requête DELETE à votre API
                fetch(`/api/edges/${edgeId}`, {
                    method: 'DELETE',
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                })
                .then(() => {                    
                    data.edges.remove({id: edgeId});
                })
                .catch(e => {
                    console.log('There was a problem with your fetch operation: ' + e.message);
                });
            } 
        }
        else {
            // No edge was clicked, revert cursor and turn off deleting mode
            console.log("ya soudan");
            document.body.style.cursor = 'auto';  // Revert cursor
            
        }
    });
    var clickHandler = function(e) {
        var myNetworkDiv = document.getElementById('my-network');
        
            // Check if the click event is outside the 'my-network' div
            if (!myNetworkDiv.contains(e.target)) {
                console.log("bokayo");
                network.off("selectEdge");
                // Reset variables and cursor
                document.body.style.cursor = 'auto';       
                // Reset form
            }
            document.removeEventListener('click', clickHandler);

    };
    setTimeout(function() {
        document.addEventListener('click', clickHandler);
}, 100);
});

// Écoute de l'événement selectEdge du réseau
