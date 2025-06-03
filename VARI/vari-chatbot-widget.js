(function() {
    // --- Konfigurace Widgetu ---
    const WIDGET_HOST_ID = 'vari-chatbot-host';
    const CHAT_CONTAINER_ID = 'chatContainer'; // Použijeme ID z vašeho HTML
    const POPPINS_FONT_URL = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap';
    const MARKED_JS_URL = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';

    // --- API a Klient ID (z vašeho kódu) ---
    const API_BASE = 'https://chatbot-production-4d1d.up.railway.app';
    const CLIENT_ID = 'VARI';
    // Použijeme původní názvy klíčů, ale pro widget je lepší je prefixovat,
    // aby se předešlo konfliktům na hostitelské stránce.
    // Pro maximální shodu s kódem ponechávám původní, ale doporučuji zvážit prefix.
    const STORAGE_KEY = 'chat_history'; // Původní: 'chat_history'; Doporučeno: `vari_widget_chat_history`
    const TOPIC_KEY = 'etrieve_topic_id'; // Původní: 'etrieve_topic_id'; Doporučeno: `vari_widget_etrieve_topic_id`

    // --- Funkce pro načtení CSS ---
    function loadWidgetCSS() {
        const style = document.createElement('style');
        style.textContent = `
            /* CSS Proměnné z vašeho :root - budou platit v kontextu widgetu */
            #${CHAT_CONTAINER_ID} { /* Aplikujeme font-family přímo na root widgetu */
              font-family: 'Poppins', sans-serif;
              /* CSS proměnné pro widget */
              --header-gradient: linear-gradient(90deg,#ff0101,#000000);
              --user-gradient: #e4032e;
              --assistant-color: #F4F4F9;
              --text-light: #ffffff;
              --text-dark: #000000;
              --bg: #fff;
              --shadow: rgba(0,0,0,0.1) 0 4px 12px;
              --shadow-hover: rgba(0,0,0,0.2) 0 6px 16px;
              box-sizing: border-box;
            }

            /* Základní reset pro prvky uvnitř widgetu, aby se minimalizoval vliv stylů hostitelské stránky */
            #${CHAT_CONTAINER_ID} *, #${CHAT_CONTAINER_ID} *::before, #${CHAT_CONTAINER_ID} *::after {
                box-sizing: border-box;
                /* margin: 0;  Ponecháme původní CSS, pokud explicitně nastavuje margin/padding */
                /* padding: 0; */
                /* border-width: 0; */
                /* font: inherit; Dědí z #${CHAT_CONTAINER_ID} */
                /* color: inherit; */
                /* background: transparent; */
                /* text-align: left; */
            }
             #${CHAT_CONTAINER_ID} button, #${CHAT_CONTAINER_ID} input, #${CHAT_CONTAINER_ID} div, #${CHAT_CONTAINER_ID} span {
                font-family: 'Poppins', sans-serif; /* Zajistíme, že všechny relevantní prvky dědí font */
             }

            /* Původní styly pro 'html, body' a 'body::before' (s pozadi.png) jsou VYNECHÁNY. */
            /* Widget nemůže a neměl by stylovat globální prvky hostitelské stránky. */

            /* Keyframes - ponechány, jak jsou */
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

            /* Styly pro #${CHAT_CONTAINER_ID} a jeho potomky - přeneseny 1:1 z vašeho kódu */
            /* Je důležité, aby se všechny selektory vztahovaly k prvkům *uvnitř* #${CHAT_CONTAINER_ID} */

            #${CHAT_CONTAINER_ID} {
              position: fixed; bottom: 20px; right: 20px;
              z-index: 99999; /* Zvýšený z-index pro widget */
            }
            #${CHAT_CONTAINER_ID} * { pointer-events: auto; } /* Tento styl je v pořádku */

            #${CHAT_CONTAINER_ID} #chatIcon {
              width: 64px; height: 64px; border-radius: 50%;
              display: flex; align-items: center; justify-content: center;
              color: var(--text-light); font-size: 36px;
              cursor: pointer; animation: pulse 2s infinite;
              box-shadow: var(--shadow); position: relative; overflow: hidden;
              background: transparent;
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
              /* Původní: position: fixed; bottom:100px; right:20px; */
              /* Pro widget je vhodnější pozicovat relativně k #${CHAT_CONTAINER_ID} nebo ponechat fixed, pokud má být nezávislý */
              /* Ponecháme fixed, jak bylo v originále, aby se co nejvíce shodovalo */
              position: fixed; bottom:100px; right:20px;
              flex-direction: column;
              opacity: 0;
              overflow: hidden; /* Ponecháno, ale může oříznout stíny/tooltipy, pokud přesahují */
              transform: translateY(20px);
              transition: all .8s ease;
            }
            #${CHAT_CONTAINER_ID} #chatBoxContainer.open {
              display: flex;
              opacity: 1;
              transform: translateY(0);
              height: 70vh !important; /* Ponecháno !important dle originálu */
            }

            #${CHAT_CONTAINER_ID} #chatHeader {
              padding: 10px 16px;
              display: flex; justify-content: space-between; align-items: center;
              border-top-left-radius: 24px; border-top-right-radius: 24px;
              position: relative;
              overflow: visible; /* Důležité pro blur efekt ::before */
              background: transparent;
              color: var(--text-light); /* Přidáno pro jistotu, že text bude bílý */
            }
            #${CHAT_CONTAINER_ID} #chatHeader::before {
              content:""; position:absolute; inset:0;
              background:var(--header-gradient);
              filter:blur(20px); transform:scale(1.2); /* Efekt přesahu pro rozmazání */
              z-index:-1;
              border-top-left-radius: inherit; /* Dědí zaoblení z rodiče */
              border-top-right-radius: inherit;
            }
            #${CHAT_CONTAINER_ID} .assistant-title { /* Selektor je již správně obecný */
                position: relative; font-size: 20px; color: white; /* color: white; z originálu */
                font-weight: normal; /* Explicitně, pokud by dědil něco jiného */
            }
            #${CHAT_CONTAINER_ID} .assistant-title b { font-weight: bold; } /* Zachování tučného písma */

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
              font-size: 20px;
              color: var(--text-light);
              transition: transform .3s ease;
              padding: 2px; /* Malé odsazení pro lepší klikatelnost */
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
              background: #fff; /* Ponecháno #fff dle originálu */
              color: var(--text-dark);
              padding: 4px 8px;
              border-radius: 6px;
              font-size: .8rem;
              white-space: nowrap;
              opacity: 0;
              transition: opacity .2s ease;
              pointer-events: none;
              box-shadow: var(--shadow);
              z-index: 100000; /* Zvýšený z-index pro tooltip */
            }
            #${CHAT_CONTAINER_ID} .icon-container:hover .icon-tooltip {
              opacity: 1;
            }

            #${CHAT_CONTAINER_ID} #chatBox {
              flex: 1; padding: 16px;
              display: flex; flex-direction: column; gap: 12px;
              overflow-y: auto;
              background-color: var(--bg); /* Explicitně pozadí chatboxu, pokud se liší od #chatBoxContainer */
              scrollbar-width: thin;
              scrollbar-color: var(--user-gradient) var(--assistant-color); /* Upraveno na solidní barvu pro první argument */
            }
            #${CHAT_CONTAINER_ID} #chatBox::-webkit-scrollbar { width: 6px; }
            #${CHAT_CONTAINER_ID} #chatBox::-webkit-scrollbar-thumb {
              background: var(--user-gradient); /* Upraveno na solidní barvu */
              border-radius: 3px;
            }

            #${CHAT_CONTAINER_ID} #chatBox .message {
              display: inline-block; /* Dle originálu */
              width: auto; /* Dle originálu */
              max-width: 85%;
              white-space: pre-wrap;
              overflow-wrap: break-word;
              transition: transform .8s cubic-bezier(.45,1.35,.55,1.02), box-shadow .8s cubic-bezier(.45,1.35,.55,1.02);
              position: relative; /* Pro save-icon */
              /* Padding a border-radius jsou definovány níže v .message */
              line-height: 1.5; /* Přesunuto z .message níže pro sjednocení */
              box-shadow: var(--shadow); /* Přesunuto z .message níže pro sjednocení */
            }
            #${CHAT_CONTAINER_ID} #chatBox .message p {
              display: inline; /* Dle originálu */
              margin: 0; /* Dle originálu */
              /* font-size a color by měly být zděděny z .message */
            }

            /* Tento .message je obecnější, ale měl by se aplikovat na zprávy v chatBoxu */
            /* Pro větší specificitu by bylo lepší #${CHAT_CONTAINER_ID} #chatBox .message, ale držím se originálu */
            #${CHAT_CONTAINER_ID} .message { /* Tento styl ovlivní jak .user-message tak .assistant-message pokud nemají vlastní přepsání */
              position: relative;
              background: var(--assistant-color); /* Výchozí pro assistant */
              color: var(--text-dark); /* Výchozí pro assistant */
              align-self: flex-start; /* Výchozí pro assistant */
              padding: 16px 24px; /* Dle originálu */
              border-radius: 24px; /* Dle originálu */
              /* line-height a box-shadow přesunuty výše do #${CHAT_CONTAINER_ID} #chatBox .message */
            }
            #${CHAT_CONTAINER_ID} .message:hover { /* Platí pro všechny .message */
              transform: scale(1.03);
              box-shadow: var(--shadow-hover);
            }
            #${CHAT_CONTAINER_ID} .assistant-message.loading { font-style: italic; opacity: .7; }
            #${CHAT_CONTAINER_ID} .user-message { /* Specifické pro uživatele, přepíše .message */
              background: var(--user-gradient);
              color: var(--text-light);
              align-self: flex-end;
              text-align: right; /* Dle originálu */
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
              font-size: 1.15em;
              background: #fff; /* Dle originálu */
              color: var(--text-dark); /* Barva pro ikonu, aby byla viditelná na bílém pozadí */
              border-radius: 7px;
              padding: 1px 8px;
              box-shadow: var(--shadow);
              z-index: 2; /* Dle originálu */
              pointer-events: all; /* Dle originálu */
            }
            #${CHAT_CONTAINER_ID} .save-icon.visible {
              opacity: 1;
              transform: scale(1);
            }

            #${CHAT_CONTAINER_ID} #inputContainer {
              display: flex;
              align-items: center; /* Pro vertikální zarovnání obsahu */
              border-top: 1px solid #eee; /* Dle originálu */
              padding: 10px 16px; /* Dle originálu */
              background-color: var(--bg); /* Zajistí pozadí, pokud by #chatBoxContainer mělo jiné */
              border-bottom-left-radius: 24px; /* Aby odpovídalo kontejneru */
              border-bottom-right-radius: 24px;
            }
            #${CHAT_CONTAINER_ID} #inputBox {
              flex: 1;
              padding: 10px 14px;
              border: 1px solid #ddd; /* Dle originálu */
              border-radius: 20px;
              font-size: 1rem;
              outline: none;
              transition: border-color .8s ease;
              font-style: italic;
              color: var(--text-dark); /* Barva textu v inputu */
              background-color: #fff; /* Barva pozadí inputu */
            }
            #${CHAT_CONTAINER_ID} #inputBox:focus {
                /* border-color: var(--header-gradient); Gradient není pro border ideální */
                border: 1px solid var(--user-gradient); /* Použita solidní červená barva pro focus */
                font-style: normal; /* Při focusu normální styl */
            }
            #${CHAT_CONTAINER_ID} #inputBox::placeholder {
                color: #999; /* Barva placeholderu */
                font-style: italic;
            }

            #${CHAT_CONTAINER_ID} #sendButton {
              background: none;
              border: none;
              margin-left: 12px;
              width: 40px; height: 40px;
              display: flex; align-items: center; justify-content: center;
              cursor: pointer;
              transition: transform .4s ease, background-color .8s ease;
              position: relative;
              border-radius: 50%; /* Přidáno pro hover efekt */
            }
            #${CHAT_CONTAINER_ID} #sendButton:hover {
              transform: scale(1.05);
              background: rgba(228, 3, 46, 0.1); /* Světlejší červená pro hover, odvozeno z --user-gradient */
            }
            #${CHAT_CONTAINER_ID} #sendButton .send-tooltip {
              position: absolute;
              bottom: 100%;
              left: 50%;
              transform: translateX(-50%);
              margin-bottom: 6px;
              background: #fff; /* Dle originálu */
              color: var(--text-dark);
              padding: 4px 8px;
              border-radius: 6px;
              font-size: .8rem;
              white-space: nowrap;
              opacity: 0;
              transition: opacity .2s ease;
              pointer-events: none;
              box-shadow: var(--shadow);
              z-index: 100000; /* Zvýšený z-index */
            }
            #${CHAT_CONTAINER_ID} #sendButton:hover .send-tooltip {
              opacity: 1;
            }

            #${CHAT_CONTAINER_ID} #sendIcon {
              width: 20px; height: 20px;
              /* fill: var(--header-gradient); Gradient pro fill není přímo podporován */
              fill: var(--user-gradient); /* Použita solidní červená barva */
            }

            /* Media queries - ponechány, jak jsou, jen obaleny do #${CHAT_CONTAINER_ID} pokud by bylo potřeba */
            /* Většina selektorů uvnitř je již s ID, takže by měly fungovat správně */
            @media (max-width: 600px) {
              #${CHAT_CONTAINER_ID} #chatIcon { width: 50px; height: 50px; font-size: 28px; }
              #${CHAT_CONTAINER_ID} #chatBoxContainer { bottom: 80px; right: 10px; width: 90vw; } /* Ponecháno dle originálu */
              #${CHAT_CONTAINER_ID} #chatHeader { padding: 8px 12px; }
              #${CHAT_CONTAINER_ID} .message { padding: 12px 16px; } /* Platí pro všechny zprávy */
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
        // Použijeme přesnou HTML strukturu z vašeho kódu
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
        // JavaScript logika je přenesena 1:1 z vašeho <script> bloku
        // Konstanty API_BASE, CLIENT_ID, STORAGE_KEY, TOPIC_KEY jsou definovány na začátku IIFE

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
          
          // Zajištění, že `marked.parse` je dostupné a `content` není null/undefined
          if (typeof marked !== 'undefined' && marked.parse && content != null) {
            msg.innerHTML = marked.parse(String(content));
          } else {
            msg.textContent = String(content); // Fallback na prostý text
            if (typeof marked === 'undefined') console.warn("Vari Chatbot: Knihovna marked.js není načtena.");
          }


          msg.addEventListener('mouseenter', () => {
            document.querySelectorAll(`#${CHAT_CONTAINER_ID} .save-icon`).forEach(el => { // Zacílení v rámci widgetu
              el.classList.remove('visible');
              setTimeout(() => { if(el.parentElement) el.remove(); }, 250);
            });
            if (!msg.querySelector('.save-icon')) {
              const saveIcon = document.createElement('span');
              saveIcon.className = 'save-icon';
              saveIcon.textContent = '💾';
              saveIcon.title = 'Zkopírovat';
              msg.append(saveIcon);
              setTimeout(() => { saveIcon.classList.add('visible'); }, 10);

              const removeIcon = (delay = 250) => {
                saveIcon.classList.remove('visible');
                setTimeout(() => { if(saveIcon.parentElement) saveIcon.remove(); }, delay);
              };
              let timer = setTimeout(() => removeIcon(250), 3000); // Automatické odstranění po 3s

              saveIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                clearTimeout(timer);
                const textToCopy = (msg.innerText || msg.textContent || "").replace(saveIcon.textContent, '').trim();
                navigator.clipboard.writeText(textToCopy).then(() => {
                    saveIcon.textContent = '✅';
                    saveIcon.title = 'Zkopírováno!';
                    timer = setTimeout(() => removeIcon(250), 1000); // Zmizí po 1s
                }).catch(err => {
                    console.error("Chyba kopírování: ", err);
                    saveIcon.textContent = '⚠️';
                    saveIcon.title = 'Chyba kopírování';
                    timer = setTimeout(() => removeIcon(250), 1500);
                });
              });
            }
          });

          msg.addEventListener('mouseleave', () => {
            // Odstranění všech save-icon, které by mohly zůstat viset
            // Původní kód odstraňoval všechny, zde zacílíme na ikonu v této zprávě
            const currentSaveIcon = msg.querySelector('.save-icon.visible');
            if (currentSaveIcon) {
                let leaveTimer = setTimeout(() => {
                    currentSaveIcon.classList.remove('visible');
                    setTimeout(() => { if(currentSaveIcon.parentElement) currentSaveIcon.remove(); }, 250);
                }, 300); // Krátké zpoždění
                // Pokud uživatel najede zpět na ikonu, neodstraňuj
                currentSaveIcon.addEventListener('mouseenter', () => clearTimeout(leaveTimer));
            }
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
          chatBox.innerHTML = ''; // Efektivnější vymazání zpráv z DOMu
          // Původní: document.querySelectorAll('.message').forEach(m => m.remove());
          
          // chatRefresh.classList.add('rotate'); // Pokud máte CSS pro '.rotate'
          // setTimeout(() => chatRefresh.classList.remove('rotate'), 600);
          
          try {
            await fetch(`${API_BASE}/reset`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ clientID: CLIENT_ID }) // Použita konstanta z vrchu skriptu
            });
          } catch(err) {
            console.error("Chyba při resetování chatu na serveru:", err);
          }

          conversation = [];
          topicId = null;
          sessionStorage.removeItem(STORAGE_KEY);
          sessionStorage.removeItem(TOPIC_KEY);
          sendInitial();
        }
        
        async function sendInitial() {
            // Nyní voláno pouze pokud je chat otevřený a prázdný
            if (!chatBoxContainer.classList.contains('open') || chatBox.children.length > 0) {
                 if (chatBoxContainer.classList.contains('open')) inputBox.focus();
                 return;
            }

            inputBox.focus();
            const text = 'Dobrý den, s čím Vám mohu pomoci?😉 Můžete se mě zeptat na cokoli ohledně současné nabídky VARI😉';
            
            // Použijeme addMessage pro konzistenci, ale s vlastní logikou pro "psaní"
            const bubbleContainer = addMessage('assistant', ''); // Vytvoří kontejner zprávy
            const textElement = bubbleContainer.querySelector('p') || bubbleContainer; // Najdeme element pro text
            textElement.textContent = ''; // Vyčistíme případný obsah z addMessage

            bubbleContainer.style.filter = 'blur(10px)'; bubbleContainer.style.opacity = '0';
            // chatBox.append(bubbleContainer); // Již je appendnuto v addMessage
            bubbleContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            bubbleContainer.style.transition = 'opacity 1s ease, filter 1s ease';
            setTimeout(() => { bubbleContainer.style.opacity = '1'; bubbleContainer.style.filter = 'blur(0)'; }, 50);

            let idx = 0;
            const revealSpeed = 40;
            const ti = setInterval(() => {
              if (idx < text.length) {
                textElement.textContent += text[idx++];
                bubbleContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
              } else {
                clearInterval(ti);
                if (!conversation.find(m => m.role === 'assistant' && m.content === text)) {
                    conversation.push({ role:'assistant', content:text }); // Použijeme text, ne bubble.textContent
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
          addMessage('user', userText); // Přidá uživatelskou zprávu do DOMu
          inputBox.value = '';
          inputBox.focus();


          const loading = ['Přemýšlím....','Momentík...','Ještě chvilinku...','Děkuji za trpělivost😉','Už to bude...'];
          let li=0;
          const bubble = addMessage('assistant', loading[li]); // Přidá "loading" zprávu
          bubble.classList.add('loading');
          const textElement = bubble.querySelector('p') || bubble; // Element pro text v loading bublině

          // Původní kód měl transition na opacity, což je v pořádku
          // bubble.style.transition='opacity .8s ease'; bubble.style.opacity='1'; 
          // Toto je implicitně nastaveno třídou .loading nebo .message

          const loadInt = setInterval(()=>{
            bubble.style.opacity='0'; // Fade out
            setTimeout(()=>{
              textElement.textContent = loading[++li % loading.length]; // Změníme text
              bubble.style.opacity='1'; // Fade in
              bubble.scrollIntoView({ behavior: 'smooth', block: 'start' });
            },500); // Půl sekundy na fade out a změnu textu
          },2000);

          let assistantText = '';
          try {
            const res = await fetch(`${API_BASE}/chat`, {
              method:'POST',
              headers:{'Content-Type':'application/json'},
              body: JSON.stringify({ clientID: CLIENT_ID, history:conversation, topic_id:topicId })
            });

            if (!res.ok) { // Lepší ošetření chyb
                const errorBody = await res.text();
                throw new Error(`Server error: ${res.status} ${res.statusText} - ${errorBody}`);
            }

            const newTopic = res.headers.get('X-Trieve-Topic-ID');
            if(newTopic){ topicId=newTopic; sessionStorage.setItem(TOPIC_KEY,topicId); }

            const reader = res.body.getReader();
            const dec=new TextDecoder();
            let firstChunkReceived = false; // Renamed from 'first' for clarity

            while(true){
              const {value,done} = await reader.read();
              if(done) break;
              
              const chunk = dec.decode(value,{stream:true});
              if(!firstChunkReceived){ // Původně 'first'
                clearInterval(loadInt);
                bubble.classList.remove('loading');
                textElement.innerHTML = ''; // Vyčistíme loading text z <p> elementu
                firstChunkReceived = true;
              }
              assistantText += chunk;
              textElement.innerHTML = marked.parse(assistantText); // Renderujeme do <p> elementu
              bubble.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            conversation.push({ role:'assistant', content:assistantText });
            saveHistory();
          } catch(err){
            clearInterval(loadInt); // Důležité i zde
            bubble.classList.remove('loading');
            textElement.textContent = 'Chyba při komunikaci se serverem.';
            console.error("Chyba sendMessage:", err);
            // Přidáme i do konverzace, pokud ještě nebyla přidána odpověď
             if (assistantText === '') {
                 conversation.push({ role:'assistant', content: textElement.textContent });
                 saveHistory();
            }
            bubble.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } finally {
             inputBox.focus();
          }
        }

        function renderHistory(){
          chatBox.innerHTML = ''; // Vyčistíme DOM
          conversation.forEach(m => addMessage(m.role, m.content));
          if (chatBox.lastChild) { // Scroll na konec po renderování historie
            chatBox.lastChild.scrollIntoView({behavior: "auto", block: "end"});
          }
          inputBox.focus();
        }

        function toggleChat(open){
          const isCurrentlyOpen = chatBoxContainer.classList.contains('open');
          if (open && isCurrentlyOpen) { // Chceme otevřít, už je otevřeno
              inputBox.focus();
              return;
          }
          if (!open && !isCurrentlyOpen) return; // Chceme zavřít, už je zavřeno

          if(open){
            chatIcon.style.display='none';
            chatBoxContainer.style.display='flex'; // Nejdříve zobrazit, pak animovat
            setTimeout(()=> {
                chatBoxContainer.classList.remove('close'); // Odebereme 'close'
                chatBoxContainer.classList.add('open');
            }, 10); // Krátký timeout pro CSS transition
            
            if (conversation.length === 0) { // Pokud je historie prázdná
                sendInitial();
            } else {
                renderHistory();
            }
            // inputBox.focus(); // Již je v sendInitial a renderHistory
          } else {
            chatBoxContainer.classList.remove('open');
            chatBoxContainer.classList.add('close'); // Přidáme 'close'
            setTimeout(()=>{
              chatBoxContainer.style.display='none';
              chatIcon.style.display='flex';
            }, 780); // Odpovídá transition duration (all .8s)
          }
        }

        chatIcon.addEventListener('click', ()=>toggleChat(true));
        chatClose.addEventListener('click', ()=>toggleChat(false));
        chatRefresh.addEventListener('click', clearChat);
        sendButton.addEventListener('click', sendMessage);
        inputBox.addEventListener('keypress', e=>{ 
            if(e.key==='Enter' && !e.shiftKey) { // Odeslat na Enter, pokud není držen Shift
                e.preventDefault(); // Zabráníme např. vložení nového řádku
                sendMessage(); 
            }
        });
        // Konec JavaScript logiky
    }

    function loadExternalScript(url, callback) {
        const script = document.createElement('script');
        script.src = url;
        script.onload = callback;
        script.onerror = () => console.error(`Vari Chatbot Widget: Nepodařilo se načíst ${url}`);
        document.head.appendChild(script);
    }

    function initWidget() {
        let hostElement = document.getElementById(WIDGET_HOST_ID);
        if (!hostElement) {
            hostElement = document.createElement('div');
            hostElement.id = WIDGET_HOST_ID;
            document.body.appendChild(hostElement);
        }
        hostElement.innerHTML = '';

        loadWidgetCSS();
        loadExternalScript(MARKED_JS_URL, () => {
            createWidgetHTML(hostElement);
            initializeWidgetLogic();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWidget);
    } else {
        initWidget();
    }
})();
