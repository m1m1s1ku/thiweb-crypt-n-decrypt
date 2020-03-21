let form = document.getElementById("cryptForm");
let  ghost = document.getElementById("ghost");

// On form submit
form.addEventListener("submit", function(event){
  event.preventDefault(); // Prevent default behavior
  getFromZerawApi(event.target[0].value.trim().replace(/\n/g,' ')); // Get asked string
  setTimeout(function(){
    ghost.select(); // Select input
    // Copy to user clipboard
    if(document.execCommand('copy')){
      document.getElementById('notifCopy').style.display = "block";
    }
  }, 200);
});

function getFromZerawApi(elem) {
  const xmlhttp = new XMLHttpRequest();

  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == XMLHttpRequest.DONE) {
      if (xmlhttp.status == 200) {
        let res = JSON.parse(xmlhttp.responseText);
        ghost.value = res.message; // Write in input response
      } else {
        console.error("Erreur pendant le cryptage");
      }
    }
  }
  xmlhttp.open("GET", "https://live.thiweb.com/api.php?code&str=" + encodeURIComponent(elem), true);
  xmlhttp.send();
}
