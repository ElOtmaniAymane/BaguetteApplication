document.addEventListener("DOMContentLoaded", (event) => {
  const userId =
    localStorage.getItem("user_id") || localStorage.getItem("guest_id"); // Retrieve the user_id or guest_id from localStorage
  document
    .getElementById("clear-button")
    .addEventListener("click", function () {
      console.log("clicked");
      // Use the fetch API to send the DELETE request
      fetch(`/api/nodes/user/${userId}`, {
        method: "DELETE",
      }).then((response) => {
        if (response.ok) {
          // If the response was successful, clear the nodes on the page
          console.log(`Nodes for user_id ${userId} successfully deleted`);
          data.nodes.clear();
          data.edges.clear();
          network.setData(data);
          // Here you might need to add code to clear the nodes visually from the page
        } else {
          console.error(`Error: ${response.statusText}`);
        }
      });
    });
});
