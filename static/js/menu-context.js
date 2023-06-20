import * as operations from "./operations.js"
export const NetworkContextMenu = (function() {
    // private properties
    let selectedNode = null;
    const contextMenu = document.getElementById('context-menu');
    const contextMenuUpdateItem = document.getElementById('updateNode');
    const deleteNodeMenuItem = document.getElementById('deleteNode'); // supposez que vous avez ajouté un id="deleteNode" à votre menu item
    const contextMenuCreateEdgeItem = document.getElementById('createEdge'); // Assuming you have this menu item
    const contextMenuCreateArrowItem = document.getElementById('createArrow'); // Assuming you have this menu item
    const nodeDialog = document.getElementById('node-dialog');
    const edgeDialog = document.getElementById('edge-dialog');
    const form = document.getElementById('node-update-form');
    const submitButton = form.querySelector('input[type="submit"]');
    const dataDisplay1 = document.getElementById('message');
    const dataDisplay2 = document.getElementById('message');
    const formCreateEdge = document.getElementById('edge-form');
    const submitButtonCreateEdge = formCreateEdge.querySelector('input[type="submit"]');
    var userId = localStorage.getItem('user_id') || localStorage.getItem('guest_id');

    // rest of the functions and logic
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
            contextMenu.style.top = `${params.pointer.DOM.y}px`;
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

    // public methods
    return {
        init: function() {
            network.on("oncontext", handleContextMenu);
            contextMenuUpdateItem.addEventListener('click', handleUpdateClick);
            contextMenuCreateEdgeItem.addEventListener('click', operations.handleCreateEdgeClick);
            deleteNodeMenuItem.addEventListener('click', operations.handleDeleteNodeClick); 
            contextMenuCreateArrowItem.addEventListener('click', operations.handleCreateArrowClick);
            // add event listener for delete
        },
        handleFormClick
    }
})();

// To use this module
