var form = document.getElementById("cryptForm"), ghost = document.getElementById("ghost");

form.addEventListener("submit", function(event){
  event.preventDefault();
  console.log(event.target[0].value);
  getFromZerawApi(event.target[0].value);
  setTimeout(function(){
    ghost.select();
    if(document.execCommand('copy')){
      document.getElementById('notifCopy').style.display = "block";
    }
  }, 200);
});

function getFromZerawApi(elem) {
  let result;
  let xmlhttp = new XMLHttpRequest();

  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == XMLHttpRequest.DONE) {
      if (xmlhttp.status == 200) {
        var res = JSON.parse(xmlhttp.responseText);
        ghost.value = res.message;
      } else {
        console.error("Erreur pendant le cryptage");
      }
    }
  }
  xmlhttp.open("GET", "https://live.thiweb.com/api.php?code&str=" + encodeURIComponent(elem), true);
  xmlhttp.send();
}
