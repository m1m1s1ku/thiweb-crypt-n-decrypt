/**
 * ThiWeb Auto-decrypt | Browser extension
 */
// @ts-check

class TWExtension {
    _addEncryptButton() {
        const buttonsContainer = document.getElementById("format-buttons");
    
        const add = document.createElement("button");
        add.className = "button button-secondary";
        add.innerHTML = "Crypter la sélection";
        add.onclick = this._onEncryptButtonClick.bind(this);
    
        buttonsContainer.appendChild(add);
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

    /**
     * @param {number} count
     */
    _set(count){
        // @ts-ignore
        chrome.storage.sync.set({count});
    }

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
     * @returns {Promise<string>}
     */
    async _encrypt(str) {
        try {
            const req = await fetch(this._endpoint('code', encodeURIComponent(str)));
            const encrypt = await req.json();
    
            return encrypt.message;
        } catch (err) {
            console.error("Erreur pendant le cryptage", err);
        }
    
        return null;
    }

    async _decode(){
        if(this._codes.length === 0){
            return;
        }

        try {
            const response = await fetch(this._endpoint('decodeMultiple', this._params())).then(res => res.json());
            const decodeArray = response.message.split(",");
            const codedArray = response.coded.split(",");
    
            let countT = 0;
        
            for (let v = 0; v < this._codes.length; v++) {
                if (this._clean(this._codes[v].innerHTML) == codedArray[countT]) {
                    this._codes[v].innerHTML = this._activateLinks(decodeArray[countT]); // Sync index with countDiff ;)
                    this._codes[v].animate([
                        { opacity: 0 }, 
                        { opacity: 1 }
                      ], { 
                        duration: 300
                      })
                    countT++;
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
        return this._apiURL.concat(type).concat('&str=').concat(body);
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
        textarea.value = textarea.value.replace(str, `[code]${encrypted}[/code]`);
    }

    /**
     * @returns {string} username of the user
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

    /**     *
     * @param {string} str
     * @returns {string}
     */
    _activateLinks(str) {
        if(!str){
            return str;
        }

        const re = /^(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)/mgi;
        if(!str.match(re)){
            return str;
        }

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
    
        return str;
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

        for (let i = 0; i < this._codes.length; i++) {
            const cleanup = this._clean(this._codes[i].innerHTML);
            if (cleanup.startsWith("TWL")) {
                params.push(this._clean(this._codes[i].innerHTML));
            }
        }

        return params.join(',');
    }

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
            alert("Tu dois être connecté et avoir au moins un message pour utiliser l'extension");
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
