const NetworkContextMenu = (function() {
    // private properties
    let selectedNode = null;
    const contextMenu = document.getElementById('context-menu');
    const contextMenuUpdateItem = document.getElementById('updateNode');
    
    const nodeDialog = document.getElementById('node-dialog');
    const form = document.getElementById('node-update-form');
    const submitButton = form.querySelector('input[type="submit"]');
    const dataDisplay1 = document.getElementById('message');
    const dataDisplay2 = document.getElementById('message');

    const deleteNodeMenuItem = document.getElementById('deleteNode'); // supposez que vous avez ajouté un id="deleteNode" à votre menu item
    const formCreateEdge = document.getElementById('edge-form');
    const submitButtonCreateEdge = formCreateEdge.querySelector('input[type="submit"]');
    
    // const submitButtonCreateArrow = formCreateEdge.querySelector('input[type="submit"]');
    const contextMenuCreateEdgeItem = document.getElementById('createEdge'); // Assuming you have this menu item
    const contextMenuCreateArrowItem = document.getElementById('createArrow'); // Assuming you have this menu item
    
    const edgeDialog = document.getElementById('edge-dialog');
    const edgeTypeSelect = document.getElementById('edge-type-select');

    var userId = localStorage.getItem('user_id') || localStorage.getItem('guest_id');

// Add this method



    // private methods
    function hideContextMenuIfClickedOutside(event) {
        const isClickInside = contextMenu.contains(event.target);
        if (!isClickInside) {
            contextMenu.style.display = 'none';
        }
    }

    function handleContextMenu(params) {
        params.event.preventDefault();
        const nodeId = network.getNodeAt(params.pointer.DOM);
        if (nodeId) {
            selectedNode = nodeId;
            contextMenu.style.display = 'block';
            contextMenu.style.left = `${params.pointer.DOM.x}px`;
            contextMenu.style.top = `${params.pointer.DOM.y + 200}px`;
        }
        document.addEventListener('click', hideContextMenuIfClickedOutside);
    }

    function handleUpdateClick() {
        if (selectedNode) {
            showUpdateForm(selectedNode);
            contextMenu.style.display = 'none';
            nodeDialog.style.display = 'block';
            nodeDialog.style.left = contextMenu.style.left;
            nodeDialog.style.top = contextMenu.style.top;
        }
    }

    function handleFormClick(event) {
        const isClickInside = nodeDialog.contains(event.target);
        const isClickOnContextMenu = contextMenu.contains(event.target);
        if (!isClickInside && !isClickOnContextMenu) {
            nodeDialog.style.display = 'none';
        }
    }

    function handleSubmitClick(event) {
        event.preventDefault();
        var nodeData = nodesData.find(node => node.node_id === selectedNode);
        if (nodeData) {
            nodeData.node_name = form.node_name.value;
            nodeData.color = form.color.value;
            nodeData.node_type = form.node_type.value;
            var newNode = { 
                id: selectedNode,
                label: `${nodeData.node_name} (${nodeData.node_type})`,
                color: nodeData.color,
            };
            try {
                data.nodes.update(newNode);
                dataDisplay1.textContent = "ouioui";
            } catch (error) {
                dataDisplay1.textContent = error;
            }  
    
            // New: Send PUT request to your API
            var updatedNode = {
                color: nodeData.color,
                node_name: nodeData.node_name,
                node_type: nodeData.node_type,
            };
            $.ajax({
                url: '/api/nodes/' + selectedNode, 
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(updatedNode),
                success: function(response) {
                    // Handle server response
                    nodeDialog.style.display = 'none';
                    dataDisplay1.textContent = "Node updated successfully";
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.error('Error: ', textStatus, ', Details: ', errorThrown);
                    console.error('Response: ', jqXHR.responseText);
                    dataDisplay1.textContent = 'Failed to update node!'; 
                }
            });
        }
    }
    

    function showUpdateForm(nodeId) {
        var nodeData = nodesData.find(node => node.node_id === nodeId);
        if (nodeData) {
            form.node_name.value = nodeData.node_name;
            form.color.value = nodeData.color;
            form.node_type.value = nodeData.node_type;
            document.addEventListener('click', handleFormClick);
            submitButton.onclick = handleSubmitClick;
        }
    }
    function handleDeleteNodeClick() {
        if (selectedNode) {
            // Supprimez le noeud de votre réseau vis.js

    
            // Envoyez une requête DELETE à votre API
            fetch(`/api/nodes/${selectedNode}`, {
                method: 'DELETE',
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                try {
                    // Supprimez d'abord les edges connectés
                    var connectedEdges = network.getConnectedEdges(selectedNode);
                    data.edges.remove(connectedEdges);
        
                    // Ensuite, supprimez le noeud
                    data.nodes.remove({id: selectedNode});
                    dataDisplay1.textContent = "ouioui";
                } catch (error) {
                    dataDisplay1.textContent = error;
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
    
            contextMenu.style.display = 'none';
        }
    }
    let selectedSourceNode = null;
    let selectedTargetNode = null;
    let isSelectingSecondNode = false;
    let edgeFormClickListenerRegistered = false;

    function getNodeTypeFromLabel(label) {
        const labelParts = label.split(" (");
        const nodeType = labelParts[1].slice(0, -1);
        return nodeType;
    }
    
    function handleCreateEdgeClick() {
        if (selectedNode) {
            showCreateEdgeOrArrowForm(selectedNode, 0);
            contextMenu.style.display = 'none';
            selectedSourceNode = selectedNode;
    
            // Get the position of the node
            const position = network.getPositions([selectedNode])[selectedNode];
    
            // Convert the position to DOM coordinates
            const DOMPosition = network.canvasToDOM(position);
    
            // Get the dialog
            const dialog = document.getElementById('select-second-node-dialog');
    
            // Position the dialog
            dialog.style.left = `${DOMPosition.x}px`;
            dialog.style.top = `${DOMPosition.y + 180}px`;
    
            // Show the dialog
            dialog.style.display = 'block';
        }
    }
    
    function handleEdgeFormClick(event) {
        const isClickInside = edgeDialog.contains(event.target);
        const isClickOnContextMenu = contextMenu.contains(event.target);
        if (!isClickInside && !isClickOnContextMenu) {
            edgeDialog.style.display = 'none';
            document.removeEventListener('click', handleEdgeFormClick);
            edgeFormClickListenerRegistered = false;
        }
    }
    
    document.getElementById('select-second-node-button').addEventListener('click', function(event) {
        // Hide the dialog
        document.getElementById('select-second-node-dialog').style.display = 'none';
    
        // Change cursor
        document.body.style.cursor = 'crosshair';
    
        // Set the state to selecting the second node
        isSelectingSecondNode = true;
        network.on('click', function(params) {
            handleNodeClickForEdge(params, 0);
        });
        
    });
    
    function handleNodeClickForEdge(params, arrow) {
        console.log("reda");
        if (params.nodes.length > 0 && isSelectingSecondNode) {
            selectedTargetNode = params.nodes[0];
    
            // Reset cursor
            document.body.style.cursor = 'default';
    
            // Reset the state
            isSelectingSecondNode = false;
    
            // Call API to create edge
            const sourceNodeType = getNodeTypeFromLabel(data.nodes.get(selectedSourceNode).label);  
            const targetNodeType = getNodeTypeFromLabel(data.nodes.get(selectedTargetNode).label);  
            populateEdgeTypeSelect(sourceNodeType, targetNodeType);
    
            // Show the dialog to select edge type and create edge
            edgeDialog.style.left = `${params.pointer.DOM.x}px`;
            edgeDialog.style.top = `${params.pointer.DOM.y}px`;
            edgeDialog.style.display = 'block';
            dataDisplay2.style.display = 'block';
            dataDisplay2.innerHTML = "raha khdama"
        }
    }
    
    function populateEdgeTypeSelect(sourceNodeType, targetNodeType) {
        console.log("redawani")
        const edgeTypeSelect = document.getElementById('edge-type-select');
        edgeTypeSelect.innerHTML = '';
    
        const possibleEdgeTypes = edgeData.filter(edge => 
            (edge[1].includes(sourceNodeType) || edge[1].includes(targetNodeType)) &&
            (edge[2].includes(sourceNodeType) || edge[2].includes(targetNodeType))
        );
    
        for (let edge of possibleEdgeTypes) {
            const option = document.createElement('option');
            option.value = edge[0];
            option.text = edge[0];
            edgeTypeSelect.appendChild(option);
        }
    }
    
    // Continue with the rest of your code...
    
function showCreateEdgeOrArrowForm(nodeId, arrow) {
    if (nodeId) {
        if (arrow ==0){
            submitButtonCreateEdge.value = "Add Edge"
        }
        else {
            submitButtonCreateEdge.value = "Add Arrow"
        }
        const edgeFields = document.getElementById('edge-fields');
        const edgeExpression = document.getElementById('edge-expression');
        edgeExpression.value = '';
        edgeFields.innerHTML = '';
        addEdgeField('');
        document.getElementById('add-type-button').addEventListener('click', addEdgeField);
        document.getElementById('or-button').addEventListener('click', () => {
            addOperatorField(' | ');
        });

        document.getElementById('and-button').addEventListener('click', () => {
            addOperatorField(' & ');
        });

        document.getElementById('open-parenthesis-button').addEventListener('click', () => {
            addOperatorField(' ( ');
        });

        document.getElementById('close-parenthesis-button').addEventListener('click', () => {
            addOperatorField(' ) ');
        });

        function addOperatorField(operator) {
            const operatorSpan = document.createElement('span');
            operatorSpan.textContent = operator;
            operatorSpan.dataset.value = operator;
            edgeFields.appendChild(operatorSpan);
        }

        function addEdgeField() {
            const newField = document.createElement('input');
            newField.type = 'text';
            newField.name = 'edge_type';
            newField.placeholder = 'Edge type';
            edgeFields.appendChild(newField);
            newField.addEventListener('input', updateEdgeExpression);
        }

        // function updateEdgeExpression() {
        //     let expression = '';
        //     for (let i = 0; i < edgeFields.childNodes.length; i++) {
        //         const node = edgeFields.childNodes[i];
        //         if (node.nodeName === 'INPUT' && node.value) {
        //             expression += node.value;
        //         } else if (node.nodeName === 'SPAN') {
        //             expression += node.dataset.value;
        //         }
        //         if (i < edgeFields.childNodes.length - 1) {
        //             expression += ' ';
        //         }
        //     }
        //     edgeExpression.value = expression;
        // }
        edgeTypeSelect.addEventListener('change', updateEdgeExpression);

        function updateEdgeExpression() {
            edgeExpression.value = edgeTypeSelect.value;
            console.log("si7loulan")
        }

        if (!edgeFormClickListenerRegistered) {
            document.addEventListener('click', handleEdgeFormClick);
            edgeFormClickListenerRegistered = true;
        }
            document.getElementById('clear-button').addEventListener('click', () => {
            edgeExpression.value = '';
            edgeFields.innerHTML = '';
            addEdgeField('');  
        });
    }
}


// Add event listener to new "Create Edge" button
document.getElementById("create-edge1").addEventListener('click', function(event) {
    event.preventDefault();
    // Hide form
    edgeDialog.style.display = 'none';
    // Create edge
    createEdge(selectedSourceNode, selectedTargetNode, submitButtonCreateEdge.value == "Add Arrow" ? 1 : 0);
    selectedSourceNode = null;
    selectedTargetNode = null;
});


function createEdge(sourceNodeId, targetNodeId, arrow) {
    let edgeExpression = document.getElementById('edge-expression').value;
    var edgeFormule = {
        arrow: arrow,
        edge_type: edgeExpression,
        source_node_id: sourceNodeId.toString(),
        target_node_id: targetNodeId.toString(),
        user_id: userId, // Retrieve the user_id from localStorage

    }
    
    $.ajax({
        url: '/api/edges',  // Your API endpoint to create the edge
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(edgeFormule),
        success: function(response) {
            try {
                data.edges.add({
                    id:edgeFormule.edge_id,
                    from: edgeFormule.source_node_id, 
                    to: edgeFormule.target_node_id,
                    label: edgeFormule.edge_type,
                    arrows: edgeFormule.arrow == 1 ? 'to' : '',
                    font: {align: 'middle'}
                  });
                dataDisplay2.textContent = "ouioui";
            } catch (error) {
                dataDisplay2.textContent = error;
            }  


            // network.setData(data);

            console.log('Success!');
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error('Error: ', textStatus, ', Details: ', errorThrown);
            console.error('Response: ', jqXHR.responseText);
        }
    });
}


    


    // public methods
    return {
        init: function() {
            network.on("oncontext", handleContextMenu);
            contextMenuUpdateItem.addEventListener('click', handleUpdateClick);
            contextMenuCreateEdgeItem.addEventListener('click', handleCreateEdgeClick);
            deleteNodeMenuItem.addEventListener('click', handleDeleteNodeClick); 
            // contextMenuCreateArrowItem.addEventListener('click', handleCreateArrowClick);
            // add event listener for delete
        }
    }
})();

// To use this module
NetworkContextMenu.init();

