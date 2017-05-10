/**
 * ThiWeb Auto-decrypt | Chrome extension
 */

let getted = false; // Avoid multiple calls
let username;

/**
 * Check if the user is connected or not
 */
function checkConnect() {
  // connectExt is the id of the "Connexion" link
  if (document.getElementById('connectExt')) {
    return false;
  }
  return true;
}

/**
 * Get every code on the page
 */
function getAllLinks() {
  let codes = document.getElementsByTagName('code'); // Get all codes elements
  for (let i = 0; i < codes.length; i++) {
    codes[i].innerHTML = codes[i].innerHTML.trim(); // Remove spaces
    // If TWL code
    if (codes[i].innerHTML.startsWith("TWL2")) {
      getFromZerawApi(codes[i]); // Get current code from api
    }
  }
}

/**
 * Get if user has more than one post and getAllLinks() if good
 */
function getCount() {
  const req = new XMLHttpRequest();
  let username = document.getElementById('usernameExt').lastChild.innerHTML; // Get username on page

  let res;

  req.onreadystatechange = function(event) {
    if (this.readyState === XMLHttpRequest.DONE) {
      if (this.status === 200) {
        res = JSON.parse(this.responseText);
        // If user has more than 1 post -> Decrypt
        if (res.message >= 1) {
          getAllLinks(); // Get everything
        } else {
          createNotification(
            "Salut " + username, null, "Pour toute demande d'aide, ou faire fonctionner l'extension, file te présenter ;)", "https://forum.thiweb.com/viewforum.php?f=2");
        }
      }
    };
  }

  req.open("GET", "https://live.thiweb.com/api.php?posts&str=" + username, true);
  req.send(null);
}

function createNotification(title, icon, content, link) {
  if (icon === null) {
    icon = "https://forum.thiweb.com/styles/prosilver/theme/images/site_logo.png";
  }

  // Create notification
  let notification = new Notification(title, {
    icon: icon,
    body: content,
  });

  // Attach onclick event on it
  notification.onclick = function() {
    window.open(link);
  };
}

/**
 * Parse every url and replace it with <a>
 * @param strParse : String to parse
 */
function parseAndReplaceUrls(strParse) {
  const re = /^(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)/mgi;
  // Regex to find urls in string

  if (strParse !== undefined && strParse.match(re)) {
    let m;
    while ((m = re.exec(strParse)) !== null) {
      if (m.index === re.lastIndex) {
        re.lastIndex++;
      }

      m.forEach((match, groupIndex) => {
        // Replace match with url to make it clickable
        strParse = strParse.replace(match, "<a href=\"" + match + "\">" + match + "</a>");
      });
    }
  }
  return strParse;
}

/**
 * Get decoded strings from Zeraw's api
 * @param elem : HTML element
 */
function getFromZerawApi(elem) {
  const req = new XMLHttpRequest();

  req.onreadystatechange = function(event) {
    if (this.readyState === XMLHttpRequest.DONE) {
      if (this.status === 200) {
        let res = JSON.parse(this.responseText);
        // Parsing response
        res.message.raw = parseAndReplaceUrls(res.message.raw);
        if (res.message.raw !== undefined) {
          elem.innerHTML = res.message.raw;
        } else {
          elem.innerHTML = "Erreur pendant le décryptage automatique";
        }
      } else {
        console.error("Erreur serveur", this.status, this.statusText);
      }
    }
  };

  req.open("GET", "https://live.thiweb.com/api.php?decode&str=" + elem.innerHTML, true);
  req.send(null);
}

chrome.extension.sendMessage({}, function(response) {
  let readyStateCheckInterval = setInterval(function() {
    if (document.readyState === "complete") {
      if (checkConnect() && !getted) {
        getCount();
        getted = true; // Done !
      } else {
        createNotification(
          "Non connecté", null,
          "Pour faire fonctionner l'extension, connecte toi ;)",
          "https://forum.thiweb.com/ucp.php?mode=login");
      }
      clearInterval(readyStateCheckInterval);
    };
  });
});
