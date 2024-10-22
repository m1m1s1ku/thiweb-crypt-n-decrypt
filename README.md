# ThiWeb Extension
Decrypt automatically links on the forum ! | Web extension for Forum.ThiWeb.com

## Install : 
- [Chrome Web Store](https://chrome.google.com/webstore/detail/thiweb-auto-decrypt/noadaplbhpacekfmbhojlbldckniffce?hl=fr)
- [Firefox Addons](https://addons.mozilla.org/fr/firefox/addon/thiweb-cryptdecrypt/)
- [Edge Store (Unmaintained, prefer chrome.)](https://microsoftedge.microsoft.com/addons/detail/jgcopilbhgndmjfbckfbfehjpeapcaed)

### Release building :

Install dependencies :
```sh
$ pnpm install
```

Build :
```
$ pnpm run build
```

Package for Firefox :
```
$ pnpm run prepare-firefox # Patch Manifest V3 into V2..
$ pnpm run bundle-firefox # Generate zip
```

Package for Chrome :
```
$ pnpm run prepare-chrome # Patch manifest v3 web_accessible_resources
$ pnpm run bundle-chrome
```

### Manual :

Avoid this method, except for development ( Store extensions stay updated, not unpacked ;) )

- Clone, install deps, build
- Open ([chrome://extensions](chrome://extensions))
- Activate developer mode
- "Load unpacked extension" 
- Select "dist" folder
