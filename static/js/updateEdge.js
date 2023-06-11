let isUpdatingEdge = false;
let isSelectingNode = false;
let selectedEdge = null;
let selectedNode = null;
let sourceNodeId = null;
let targetNodeId = null;
const dataDisplay2 = document.getElementById('message');

// Bouton pour entrer en mode "update edge"
document.getElementById('edgeUpdateButton').addEventListener('click', function() {
    isUpdatingEdge = true;

    document.body.style.cursor = 'crosshair';  // Change cursor
});

// Écoute de l'événement selectEdge du réseau
network.on("selectEdge", function(params) {
    if (params.edges.length > 0) {
        var edgeId = params.edges[0];  // Get selected edge ID
        var edgeData = data.edges.get(edgeId);  // Get edge data

        if (isUpdatingEdge) {
            // Sortir du mode "update edge"
            isUpdatingEdge = false;
            document.body.style.cursor = 'auto';  // Revert cursor

            // Enregistrer l'arête sélectionnée
            selectedEdge = edgeData;
            sourceNodeId = edgeData.from;
            targetNodeId = edgeData.to;

            // Afficher le formulaire
            document.getElementById('edgeUpdateDialogue').style.display = 'block';

            // Pré-remplir le formulaire avec les valeurs existantes
            document.querySelector('#edgeUpdateForm input[name="edgeTypeField"]').value = edgeData.label;
            // Repeat for other form fields...
        }
    }
});
let action = null;

// Gestionnaires pour les boutons "change source" et "change target"
document.getElementById('changeSourceNodeButton').addEventListener('click', function(event) {
    event.preventDefault();  // Prevent form submission

    // Entrer en mode "sélection de nœud"
    isSelectingNode = true;
    action = 'changeSourceNode';  // Set action
    document.body.style.cursor = 'crosshair';  // Change cursor

    // Cacher le formulaire
    document.getElementById('edgeUpdateDialogue').style.display = 'none';
});
document.getElementById('changeTargetNodeButton').addEventListener('click', function(event) {
    event.preventDefault();  // Prevent form submission

    // Entrer en mode "sélection de nœud"
    isSelectingNode = true;
    action = 'changeTargetNode';  // Set action
    document.body.style.cursor = 'crosshair';  // Change cursor

    // Cacher le formulaire
    document.getElementById('edgeUpdateDialogue').style.display = 'none';
});

// Attacher un gestionnaire de clic à chaque nœud
network.on("click", function(params) {
    if (params.nodes.length > 0 && isSelectingNode) {
        var nodeId = params.nodes[0];  // Get selected node ID

        // Sortir du mode "sélection de nœud"
        isSelectingNode = false;
        document.body.style.cursor = 'auto';  // Revert cursor

        // Update the source or target node ID as necessary
        if (action === 'changeSourceNode') {
            sourceNodeId = nodeId;
        } else if (action === 'changeTargetNode') {
            targetNodeId = nodeId;
        }

        action = null;  // Clear action

        // Réafficher le formulaire
        document.getElementById('edgeUpdateDialogue').style.display = 'block';
    }
});


// Gestionnaire pour le bouton "save"
document.getElementById('saveModificationButton').addEventListener('click', function(event) {
    event.preventDefault();  // Prevent form submission

    // Gather updated edge data
    let updatedEdgeData = {
        arrow: 0,
        edge_type: document.querySelector('#edgeUpdateForm input[name="edgeTypeField"]').value,
        source_node_id: sourceNodeId.toString(),
        target_node_id: targetNodeId.toString(),
    };
    dataDisplay2.textContent= selectedEdge.id;

    // Send PUT request to API
    $.ajax({
        url: `/api/edges/${selectedEdge.id}`, 
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(updatedEdgeData),
        success: function(response) {
            // Handle successful response

            var edgevis = {id: selectedEdge.id, 
                            from:updatedEdgeData.source_node_id,
                            to: updatedEdgeData.target_node_id,
                            label: updatedEdgeData.edge_type,
                            arrows: updatedEdgeData.arrow == 1 ? 'to' : '',
                            font: {align: 'middle'}}
                        

            data.edges.update(edgevis);
            console.log('Success!');
        },
        error: function(jqXHR, textStatus, errorThrown) {
            // Handle errors
            console.error('Error: ', textStatus, ', Details: ', errorThrown);
            console.error('Response: ', jqXHR.responseText);
        }
    });

    // Hide form
    document.getElementById('edgeUpdateDialogue').style.display = 'none';
});
