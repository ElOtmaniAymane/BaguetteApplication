// var saveButton = document.getElementById('save-button');
// saveButton.addEventListener('click', function() {
// // Récupérer l'état actuel des nœuds dans la base de données
// $.ajax({
// url: '/api/nodes',  // Votre point de terminaison de l'API pour obtenir les nœuds
// type: 'GET',
// success: function(response) {
//     var currentNodes = JSON.stringify(response, null, 2);
//     var messageElement = document.getElementById('message');
//     messageElement.textContent = 'Success!';
//     // Pour chaque nœud dans le tableau nodesData...
//     for (var i = 0; i < nodesData.length; i++) {
//         var node = nodesData[i];
//         var nodejson={color: node.color,
//                       node_name: node.node_name,
//                       node_type: node.node_type,
//                       node_id: node.node_id}  // ajout de node_id dans nodejson
//         // Si le nœud existe déjà dans la base de données, le mettre à jour
//         if (JSON.parse(currentNodes).find(function(n) { return n.node_id == node.node_id; })) {
//             $.ajax({
//                 url: '/api/nodes/' + node.node_id,  // Votre point de terminaison de l'API pour mettre à jour le nœud
//                 type: 'PUT',
//                 contentType: 'application/json',
//                 data: JSON.stringify(nodejson),
//                 success: function(response) {
//                     // Gérer la réponse du serveur
//                     messageElement.textContent = 'Success1!';
//                 },
//                 error: function(jqXHR, textStatus, errorThrown) {
//                     console.error('Error: ', textStatus, ', Details: ', errorThrown);
//                     console.error('Response: ', jqXHR.responseText);

//                     // Mettre à jour l'élément HTML avec le message d'échec
//                     messageElement.textContent = 'Failed1!';
//                 }
//             });
//         }
//         // Si le nœud n'existe pas dans la base de données, l'ajouter
//         else {
//             $.ajax({
//                 url: '/api/nodes',  // Votre point de terminaison de l'API pour ajouter le nœud
//                 type: 'POST',
//                 contentType: 'application/json',
//                 data: JSON.stringify(nodejson),
//                 success: function(response) {
//                     // Gérer la réponse du serveur
//                     messageElement.textContent = 'Success!2';
//                 },
//                 error: function(jqXHR, textStatus, errorThrown) {
//                     console.error('Error: ', textStatus, ', Details: ', errorThrown);
//                     console.error('Response: ', jqXHR.responseText);

//                     // Mettre à jour l'élément HTML avec le message d'échec
//                     messageElement.textContent = 'Failed2!';
//                 }
//             });
//         }
//     }
// },
// });

// });
