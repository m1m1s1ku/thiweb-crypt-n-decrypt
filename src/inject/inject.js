/**
 * ThiWeb Auto-decrypt | Chrome extension
 */

let getted = false;
let username;


/**
 * Check if the user is connected or not
 */
function checkConnect() {
  if (document.getElementById('connectExt')) {
    return false;
  }
  return true;
}

/**
 * Get every code on the page
 */
function getAllLinks() {
  let codes = document.getElementsByTagName('code');
  for (var i = 0; i < codes.length; i++) {
    codes[i].innerHTML = codes[i].innerHTML.trim();
    if (codes[i].innerHTML.startsWith("TWL2")) {
      getFromZerawApi(codes[i]);
    }
  }
}

/**
 * Get user msg count
 */
function getCount() {
  let res;
  const req = new XMLHttpRequest();
  let username = document.getElementById('usernameExt').lastChild.innerHTML;

  req.onreadystatechange = function(event) {
    if (this.readyState === XMLHttpRequest.DONE) {
      if (this.status === 200) {
        res = JSON.parse(this.responseText);
        if (res.message >= 1) {
          getAllLinks();
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

  let notification = new Notification(title, {
    icon: icon,
    body: content,
  });

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

  if (strParse !== undefined && strParse.match(re)) {
    let m;
    while ((m = re.exec(strParse)) !== null) {
      if (m.index === re.lastIndex) {
        re.lastIndex++;
      }

      m.forEach((match, groupIndex) => {
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
        var res = JSON.parse(this.responseText);
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
      /*
       *   Inject.js
       *   ThiWeb Chrome \ Edge \ Firefox
       *   Automatically decrypt links on the forum
       */
       console.time("script");
      if (checkConnect() && !getted) {
        getCount();
        getted = true;
      } else {
        createNotification(
          "Non connecté", null,
          "Pour faire fonctionner l'extension, connecte toi ;)",
          "https://forum.thiweb.com/ucp.php?mode=login");
      }
      clearInterval(readyStateCheckInterval);
      console.timeEnd("script");
    };
  });
});
