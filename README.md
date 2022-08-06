# ThiWeb Extension
Decrypt automatically links on the forum ! | Web extension for Forum.ThiWeb.com

## Install : 
- [Chrome Web Store](https://chrome.google.com/webstore/detail/thiweb-auto-decrypt/noadaplbhpacekfmbhojlbldckniffce?hl=fr)
- [Edge Store](https://microsoftedge.microsoft.com/addons/detail/jgcopilbhgndmjfbckfbfehjpeapcaed)
- [Firefox Addons](https://addons.mozilla.org/fr/firefox/addon/thiweb-cryptdecrypt/)

### Release building :

Install dependencies :
```sh
$ npm install
```

Build :
```
$ npm run build
```

Package for stores :
```
$ npm run prepare
```

### Manual :

Avoid this method, except for development ( Store extensions stay updated, not unpacked ;) )

- Clone & build
- Go to chrome settings
- Activate developer mode
- "Extensions" tab ([chrome://extensions](chrome://extensions))
- Install dependencies & build
- "Load unpacked extension" 
- select "dist" folder
