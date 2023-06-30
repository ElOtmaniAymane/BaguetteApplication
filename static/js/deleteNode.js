
document.addEventListener('DOMContentLoaded', (event) => {

var deleteNodeButton = document.getElementById('delete-node-button');

deleteNodeButton.addEventListener('click', function() {
    // Change the cursor
    document.body.style.cursor = 'crosshair';

    // Add a one-time event listener for the network
    network.once("click", function(params) {
        // Check if a node was clicked
        if (params.nodes.length > 0) {
            // If a node was clicked, use its id as the selected node
            var selectedNode = params.nodes[0];

            // Call the handleDeleteNodeClick function
            handleDeleteNodeClick(selectedNode);
        }

        // Change the cursor back to default
        document.body.style.cursor = 'auto';
    });
    var clickHandler = function(e) {
        var myNetworkDiv = document.getElementById('my-network');
        
            // Check if the click event is outside the 'my-network' div
            if (!myNetworkDiv.contains(e.target)) {
                console.log("bokayo");
                network.off("click");
                // Reset variables and cursor

                document.body.style.cursor = 'auto';
        

            }
            document.removeEventListener('click', clickHandler);

    };
    setTimeout(function() {
        document.addEventListener('click', clickHandler);
}, 100);
});

function handleDeleteNodeClick(nodeId) {
   
    fetch(`/api/nodes/${nodeId}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        try {
            // First, remove the connected edges
            var connectedEdges = network.getConnectedEdges(nodeId);
            data.edges.remove(connectedEdges);

            // Then, remove the node
            data.nodes.remove({id: nodeId});
            console.log("Node deleted successfully");
        } catch (error) {
            console.error(error);
        }

})
.catch(e => {
    console.log('There was a problem with your fetch operation: ' + e.message);
});
    
    


}
});