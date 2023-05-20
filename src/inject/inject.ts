function reverseString(str: string): string {
    return str.split("").reverse().join("");
}

function hexToText(hex: string): string {
    let result = "";
    for (let i = 0; i < hex.length; i += 2) {
      const hexByte = hex.substring(i, i + 2);
      const charCode = parseInt(hexByte, 16);
      result += String.fromCharCode(charCode);
    }
    const escaped = escape(result.replaceAll('\x00', '').replaceAll('\x02', ''));
    try {
        return decodeURIComponent(escaped);
    } catch (err) {
        return unescape(escaped);
    }
}

function decodeTWL(str: string): string {
    str = str.replace(/[\r\n\s]+/g, "");
    str = str.replaceAll("\x20", "");
    str = str.replaceAll("\x0D", "");
    str = str.replaceAll("\x0A", "");
    
    const match = str.match(/(^TWL2\.\d{1})([0-9A-F]+)$/);
    if (!match) {
        return str;
    }
    
    const version = match[1];
    let hex = match[2];
    
    if (version == "TWL2.0") {
        let patched = "";
        for(let i = 0; i < hex.length; i += 2) {
            const c = hex.substring(i, i+2);
            if(c == "AD") {
                patched += "A0D0";
            } else {
                patched += c;
            }
        }
        hex = patched;
        // hex = hex.replace(/A0D0/g, "AD");
    }
    
    return hexToText(reverseString(hex));
}

export default class TWExtension {
    async run(): Promise<void> {
        this._addEncryptButton();

        if(this._codes.length === 0){
            return;
        }

        const canUse = await this._check();
        if(canUse){
            await this._decode();
        }
    }

    _addEncryptButton(): void {
        const buttonsContainer = document.getElementById("format-buttons");

        if(!buttonsContainer){ return; }
    
        const add = document.createElement("button");
        add.className = "button button-secondary";
        add.innerText = chrome.i18n.getMessage("cryptSelection");
        add.onclick = this._onEncryptButtonClick.bind(this);
    
        buttonsContainer.appendChild(add);
    }

    async _onEncryptButtonClick(event: MouseEvent): Promise<void> {
        event.preventDefault();
        const textarea = document.querySelector<HTMLTextAreaElement>("textarea#message");
        if(!textarea) { return; }
        if (typeof textarea.selectionStart === 'number' && typeof textarea.selectionEnd === 'number') {
            const str = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
    
            const encrypted = await this._encrypt(str);
            if(encrypted){
                textarea.value = textarea.value.replace(str, `[code]${encrypted}[/code]`);
            }
        }
    }

    /**
     * Check if ext can be used (logged in)
     */
    async _check(): Promise<boolean> {    
        if(!document.getElementById('usernameExt')){
            return false; 
        }

        const username = this._username();
        if(!username){
            return false;
        }
        
        return true;
    }

    async _encrypt(str: string): Promise<null | string> {
        try {
            const req = await fetch(this._endpoint('code', encodeURIComponent(str)));
            const encrypt = await req.json();

            if(!encrypt || !encrypt.message){
                return null;
            }
    
            return encrypt.message;
        } catch (err) {
            console.error("Error while encrypt", err);
        }
    
        return null;
    }

    async _decode(): Promise<void>{
        if(this._codes.length === 0){
            return;
        }

        for(const { element, raw } of this._params()) {
            let clear: string;
            try {
                clear = decodeTWL(raw);
            } catch (err) {
                console.error("Error while decoding", err);
                continue;
            }

            let newCode = this._activateLinks(clear);
            const showOriginal = document.createElement('a');
            showOriginal.style.marginLeft = '5px';
            showOriginal.href = "#";
            showOriginal.style.cursor = 'pointer';

            const onDecryptCode = (event: MouseEvent) => {
                event.preventDefault();
                const parent = newCode.parentElement;
                const oldCode = newCode;
                newCode = this._activateLinks(clear);
                parent?.replaceChild(newCode, oldCode);
                this._blur(newCode);

                showOriginal.innerText = chrome.i18n.getMessage("showOriginal");
                showOriginal.onclick = onShowCode;
            };

            const onShowCode = (event: MouseEvent) => {
                event.preventDefault();
                newCode.innerText = raw;
                this._blur(newCode);
                showOriginal.innerText = chrome.i18n.getMessage("showDecrypted");
                showOriginal.onclick = onDecryptCode;
            };

            showOriginal.onclick = onShowCode;
            showOriginal.innerText = chrome.i18n.getMessage("showOriginal");
            element?.parentElement?.replaceChild(newCode, element);

            const parentCodeBoxP = newCode?.parentElement?.parentElement?.querySelector('p');
            parentCodeBoxP?.appendChild(showOriginal);

            this._blur(newCode);
        }
    }

    _blur(elem: HTMLElement): void {
        elem.animate([{ filter: 'blur(5px)'}, { filter: 'none' }], { duration: 300 });
    }

    _endpoint(type: string, body: string): string {
        return `${this._apiURL}${type}&str=${body}`;
    }

    get _apiURL(): string {
        return "https://live.thiweb.com/api.php?";
    }

    get _codes(): HTMLElement[] {
        return Array.from(document.querySelectorAll('code')).filter(element => {
            return element.innerHTML.startsWith('TWL');
        });
    }

    _username(): string | null {
        const usernameContainer = document.querySelector<HTMLSpanElement>('#usernameExt span');
        if(usernameContainer){
            return usernameContainer.innerText;
        } else {
            return null;
        }
    }

    _activateLinks(str: string): HTMLElement {
        const codeElement = document.createElement('code');

        const re = /^(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)/mgi;
        let m: RegExpExecArray | null;
        const links = new Set<string>();

        while ((m = re.exec(str)) !== null) {
            if (m.index === re.lastIndex) {
                re.lastIndex++;
            }

            for(const match of m){
                links.add(match);
            }
        }

        for(const link of links) {
            str = str.replace(link, "<a target=\"_blank\" href=\"" + link + "\">" + link + "</a>");
        }

        this._insertUnsafeHTML(str, codeElement);
        
        return codeElement;
    }
    
    _insertUnsafeHTML(str: string, element: HTMLElement): void {
        const parser = new DOMParser();
        const parsedBody = parser.parseFromString(str, 'text/html').body;

        for(let i = 0; i < parsedBody.childNodes.length; i++){
            const tag = parsedBody.childNodes[i];

            if(tag instanceof Text && tag.textContent){
                element.append(document.createTextNode(tag.textContent));
            } else if(tag instanceof HTMLAnchorElement){
                element.appendChild(tag.cloneNode(true));
            }
        }
    }

    _clean(str: string): string {
        return str.trim().replace(/\n/g,' ');
    }

    _params(): { element: HTMLElement, raw: string }[] {
        const params = [];

        for(const code of this._codes){
            params.push({ 
                element: code, 
                raw: this._clean(code.innerHTML) 
            });
        }

        return params;
    }
}

(async function(){
    try {
        const ext = new TWExtension();
        await ext.run();
    } catch (err){
        console.error('Error while running ext', err);
    }
})();
