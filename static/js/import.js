document.addEventListener('DOMContentLoaded', (event) => {
const userId = localStorage.getItem('user_id') || localStorage.getItem('guest_id');  // Retrieve the user_id or guest_id from localStorage
function rgbToHex(r, g, b) {
    r = Math.floor(r * 255);
    g = Math.floor(g * 255);
    b = Math.floor(b * 255);
    return "#" + ((1 << 24) | ((r|0) << 16) | ((g|0) << 8) | (b|0)).toString(16).slice(1).toUpperCase();
}
document.getElementById('import').addEventListener('click', function() {

            // document.getElementById('exportData').textContent = JSON.stringify(data, null, 2);
            $('#importModal').modal('show');

});
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
});

