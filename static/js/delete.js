// const handleDeleteNodeClick = function() {
//     if (selectedNode) {
//         // Supprimez le noeud de votre réseau vis.js
//         try {
//             // Supprimez d'abord les edges connectés
//             var connectedEdges = network.getConnectedEdges(selectedNode);
//             data.edges.remove(connectedEdges);

//             // Ensuite, supprimez le noeud
//             data.nodes.remove({id: selectedNode});
//             dataDisplay1.textContent = "ouioui";
//         } catch (error) {
//             dataDisplay1.textContent = error;
//         }

//         // Envoyez une requête DELETE à votre API
//         fetch(`/api/nodes/${selectedNode}`, {
//             method: 'DELETE',
//         })
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }
//             return response.json(); // or .text() or .blob() ...
//         })
//         .then(() => {
//             // Ensuite, rechargez votre page ou récupérez de nouvelles données pour mettre à jour votre page
//             location.reload();
//         })
//         .catch(e => {
//             console.log('There was a problem with your fetch operation: ' + e.message);
//         });

//         contextMenu.style.display = 'none';
//     }
// }

// NetworkContextMenu.deleteNodeMenuItem.addEventListener('click', handleDeleteNodeClick);
