/**
 * ThiWeb Auto-decrypt | Browser extension
 */
// @ts-check

class TWExtension {
    constructor(){
        this._separator = '{{|}}';
    }

    _addEncryptButton() {
        const buttonsContainer = document.getElementById("format-buttons");

        if(!buttonsContainer){ return; }
    
        const add = document.createElement("button");
        add.className = "button button-secondary";
        // @ts-ignore
        add.innerText = chrome.i18n.getMessage("cryptSelection");
        add.onclick = this._onEncryptButtonClick.bind(this);
    
        buttonsContainer.appendChild(add);
    }

    _showLoginAlert(){
        const style = document.createElement('style');
        const css = document.createTextNode(`
        #should-be-logged-dialog {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
            background: #2b2b2b;
            color: #212121;

            font-weight: 400;
            font-size: 13px;

            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 270px;
            margin: auto auto;
            border-radius: 8px;
            overflow: visible;
            max-width: 95%;
            cursor: pointer;

            display: flex;
            flex-direction: row;
            justify-content: space-between;
            padding: 1em;

            box-shadow: 0 3px 3px -2px rgba(0,0,0,.2), 0 3px 4px 0 rgba(0,0,0,.14), 0 1px 8px 0 rgba(0,0,0,.12);
        }

        #should-be-logged-dialog h3 {
            text-transform: none;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            font-size: 17px;
            font-size: 17px;
            font-weight: 500;
            text-align: center;
            color: #fff;
            padding: 0;
            margin: 0;
        }

        #should-be-logged-dialog img {
            width: 50px;
            padding: 5px;
        }
        `);
        style.appendChild(css);

        const dialog = document.createElement('div');
        dialog.id = "should-be-logged-dialog";

        const logo = document.createElement('img');
        logo.src = 'https://www.thiweb.com/img/logo.svg';
        logo.alt = 'Thiweb logo';

        const title = document.createElement('h3');
        // @ts-ignore
        title.innerText = chrome.i18n.getMessage("connectAlert");
        dialog.appendChild(logo);
        dialog.appendChild(title);
        dialog.appendChild(style);
        document.body.appendChild(dialog);

        dialog.onclick = function(){
            dialog.parentElement.removeChild(dialog);
        };
    }

    /**
     * @param {Event} event
     */
    async _onEncryptButtonClick(event){
        event.preventDefault();
        /**
         * @type {HTMLInputElement}
         */
        const textarea = document.querySelector("textarea#message");
        const str = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
    
        const encrypted = await this._encrypt(str);
        if(encrypted){
            textarea.value = textarea.value.replace(str, `[code]${encrypted}[/code]`);
        }
    }

    /**
     * @returns {Promise<number>}
     */
    async _get(){
        return new Promise((resolve) => {
            // @ts-ignore
            chrome.storage.sync.get(['count'], function(items) {
                if(items && items.count){
                    resolve(parseInt(items.count, 10));
                } else {
                    resolve(null);
                }
            });
        })
    }

    // Storage sync part
    // Allows to get / set message count thus, avoid one api call (except first time)
    /**
     * @param {number} count
     */
    _set(count){
        // @ts-ignore
        chrome.storage.sync.set({count});
    }

    /**
     * @returns {Promise<boolean>}
     */
    async _check() {    
        if(!document.getElementById('usernameExt')){
            return false; 
        }

        // @ts-ignore
        const count = await this._get();
        if(count !== null && count > 1){
            return true;
        }
    
        const username = this._username();
        if(!username){
            return false;
        }

        const req = await fetch(this._endpoint('posts', username));
        const res = await req.json();

        if(res.message > 1){
            this._set(res.message);

            return true;
        } else {
            return false;
        }
    }

    /**
     * @param {string} str
     * @returns {Promise<null|string>}
     */
    async _encrypt(str) {
        try {
            const req = await fetch(this._endpoint('code', encodeURIComponent(str)));
            const encrypt = await req.json();

            if(!encrypt || !encrypt.message){
                return;
            }
    
            return encrypt.message;
        } catch (err) {
            console.error("Error while encrypt", err);
        }
    
        return null;
    }

    /**
     * @returns {Promise<void>}
     */
    async _decode(){
        if(this._codes.length === 0){
            return;
        }

        try {
            const response = await fetch(this._endpoint('decodeMultiple', this._params())).then(res => res.json());
            if(!response.message || !response.coded){
                return;
            }

            const decoded = response.message.split(this._separator);
            const coded = response.coded.split(this._separator);
    
            let idx = 0;
            for(const code of this._codes){
                if (this._clean(code.innerHTML) == coded[idx]) {
                    const newCode = this._activateLinks(decoded[idx]);
                    code.parentElement.replaceChild(newCode, code);
                    newCode.animate([{ opacity: 0 },{ opacity: 1 }], { duration: 300 });
                    idx++;
                }
            }
        } catch (err){
            console.error("Error while decoding", err);
        }
    }

    /**
     * @param {string} type
     * @param {string} body
     * @returns {string}
     */
    _endpoint(type, body){
        return `${this._apiURL}${type}&str=${body}`;
    }

    get _apiURL(){
        return "https://live.thiweb.com/api.php?";
    }

    /**
     * @readonly
     * @returns {HTMLCollectionOf<HTMLElement>}
     */
    get _codes(){
        return document.getElementsByTagName('code');
    }

    /**
     * @returns {string|null} username of the user
     */
    _username(){
        /**
         * @type {HTMLSpanElement}
         */
        const usernameContainer = document.querySelector('#usernameExt span');
        if(usernameContainer){
            return usernameContainer.innerText;
        } else {
            return null;
        }
    }

    /**
     * @param {string} str
     * @returns {HTMLElement}
     */
    _activateLinks(str) {
        const codeElement = document.createElement('code');

        const re = /^(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)/mgi;
        /**
         * @type {RegExpExecArray}
         */
        let m;
        while ((m = re.exec(str)) !== null) {
            if (m.index === re.lastIndex) {
                re.lastIndex++;
            }

            for(const match of m){
                str = str.replace(match, "<a href=\"" + match + "\">" + match + "</a>");
            }
        }

        const parser = new DOMParser();
        const tags = parser.parseFromString(str, 'text/html').body.children;

        if(tags.length === 0){
            codeElement.appendChild(document.createTextNode(str));
        }

        for(const tag of tags){
            codeElement.insertBefore(tag, codeElement.firstChild);
        }
        
        return codeElement;
    }

    /**
     * @param {string} str
     */
    _clean(str){
        return str.trim().replace(/\n/g,' ');
    }

    /**
     * @returns {string}
     */
    _params(){
        const params = [];

        for(const code of this._codes){
            const cleanup = this._clean(code.innerHTML);
            if (cleanup.startsWith("TWL")) {
                params.push(cleanup);
            }
        }

        return params.join(this._separator);
    }

    /**
     * @returns {Promise<void>}
     */
    async run(){
        if(this._codes.length === 0){
            return;
        }

        const canUse = await this._check();
        if(canUse){
            await this._decode();
    
            if (document.getElementById('message')) {
                this._addEncryptButton();
            }
        } else {
            this._showLoginAlert();
        }
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
