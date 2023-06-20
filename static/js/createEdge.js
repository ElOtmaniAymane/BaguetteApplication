let selectedNode = null;
const contextMenu = document.getElementById('context-menu');
const contextMenuUpdateItem = document.getElementById('updateNode');

const nodeDialog = document.getElementById('node-dialog');
const form = document.getElementById('node-update-form');
// const submitButton = form.querySelector('input[type="submit"]');
const dataDisplay1 = document.getElementById('message');
const dataDisplay2 = document.getElementById('message');
const submitButtonCreateEdge = document.getElementById('add-edge');

const deleteNodeMenuItem = document.getElementById('deleteNode'); // supposez que vous avez ajouté un id="deleteNode" à votre menu item
const formCreateEdge = document.getElementById('edge-form');



// const submitButtonCreateArrow = formCreateEdge.querySelector('input[type="submit"]');
const contextMenuCreateEdgeItem = document.getElementById('createEdge'); // Assuming you have this menu item
const contextMenuCreateArrowItem = document.getElementById('createArrow'); // Assuming you have this menu item

const edgeDialog = document.getElementById('edge-dialog');
let selectedSourceNode = null;
let selectedTargetNode = null;
function getNodeTypeFromLabel(label) {
    const labelParts = label.split(" (");
    const nodeType = labelParts[1].slice(0, -1);  // Remove closing parenthesis
    return nodeType;
}

function handleCreateEdgeClick() {
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
function handleCreateArrowClick() {
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
function handleEdgeFormClick(event) {
    const isClickInside = edgeDialog.contains(event.target);
    const isClickOnContextMenu = contextMenu.contains(event.target);
    if (!isClickInside && !isClickOnContextMenu) {
        edgeDialog.style.display = 'none';
    }
}
function handleNodeClickForEdge(params, arrow) {

    if (params.nodes.length > 0) {
        selectedTargetNode = params.nodes[0];
        // Reset cursor
        document.body.style.cursor = 'default';
        // Remove click event listener
        // network.off('click', handleNodeClickForEdge);
        // Call API to create edge
        const sourceNodeType = getNodeTypeFromLabel(data.nodes.get(selectedSourceNode).label);  
        const targetNodeType = getNodeTypeFromLabel(data.nodes.get(selectedTargetNode).label);  
        console.log("prepopulate");
        populateEdgeTypeSelect(sourceNodeType, targetNodeType);
        console.log("postpopulate");


        // createEdge(selectedSourceNode, selectedTargetNode, arrow);
        // selectedSourceNode = null;
        // selectedTargetNode = null;
        if (edgeDialog.style.display != 'block') {
            // createEdge(selectedSourceNode, selectedTargetNode, arrow);
            // selectedSourceNode = null;
            // selectedTargetNode = null;
            edgeDialog.style.display = 'block';
            console.log(params.pointer.DOM.x)
            edgeDialog.style.left = `${params.pointer.DOM.x}px`;
            edgeDialog.style.top = `${params.pointer.DOM.y}px`;
            console.log("postblock");
            dataDisplay2.style.display = 'block';
            dataDisplay2.innerHTML = "raha khdama"
        }
    }
}
function populateEdgeTypeSelect(sourceNodeType, targetNodeType) {
    const edgeTypeSelect = document.getElementById('edge-type-select');
    edgeTypeSelect.innerHTML = '';  // Clear current options

    // Get possible edge types based on node types
    const possibleEdgeTypes = edgeData.filter(edge => 
        (edge[1].includes(sourceNodeType) || edge[1].includes(targetNodeType)) &&
        (edge[2].includes(sourceNodeType) || edge[2].includes(targetNodeType))
    );

    // Create a new option element for each possible edge type
    for (let edge of possibleEdgeTypes) {
        const option = document.createElement('option');
        option.value = edge[0];
        option.text = edge[0];
        edgeTypeSelect.appendChild(option);
    }
}
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
    console.log("hhhhhh");
    var userId = localStorage.getItem('user_id') || localStorage.getItem("guest_id");
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


contextMenuCreateEdgeItem.addEventListener('click', handleCreateEdgeClick);
