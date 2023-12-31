   
   import { NetworkContextMenu } from './menu-context.js';
   NetworkContextMenu.init();

   export function handleSubmitClick(event) {
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
    

    export function showUpdateForm(nodeId) {
        var nodeData = nodesData.find(node => node.node_id === nodeId);
        if (nodeData) {
            form.node_name.value = nodeData.node_name;
            form.color.value = nodeData.color;
            form.node_type.value = nodeData.node_type;
            document.addEventListener('click', NetworkContextMenu.handleFormClick);
            submitButton.onclick = handleSubmitClick;
        }
    }
    export function handleDeleteNodeClick() {
        if (selectedNode) {
            // Supprimez le noeud de votre réseau vis.js
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
    
            // Envoyez une requête DELETE à votre API
            fetch(`/api/nodes/${selectedNode}`, {
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
    
            contextMenu.style.display = 'none';
        }
    }
    
    let selectedSourceNode = null;
let selectedTargetNode = null;

export function handleCreateEdgeClick() {
    if (selectedNode) {
        showCreateEdgeOrArrowForm(selectedNode, 0);
        contextMenu.style.display = 'none';
        edgeDialog.style.display = 'block';
        edgeDialog.style.left = contextMenu.style.left;
        edgeDialog.style.top = contextMenu.style.top;
        selectedSourceNode = selectedNode;
        // Change cursor

    }
}
export function handleCreateArrowClick() {
    if (selectedNode) {
        showCreateEdgeOrArrowForm(selectedNode, 1);
        contextMenu.style.display = 'none';
        edgeDialog.style.display = 'block';
        edgeDialog.style.left = contextMenu.style.left;
        edgeDialog.style.top = contextMenu.style.top;
        selectedSourceNode = selectedNode;
        // Change cursor

    }
}
submitButtonCreateEdge.addEventListener('click', function(event) {
    event.preventDefault();  // Prevent form submission
    // Hide form
    edgeDialog.style.display = 'none';
    // Change cursor
    document.body.style.cursor = 'crosshair';
    // Wait for click on another node
    if (submitButtonCreateEdge.value == "Add Edge"){
    network.on('click', function(params) {
        handleNodeClickForEdge(params, 0);
    });}
    else {
        network.on('click', function(params) {
            handleNodeClickForEdge(params, 1);
        });
    }
});
export function handleEdgeFormClick(event) {
    const isClickInside = edgeDialog.contains(event.target);
    const isClickOnContextMenu = contextMenu.contains(event.target);
    if (!isClickInside && !isClickOnContextMenu) {
        edgeDialog.style.display = 'none';
    }
}
export function handleNodeClickForEdge(params, arrow) {

    if (params.nodes.length > 0) {
        selectedTargetNode = params.nodes[0];
        // Reset cursor
        document.body.style.cursor = 'default';
        // Remove click event listener
        network.off('click', handleNodeClickForEdge);
        // Call API to create edge
        createEdge(selectedSourceNode, selectedTargetNode, arrow);
        selectedSourceNode = null;
        selectedTargetNode = null;
    }
}
export function showCreateEdgeOrArrowForm(nodeId, arrow) {
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

        function updateEdgeExpression() {
            let expression = '';
            for (let i = 0; i < edgeFields.childNodes.length; i++) {
                const node = edgeFields.childNodes[i];
                if (node.nodeName === 'INPUT' && node.value) {
                    expression += node.value;
                } else if (node.nodeName === 'SPAN') {
                    expression += node.dataset.value;
                }
                if (i < edgeFields.childNodes.length - 1) {
                    expression += ' ';
                }
            }
            edgeExpression.value = expression;
        }

        document.addEventListener('click', handleEdgeFormClick);
        document.getElementById('clear-button').addEventListener('click', () => {
            edgeExpression.value = '';
            edgeFields.innerHTML = '';
            addEdgeField('');  
        });
    }
}





export function createEdge(sourceNodeId, targetNodeId, arrow) {
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
