// @ts-check
const form = document.getElementById("main");
/**
 * @type {HTMLInputElement | null}
 */
const ghost = document.querySelector("input#ghost");

/**
 * @type {HTMLParagraphElement | null}
 */
const message = document.querySelector('p#notifCopy');

/**
 *
 * @param {Event} event
 */
async function _onSubmit(event){
  event.preventDefault();
  if(!event.target) { return; }
  const clear = event.target[0].value.trim().replace(/\n/g,' ');

  try {
    const encrypted = await _encrypt(clear);
    if (ghost) {
      ghost.value = encrypted;
      ghost.select();
    }

    try {
      await navigator.clipboard.writeText(encrypted);
      if(!message) { return; }
      message.style.display = "block";
      setTimeout(() => {
        message.style.display = "none";
      }, 1000);
    } catch (err) {
      console.error('Can\'t write into clipboard');
    }
  } catch (err) {
    console.error("Error while encrypting string", clear, err);
  }
}

if(form) {
  form.addEventListener("submit", _onSubmit);
}

/**
 * @param {string} str
 * @returns {Promise<string>} encrypted
 */
async function _encrypt(str) {
  try {
    const res = await fetch("https://live.thiweb.com/api.php?code&str=" + encodeURIComponent(str)).then(res => res.json());
    return res.message;
  } catch (err){
    return Promise.reject(err);
  }
}