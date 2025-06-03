(function() {
    // --- Konfigurace Widgetu ---
    const WIDGET_HOST_ID = 'vari-chatbot-host'; // ID elementu na stránce, kam se widget může vložit
    const CHAT_CONTAINER_ID = 'chatContainer'; // ID hlavního kontejneru widgetu (z vašeho HTML)
    const POPPINS_FONT_URL = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap';
    const MARKED_JS_URL = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';

    // --- API a Klient ID (z vašeho kódu) ---
    const API_BASE = 'https://chatbot-production-4d1d.up.railway.app';
    const CLIENT_ID = 'VARI';
    const STORAGE_KEY_PREFIX = 'vari_widget_'; // Prefix pro sessionStorage klíče

    // --- Funkce pro načtení CSS ---
    function loadWidgetCSS() {
        const style = document.createElement('style');
        style.textContent = `
            /* Widget Scoped Variables - Applied to #${CHAT_CONTAINER_ID} to avoid global :root conflicts if any */
            #${CHAT_CONTAINER_ID} {
              --header-gradient: linear-gradient(90deg,#ff0101,#000000);
              --user-gradient: #e4032e;
              --assistant-color: #F4F4F9;
              --text-light: #ffffff;
              --text-dark: #000000;
              --bg: #fff;
              --shadow: rgba(0,0,0,0.1) 0 4px 12px;
              --shadow-hover: rgba(0,0,0,0.2) 0 6px 16px;
              font-family: 'Poppins', sans-serif; /* Apply font family to the root of the widget */
              box-sizing: border-box;
            }

            #${CHAT_CONTAINER_ID} *, #${CHAT_CONTAINER_ID} *::before, #${CHAT_CONTAINER_ID} *::after {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
                border-width: 0;
                font: inherit;
                color: inherit;
                background: transparent;
                text-align: left;
            }
             #${CHAT_CONTAINER_ID} button, #${CHAT_CONTAINER_ID} input {
                font-family: 'Poppins', sans-serif;
             }
            /* Poznámka: Původní styly pro 'html, body' a 'body::before' (s pozadi.png) byly odstraněny,
               protože widget by neměl ovlivňovat globální styly hostitelské stránky. */

            @keyframes gradientFlow { /* Prefixed or ensure no name collision */
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
            @keyframes pulse { /* Prefixed or ensure no name collision */
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.1); }
            }
            @keyframes slideIn { /* Prefixed or ensure no name collision */
              from { transform: translateX(-10px); opacity: 0; }
              to   { transform: translateX(0); opacity: 1; }
            }

            /* Všechny následující styly jsou z vašeho původního <style> bloku,
               a měly by být aplikovány v kontextu #${CHAT_CONTAINER_ID} */

            #${CHAT_CONTAINER_ID} { /* Již existuje, sloučeno výše */
              position: fixed; bottom: 20px; right: 20px;
              z-index: 99999; /* Higher z-index for widget */
            }
            #${CHAT_CONTAINER_ID} * { pointer-events: auto; } /* Selektor upraven pro kontext widgetu */

            #${CHAT_CONTAINER_ID} #chatIcon {
              width: 64px; height: 64px; border-radius: 50%;
              display: flex; align-items: center; justify-content: center;
              color: var(--text-light); font-size: 36px;
              cursor: pointer; animation: pulse 2s infinite;
              box-shadow: var(--shadow); position: relative; overflow: hidden;
              /* background: transparent; (již z resetu) */
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
              /* position: fixed; Původně fixed, pro widget je lepší absolute vzhledem k #${CHAT_CONTAINER_ID} */
              position: absolute; /* Upraveno pro lepší pozicování widgetu */
              bottom: 85px; /* (Výška ikony + mezera) */
              right: 0;
              flex-direction: column;
              opacity: 0;
              overflow: hidden;
              transform: translateY(20px);
              transition: all .8s ease;
              height: 0px; /* Počáteční výška, .open ji přepíše */
            }
            #${CHAT_CONTAINER_ID} #chatBoxContainer.open {
              display: flex;
              opacity: 1;
              transform: translateY(0);
              height: 70vh !important; /* Maximální výška 70% viewportu */
              max-height: 650px; /* Přidána maximální pevná výška */
            }

            #${CHAT_CONTAINER_ID} #chatHeader {
              padding: 10px 16px;
              display: flex; justify-content: space-between; align-items: center;
              border-top-left-radius: 24px; border-top-right-radius: 24px;
              position: relative;
              overflow: visible; /* Ponecháno dle originálu */
              /* background: transparent; (již z resetu) */
              color: var(--text-light); /* Přidáno pro text v hlavičce */
            }
            #${CHAT_CONTAINER_ID} #chatHeader::before {
              content:""; position:absolute; inset:0;
              background:var(--header-gradient);
              filter:blur(20px); transform:scale(1.2);
              z-index:-1;
              border-top-left-radius: 24px; border-top-right-radius: 24px; /* Aby blur efekt kopíroval zaoblení */
            }
            #${CHAT_CONTAINER_ID} .assistant-title {
                position: relative; font-size: 20px; color: var(--text-light); /* Explicitně barva z proměnné */
                font-weight: 500; /* Zvýraznění */
            }
             #${CHAT_CONTAINER_ID} .assistant-title b { font-weight: 700; } /* Pro tučné písmo v názvu */
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
              padding: 5px; /* Pro snadnější kliknutí */
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
              background: var(--bg); /* Použita proměnná */
              color: var(--text-dark);
              padding: 4px 8px;
              border-radius: 6px;
              font-size: .8rem;
              white-space: nowrap;
              opacity: 0;
              transition: opacity .2s ease;
              pointer-events: none;
              box-shadow: var(--shadow);
              z-index: 10; /* Vyšší z-index pro tooltip v hlavičce */
            }
            #${CHAT_CONTAINER_ID} .icon-container:hover .icon-tooltip {
              opacity: 1;
            }

            #${CHAT_CONTAINER_ID} #chatBox {
              flex: 1; padding: 16px;
              display: flex; flex-direction: column; gap: 12px;
              overflow-y: auto;
              background: var(--bg); /* Explicitní pozadí pro chatbox */
              scrollbar-width: thin;
              /* scrollbar-color: var(--header-gradient) var(--assistant-color); 'var(--header-gradient)' je gradient, použijeme solidní barvu */
              scrollbar-color: var(--user-gradient) var(--assistant-color);
            }
            #${CHAT_CONTAINER_ID} #chatBox::-webkit-scrollbar { width: 6px; }
            #${CHAT_CONTAINER_ID} #chatBox::-webkit-scrollbar-thumb {
              /* background: var(--header-gradient); Gradient pro scrollbar thumb není ideální */
              background: var(--user-gradient); /* Použita solidní barva */
              border-radius: 3px;
            }

            #${CHAT_CONTAINER_ID} #chatBox .message {
              /* display: inline-block; Není potřeba, flex rodič se stará o zarovnání */
              width: auto;
              max-width: 85%;
              white-space: pre-wrap;
              overflow-wrap: break-word;
              transition: transform .3s cubic-bezier(.45,1.35,.55,1.02), box-shadow .3s cubic-bezier(.45,1.35,.55,1.02); /* Zrychlená animace */
              position: relative; /* Pro save-icon */
              padding: 12px 18px; /* Jednotné odsazení */
              border-radius: 18px; /* Jednotné zaoblení */
              line-height: 1.5;
              box-shadow: var(--shadow);
            }
            #${CHAT_CONTAINER_ID} #chatBox .message p {
              /* display: inline; Může způsobovat problémy s blokovými elementy z marked.js */
              margin: 0; /* Ponecháno */
              font-size: 0.95rem; /* Velikost textu v bublině */
            }

            #${CHAT_CONTAINER_ID} .message { /* Tento obecný selektor již máme pokrytý v #${CHAT_CONTAINER_ID} #chatBox .message */
              /* Vlastnosti přesunuty do #${CHAT_CONTAINER_ID} #chatBox .message */
            }
            #${CHAT_CONTAINER_ID} #chatBox .message:hover { /* Upraven selektor */
              transform: scale(1.02); /* Jemnější hover efekt */
              box-shadow: var(--shadow-hover);
            }
            #${CHAT_CONTAINER_ID} .assistant-message { /* Specifické pro asistenta */
                background: var(--assistant-color);
                color: var(--text-dark);
                align-self: flex-start;
            }
            #${CHAT_CONTAINER_ID} .assistant-message.loading { font-style: italic; opacity: .7; }

            #${CHAT_CONTAINER_ID} .user-message { /* Specifické pro uživatele */
              background: var(--user-gradient);
              color: var(--text-light);
              align-self: flex-end;
              /* text-align: right; Není potřeba, align-self: flex-end se postará */
            }

            #${CHAT_CONTAINER_ID} .save-icon {
              display: inline-block;
              position: absolute;
              top: 8px;
              right: 10px;
              opacity: 0;
              transform: scale(0.8);
              transition: opacity 0.25s cubic-bezier(.45,1.35,.55,1.02), transform 0.25s cubic-bezier(.45,1.35,.55,1.02);
              cursor: pointer;
              user-select: none;
              font-size: 1.1em; /* Upravena velikost */
              background: var(--bg); /* Použita proměnná */
              color: var(--text-dark); /* Barva ikony */
              border-radius: 7px;
              padding: 2px 6px; /* Upravené odsazení */
              box-shadow: var(--shadow);
              z-index: 2;
              pointer-events: all;
            }
            #${CHAT_CONTAINER_ID} .save-icon.visible {
              opacity: 1;
              transform: scale(1);
            }

            #${CHAT_CONTAINER_ID} #inputContainer {
              display: flex;
              align-items: center; /* Vertikální zarovnání */
              border-top: 1px solid #eee;
              padding: 10px 16px;
              background: var(--bg); /* Explicitní pozadí */
              border-bottom-left-radius: 24px; /* Aby kopírovalo zaoblení #chatBoxContainer */
              border-bottom-right-radius: 24px;
            }
            #${CHAT_CONTAINER_ID} #inputBox {
              flex: 1;
              padding: 10px 14px;
              border: 1px solid #ddd;
              border-radius: 20px;
              font-size: 1rem;
              outline: none;
              transition: border-color .3s ease; /* Zrychlená animace */
              font-style: italic;
              color: var(--text-dark); /* Explicitní barva textu */
              background-color: #fff; /* Explicitní pozadí */
            }
            #${CHAT_CONTAINER_ID} #inputBox:focus {
                /* border-color: var(--header-gradient); Gradient pro border není ideální */
                border-color: var(--user-gradient); /* Použita solidní barva */
                font-style: normal; /* Při focusu normální styl písma */
            }
            #${CHAT_CONTAINER_ID} #inputBox::placeholder {
                color: #aaa;
                font-style: italic;
            }

            #${CHAT_CONTAINER_ID} #sendButton {
              /* background: none; (již z resetu) */
              /* border: none; (již z resetu) */
              margin-left: 12px;
              width: 40px; height: 40px;
              display: flex; align-items: center; justify-content: center;
              cursor: pointer;
              transition: transform .2s ease, background-color .3s ease; /* Zrychlená animace */
              position: relative;
              border-radius: 50%; /* Pro konzistentní hover efekt */
            }
            #${CHAT_CONTAINER_ID} #sendButton:hover {
              transform: scale(1.05);
              background-color: rgba(228, 3, 46, 0.1); /* Barva odvozená z --user-gradient */
            }
            #${CHAT_CONTAINER_ID} #sendButton .send-tooltip {
              position: absolute;
              bottom: 100%;
              left: 50%;
              transform: translateX(-50%);
              margin-bottom: 6px;
              background: var(--bg);
              color: var(--text-dark);
              padding: 4px 8px;
              border-radius: 6px;
              font-size: .8rem;
              white-space: nowrap;
              opacity: 0;
              transition: opacity .2s ease;
              pointer-events: none;
              box-shadow: var(--shadow);
              z-index: 10; /* Vyšší z-index pro tooltip */
            }
            #${CHAT_CONTAINER_ID} #sendButton:hover .send-tooltip {
              opacity: 1;
            }

            #${CHAT_CONTAINER_ID} #sendIcon {
              width: 20px; height: 20px;
              /* fill: var(--header-gradient); Gradient pro fill SVG není přímo podporován */
              fill: var(--user-gradient); /* Použita solidní barva */
            }

            @media (max-width: 600px) {
              #${CHAT_CONTAINER_ID} {
                bottom: 10px; right: 10px; left: 10px; /* Roztažení na menších obrazovkách */
                width: auto;
              }
              #${CHAT_CONTAINER_ID} #chatIcon { width: 50px; height: 50px; font-size: 28px; }
              #${CHAT_CONTAINER_ID} #chatBoxContainer {
                /* bottom: 80px; right: 10px; width: 90vw;  Původní hodnoty */
                width: 100%; /* Plná šířka rodiče (#chatContainer) */
                right: 0; left: 0;
                bottom: 70px; /* (Výška ikony 50px + mezera 20px) */
              }
               #${CHAT_CONTAINER_ID} #chatBoxContainer.open {
                 height: 75vh !important; /* Výška na menších obrazovkách */
                 max-height: 550px; /* Maximální pevná výška na menších obrazovkách */
               }
              #${CHAT_CONTAINER_ID} #chatHeader { padding: 8px 12px; }
              #${CHAT_CONTAINER_ID} .assistant-title { font-size: 18px; }
              #${CHAT_CONTAINER_ID} #chatBox .message { padding: 10px 14px; font-size: 0.9rem; }
              #${CHAT_CONTAINER_ID} #inputContainer { padding: 8px 12px; }
              #${CHAT_CONTAINER_ID} #inputBox { font-size: .9rem; }
              #${CHAT_CONTAINER_ID} #sendButton { width: 36px; height: 36px; }
            }
        `;
        document.head.appendChild(style);

        // Načtení Google Fontu
        const fontLink = document.createElement('link');
        fontLink.href = POPPINS_FONT_URL;
        fontLink.rel = 'stylesheet';
        document.head.appendChild(fontLink);
    }

    // --- Funkce pro vytvoření HTML struktury widgetu ---
    function createWidgetHTML(hostElement) {
        hostElement.innerHTML = `
            <div id="${CHAT_CONTAINER_ID}">
              <div id="chatIcon">
                🤖<div class="tooltip">Potřebujete poradit?</div>
              </div>
              <div id="chatBoxContainer" class="close">
                <div id="chatHeader">
                  <span class="assistant-title">🤖Virtuální asistent <b>VariQ</b></span>
                  <div style="display:flex;align-items:center;">
                    <div class="icon-container">
                      <span id="chatRefresh" class="icon" title="Nový chat">⟲</span>
                      <div class="icon-tooltip">Nový chat</div>
                    </div>
                    <div class="icon-container">
                      <span id="chatClose" class="icon" title="Zavřít">✖</span>
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

    // --- Funkce pro inicializaci JavaScriptové logiky ---
    function initializeWidgetLogic() {
        // Následující kód je JavaScript z vašeho původního <script> bloku
        // Konstanty API_BASE a CLIENT_ID jsou definovány na začátku IIFE

        const storageChatHistoryKey = `${STORAGE_KEY_PREFIX}chat_history`;
        const storageTopicIdKey = `${STORAGE_KEY_PREFIX}etrieve_topic_id`;

        let conversation = JSON.parse(sessionStorage.getItem(storageChatHistoryKey) || '[]');
        let topicId = sessionStorage.getItem(storageTopicIdKey) || null;

        // Získání DOM elementů widgetu (již jsou v DOMu díky createWidgetHTML)
        const chatIcon = document.getElementById('chatIcon');
        const chatBoxContainer = document.getElementById('chatBoxContainer');
        const chatClose = document.getElementById('chatClose');
        const chatRefresh = document.getElementById('chatRefresh');
        const chatBox = document.getElementById('chatBox');
        const inputBox = document.getElementById('inputBox');
        const sendButton = document.getElementById('sendButton');

        // Kontrola, zda byly všechny elementy nalezeny
        if (!chatIcon || !chatBoxContainer || !chatClose || !chatRefresh || !chatBox || !inputBox || !sendButton) {
            console.error('Vari Chatbot Widget: Chyba při inicializaci - některé DOM elementy nebyly nalezeny.');
            return;
        }

        function saveHistory() {
          sessionStorage.setItem(storageChatHistoryKey, JSON.stringify(conversation));
        }

        function addMessage(sender, content = '') {
          const msg = document.createElement('div');
          msg.className = `message ${sender}-message`; // Třídy jsou již ostylovány v CSS widgetu

          if (typeof marked !== 'undefined' && marked.parse) {
            msg.innerHTML = marked.parse(content || "");
          } else {
            const p = document.createElement('p');
            p.textContent = content;
            msg.appendChild(p);
            if (typeof marked === 'undefined') console.warn("Vari Chatbot: Knihovna marked.js není načtena.");
          }

          msg.addEventListener('mouseenter', () => {
            document.querySelectorAll(`#${CHAT_CONTAINER_ID} .save-icon.visible`).forEach(el => {
              el.classList.remove('visible');
              setTimeout(() => { if (el.parentElement) el.remove(); }, 250);
            });
            if (!msg.querySelector('.save-icon')) {
              const saveIcon = document.createElement('span');
              saveIcon.className = 'save-icon';
              saveIcon.textContent = '💾';
              saveIcon.title = 'Zkopírovat zprávu';
              msg.append(saveIcon);
              setTimeout(() => { saveIcon.classList.add('visible'); }, 10);

              let removeTimer;
              const scheduleRemove = (timeout = 3000) => {
                clearTimeout(removeTimer);
                removeTimer = setTimeout(() => {
                    saveIcon.classList.remove('visible');
                    setTimeout(() => { if (saveIcon.parentElement) saveIcon.remove(); }, 250);
                }, timeout);
              };
              scheduleRemove();

              saveIcon.addEventListener('click', (e) => {
                e.stopPropagation(); // Zabráníme spuštění mouseleave na rodiči
                clearTimeout(removeTimer);
                const textToCopy = (msg.innerText || msg.textContent || "").replace(saveIcon.textContent, '').trim();
                navigator.clipboard.writeText(textToCopy).then(() => {
                  saveIcon.textContent = '✅';
                  saveIcon.title = 'Zkopírováno!';
                  scheduleRemove(1200); // Necháme "zkopírováno" zobrazené kratší dobu
                }).catch(err => {
                  console.error('Vari Chatbot: Chyba při kopírování do schránky:', err);
                  saveIcon.textContent = '⚠️';
                  saveIcon.title = 'Chyba kopírování';
                  scheduleRemove(1500);
                });
              });
            }
          });

          msg.addEventListener('mouseleave', () => {
            const saveIcon = msg.querySelector('.save-icon.visible');
            if (saveIcon) {
                 // Krátké zpoždění, aby uživatel stihl kliknout, pokud se rychle vrátí
                let leaveTimer = setTimeout(() => {
                    saveIcon.classList.remove('visible');
                    setTimeout(() => { if (saveIcon.parentElement) saveIcon.remove(); }, 250);
                }, 300);
                saveIcon.addEventListener('mouseenter', () => clearTimeout(leaveTimer)); // Pokud se vrátí na ikonu, nezmizí
            }
          });

          chatBox.append(msg);

          if (sender === 'assistant') {
            msg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          } else {
            // Pro uživatelské zprávy je lepší okamžitý scroll, aby viděl své pole pro psaní
            chatBox.scrollTop = chatBox.scrollHeight;
          }
          return msg;
        }

        async function clearChat() {
          chatBox.innerHTML = ''; // Efektivnější vyčištění
          // chatRefresh.classList.add('rotate'); // Pokud máte CSS pro animaci rotace
          // setTimeout(() => chatRefresh.classList.remove('rotate'), 600);

          try {
            await fetch(`${API_BASE}/reset`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ clientID: CLIENT_ID })
            });
          } catch (err) {
            console.error('Vari Chatbot: Chyba při resetování konverzace na serveru:', err);
          }
          
          conversation = [];
          topicId = null;
          sessionStorage.removeItem(storageChatHistoryKey);
          sessionStorage.removeItem(storageTopicIdKey);
          sendInitial(); // Zobrazí úvodní zprávu po vyčištění
        }

        async function sendInitial() {
            if (!chatBoxContainer.classList.contains('open')) return; // Neodesílat, pokud chat není otevřen

            inputBox.focus();
            const text = 'Dobrý den, s čím Vám mohu pomoci?😉 Můžete se mě zeptat na cokoli ohledně současné nabídky VARI😉';
            
            // Zabráníme duplicitnímu přidání úvodní zprávy, pokud již existuje
            if (conversation.length > 0 && conversation[0].role === 'assistant' && conversation[0].content === text) {
                return;
            }
            // Nebo pokud je chatbox prázdný, ale v konverzaci už zpráva je (např. po renderHistory)
            if (chatBox.children.length === 0 && conversation.find(m => m.role === 'assistant' && m.content === text)) {
                // Pokud je historie prázdná (vizuálně), ale konverzace obsahuje úvodní zprávu,
                // renderHistory se postará o její zobrazení. Jinak by došlo k duplicitě.
                // Toto je relevantní hlavně pokud by sendInitial bylo voláno i po renderHistory za určitých okolností.
            }


            const bubble = document.createElement('div'); // Použijeme standardní addMessage pro konzistenci
            bubble.className = 'message assistant-message'; // Třídy pro styl
            
            // Vnitřní textový element pro postupné psaní, pokud `marked.parse` vytvoří <p>
            const textElement = document.createElement('p');
            bubble.appendChild(textElement);

            bubble.style.filter = 'blur(8px)'; bubble.style.opacity = '0';
            chatBox.append(bubble);
            bubble.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            bubble.style.transition = 'opacity .8s ease, filter .8s ease';
            setTimeout(() => { bubble.style.opacity = '1'; bubble.style.filter = 'blur(0)'; }, 50);

            let idx = 0;
            const revealSpeed = 35; // Mírně upravená rychlost
            
            function typeCharacter() {
                if (idx < text.length) {
                    textElement.textContent += text[idx++];
                    bubble.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    setTimeout(typeCharacter, revealSpeed);
                } else {
                    // Uložíme až po napsání celé zprávy
                    // Zabráníme duplicitnímu uložení, pokud by se funkce volala vícekrát
                    if (!conversation.find(m => m.role === 'assistant' && m.content === text)) {
                        conversation.unshift({ role:'assistant', content:text }); // Přidáme na začátek pro případné budoucí renderování historie
                        saveHistory();
                    }
                }
            }
            typeCharacter(); // Spustíme psaní
        }

        async function sendMessage() {
          const userText = inputBox.value.trim();
          if (!userText) return;

          conversation.push({ role:'user', content:userText });
          saveHistory();
          addMessage('user', userText);
          inputBox.value = '';
          inputBox.focus();


          const loadingTexts = ['Přemýšlím....','Momentík...','Ještě chvilinku...','Děkuji za trpělivost😉','Už to bude...'];
          let loadingIndex = 0;
          const assistantBubble = addMessage('assistant', loadingTexts[loadingIndex]);
          assistantBubble.classList.add('loading');
          const assistantTextElement = assistantBubble.querySelector('p') || assistantBubble; // Cílový element pro text

          const loadingInterval = setInterval(() => {
            loadingIndex = (loadingIndex + 1) % loadingTexts.length;
            assistantBubble.style.opacity='0.3'; // Jemné ztmavení před změnou textu
            setTimeout(() => {
              assistantTextElement.textContent = loadingTexts[loadingIndex];
              assistantBubble.style.opacity='1';
              assistantBubble.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 400);
          }, 2000);

          let assistantResponseText = '';
          try {
            const res = await fetch(`${API_BASE}/chat`, {
              method:'POST',
              headers:{'Content-Type':'application/json'},
              body: JSON.stringify({ clientID: CLIENT_ID, history:conversation, topic_id:topicId })
            });

            if (!res.ok) {
                const errorData = await res.text(); // Zkusíme získat více info o chybě
                throw new Error(`Chyba serveru: ${res.status} - ${errorData}`);
            }

            const newTopic = res.headers.get('X-Trieve-Topic-ID'); // Trieve hlavička
            if(newTopic){ topicId=newTopic; sessionStorage.setItem(storageTopicIdKey,topicId); }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let firstChunkReceived = false;

            while(true){
              const {value, done} = await reader.read();
              if(done) break;
              
              const chunk = decoder.decode(value, {stream:true});
              if(!firstChunkReceived){
                clearInterval(loadingInterval);
                assistantBubble.classList.remove('loading');
                assistantTextElement.innerHTML = ''; // Vyčistíme loading text
                firstChunkReceived = true;
              }
              assistantResponseText += chunk;
              assistantTextElement.innerHTML = marked.parse(assistantResponseText); // Inkrementální renderování Markdownu
              assistantBubble.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
            conversation.push({ role:'assistant', content:assistantResponseText });
            saveHistory();
          } catch(err){
            clearInterval(loadingInterval); // Vždy vyčistit interval v případě chyby
            assistantBubble.classList.remove('loading');
            assistantTextElement.textContent = 'Omlouvám se, došlo k chybě při komunikaci se serverem.';
            console.error('Vari Chatbot: Chyba sendMessage:', err);
            // Přidáme chybovou hlášku i do konverzace pro uživatele
            if (assistantResponseText === '') { // Pokud ještě nepřišla žádná část odpovědi
                 conversation.push({ role:'assistant', content: assistantTextElement.textContent });
                 saveHistory();
            }
          } finally {
            inputBox.focus();
          }
        }

        function renderHistory(){
          chatBox.innerHTML = ''; // Vyčistíme chatbox před renderováním
          conversation.forEach(msg => addMessage(msg.role, msg.content));
          if (chatBox.lastChild) { // Scroll na poslední zprávu
            chatBox.lastChild.scrollIntoView({ behavior: 'auto', block: 'end' });
          }
          inputBox.focus();
        }

        function toggleChat(openState){
            const isOpen = chatBoxContainer.classList.contains('open');

            if (openState) { // Chceme otevřít
                if (isOpen) return; // Již otevřeno
                chatIcon.style.display='none';
                chatBoxContainer.style.display='flex';
                setTimeout(() => { // Timeout pro CSS transition
                    chatBoxContainer.classList.remove('close');
                    chatBoxContainer.classList.add('open');
                }, 10);
                
                if (conversation.length === 0) {
                    sendInitial();
                } else {
                    renderHistory();
                }
                inputBox.focus();
            } else { // Chceme zavřít
                if (!isOpen) return; // Již zavřeno
                chatBoxContainer.classList.remove('open');
                chatBoxContainer.classList.add('close');
                setTimeout(() => {
                    chatBoxContainer.style.display='none';
                    chatIcon.style.display='flex'; // Znovu zobrazíme ikonu
                }, 780); // Doba by měla odpovídat délce CSS animace (all .8s)
            }
        }

        chatIcon.addEventListener('click', () => toggleChat(true));
        chatClose.addEventListener('click', () => toggleChat(false));
        chatRefresh.addEventListener('click', clearChat);
        sendButton.addEventListener('click', sendMessage);
        inputBox.addEventListener('keypress', e => {
          if (e.key === 'Enter' && !e.shiftKey) { // Odeslat na Enter, Shift+Enter pro nový řádek
            e.preventDefault(); // Zabráníme výchozí akci (např. nový řádek v textovém poli)
            sendMessage();
          }
        });

        // Možnost: Automaticky otevřít chat, pokud byl naposledy otevřený (pomocí sessionStorage flagu)
        // if (sessionStorage.getItem(`${STORAGE_KEY_PREFIX}was_open`) === 'true' && conversation.length > 0) {
        //    toggleChat(true);
        // }
        // window.addEventListener('beforeunload', () => {
        //    if (chatBoxContainer.classList.contains('open')) {
        //        sessionStorage.setItem(`${STORAGE_KEY_PREFIX}was_open`, 'true');
        //    } else {
        //        sessionStorage.removeItem(`${STORAGE_KEY_PREFIX}was_open`);
        //    }
        // });

    } // Konec initializeWidgetLogic

    // --- Funkce pro načtení externích skriptů ---
    function loadExternalScript(url, callback) {
        const script = document.createElement('script');
        script.src = url;
        script.onload = callback;
        script.onerror = () => console.error(`Vari Chatbot Widget: Nepodařilo se načíst skript ${url}`);
        document.head.appendChild(script);
    }

    // --- Hlavní inicializační funkce widgetu ---
    function initWidget() {
        // Najdeme nebo vytvoříme hostitelský element pro widget
        let hostElement = document.getElementById(WIDGET_HOST_ID);
        if (!hostElement) {
            hostElement = document.createElement('div');
            hostElement.id = WIDGET_HOST_ID;
            document.body.appendChild(hostElement);
        }
        hostElement.innerHTML = ''; // Vyčistíme pro případ re-inicializace

        loadWidgetCSS(); // Načteme CSS

        // Načteme marked.js a až poté vytvoříme HTML a inicializujeme logiku
        loadExternalScript(MARKED_JS_URL, () => {
            createWidgetHTML(hostElement); // Vytvoříme HTML strukturu widgetu
            initializeWidgetLogic();       // Aplikujeme JavaScriptovou logiku
        });
    }

    // Spuštění widgetu po načtení DOMu
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWidget);
    } else {
        initWidget(); // DOM již načten
    }

})();
