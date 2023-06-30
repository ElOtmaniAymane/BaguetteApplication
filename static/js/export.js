document.addEventListener("DOMContentLoaded", (event) => {
    const userId = localStorage.getItem("user_id") || localStorage.getItem("guest_id");
    const exportModal = document.getElementById("exportModal");
    const exportData = document.getElementById("exportData");
    const copyBtn = document.getElementById("copyBtn");
    const closeBtn = document.getElementById("closedd");
    console.log(closeBtn);
    document.getElementById("export").addEventListener("click", function() {
      fetch("/api/users/export/" + userId)
        .then((response) => response.json())
        .then((data) => {
          exportData.textContent = JSON.stringify(data, null, 2);
          exportModal.style.display = "block";
        });
    });
  
    copyBtn.addEventListener("click", function() {
      copyToClipboard(exportData);
    });
    closeBtn.addEventListener("click", function() {
        console.log("dd")
        exportModal.style.display = "none";
      });
    
    function copyToClipboard(element) {
      let textArea = document.createElement("textarea");
      textArea.value = element.textContent;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      alert("Copied the text: " + textArea.value);
    }
  
    exportModal.addEventListener("click", function(event) {
      if (event.target === exportModal) {
        exportModal.style.display = "none";
      }
    });
  });
  