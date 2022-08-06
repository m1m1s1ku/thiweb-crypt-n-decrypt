# ThiWeb Extension
Decrypt automatically links on the forum ! | Web extension for Forum.ThiWeb.com

## Install : 
- [Edge Store](https://microsoftedge.microsoft.com/addons/detail/jgcopilbhgndmjfbckfbfehjpeapcaed)
- [Chrome Web Store](https://chrome.google.com/webstore/detail/thiweb-auto-decrypt/noadaplbhpacekfmbhojlbldckniffce?hl=fr)
- [Firefox Addons](https://addons.mozilla.org/fr/firefox/addon/thiweb-cryptdecrypt/)

### Release building :

Install dependencies :
```sh
$ npm install
```

Build package :
```
$ npm run build
```

### Manual :

Avoid this method, except for development ( Store extensions stay updated, not unpacked ;) )

- Go to chrome settings
- "Extensions" tab
- "Load unpacked extension" after git clone

## Dev :
- Load unpacked extension
- The main code is in inject/inject.js
- The Popup is in page_action/page_action.html
