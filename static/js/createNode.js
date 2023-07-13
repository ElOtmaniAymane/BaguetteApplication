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
    // document.getElementById('exportData').textContent = JSON.stringify(data, null, 2);
    $('#createNodeModal').modal('show');
    form.style.display = 'block';
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
    network.once("click", function(params) {
        if (isCreatingNode && params.nodes.length == 0) {
            // Get clicked position only when no node is clicked
            newNodePosition = params.pointer.canvas;
        }
    });
    var clickHandler = function(e) {
        var myNetworkDiv = document.getElementById('my-network');
        
            // Check if the click event is outside the 'my-network' div
            if (!myNetworkDiv.contains(e.target)) {
                console.log("bokayo");
                network.off("click");
                // Reset variables and cursor
                isCreatingNode = false;
                newNodePosition = null;
                document.body.style.cursor = 'auto';
        
                // Reset form
                form.reset();
            }
            document.removeEventListener('click', clickHandler);

    };
    setTimeout(function() {
        document.addEventListener('click', clickHandler);
}, 100);
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

                    data.nodes.add(newNodeVis);

                    console.log("dsdd" + JSON.stringify(nodesData));
 
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.error('Error: ', textStatus, ', Details: ', errorThrown);
                    console.error('Response: ', jqXHR.responseText);
                }
            });

            // Reset variables and cursor
            isCreatingNode = false;
            newNodePosition = null;
            document.body.style.cursor = 'auto';
        }
    }, 100);
    $('#createNodeModal').modal('hide');

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

