// @ts-check
const form = document.getElementById("cryptForm");
/**
 * @type {HTMLInputElement}
 */
// @ts-ignore
const ghost = document.getElementById("ghost");

/**
 *
 * @param {Event} event
 */
async function _onSubmit(event){
  event.preventDefault();
  const clear = event.target[0].value.trim().replace(/\n/g,' ');
  const encrypted = await _encrypt(clear);
  ghost.value = encrypted;

  ghost.select(); // Select input

  // Copy to user clipboard
  if(document.execCommand('copy')){
    document.getElementById('notifCopy').style.display = "block";
  }
}

form.addEventListener("submit", _onSubmit);

/**
 * @param {string} str
 * @returns {Promise<string>} encrypted
 */
async function _encrypt(str) {
  try {
    const res = await fetch("https://live.thiweb.com/api.php?code&str=" + encodeURIComponent(str)).then(res => res.json());
    return res.message;
  } catch (err){
    console.error("Error while encrypting string", str);
  }
}