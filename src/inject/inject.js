/**
 * ThiWeb Auto-decrypt | Browser extension
 */
// @ts-check

class TWExtension {
    addEncryptButton() {
        const buttonsContainer = document.getElementById("format-buttons");
    
        const add = document.createElement("button");
        add.className = "button button-secondary";
        add.innerHTML = "Crypter la sélection";
        add.onclick = this._onEncryptButtonClick.bind(this);
    
        buttonsContainer.appendChild(add);
    }

    async check() {    
        if(!document.getElementById('usernameExt')){
            return false; 
        }
    
        const username = this._username();
    
        const req = await fetch("https://live.thiweb.com/api.php?posts&str=" + username);
        const res = await req.json();
        if(res.message >= 1){
            return true;
        } else {
            return false;
        }
    }

    /**
     * @param {string} str
     * @returns {Promise<string>}
     */
    async encrypt(str) {
        try {
            const req = await fetch("https://live.thiweb.com/api.php?code&str=" + encodeURIComponent(str));
            const encrypt = await req.json();
    
            return encrypt.message;
        } catch (err) {
            console.error("Erreur pendant le cryptage", err);
        }
    
        return null;
    }

    async decode(){
        if(this.codes.length === 0){
            return;
        }

        try {
            const response = await fetch("https://live.thiweb.com/api.php?decodeMultiple&str=" + this._params()).then(res => res.json());
            const decodeArray = response.message.split(",");
            const codedArray = response.coded.split(",");
    
            let countT = 0;
        
            for (let v = 0; v < this.codes.length; v++) {
                if (this.codes[v].innerHTML.trim() == codedArray[countT]) {
                    this.codes[v].innerHTML = this._activateLinks(decodeArray[countT]); // Sync index with countDiff ;)
                    countT++;
                }
            }
        } catch (err){
            console.error("Error while decoding", err);
        }
    }

    /**
     * @readonly
     * @returns {HTMLCollectionOf<HTMLElement>}
     */
    get codes(){
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
    
        const encrypted = await this.encrypt(str);
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
        const re = /^(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)/mgi;
    
        if (str !== undefined && str.match(re)) {
            let m;
            while ((m = re.exec(str)) !== null) {
                if (m.index === re.lastIndex) {
                    re.lastIndex++;
                }
    
                for(const match of m){
                    str = str.replace(match, "<a href=\"" + match + "\">" + match + "</a>");
                }
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
        let params = "";

        for (let i = 0; i < this.codes.length; i++) {
            if (this.codes[i].innerHTML.trim().startsWith("TWL")) {
                params += this._clean(this.codes[i].innerHTML) + ",";
            }
        }

        return params.slice(0, -1);
    }
}

(async function(){
    const utils = new TWExtension();
    const canUse = await utils.check();
    if(canUse){
        await utils.decode();

        if (document.getElementById('message')) {
            utils.addEncryptButton();
        }
    } else if(utils.codes.length > 0) {
        alert("Tu dois être connecté et avoir au moins un message pour utiliser l'extension");
    }
})();
