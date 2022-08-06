
export {}

const form = document.querySelector<HTMLFormElement>("form#main");
const ghost = document.querySelector<HTMLInputElement>("input#ghost");
const message = document.querySelector<HTMLParagraphElement>('p#notifCopy');

/**
 *
 * @param {Event} event
 */
async function _onSubmit(event: SubmitEvent){
  event.preventDefault();
  if(!event.target) { return; }

  const form = event.target as HTMLFormElement;
  const formInput = form.querySelector<HTMLInputElement>('input#toCrypt');
  const clear = formInput?.value.trim().replace(/\n/g,' ');
  
  if(!clear) { return; }

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

async function _encrypt(str: string): Promise<string> {
  try {
    const res = await fetch("https://live.thiweb.com/api.php?code&str=" + encodeURIComponent(str)).then(res => res.json());
    return res.message;
  } catch (err){
    return Promise.reject(err);
  }
}