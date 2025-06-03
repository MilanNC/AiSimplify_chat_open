(function() {
    // --- Konfigurace Widgetu ---
    const WIDGET_HOST_ID = 'vari-chatbot-host'; // ID elementu na stránce, kam se widget může vložit
    const CHAT_CONTAINER_ID = 'chatContainer';   // ID hlavního kontejneru widgetu (z vašeho HTML)
    const POPPINS_FONT_URL = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap';
    const MARKED_JS_URL = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';

    // --- API, Klient ID a Storage klíče (přesně podle vašeho kódu) ---
    const API_BASE = 'https://chatbot-production-4d1d.up.railway.app';
    const clientID = 'VARI'; // Přejmenováno z CLIENT_ID na clientID pro shodu s vaším JS kódem
    const STORAGE_KEY = 'chat_history';
    const TOPIC_KEY = 'etrieve_topic_id';

    // --- Funkce pro načtení CSS ---
    function loadWidgetCSS() {
        const style = document.createElement('style');
        style.textContent = `
            /* CSS Proměnné z vašeho :root - budou platit v kontextu widgetu */
            /* Pro widget je definujeme přímo na jeho hlavním kontejneru */
            #${CHAT_CONTAINER_ID} {
              font-family: 'Poppins', sans-serif; /* Základní font pro widget */
              --header-gradient: linear-gradient(90deg,#ff0101,#000000);
              --user-gradient: #e4032e;
              --assistant-color: #F4F4F9;
              --text-light: #ffffff;
              --text-dark: #000000;
              --bg: #fff;
              --shadow: rgba(0,0,0,0.1) 0 4px 12px;
              --shadow-hover: rgba(0,0,0,0.2) 0 6px 16px;
              box-sizing: border-box; /* Základní box-sizing pro widget */
            }

            /* Reset pro prvky uvnitř widgetu, aby se co nejvíce omezil vliv stylů hostitelské stránky. */
            /* Tento reset je velmi mírný, aby co nejvíce odpovídal vašemu původnímu stavu, kde nebyl explicitní reset. */
            #${CHAT_CONTAINER_ID} *, #${CHAT_CONTAINER_ID} *::before, #${CHAT_CONTAINER_ID} *::after {
                box-sizing: border-box; /* Klíčové pro konzistentní layout */
                /* margin: 0;  Ponecháváme na individuálních pravidlech níže */
                /* padding: 0; Ponecháváme na individuálních pravidlech níže */
            }
             #${CHAT_CONTAINER_ID} button, #${CHAT_CONTAINER_ID} input, #${CHAT_CONTAINER_ID} div, #${CHAT_CONTAINER_ID} span, #${CHAT_CONTAINER_ID} p, #${CHAT_CONTAINER_ID} b, #${CHAT_CONTAINER_ID} svg {
                font-family: inherit; /* Dědí 'Poppins' z #${CHAT_CONTAINER_ID} */
                background: transparent; /* Výchozí transparentní pozadí */
                border: 0; /* Výchozí bez borderu, pokud není specifikováno */
                margin: 0; /* Výchozí bez marginu */
                padding: 0; /* Výchozí bez paddingu */
                color: inherit; /* Dědí barvu */
                text-align: left; /* Výchozí zarovnání */
             }


            /* STYLY PRO 'html, body' a 'body::before' (s pozadi.png) Z PŮVODNÍHO KÓDU JSOU ZDE ZÁMĚRNĚ VYNECHÁNY. */
            /* Widget je samostatná komponenta a neměl by modifikovat globální styly hostitelské stránky. */

            /* Keyframes - přeneseny 1:1 */
            @keyframes gradientFlow {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.1); }
            }
            @keyframes slideIn {
              from { transform: translateX(-10px); opacity: 0; }
              to   { transform: translateX(0); opacity: 1; }
            }

            /* Následující styly jsou přeneseny co nejvěrněji z vašeho <style> bloku. */
            /* Všechny selektory by měly být automaticky "scoped" díky tomu, že budou aplikovány */
            /* na HTML strukturu vytvořenou uvnitř #${WIDGET_HOST_ID} (který obsahuje #${CHAT_CONTAINER_ID}) */

            #${CHAT_CONTAINER_ID} { /* Již definováno výše pro proměnné a font, zde doplníme zbytek */
              position: fixed; bottom: 20px; right: 20px;
              z-index: 99999; /* Zvýšený z-index pro widget */
            }
            #${CHAT_CONTAINER_ID} * { pointer-events: auto; }

            #${CHAT_CONTAINER_ID} #chatIcon {
              width: 64px; height: 64px; border-radius: 50%;
              display: flex; align-items: center; justify-content: center;
              color: var(--text-light); font-size: 36px;
              cursor: pointer; animation: pulse 2s infinite;
              box-shadow: var(--shadow); position: relative; overflow: hidden;
              background: transparent; /* Toto je explicitně z vašeho kódu */
            }
            #${CHAT_CONTAINER_ID} #chatIcon::before {
              content:""; position:absolute; inset:0;
              background:var(--header-gradient); background-size:200% 200%;
              animation:gradientFlow 8s infinite;
              filter:blur(20px); transform:scale(1.2); z-index:-1;
            }
            #${CHAT_CONTAINER_ID} #chatIcon .tooltip {
              position:absolute; bottom:70px; right:0;
              background:var(--header-gradient); color:var(--text-light);
              padding:6px 10px; border-radius:12px; font-size:.85rem;
              white-space:nowrap; opacity:0; transition:opacity .3s;
              pointer-events:none;
            }
            #${CHAT_CONTAINER_ID} #chatIcon:hover .tooltip { opacity:1; }

            #${CHAT_CONTAINER_ID} #chatBoxContainer {
              display: none;
              width: clamp(350px, 90vw, 900px);
              border-radius: 24px;
              background: var(--bg);
              box-shadow: var(--shadow);
              position: fixed; bottom:100px; right:20px; /* Přesně dle vašeho kódu */
              flex-direction: column;
              opacity: 0;
              overflow: hidden; /* Přesně dle vašeho kódu */
              transform: translateY(20px);
              transition: all .8s ease;
            }
            #${CHAT_CONTAINER_ID} #chatBoxContainer.open {
              display: flex;
              opacity: 1;
              transform: translateY(0);
              height: 70vh !important; /* Přesně dle vašeho kódu */
            }

            #${CHAT_CONTAINER_ID} #chatHeader {
              padding: 10px 16px;
              display: flex; justify-content: space-between; align-items: center;
              border-top-left-radius: 24px; border-top-right-radius: 24px;
              position: relative;
              overflow: visible; /* Přesně dle vašeho kódu */
              background: transparent; /* Přesně dle vašeho kódu */
              color: white; /* Z .assistant-title, pro jistotu i zde */
            }
            #${CHAT_CONTAINER_ID} #chatHeader::before {
              content:""; position:absolute; inset:0;
              background:var(--header-gradient);
              filter:blur(20px); transform:scale(1.2);
              z-index:-1;
              /* Aby blur efekt správně kopíroval rohy hlavičky */
              border-top-left-radius: inherit;
              border-top-right-radius: inherit;
            }
            /* Selektor .assistant-title je použitelný, protože bude uvnitř #chatContainer */
            #${CHAT_CONTAINER_ID} .assistant-title {
                position: relative; font-size: 20px; color: white; /* Přesně dle vašeho kódu */
                font-weight: normal; /* Normalizujeme, <b> se postará o tučné */
            }
             #${CHAT_CONTAINER_ID} .assistant-title b { font-weight: bold; } /* Zachování tučného z HTML */

            #${CHAT_CONTAINER_ID} .assistant-title:hover::after {
              content:'😉'; position:absolute; right:-25px; top:0;
              animation:slideIn .8s forwards;
            }

            #${CHAT_CONTAINER_ID} .icon-container {
              position: relative;
              display: inline-block;
              margin-left: 12px;
            }
            #${CHAT_CONTAINER_ID} .icon-container .icon {
              cursor: pointer;
              font-size: 20px; /* Přesně dle vašeho kódu */
              color: var(--text-light); /* Přesně dle vašeho kódu */
              transition: transform .3s ease; /* Přesně dle vašeho kódu */
              padding: 2px; /* Malý padding pro lepší klikání, lze odstranit, pokud to mění vzhled */
            }
            #${CHAT_CONTAINER_ID} .icon-container .icon:hover {
              transform: rotate(90deg);
            }
            #${CHAT_CONTAINER_ID} .icon-container .icon-tooltip {
              position: absolute;
              top: 100%;
              left: 50%;
              transform: translateX(-50%);
              margin-top: 6px;
              background: #fff; /* Přesně dle vašeho kódu */
              color: var(--text-dark); /* Přesně dle vašeho kódu */
              padding: 4px 8px; /* Přesně dle vašeho kódu */
              border-radius: 6px; /* Přesně dle vašeho kódu */
              font-size: .8rem; /* Přesně dle vašeho kódu */
              white-space: nowrap;
              opacity: 0;
              transition: opacity .2s ease;
              pointer-events: none;
              box-shadow: var(--shadow);
              z-index: 100001; /* Zvýšen z-index pro jistotu nad ostatními prvky widgetu */
            }
            #${CHAT_CONTAINER_ID} .icon-container:hover .icon-tooltip {
              opacity: 1;
            }

            #${CHAT_CONTAINER_ID} #chatBox {
              flex: 1; padding: 16px;
              display: flex; flex-direction: column; gap: 12px;
              overflow-y: auto;
              background-color: var(--bg); /* Explicitně, aby bylo pozadí boxu bílé */
              scrollbar-width: thin;
              scrollbar-color: var(--user-gradient) var(--assistant-color); /* Solidní barva pro první parametr */
            }
            #${CHAT_CONTAINER_ID} #chatBox::-webkit-scrollbar { width: 6px; }
            #${CHAT_CONTAINER_ID} #chatBox::-webkit-scrollbar-thumb {
              background: var(--user-gradient); /* Solidní barva, gradient zde není dobře podporován */
              border-radius: 3px;
            }

            /* Styly pro .message uvnitř #chatBox */
            #${CHAT_CONTAINER_ID} #chatBox .message {
              display: inline-block; /* Dle vašeho kódu */
              width: auto; /* Dle vašeho kódu */
              max-width: 85%; /* Dle vašeho kódu */
              white-space: pre-wrap; /* Dle vašeho kódu */
              overflow-wrap: break-word; /* Dle vašeho kódu */
              transition: transform .8s cubic-bezier(.45,1.35,.55,1.02), box-shadow .8s cubic-bezier(.45,1.35,.55,1.02); /* Dle vašeho kódu */
              /* Následující vlastnosti jsou z obecnějšího .message pravidla, ale platí zde */
              position: relative;
              padding: 16px 24px; /* Dle vašeho .message pravidla */
              border-radius: 24px; /* Dle vašeho .message pravidla */
              box-shadow: var(--shadow); /* Dle vašeho .message pravidla */
              line-height: 1.5; /* Dle vašeho .message pravidla */
            }
            #${CHAT_CONTAINER_ID} #chatBox .message p {
              display: inline; /* Dle vašeho kódu */
              margin: 0; /* Dle vašeho kódu */
              /* Barva a velikost písma by měly být zděděny z .message kontejneru */
            }

            /* Obecné .message pravidlo, které se aplikuje na .user-message a .assistant-message */
            /* Toto pravidlo nastavuje výchozí vzhled pro .assistant-message */
            #${CHAT_CONTAINER_ID} .message { /* Tento selektor je méně specifický než ten výše, ale ponechávám kvůli struktuře originálu */
              position: relative;
              background: var(--assistant-color); /* Výchozí pro asistenta */
              color: var(--text-dark); /* Výchozí pro asistenta */
              align-self: flex-start; /* Výchozí pro asistenta */
              /* padding, border-radius, box-shadow, line-height jsou již definovány ve specifičtějším #${CHAT_CONTAINER_ID} #chatBox .message */
            }
            #${CHAT_CONTAINER_ID} .message:hover { /* Platí pro všechny .message */
              transform: scale(1.03);
              box-shadow: var(--shadow-hover);
            }
            #${CHAT_CONTAINER_ID} .assistant-message.loading { font-style: italic; opacity: .7; }

            /* Specifické styly pro .user-message, přepíší obecné .message tam, kde je to potřeba */
            #${CHAT_CONTAINER_ID} .user-message {
              background: var(--user-gradient);
              color: var(--text-light);
              align-self: flex-end;
              text-align: right; /* Dle vašeho kódu */
            }

            #${CHAT_CONTAINER_ID} .save-icon {
              display: inline-block;
              position: absolute;
              top: 8px;
              right: 12px;
              opacity: 0;
              transform: scale(0.8);
              transition: opacity 0.25s cubic-bezier(.45,1.35,.55,1.02), transform 0.25s cubic-bezier(.45,1.35,.55,1.02);
              cursor: pointer;
              user-select: none;
              font-size: 1.15em; /* Dle vašeho kódu */
              background: #fff; /* Dle vašeho kódu */
              color: var(--text-dark); /* Aby byla ikona viditelná na bílém pozadí */
              border-radius: 7px; /* Dle vašeho kódu */
              padding: 1px 8px; /* Dle vašeho kódu */
              box-shadow: var(--shadow); /* Dle vašeho kódu */
              z-index: 2; /* Dle vašeho kódu */
              pointer-events: all; /* Dle vašeho kódu */
            }
            #${CHAT_CONTAINER_ID} .save-icon.visible {
              opacity: 1;
              transform: scale(1);
            }

            #${CHAT_CONTAINER_ID} #inputContainer {
              display: flex;
              align-items: center; /* Vertikální zarovnání */
              border-top: 1px solid #eee; /* Dle vašeho kódu */
              padding: 10px 16px; /* Dle vašeho kódu */
              background-color: var(--bg); /* Explicitní pozadí */
              border-bottom-left-radius: 24px; /* Aby odpovídalo kontejneru */
              border-bottom-right-radius: 24px;
            }
            #${CHAT_CONTAINER_ID} #inputBox {
              flex: 1;
              padding: 10px 14px; /* Dle vašeho kódu */
              border: 1px solid #ddd; /* Dle vašeho kódu */
              border-radius: 20px; /* Dle vašeho kódu */
              font-size: 1rem; /* Dle vašeho kódu */
              outline: none;
              transition: border-color .8s ease; /* Dle vašeho kódu */
              font-style: italic; /* Dle vašeho kódu */
              color: var(--text-dark); /* Barva textu */
              background-color: #fff; /* Barva pozadí */
            }
            #${CHAT_CONTAINER_ID} #inputBox:focus {
                /* border-color: var(--header-gradient); Gradient není pro border ideální */
                border: 1px solid var(--user-gradient); /* Pevná barva z vašeho gradientu */
                font-style: normal; /* Při focusu změna stylu */
            }
             #${CHAT_CONTAINER_ID} #inputBox::placeholder {
                color: #aaa; /* Světlejší placeholder */
                font-style: italic;
            }


            #${CHAT_CONTAINER_ID} #sendButton {
              background: none; /* Dle vašeho kódu */
              border: none; /* Dle vašeho kódu */
              margin-left: 12px; /* Dle vašeho kódu */
              width: 40px; height: 40px; /* Dle vašeho kódu */
              display: flex; align-items: center; justify-content: center; /* Dle vašeho kódu */
              cursor: pointer; /* Dle vašeho kódu */
              transition: transform .4s ease, background-color .8s ease; /* Dle vašeho kódu */
              position: relative; /* Dle vašeho kódu */
              border-radius: 50%; /* Přidáno pro hover efekt, pokud má mít kulaté pozadí */
            }
            #${CHAT_CONTAINER_ID} #sendButton:hover {
              transform: scale(1.05); /* Dle vašeho kódu */
              background: rgba(113,93,228,0.1); /* Dle vašeho kódu - pozor, tato barva (fialová) neodpovídá vašim gradientům (červeno-černá) */
              /* Pokud chcete použít barvu z gradientu, např. červenou: background: rgba(228, 3, 46, 0.1); */
            }
            #${CHAT_CONTAINER_ID} #sendButton .send-tooltip {
              position: absolute;
              bottom: 100%;
              left: 50%;
              transform: translateX(-50%);
              margin-bottom: 6px;
              background: #fff; /* Dle vašeho kódu */
              color: var(--text-dark); /* Dle vašeho kódu */
              padding: 4px 8px; /* Dle vašeho kódu */
              border-radius: 6px; /* Dle vašeho kódu */
              font-size: .8rem; /* Dle vašeho kódu */
              white-space: nowrap;
              opacity: 0;
              transition: opacity .2s ease;
              pointer-events: none;
              box-shadow: var(--shadow);
              z-index: 100001; /* Zvýšený z-index */
            }
            #${CHAT_CONTAINER_ID} #sendButton:hover .send-tooltip {
              opacity: 1;
            }

            #${CHAT_CONTAINER_ID} #sendIcon {
              width: 20px; height: 20px; /* Dle vašeho kódu */
              /* fill: var(--header-gradient); Gradient pro fill SVG není přímo podporován */
              fill: var(--user-gradient); /* Použita červená barva z vašeho gradientu */
            }

            /* Media queries - přeneseny 1:1 */
            @media (max-width: 600px) {
              #${CHAT_CONTAINER_ID} #chatIcon { width: 50px; height: 50px; font-size: 28px; }
              #${CHAT_CONTAINER_ID} #chatBoxContainer { bottom: 80px; right: 10px; width: 90vw; }
              #${CHAT_CONTAINER_ID} #chatHeader { padding: 8px 12px; }
              /* Pravidlo .message v media query by mělo být specifičtější, pokud má ovlivnit pouze zprávy v chatBoxu */
              #${CHAT_CONTAINER_ID} #chatBox .message { padding: 12px 16px; }
              #${CHAT_CONTAINER_ID} #inputContainer { padding: 8px 12px; }
              #${CHAT_CONTAINER_ID} #inputBox { font-size: .9rem; }
              #${CHAT_CONTAINER_ID} #sendButton { width: 36px; height: 36px; }
            }
        `;
        document.head.appendChild(style);

        const fontLink = document.createElement('link');
        fontLink.href = POPPINS_FONT_URL;
        fontLink.rel = 'stylesheet';
        document.head.appendChild(fontLink);
    }

    function createWidgetHTML(hostElement) {
        // HTML struktura je přenesena 1:1 z vašeho <body> bloku pro chatContainer
        hostElement.innerHTML = `
            <div id="${CHAT_CONTAINER_ID}">
              <div id="chatIcon">
                🤖<div class="tooltip">Potřebujete poradit?</div>
              </div>
              <div id="chatBoxContainer" class="close">
                <div id="chatHeader">
                  <span class="assistant-title">🤖Virtuální asistent <b>VariQ</b></span>
                  <div style="display:flex;align-items:center">
                    <div class="icon-container">
                      <span id="chatRefresh" class="icon">⟲</span>
                      <div class="icon-tooltip">Nový chat</div>
                    </div>
                    <div class="icon-container">
                      <span id="chatClose" class="icon">✖</span>
                      <div class="icon-tooltip">Zavřít</div>
                    </div>
                  </div>
                </div>
                <div id="chatBox"></div>
                <div id="inputContainer">
                  <input id="inputBox" type="text" placeholder="Zadejte zprávu…" />
                  <button id="sendButton" aria-label="Odeslat zprávu">
                    <svg id="sendIcon" viewBox="0 0 24 24">
                      <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
                    </svg>
                    <div class="send-tooltip">Odeslat</div>
                  </button>
                </div>
              </div>
            </div>
        `;
    }

    function initializeWidgetLogic() {
        // JavaScript logika je přenesena 1:1 z vašeho <script> bloku.
        // Konstanty API_BASE, clientID, STORAGE_KEY, TOPIC_KEY jsou definovány na začátku IIFE.

        let conversation = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]');
        let topicId = sessionStorage.getItem(TOPIC_KEY) || null;

        const chatIcon = document.getElementById('chatIcon');
        const chatBoxContainer = document.getElementById('chatBoxContainer');
        const chatClose = document.getElementById('chatClose');
        const chatRefresh = document.getElementById('chatRefresh');
        const chatBox = document.getElementById('chatBox');
        const inputBox = document.getElementById('inputBox');
        const sendButton = document.getElementById('sendButton');

        if (!chatIcon || !chatBoxContainer || !chatClose || !chatRefresh || !chatBox || !inputBox || !sendButton) {
            console.error('Vari Chatbot Widget: Chyba při inicializaci DOM elementů.');
            return;
        }

        function saveHistory() {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(conversation));
        }

        function addMessage(sender, content = '') {
          const msg = document.createElement('div');
          msg.className = `message ${sender}-message`;
          
          if (typeof marked !== 'undefined' && marked.parse && content != null) {
            msg.innerHTML = marked.parse(String(content));
          } else {
            msg.textContent = String(content);
            if (typeof marked === 'undefined') console.warn("Vari Chatbot: Knihovna marked.js není načtena.");
          }

          msg.addEventListener('mouseenter', () => {
            document.querySelectorAll(`#${CHAT_CONTAINER_ID} .save-icon`).forEach(el => {
              el.classList.remove('visible');
              setTimeout(() => { if (el.parentElement) el.remove(); }, 250);
            });
            if (!msg.querySelector('.save-icon')) {
              const saveIcon = document.createElement('span');
              saveIcon.className = 'save-icon';
              saveIcon.textContent = '💾';
              saveIcon.title = "Zkopírovat";
              msg.append(saveIcon);
              setTimeout(() => { saveIcon.classList.add('visible'); }, 10);

              const removeIcon = (delay = 250) => {
                saveIcon.classList.remove('visible');
                setTimeout(() => { if (saveIcon.parentElement) saveIcon.remove(); }, delay);
              };
              let timer = setTimeout(() => removeIcon(250), 3000);

              saveIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                clearTimeout(timer);
                const textToCopy = (msg.innerText || msg.textContent || "").replace(saveIcon.textContent, '').trim();
                navigator.clipboard.writeText(textToCopy).then(() => {
                    saveIcon.textContent = '✅Zkopírováno'; // Přesně dle vašeho kódu
                    saveIcon.title = "Zkopírováno!";
                    timer = setTimeout(() => removeIcon(250), 1000); // Přesně dle vašeho kódu
                }).catch(err => {
                    console.error("Chyba kopírování:", err);
                    saveIcon.textContent = '⚠️';
                    saveIcon.title = "Chyba kopírování";
                    timer = setTimeout(() => removeIcon(250), 1500);
                });
              });
            }
          });

          msg.addEventListener('mouseleave', () => {
            // Ponecháváme původní logiku z vašeho kódu
            document.querySelectorAll(`#${CHAT_CONTAINER_ID} .save-icon`).forEach(el => {
              el.classList.remove('visible');
              setTimeout(() => { if (el.parentElement) el.remove(); }, 250);
            });
          });

          chatBox.append(msg);

          if (sender === 'assistant') {
            msg.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            chatBox.scrollTop = chatBox.scrollHeight;
          }
          return msg;
        }

        async function clearChat() {
          document.querySelectorAll(`#${CHAT_CONTAINER_ID} .message`).forEach(m => m.remove()); // Cíleno na widget
          // chatRefresh.classList.add('rotate'); // Předpokládá existenci CSS pro .rotate

          try {
            await fetch(`${API_BASE}/reset`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ clientID }) // clientID z vrchu skriptu
            });
          } catch (err) {
            console.error("Chyba při resetování chatu na serveru:", err);
          }
          
          // setTimeout(() => { // Původní setTimeout
            conversation = [];
            topicId = null;
            sessionStorage.removeItem(STORAGE_KEY);
            sessionStorage.removeItem(TOPIC_KEY);
            // chatRefresh.classList.remove('rotate');
            if (chatBoxContainer.classList.contains('open')) { // Odeslat initial jen pokud je chat otevřený
                sendInitial();
            }
          // }, 600); // Původní zpoždění
        }
        
        async function sendInitial() {
            // Tato funkce by měla být volána jen když se chat poprvé otevře a je prázdný,
            // nebo po clearChat, pokud je chat stále otevřený.
             if (!chatBoxContainer.classList.contains('open')) {
                return; // Neinicializovat, pokud není okno otevřené
            }
            // Pokud už v chatBoxu něco je (např. z renderHistory), nevolat znovu
            if (chatBox.children.length > 0 && conversation.length > 0) {
                inputBox.focus();
                return;
            }


            inputBox.focus();
            const text = 'Dobrý den, s čím Vám mohu pomoci?😉 Můžete se mě zeptat na cokoli ohledně současné nabídky VARI😉';
            
            const bubble = document.createElement('div'); // Přesně dle vašeho kódu
            bubble.className = 'message assistant-message';
            bubble.style.filter = 'blur(10px)'; bubble.style.opacity = '0';
            chatBox.append(bubble);
            bubble.scrollIntoView({ behavior: 'smooth', block: 'start' });
            bubble.style.transition = 'opacity 1s ease,filter 1s ease';
            setTimeout(() => { bubble.style.opacity = '1'; bubble.style.filter = 'blur(0)'; }, 50);

            let idx = 0;
            const revealSpeed = 40;
            const ti = setInterval(() => {
              if (idx < text.length) { // Zajištění, že idx nepřekročí délku textu
                bubble.textContent += text[idx++];
                bubble.scrollIntoView({ behavior: 'smooth', block: 'start' });
              } else {
                clearInterval(ti);
                // Uložíme, pouze pokud tato zpráva ještě není v konverzaci (pro případ opakovaného volání)
                if (!conversation.some(m => m.role === 'assistant' && m.content === bubble.textContent)) {
                    conversation.push({ role:'assistant', content:bubble.textContent });
                    saveHistory();
                }
              }
            }, revealSpeed);
        }

        async function sendMessage() {
          const userText = inputBox.value.trim();
          if (!userText) return;
          
          conversation.push({ role:'user', content:userText });
          saveHistory(); 
          addMessage('user', userText);
          inputBox.value = '';
          inputBox.focus(); // Focus po odeslání a vymazání

          const loading = ['Přemýšlím....','Momentík...','Ještě chvilinku...','Děkuji za trpělivost😉','Už to bude...'];
          let li=0;
          const bubble = addMessage('assistant', loading[li]);
          bubble.classList.add('loading');
          // Původní kód: bubble.style.transition='opacity .8s ease'; bubble.style.opacity='1';
          // Toto by mělo být řešeno CSS pravidly pro .message a .loading, explicitní styl zde není nutný
          // a může přepsat přirozené přechody z CSS. Ponechávám pro shodu, pokud to bylo záměrné.
          bubble.style.transition='opacity .8s ease'; // Pokud chcete explicitní transition jen pro loading
          bubble.style.opacity='1';

          const textElement = bubble.querySelector('p') || bubble; // Cílový element pro text

          const loadInt = setInterval(()=>{
            bubble.style.opacity='0';
            setTimeout(()=>{
              textElement.textContent = loading[++li % loading.length];
              bubble.style.opacity='1';
              bubble.scrollIntoView({ behavior: 'smooth', block: 'start' });
            },500);
          },2000);

          let assistantText = ''; // Přejmenováno z assistantText pro zamezení konfliktu s vnější proměnnou, pokud by existovala
          try {
            const res = await fetch(`${API_BASE}/chat`, {
              method:'POST',
              headers:{'Content-Type':'application/json'},
              body: JSON.stringify({ clientID, history:conversation, topic_id:topicId }) // clientID z vrchu skriptu
            });

            if (!res.ok) {
                const errorBody = await res.text();
                throw new Error(`Server error: ${res.status} ${res.statusText} - ${errorBody}`);
            }

            const newTopic = res.headers.get('X-Trieve-Topic-ID');
            if(newTopic){ topicId=newTopic; sessionStorage.setItem(TOPIC_KEY,topicId); }

            const reader = res.body.getReader();
            const dec=new TextDecoder();
            let firstChunkReceived = false; // Přejmenováno z 'first'

            while(true){
              const {value,done} = await reader.read();
              if(done) break;
              
              const chunk = dec.decode(value,{stream:true});
              if(!firstChunkReceived){
                clearInterval(loadInt);
                bubble.classList.remove('loading');
                textElement.innerHTML = ''; // Vyčistíme text v <p> nebo přímo v bubble
                firstChunkReceived = true;
              }
              assistantText += chunk;
              textElement.innerHTML = marked.parse(assistantText); // Vkládáme do <p> nebo bubble
              bubble.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            // Uložíme až kompletní odpověď
            if (assistantText) { // Uložíme, jen pokud nějaká odpověď přišla
                conversation.push({ role:'assistant', content:assistantText });
                saveHistory();
            }
          } catch(err){
            clearInterval(loadInt);
            bubble.classList.remove('loading');
            textElement.textContent = 'Chyba při komunikaci se serverem.'; // Do <p> nebo bubble
            console.error("Chyba sendMessage:", err);
             if (assistantText === '') { // Pokud chyba nastala před jakoukoliv odpovědí
                 conversation.push({ role:'assistant', content: textElement.textContent });
                 saveHistory();
            }
            bubble.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } finally {
             inputBox.focus();
          }
        }

        function renderHistory(){
          chatBox.innerHTML = '';
          conversation.forEach(m => addMessage(m.role, m.content));
          if (chatBox.lastChild) {
              chatBox.lastChild.scrollIntoView({behavior: "auto", block: "end"});
          }
          inputBox.focus();
        }

        function toggleChat(open){
          const isCurrentlyOpen = chatBoxContainer.classList.contains('open');

          if(open){
            if (isCurrentlyOpen) { // Pokud je již otevřen, jen focus
                inputBox.focus();
                return;
            }
            chatIcon.style.display='none';
            chatBoxContainer.style.display='flex';
            setTimeout(()=>{
                chatBoxContainer.classList.remove('close'); // Ujistíme se, že 'close' je pryč
                chatBoxContainer.classList.add('open');
            } ,10); // Původní hodnota
            
            // Volání renderHistory nebo sendInitial se provede uvnitř setTimeout pro zajištění,
            // že se `classList.add('open')` stihne aplikovat a `sendInitial` nebude volat zbytečně,
            // pokud se chat otevře a hned se renderuje historie.
            setTimeout(() => {
                if (conversation.length > 0) {
                    renderHistory();
                } else {
                    sendInitial(); // sendInitial si samo zkontroluje, zda má běžet
                }
            }, 20); // Malé zpoždění po otevření

          } else {
            if (!isCurrentlyOpen) return; // Pokud je již zavřený

            // Původní kód: chatBoxContainer.classList.replace('open','close');
            // Pro větší jistotu:
            chatBoxContainer.classList.remove('open');
            chatBoxContainer.classList.add('close');

            setTimeout(()=>{
              chatBoxContainer.style.display='none';
              chatIcon.style.display='flex';
            }, 780); // Původně 400, ale transition je .8s, takže 780-800ms je lepší
          }
        }

        chatIcon.addEventListener('click', ()=>toggleChat(true));
        chatClose.addEventListener('click', ()=>toggleChat(false));
        chatRefresh.addEventListener('click', clearChat);
        sendButton.addEventListener('click', sendMessage);
        inputBox.addEventListener('keypress', e=>{ 
            if(e.key==='Enter' && !e.shiftKey) { // Původní podmínka byla jen e.key==='Enter'
                e.preventDefault();
                sendMessage(); 
            }
        });
        // Konec JavaScriptové logiky
    }

    // --- Pomocná funkce pro načtení externích skriptů ---
    function loadExternalScript(url, callback) {
        const script = document.createElement('script');
        script.src = url;
        script.onload = callback;
        script.onerror = () => console.error(`Vari Chatbot Widget: Nepodařilo se načíst externí skript ${url}`);
        document.head.appendChild(script);
    }

    // --- Hlavní inicializační funkce widgetu ---
    function initWidget() {
        let hostElement = document.getElementById(WIDGET_HOST_ID);
        if (!hostElement) {
            hostElement = document.createElement('div');
            hostElement.id = WIDGET_HOST_ID;
            document.body.appendChild(hostElement);
        }
        hostElement.innerHTML = ''; // Vyčistíme host element pro případ re-inicializace

        loadWidgetCSS(); // Načteme CSS

        loadExternalScript(MARKED_JS_URL, () => { // Načteme marked.js
            createWidgetHTML(hostElement);     // Vytvoříme HTML strukturu
            initializeWidgetLogic();           // Aplikujeme JS logiku
        });
    }

    // Spuštění widgetu
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWidget);
    } else {
        initWidget(); // DOM je již načten
    }

})();
