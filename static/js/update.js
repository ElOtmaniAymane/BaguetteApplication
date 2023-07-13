const NetworkContextMenu = (function() {
    // private properties
    let selectedNode = null;
    const contextMenu = document.getElementById('context-menu');
    const contextMenuUpdateItem = document.getElementById('updateNode');
    
    const nodeDialog = document.getElementById('node-dialog');
    const form = document.getElementById('node-update-form');
    const submitButton = form.querySelector('input[type="submit"]');
    const dataDisplay2 = document.getElementById('message');

    const deleteNodeMenuItem = document.getElementById('deleteNode'); // supposez que vous avez ajouté un id="deleteNode" à votre menu item
    const formCreateEdge = document.getElementById('edge-form');
    const submitButtonCreateEdge = formCreateEdge.querySelector('input[type="submit"]');
    
    // const submitButtonCreateArrow = formCreateEdge.querySelector('input[type="submit"]');
    const contextMenuCreateEdgeItem = document.getElementById('createEdge'); // Assuming you have this menu item
    const contextMenuCreateArrowItem = document.getElementById('createArrow'); // Assuming you have this menu item
    const dialog = document.getElementById('select-second-node-dialog');

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
            contextMenu.style.left = `${params.pointer.DOM.x +190}px`;
            contextMenu.style.top = `${params.pointer.DOM.y}px`;
        }
        document.addEventListener('click', hideContextMenuIfClickedOutside);
    }
    var updateNodeButton = document.getElementById('nodeUpdateButton');
    updateNodeButton.addEventListener('click', handleUpdateButtonClick);
    function handleUpdateButtonClick() {
        // Change the cursor
        document.body.style.cursor = 'crosshair';
    
        // Add a one-time event listener for the network
        network.once("click", function(params) {
            // Check if a node was clicked
            if (params.nodes.length > 0) {
                // If a node was clicked, use its id as the selected node
                selectedNode = params.nodes[0];
    
                // Call the handleCreateEdgeOrArrowClick function
                handleUpdateClick(selectedNode);
            }
    
            // Change the cursor back to default
            document.body.style.cursor = 'auto';
        });
        
    }
    function handleUpdateClick(node) {
        var nodeToUse = node || selectedNode;
        console.log("houna");
        if (nodeToUse) {
            
            showUpdateForm(nodeToUse);
            contextMenu.style.display = 'none';
            console.log("Nodes: ", network.body.data.nodes.getIds()); // Add this
            console.log("nodeToUse: ", nodeToUse);
            const position = network.getPositions([nodeToUse])[nodeToUse];
            console.log("position: ", position); // Add this

            const DOMPosition = network.canvasToDOM(position);
            console.log("DOMPosition: ", DOMPosition); // Add this

            nodeDialog.style.left = `${DOMPosition.x + 180}px`;
            nodeDialog.style.top = `${DOMPosition.y}px`;
            nodeDialog.style.display = 'block';

        }
    }

    function handleFormClick(event) {
        const isClickInside = nodeDialog.contains(event.target);
        const isClickOnContextMenu = contextMenu.contains(event.target);
        if (!isClickInside && !isClickOnContextMenu ) {
            nodeDialog.style.display = 'none';
            contextMenu.style.display = 'none';
            resetEdgeForm();
            document.removeEventListener('click', handleFormClick);

        }
    }

    function handleSubmitClick(event) {
        event.preventDefault();
        var nodeData = nodesData.find(node => node.node_id === selectedNode);
        if (nodeData) {
            nodeData.node_name = form.node_name.value;
            nodeData.color = form.color.value;
            // nodeData.node_type = form.node_type.value;
            var newNode = { 
                id: selectedNode,
                label: `${nodeData.node_name} (${nodeData.node_type})`,
                color: nodeData.color,
            };

                data.nodes.update(newNode);

    
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
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.error('Error: ', textStatus, ', Details: ', errorThrown);
                    console.error('Response: ', jqXHR.responseText);
                }
            });
        }
    }
    

    function showUpdateForm(nodeId) {
        var nodeData = nodesData.find(node => node.node_id === nodeId);
        if (nodeData) {
            form.node_name.value = nodeData.node_name;
            form.color.value = nodeData.color;
            // form.node_type.value = nodeData.node_type;
            setTimeout(function() {
                document.addEventListener('click', handleFormClick);
                edgeSecondFormClickListenerRegistered = true;
            }, 100);
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

                    // Supprimez d'abord les edges connectés
                    var connectedEdges = network.getConnectedEdges(selectedNode);
                    data.edges.remove(connectedEdges);
        
                    // Ensuite, supprimez le noeud
                    data.nodes.remove(selectedNode);
            })
            .then(() => {
                console.log("success");
            })
            .catch(e => {
                console.log('There was a problem with your fetch operation: ' + e.message);
            });
    
            contextMenu.style.display = 'none';
        }
    }
    const EDGE = 0;
    const ARROW = 1;
    let selectedSourceNode = null;
    let selectedTargetNode = null;
    let isSelectingSecondNode = false;
    let edgeFormClickListenerRegistered = false;
    let edgeSecondFormClickListenerRegistered = false;
    let currentActionType = EDGE;
    let typeSelectorCount = 0;
    let sourceNodeType = null;
    let targetNodeType = null;

    // Helper Functions
    function getNodeTypeFromLabel(label) {
        const labelParts = label.split(" (");
        return labelParts[1].slice(0, -1);
    }

    function resetEdgeForm() {
        // selectedSourceNode = null;
        // selectedTargetNode = null;
        // isSelectingSecondNode = false;
        // edgeFormClickListenerRegistered = false;
        // edgeSecondFormClickListenerRegistered = false;
        // currentActionType = EDGE;
        // typeSelectorCount = 0;
        // sourceNodeType = null;
        // targetNodeType = null;
    }
    
    function populateEdgeTypeSelect(sourceNodeType, targetNodeType, arrow, selectId) {
        console.log(arrowData);
        const edgeTypeSelect = document.getElementById(selectId);
        edgeTypeSelect.innerHTML = '';
    
        let possibleEdgeTypes;
        if (arrow == 1) {  // si c'est une flèche, utiliser arrowData
            possibleEdgeTypes = arrowData.filter(edge => {
                // Diviser les types de edge en listes de types individuels
                const edgeSourceTypes = edge[1].split(' | ');
                const edgeTargetTypes = edge[2].split(' | ');
                
                // Vérifier si le type de nœud source ou cible est présent dans les types de edge
                return edgeSourceTypes.includes(sourceNodeType) && edgeTargetTypes.includes(targetNodeType);
            });
        } else {  // si c'est une arête, utiliser edgeData
            possibleEdgeTypes = edgeData.filter(edge => 
                (edge[1].includes(sourceNodeType) || edge[1].includes(targetNodeType)) &&
                (edge[2].includes(sourceNodeType) || edge[2].includes(targetNodeType))
            );
        }
    
        for (let edge of possibleEdgeTypes) {
            const option = document.createElement('option');
            option.value = edge[0];
            option.text = edge[0];
            edgeTypeSelect.appendChild(option);
        }
    }
    function createEdge(sourceNodeId, targetNodeId, edgeExpression, arrow) {
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
                    var edgeId = response.edge_id;

                    data.edges.add({
                        id:edgeId,
                        from: edgeFormule.source_node_id, 
                        to: edgeFormule.target_node_id,
                        label: edgeFormule.edge_type,
                        arrows: edgeFormule.arrow == 1 ? 'to' : '',
                        font: {align: 'middle'}
                      });
                    resetEdgeForm()
                } catch (error) {
                    alert("Something Went Wrong : edge's creation failed")
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
    function showCreateEdgeOrArrowForm(nodeId, arrow) {
        if (nodeId) {
            const submitButtonCreateEdge = document.getElementById('create-edge');
            const edgeTypeSelect = document.getElementById(`edge-type-select-0`);
    
            if (arrow == 0) {
                submitButtonCreateEdge.value = "Add Edge";
            }
            else {
                submitButtonCreateEdge.value = "Add Arrow";
            }
    
            edgeTypeSelect.value = '';
            const sourceNodeType = getNodeTypeFromLabel(data.nodes.get(nodeId).label);  
            populateEdgeTypeSelect(sourceNodeType, sourceNodeType, arrow, edgeTypeSelect.id);
    
            // Reset number of type selectors
            typeSelectorCount = 0;
    
            // Clear out any extra type selectors
            const typeSelectorsDiv = document.getElementById('type-selectors');
            while (typeSelectorsDiv.children.length > 1) {
                typeSelectorsDiv.removeChild(typeSelectorsDiv.lastChild);
            }
    

        }
    }
    function handleCreateEdgeOrArrowClick(arrow, selectedNodeInput) {
        // Utilisez selectedNodeInput s'il est fourni, sinon utilisez selectedNode
        var nodeToUse = selectedNodeInput || selectedNode;
    
        if (nodeToUse) {
    
            showCreateEdgeOrArrowForm(nodeToUse, arrow);
            contextMenu.style.display = 'none';
            selectedSourceNode = nodeToUse;
            currentActionType = arrow;
            // Get the position of the node
            const position = network.getPositions([nodeToUse])[nodeToUse];
    
            // Convert the position to DOM coordinates
            const DOMPosition = network.canvasToDOM(position);
    
            // Get the dialog
    
            // Position the dialog
            dialog.style.left = `${DOMPosition.x + 180}px`;
            dialog.style.top = `${DOMPosition.y}px`;
    
            // Show the dialog
            dialog.style.display = 'block';
            if (!edgeFormClickListenerRegistered) {
                console.log("waterrr");
                // Add a delay before registering the click event
                setTimeout(function() {
                    document.addEventListener('click', handleSecondEdgeFormClickOutside);
                    edgeSecondFormClickListenerRegistered = true;
                }, 100);
            }
    
            // Si selectedNodeInput a été fourni, vous pouvez ajouter des actions supplémentaires ici

        }
    }
    // Select the new button
    function handleButtonClick(actionType) {
        // Change the cursor
        document.body.style.cursor = 'crosshair';
    
        // Add a one-time event listener for the network
        network.once("click", function(params) {
            // Check if a node was clicked
            if (params.nodes.length > 0) {
                // If a node was clicked, use its id as the selected node
                selectedNode = params.nodes[0];
    
                // Call the handleCreateEdgeOrArrowClick function
                handleCreateEdgeOrArrowClick(actionType, selectedNode);
            }
    
            // Change the cursor back to default
            document.body.style.cursor = 'auto';
        });
    }
    
    var createEdgeButton = document.getElementById('create-edge-button');
    var createArrowButton = document.getElementById('create-arrow-button');
    
    // Add an event listener for the buttons
    createEdgeButton.addEventListener('click', function() { handleButtonClick(EDGE); });
    createArrowButton.addEventListener('click', function() { handleButtonClick(ARROW); });
    
    function handleCreateEdgeClick() {
        handleCreateEdgeOrArrowClick(EDGE)
    }
    function handleCreateArrowClick() {
        handleCreateEdgeOrArrowClick(ARROW)
    }
    function handleEdgeFormClick(event) {
        console.log("fireer");
        const isClickInside = edgeDialog.contains(event.target);
        if (!isClickInside ) {
            edgeDialog.style.display = 'none';
            document.removeEventListener('click', handleEdgeFormClick);
            edgeFormClickListenerRegistered = false;
            resetEdgeForm();
        }
    }
    function handleSecondEdgeFormClickOutside(event) {
        console.log("fireer");
        const isClickOnsecond = dialog.contains(event.target);
        if (!isClickOnsecond) {
            dialog.style.display = 'none';
            document.removeEventListener('click', handleSecondEdgeFormClickOutside);
            edgeSecondFormClickListenerRegistered = false;
            resetEdgeForm();
        }
    }
    function handleAddTypeButtonClick() {
        const newSelect = document.createElement('select');
        typeSelectorCount++;
        console.log(typeSelectorCount);
        newSelect.id = `edge-type-select-${typeSelectorCount}`;
        newSelect.name = 'edge_type';
        newSelect.className = "border-slate-900 w-40 rounded-3xl border border-solid bg-gray-300 p-3 text-black hover:bg-teal-600 active:bg-teal-500 dark:border-none";
        document.getElementById('type-selectors').appendChild(newSelect);

        // Populate new select element
        populateEdgeTypeSelect(sourceNodeType, targetNodeType, currentActionType, newSelect.id);
    
        // Add new select element to DOM
    
    }

    function handleRemoveTypeButtonClick(){
        if (typeSelectorCount > 0) {
            // Remove last select element from DOM
            const lastSelect = document.getElementById(`edge-type-select-${typeSelectorCount}`);
            document.getElementById('type-selectors').removeChild(lastSelect);
    
            typeSelectorCount--;
        }
    }

    function handleCreateEdgeButtonClick(event){
        event.preventDefault();

        // Create edge expression from all select elements
        let edgeExpression = '';
        for (let i = 0; i < typeSelectorCount + 1; i++) {
            edgeExpression += document.getElementById(`edge-type-select-${i}`).value;
    
            // Add '|' operator between types, but not after the last type
            if (i < typeSelectorCount ) {
                edgeExpression += ' | ';
            }
        }
    
        // Check if all choices are distinct and not empty
        let selectValues = [];
        for (let i = 0; i < typeSelectorCount + 1; i++) {
            const value = document.getElementById(`edge-type-select-${i}`).value;
            if (value === '' || selectValues.includes(value)) {
                // Handle error (e.g. show an alert to the user)
                alert('All choices must be distinct and not empty');
                return;
            }
            selectValues.push(value);
        }
    
        // Create edge
        createEdge(selectedSourceNode, selectedTargetNode, edgeExpression, currentActionType);
        edgeDialog.style.display = "none";
    }


    
    function handleSelectSecondNodeButtonClick() {
        // Hide the dialog
        document.getElementById('select-second-node-dialog').style.display = 'none';

        // Change cursor
        document.body.style.cursor = 'crosshair';
    
        // Set the state to selecting the second node
        isSelectingSecondNode = true;
        const clickHandler = function(params) {
            handleNodeClickForEdge(params, currentActionType);
            network.off('click', clickHandler);  // Remove the event listener
        };
    
        network.on('click', clickHandler);
    }

    
    function handleNodeClickForEdge(params, arrow) {
        console.log("reda");
        if (params.nodes.length > 0 && isSelectingSecondNode) {
            selectedTargetNode = params.nodes[0];
    
            // Reset cursor
            document.body.style.cursor = 'default';
    
            // Reset the state
            isSelectingSecondNode = false;
    
            // Call API to create edge
    
            sourceNodeType = getNodeTypeFromLabel(data.nodes.get(selectedSourceNode).label);  
            targetNodeType = getNodeTypeFromLabel(data.nodes.get(selectedTargetNode).label);  
    
            const selectId = `edge-type-select-${typeSelectorCount}`;
            populateEdgeTypeSelect(sourceNodeType, targetNodeType, arrow, selectId);
    
            // Show the dialog to select edge type and create edge
            edgeDialog.style.left = `${params.pointer.DOM.x}px`;
            edgeDialog.style.top = `${params.pointer.DOM.y}px`;
            edgeDialog.style.display = 'block';
    
            if (!edgeFormClickListenerRegistered) {
                console.log("waterrr");
                // Add a delay before registering the click event
                setTimeout(function() {
                    document.addEventListener('click', handleEdgeFormClick);
                    edgeFormClickListenerRegistered = true;
                }, 100);
            }
        }
    }
    
    document.getElementById('add-type-button').addEventListener('click', handleAddTypeButtonClick);
    document.getElementById('remove-type-button').addEventListener('click', handleRemoveTypeButtonClick);
    document.getElementById('create-edge').addEventListener('click', handleCreateEdgeButtonClick);
    document.getElementById('select-second-node-button').addEventListener('click', handleSelectSecondNodeButtonClick);
    


// Add event listener to new "Create Edge" button
// document.getElementById("create-edge1").addEventListener('click', function(event) {
//     event.preventDefault();
//     // Hide form
//     edgeDialog.style.display = 'none';
//     // Create edge
//     createEdge(selectedSourceNode, selectedTargetNode, submitButtonCreateEdge.value == "Add Arrow" ? 1 : 0);
//     selectedSourceNode = null;
//     selectedTargetNode = null;
// });





    


    // public methods
    return {
        init: function() {
            network.on("oncontext", handleContextMenu);
            contextMenuUpdateItem.addEventListener('click', function() {
                handleUpdateClick();
            });
            contextMenuCreateEdgeItem.addEventListener('click', handleCreateEdgeClick);
            deleteNodeMenuItem.addEventListener('click', handleDeleteNodeClick); 
            contextMenuCreateArrowItem.addEventListener('click', handleCreateArrowClick);
            // add event listener for delete
        }
    }
})();

// To use this module
NetworkContextMenu.init();

