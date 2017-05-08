/**
 * ThiWeb Auto-decrypt | Chrome extension
 */
chrome.extension.sendMessage({}, function(response) {
  var readyStateCheckInterval = setInterval(function() {
    if (document.readyState === "complete") {
      clearInterval(readyStateCheckInterval);
      //console.time("Exec");
      /*
       *	Init
       */
      if (checkConnect()) {
        getAllLinks();
      } else {
        createNotification(
          "Extension désactivée",
          "https://forum.thiweb.com/styles/prosilver/theme/images/site_logo.png",
          "Tu n'es pas connecté, pour limiter les appels API l'extension ne fonctionnera pas",
          "https://forum.thiweb.com/ucp.php?mode=login"
        );
      }
      //console.timeEnd("Exec");

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
       * Create a Chrome notification
       * @param title, icon, content, link : strings
       */
      function createNotification(title, icon, content, link) {
        let notification = new Notification(title, {
          icon: icon,
          body: content,
        });

        notification.onclick = function() {
          window.open(link);
        };
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
        let result;
        let xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function() {
          if (xmlhttp.readyState == XMLHttpRequest.DONE) {
            if (xmlhttp.status == 200) {
              var res = JSON.parse(xmlhttp.responseText);
              res.message.raw = parseAndReplaceUrls(res.message.raw);
              if (res.message.raw !== undefined) {
                elem.innerHTML = res.message.raw;
              } else {
                elem.innerHTML = "Erreur pendant le décryptage automatique";
              }

            } else {
              createNotification(
                "Erreur interne",
                "https://forum.thiweb.com/styles/prosilver/theme/images/site_logo.png",
                "La réponse du serveur est incorrecte",
                "mailto:ghostfly@outlook.com"
              );
            }
          }
        }

        xmlhttp.open("GET", "https://live.thiweb.com/api.php?decode&str=" + elem.innerHTML, true);
        xmlhttp.send();
      }

    };
  }, 10);
});
