let isDeletingEdge = false;
const dataDisplay3 = document.getElementById('message');

// Bouton pour entrer en mode "delete edge"
document.getElementById('edgeDeleteButton').addEventListener('click', function() {
    isDeletingEdge = true;

    document.body.style.cursor = 'crosshair';  // Change cursor
});

// Écoute de l'événement selectEdge du réseau
network.on("selectEdge", function(params) {
    if (params.edges.length > 0) {
        var edgeId = params.edges[0];  // Get selected edge ID

        if (isDeletingEdge) {
            // Sortir du mode "delete edge"
            isDeletingEdge = false;
            document.body.style.cursor = 'auto';  // Revert cursor

            // Supprimer le edge de votre réseau vis.js
            try {
                data.edges.remove({id: edgeId});
                dataDisplay3.textContent = "ouioui";
            } catch (error) {
                dataDisplay3.textContent = error;
            }

            // Envoyez une requête DELETE à votre API
            fetch(`/api/edges/${edgeId}`, {
                method: 'DELETE',
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json(); // or .text() or .blob() ...
            })
            .then(() => {
                // Ensuite, rechargez votre page ou récupérez de nouvelles données pour mettre à jour votre page
                location.reload();
            })
            .catch(e => {
                console.log('There was a problem with your fetch operation: ' + e.message);
            });
        }
    }
});
