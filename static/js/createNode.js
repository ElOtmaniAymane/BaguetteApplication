// Conversion RGB to Hex color
function rgbToHex(r, g, b) {
    r = Math.floor(r * 255);
    g = Math.floor(g * 255);
    b = Math.floor(b * 255);
    return "#" + ((1 << 24) | ((r|0) << 16) | ((g|0) << 8) | (b|0)).toString(16).slice(1).toUpperCase();
}

var initCreateNodeButton = document.getElementById('init-create-node-button');
var createNodeButton = document.getElementById('create-node-button');
var cancelNodeButton = document.getElementById('cancel-node-button');
var form = document.getElementById('node-create-form');
const dataDisplay1 = document.getElementById('message');
var userId = localStorage.getItem('user_id') || localStorage.getItem('guest_id');

// Get the datalist element from the HTML
var nodeTypeList = document.getElementById('node-type-list');

// Add each node type as an option in the datalist
for (var nodeType in typeColorJson) {
    var option = document.createElement('option');
    option.value = nodeType;
    nodeTypeList.appendChild(option);
}

// Show the form when the initial "Create Node" button is clicked
initCreateNodeButton.addEventListener('click', function() {
    form.style.display = 'block';
    initCreateNodeButton.style.display = 'none';
});

var isCreatingNode = false;
var newNodePosition = null;

createNodeButton.addEventListener('click', function() {
    var nodeName = form.node_name.value;
    var nodeType = form.node_type.value;
    
    // Get color from typeColorJson
    var rgbColor = typeColorJson[nodeType];
    var nodeColor = rgbToHex(rgbColor[0], rgbColor[1], rgbColor[2]);

    // Check if the node type is valid
    if (nodeName === "" || nodeColor === undefined || nodeType === "") {
        alert("Please fill in all fields and ensure node type is valid");
        return;
    }

    var newNode = {
        color: nodeColor,
        node_name: nodeName,
        node_type: nodeType,
        user_id: userId,  // Include the user_id in the new node object
    };

    // Change cursor and set creating node mode
    document.body.style.cursor = 'crosshair';
    isCreatingNode = true;

    // Listen to network click only when creating node
    network.on("click", function(params) {
        if (isCreatingNode && params.nodes.length == 0) {
            // Get clicked position only when no node is clicked
            newNodePosition = params.pointer.canvas;
        }
    });

    // Wait for click on network to determine position and send POST request
    var interval = setInterval(function() {
        if (newNodePosition) {
            clearInterval(interval);
            
            var newNodeVis = {
                label: nodeName + " ("+ nodeType+")", 
                color: nodeColor,
                x: newNodePosition.x,
                y: newNodePosition.y,
            };
            
            // Send POST request to your API
            $.ajax({
                url: '/api/nodes',  
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(newNode),
                success: function(nodeData) {
                    newNodeVis.id = nodeData.node_id;
                    // Add the new node to the vis.js network
                    try {
                        data.nodes.add(newNodeVis);
                        dataDisplay1.textContent = "Node created successfully";
                    } catch (error) {
                        dataDisplay1.textContent = error;
                    } 
                    console.log("dsdd" + JSON.stringify(nodesData));
 
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.error('Error: ', textStatus, ', Details: ', errorThrown);
                    console.error('Response: ', jqXHR.responseText);
                    dataDisplay1.textContent = 'Failed to create node!'; 
                }
            });

            // Reset variables and cursor
            isCreatingNode = false;
            newNodePosition = null;
            document.body.style.cursor = 'auto';
        }
    }, 100);

    // Hide the form and show the initial "Create Node" button
    form.reset();
    form.style.display = 'none';
    initCreateNodeButton.style.display = 'block';
});
cancelNodeButton.addEventListener('click', function(){
    form.reset();
    form.style.display = 'none';
    initCreateNodeButton.style.display = 'block';
});

// document.getElementById('submitImport').addEventListener('click', function() {
//     var importedData = JSON.parse(document.getElementById('importData').value);
//     var nodeMapping = {};

//     // First, delete all existing data
//     fetch('/api/nodes/user/' + userId, {
//         method: 'DELETE',
//     })
//     .then(response => {
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         // When deletion is successful, start importing new data

//         // First, create all the nodes
//         var nodePromises = importedData.map(function(node) {
//             // Get color from typeColorJson
//             var rgbColor = typeColorJson[node.node_type];
//             var nodeColor = rgbToHex(rgbColor[0], rgbColor[1], rgbColor[2]);

//             // Create node object to post
//             var nodeToPost = {
//                 color: nodeColor,
//                 node_name: node.node_name,
//                 node_type: node.node_type,
//                 user_id: userId,
//             };

//             return fetch('/api/nodes', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(nodeToPost),
//             })
//             .then(response => response.json())
//             .then(newNode => {
//                 // Map the old node ID to the new node ID
//                 nodeMapping[node.node_id] = newNode.node_id;
//             });
//         });

//         // After all the nodes have been created, create the edges
//         Promise.all(nodePromises).then(() => {
//             importedData.forEach(function(node) {
//                 if (node.outgoing_edges.length > 0) {
//                     node.outgoing_edges.forEach(function(edge) {
//                         var edgeToPost = {
//                             edge_type: edge.edge_type,
//                             source_node_id: nodeMapping[edge.source_node_id],
//                             target_node_id: nodeMapping[edge.target_node_id],
//                             user_id: userId,
//                         };

//                         fetch('/api/edges', {
//                             method: 'POST',
//                             headers: {
//                                 'Content-Type': 'application/json',
//                             },
//                             body: JSON.stringify(edgeToPost),
//                         })
//                         .then(response => {
//                             if (!response.ok) {
//                                 throw new Error(`HTTP error! status: ${response.status}`);
//                             }
//                             console.log('Edge created successfully!');
//                         })
//                         .catch(error => {
//                             console.error('Failed to create edge: ', error);
//                         });
//                     });
//                 }
//             });

//             // Close the import modal
//             $('#importModal').modal('hide');
//         })
//         .catch(error => {
//             console.error('Failed to create nodes: ', error);
//         });
//     })
//     .catch(error => {
//         console.error('Failed to delete nodes: ', error);
//     });
// });
document.getElementById('submitImport').addEventListener('click', async function() {
    var importedData = JSON.parse(document.getElementById('importData').value);

    // First, delete all existing data
    let deleteResponse = await fetch('/api/nodes/user/' + userId, { method: 'DELETE' });
    if (!deleteResponse.ok) {
        throw new Error(`HTTP error! status: ${deleteResponse.status}`);
    }

    let nodeMapping = {};
    let edgeQueue = [];

    // Create all nodes
    for(let nodeData of importedData) {
        let rgbColor = typeColorJson[nodeData.node_type];
        let nodeColor = rgbToHex(rgbColor[0], rgbColor[1], rgbColor[2]);
        
        let node = {
            color: nodeColor,
            node_name: nodeData.node_name,
            node_type: nodeData.node_type,
            user_id: userId,
        };
        
        let createResponse = await fetch('/api/nodes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(node),
        });

        if (!createResponse.ok) {
            throw new Error(`HTTP error! status: ${createResponse.status}`);
        }
        
        let createdNode = await createResponse.json();
        nodeMapping[nodeData.node_id] = createdNode.node_id;
        
        // Queue edges for creation
        for(let edge of nodeData.outgoing_edges) {
            edgeQueue.push({
                edge_type: edge.edge_type,
                source_node_id: nodeData.node_id,
                target_node_id: edge.target_node_id,
                arrow: edge.arrow
            });
        }
    }

    // Create all edges
    for(let edgeData of edgeQueue) {
        let edge = {
            arrow:edgeData.arrow,
            edge_type: edgeData.edge_type,
            source_node_id: nodeMapping[edgeData.source_node_id].toString(),
            target_node_id: nodeMapping[edgeData.target_node_id].toString(),
            user_id: userId,
        };
        
        let createResponse = await fetch('/api/edges', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(edge),
        });

        if (!createResponse.ok) {
            throw new Error(`HTTP error! status: ${createResponse.status}`);
        }
    }

    // Close the import modal
    $('#importModal').modal('hide');
    location.reload();

});
