(function() {
    // Unikátní ID pro kontejner widgetu na cílové stránce
    const WIDGET_CONTAINER_ID = 'ai-simplify-chat-widget-container';

    // --- 1. CSS STYLY ---
    // (Poznámka: Cestu k 'pozadi.png' bude možná potřeba upravit podle toho,
    // kde bude obrázek hostován vzhledem k widget.js nebo použít absolutní URL)
    // Pravidlo body::before jsem zakomentoval, protože widget by neměl přímo
    // modifikovat pozadí celé stránky. Pozadí by mělo být řešeno na úrovni
    // stránky, kam widget vkládáte. Pokud ho tam chcete, odkomentujte a zajistěte správnou cestu k obrázku.
    const styles = `
    :root {
      --header-gradient: linear-gradient(90deg, #b477ff, #000000);
      --user-gradient: #b477ff;
      --assistant-color: #f0f0f5; /* Mírně upraveno pro lepší kontrast */
      --text-light: #ffffff;
      --text-dark: #000000;
      --bg: #fff;
      --shadow: rgba(0, 0, 0, 0.1) 0 4px 12px;
      --shadow-hover: rgba(0, 0, 0, 0.2) 0 6px 16px;
    }

    #${WIDGET_CONTAINER_ID} {
      font-family: 'Poppins', sans-serif;
      position: relative;
      z-index: 0;
    }

    /* --- Animace --- */
    @keyframes gradientFlow {
      0% { background-position: 0% 50%; }
      25% { background-position: 100% 25%; }
      50% { background-position: 100% 75%; }
      75% { background-position: 0% 100%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes gradientRotate {
      0% { transform: scale(1.2) rotate(0deg); }
      25% { transform: scale(1.3) rotate(90deg); }
      50% { transform: scale(1.4) rotate(180deg); }
      75% { transform: scale(1.3) rotate(270deg); }
      100% { transform: scale(1.2) rotate(360deg); }
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.08); }
    }
    @keyframes slideIn {
      from { transform: translateX(-10px); opacity: 0; }
      to   { transform: translateX(0); opacity: 1; }
    }
    @keyframes formSpinner {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* --- Hlavní kontejner a ikona chatu --- */
    #chatContainer {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
    }
    #chatContainer * {
      pointer-events: auto;
    }

    #chatIcon {
      width: 64px; height: 64px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      color: var(--text-light); font-size: 36px;
      cursor: pointer; animation: pulse 2.5s infinite;
      box-shadow: var(--shadow); position: relative; overflow: hidden;
      background: white;
    }
    #chatIcon img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      position: relative;
      z-index: 2;
    }
    #chatIcon:hover::before {
      animation: gradientFlow 2s ease-in-out infinite, gradientRotate 2s ease-in-out infinite;
      filter: blur(10px);
    }
    #chatIcon:hover::after {
      animation: gradientFlow 3s ease-in-out infinite reverse;
      opacity: 1;
    }
    #chatIcon::before {
      content: ""; position: absolute; inset: 0;
      background: var(--header-gradient); background-size: 300% 300%;
      animation: gradientFlow 4s ease-in-out infinite, gradientRotate 4s ease-in-out infinite;
      filter: blur(15px); z-index: 1;
      border-radius: 50%;
    }
    #chatIcon::after {
      content: ""; position: absolute; inset: -5px;
      background: linear-gradient(45deg, #b477ff, transparent, #000000, transparent, #b477ff);
      background-size: 400% 400%;
      animation: gradientFlow 6s ease-in-out infinite reverse;
      filter: blur(20px); opacity: 0.7;
      border-radius: 50%;
      z-index: 0;
    }
    #chatIcon .tooltip {
      position: absolute; bottom: 70px; right: 0;
      background: var(--header-gradient); color: var(--text-light);
      padding: 6px 10px; border-radius: 12px; font-size: 0.85rem;
      white-space: nowrap; opacity: 0; transition: opacity 0.3s;
      pointer-events: none;
    }
    #chatIcon:hover .tooltip {
      opacity: 1;
    }

    /* --- Okno chatu --- */
    #chatBoxContainer {
      display: none;
      width: clamp(350px, 90vw, 900px);
      height: 70vh; /* Přesunuto z .open pro konzistenci */
      border-radius: 24px;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      box-shadow: var(--shadow);
      position: fixed; bottom: 100px; right: 20px;
      flex-direction: column;
      opacity: 0;
      overflow: hidden;
      transform: translateY(20px);
      transition: all 0.5s ease-out; /* Zpomalená animace */
    }
    #chatBoxContainer.open {
      display: flex;
      opacity: 1;
      transform: translateY(0);
    }

    /* --- Hlavička chatu --- */
    #chatHeader {
      padding: 10px 16px;
      display: flex; justify-content: space-between; align-items: center;
      position: relative;
      background: transparent;
      flex-shrink: 0; /* Zabrání zmenšení hlavičky */
    }
    #chatHeader::before {
      content: ""; position: absolute; inset: 0;
      background: var(--header-gradient);
      filter: blur(20px); transform: scale(1.2);
      z-index: -1;
    }
    .assistant-title {
      font-size: 20px;
      color: white;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .assistant-title img {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
    }
    #chatHeader > div {
      display: flex;
      align-items: center;
      gap: 15px; /* Větší mezera mezi tlačítky */
    }
    #chatHeader .icon-container {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 40px; /* Jednotná výška pro zarovnání */
    }
    #chatHeader .icon-container .icon {
      cursor: pointer;
      font-size: 20px;
      color: var(--text-light);
      transition: transform 0.3s ease;
      padding: 8px; /* Větší plocha pro kliknutí a lepší zarovnání */
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #chatHeader .icon-container .icon:hover {
      transform: scale(1.1) rotate(90deg);
    }
    #chatHeader .icon-container .icon-tooltip {
      position: absolute;
      top: -35px;
      left: 50%;
      transform: translateX(-50%); /* Vycentrování tooltipů */
      background: white;
      color: black;
      padding: 4px 8px;
      border-radius: 8px;
      font-size: 0.75rem;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
      box-shadow: var(--shadow);
    }
    #chatHeader .icon-container:hover .icon-tooltip {
      opacity: 1;
    }

    /* --- Oblast se zprávami (scroll) --- */
    #chatBox {
      flex: 1; padding: 16px;
      display: flex; flex-direction: column; gap: 12px;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: var(--user-gradient) transparent;
    }
    #chatBox::-webkit-scrollbar { width: 6px; }
    #chatBox::-webkit-scrollbar-thumb {
      background: var(--user-gradient);
      border-radius: 3px;
    }

    /* ======================================================= */
    /* === VYLEPŠENÉ STYLY PRO SAMOTNÉ ZPRÁVY (DŮLEŽITÉ) === */
    /* ======================================================= */

    #chatBox .message {
      display: flex; /* Použijeme flexbox pro správné zarovnání obsahu */
      flex-direction: column; /* Obsah půjde pod sebe (klíčové pro odstavce a seznamy) */
      width: auto;
      max-width: 85%;
      position: relative; /* Pro pozicování ikony pro kopírování */
      white-space: normal; /* Umožní správné zalamování bloků jako <p> a <ul> */
      overflow-wrap: break-word;
      transition: transform 0.6s ease, box-shadow 0.6s ease; /* Pomalejší hover animace */
      font-size: 15px;
      padding: 12px 20px;
      border-radius: 18px;
      box-shadow: var(--shadow);
      line-height: 1.6;
    }
    #chatBox .message:hover {
      transform: translateY(-3px); /* Mírně větší posun pro lepší efekt */
      box-shadow: var(--shadow-hover);
    }

    /* -- Styly pro obsah generovaný z Markdownu -- */
    /* Opravuje zobrazení odstavců, nadpisů a seznamů uvnitř bubliny */
    #chatBox .message > * {
      margin: 0 0 10px 0; /* Mezera pod každým blokem (<p>, <ul>, <h3> atd.) */
    }
    #chatBox .message > *:last-child {
      margin-bottom: 0; /* Poslední blok ve zprávě nemá mezeru pod sebou */
    }
    
    #chatBox .assistant-message {
      background: var(--assistant-color);
      color: var(--text-dark);
      align-self: flex-start;
      border-top-left-radius: 4px; /* "Ocas" bubliny */
    }
    #chatBox .user-message {
      background: var(--user-gradient);
      color: var(--text-light);
      align-self: flex-end;
      border-top-right-radius: 4px; /* "Ocas" bubliny */
    }

    #chatBox .assistant-message.loading {
      font-style: italic;
      opacity: .7;
    }

    /* -- Styly pro seznamy (<ul>, <li>) -- */
    #chatBox .assistant-message ul {
      padding-left: 20px; /* Odsazení seznamu od kraje */
    }
    #chatBox .assistant-message li {
      margin-bottom: 8px; /* Mezera mezi položkami seznamu */
    }
    /* Vlastní odrážka pro moderní vzhled */
    #chatBox .assistant-message li::marker {
      color: var(--user-gradient);
      font-weight: bold;
    }
    #chatBox .assistant-message li strong {
        color: #000; /* Zvýraznění tučného textu v seznamu */
    }

    /* --- Ikona pro kopírování zprávy --- */
    .save-icon {
      position: absolute;
      top: -10px; /* Umístění nad bublinu */
      right: 10px;
      opacity: 0; /* Skryté ve výchozím stavu */
      transform: translateY(5px);
      transition: opacity 0.3s ease, transform 0.3s ease;
      cursor: pointer;
      user-select: none;
      font-size: 1.1em;
      background: #fff;
      border-radius: 8px;
      padding: 2px 8px;
      box-shadow: var(--shadow);
      z-index: 2;
      pointer-events: none; /* Důležité, aby neblokovalo hover na zprávě */
    }
    /* Zobrazí se, když je myš nad zprávou */
    .message:hover .save-icon {
      opacity: 1;
      transform: translateY(0);
      pointer-events: all; /* Zpřístupní ikonu pro kliknutí */
    }

    /* --- Vstupní pole a tlačítko --- */
    #inputContainer {
      display: flex;
      padding: 10px 16px;
      border-top: 1px solid rgba(0, 0, 0, 0.08); /* Jemný oddělovač */
      flex-shrink: 0;
    }
    #inputBox {
      flex: 1;
      padding: 10px 16px; /* Zvětšený padding pro pohodlnější psaní */
      border: 1px solid transparent; /* Průhledný rámeček na startu */
      background-color: #f0f0f5;
      border-radius: 20px;
      font-size: 1rem;
      outline: none;
      transition: border-color .3s ease, box-shadow .3s ease;
    }
    #inputBox:focus {
      border-color: #b477ff;
      box-shadow: 0 0 0 3px rgba(180, 119, 255, 0.2);
    }
    #sendButton {
      background: none; border: none;
      margin-left: 10px;
      width: 44px; height: 44px; /* Zvětšeno pro snadnější kliknutí */
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      transition: transform .2s ease, background-color .2s ease;
      border-radius: 50%;
      position: relative;
    }
    #sendButton:hover {
      background: rgba(180, 119, 255, 0.1);
    }
    #sendIcon path {
      fill: var(--user-gradient); /* Správné nastavení barvy ikony */
    }
    #sendButton .send-tooltip {
      position: absolute;
      top: -35px;
      left: 50%;
      transform: translateX(-50%); /* Vycentrování tooltipů */
      background: white;
      color: black;
      padding: 4px 8px;
      border-radius: 8px;
      font-size: 0.75rem;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
      box-shadow: var(--shadow);
    }
    #sendButton:hover .send-tooltip {
      opacity: 1;
    }

    /* --- Responzivní design --- */
    @media (max-width: 600px) {
      #chatIcon { width: 50px; height: 50px; font-size: 28px; }
      #chatBoxContainer {
        bottom: 0; right: 0; top: 0; left: 0;
        width: 100%; height: 100%;
        border-radius: 0;
      }
      #chatBox .message { max-width: 90%; }
      #inputContainer { padding-bottom: 20px; }
      
      /* Explicitně bílá barva pro ikony v mobilní verzi */
      #chatHeader .icon-container .icon {
        color: #ffffff !important;
      }
    }

    /* --- Načítací kolečko pro formulář --- */
    .form-generator-loading {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 15px;
      background: rgba(180, 119, 255, 0.1);
      border-radius: 12px;
      margin: 10px 0;
      font-style: italic;
      color: var(--user-gradient);
    }
    .form-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(180, 119, 255, 0.3);
      border-top: 2px solid var(--user-gradient);
      border-radius: 50%;
      animation: formSpinner 1s linear infinite;
    }
`;

    // --- 2. HTML STRUKTURA WIDGETU ---
    const widgetHTML = `
      <div id="chatContainer">
        <div id="chatIcon">
          <img src="https://static.wixstatic.com/media/ae7bf7_4c28c0f4765b482182668193d4f80fed~mv2.png" alt="Virtuální asistent Milan" />
          <div class="tooltip">Potřebujete poradit?</div>
        </div>
        <div id="chatBoxContainer" class="close">
          <div id="chatHeader">
            <span class="assistant-title">
              <img src="https://static.wixstatic.com/media/ae7bf7_4c28c0f4765b482182668193d4f80fed~mv2.png" alt="Avatar" />
              Virtuální asistent <b>Milan</b>
            </span>
            <div>
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
              <svg id="sendIcon" viewBox="0 0 24 24" style="width: 20px; height: 20px;">
                <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
              </svg>
              <div class="send-tooltip">Odeslat</div>
            </button>
          </div>
        </div>
      </div>
    `;

    // --- 3. VLOŽENÍ CSS A HTML DO STRÁNKY ---
    function injectWidget() {
        // Vložení CSS
        const styleSheet = document.createElement("style");
        styleSheet.textContent = styles; // Použijte textContent pro <style>
        document.head.appendChild(styleSheet);

        // Vložení HTML
        const widgetContainer = document.getElementById(WIDGET_CONTAINER_ID);
        if (widgetContainer) {
            widgetContainer.innerHTML = widgetHTML;
            initializeChatLogic(); // Spustí logiku až po vložení HTML
        } else {
            console.error(`Kontejner pro AiSimplify Chat Widget (ID: ${WIDGET_CONTAINER_ID}) nebyl na stránce nalezen.`);
        }
    }

    // --- 4. JAVASCRIPT LOGIKA CHATU ---
    function initializeChatLogic() {
        if (typeof marked === 'undefined') {
            console.error('Knihovna Marked.js není načtena. Prosím, vložte ji před script widgetu.');
            // Můžete zde přidat i dynamické načtení Marked.js, pokud chcete
            // Např. pomocí:
            // const script = document.createElement('script');
            // script.src = "https://cdn.jsdelivr.net/npm/marked/marked.min.js";
            // script.onload = () => { /* ... zbytek inicializace ... */ };
            // document.head.appendChild(script);
            return;
        }

        const API_BASE = 'https://chatbot-production-4d1d.up.railway.app';
        const clientID = 'AiSimplify'; // Můžete zvážit předání jako data atributu na kontejneru
        const STORAGE_KEY = 'chat_history_' + clientID; // Unikátní klíč pro různé instance
        const TOPIC_KEY = 'etrieve_topic_id_' + clientID;
        let conversation = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]');
        let topicId = sessionStorage.getItem(TOPIC_KEY) || null;

        const chatIcon = document.getElementById('chatIcon');
        const chatBoxContainer = document.getElementById('chatBoxContainer');
        const chatClose = document.getElementById('chatClose');
        const chatRefresh = document.getElementById('chatRefresh');
        const chatBox = document.getElementById('chatBox');
        const inputBox = document.getElementById('inputBox');
        const sendButton = document.getElementById('sendButton');
        const sendIconSVG = document.getElementById('sendIcon'); // Reference na SVG

        // Aplikace barvy na sendIcon pomocí CSS proměnné
        // Pokud by přímé `fill: var(...)` v CSS nefungovalo spolehlivě ve všech prohlížečích
        // pro SVG vložené jako string, můžeme to nastavit přes JS:
        if (sendIconSVG) {
            const sendIconPath = sendIconSVG.querySelector('path');
            if (sendIconPath) {
                 // Získání hodnoty CSS proměnné
                const headerGradientColor = getComputedStyle(document.documentElement).getPropertyValue('--header-gradient').trim();
                // Pokud je to gradient, vezmeme první barvu nebo fallback
                const firstColorOfGradient = headerGradientColor.startsWith('linear-gradient') ? headerGradientColor.split(',')[1].trim() : headerGradientColor;
                sendIconPath.style.fill = firstColorOfGradient || '#000000'; // Fallback na černou
            }
        }


        function saveHistory() {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(conversation));
        }

        function addMessage(sender, content = '') {
          const msg = document.createElement('div');
          msg.className = `message ${sender}-message`;
          msg.innerHTML = marked.parse(content); // Použijte marked.parse

          msg.addEventListener('mouseenter', () => {
            document.querySelectorAll(`#${WIDGET_CONTAINER_ID} .save-icon`).forEach(el => { // Omezit na widget
              el.classList.remove('visible');
              setTimeout(() => { el.remove(); }, 250);
            });
            if (!msg.querySelector('.save-icon')) {
              const saveIcon = document.createElement('span');
              saveIcon.className = 'save-icon';
              saveIcon.textContent = '💾';
              msg.append(saveIcon);
              setTimeout(() => { saveIcon.classList.add('visible'); }, 10);

              const removeIcon = () => {
                saveIcon.classList.remove('visible');
                setTimeout(() => { saveIcon.remove(); }, 250);
              };
              const timer = setTimeout(removeIcon, 3000);
              saveIcon.addEventListener('click', (e) => {
                e.stopPropagation(); // Zabráníme propagaci na mouseleave zprávy
                clearTimeout(timer);
                const textToCopy = msg.innerText.replace(saveIcon.textContent, '').trim();
                navigator.clipboard.writeText(textToCopy)
                    .then(() => {
                        saveIcon.textContent = '✅Zkopírováno';
                    })
                    .catch(err => {
                        console.error('Nepodařilo se zkopírovat text: ', err);
                        saveIcon.textContent = '⚠️Chyba';
                    });
                setTimeout(removeIcon, 1000);
              });
            }
          });

          msg.addEventListener('mouseleave', () => {
            const saveIconInstance = msg.querySelector('.save-icon');
            if (saveIconInstance && saveIconInstance.textContent === '💾') { // Odstraní jen pokud neproběhlo kopírování
                 saveIconInstance.classList.remove('visible');
                 setTimeout(() => { saveIconInstance.remove(); }, 250);
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
          document.querySelectorAll(`#${WIDGET_CONTAINER_ID} #chatBox .message`).forEach(m => m.remove()); // Omezit na widget
          if (chatRefresh) chatRefresh.classList.add('rotate'); // Přidat kontrolu existence
          try {
            await fetch(`${API_BASE}/reset`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ clientID })
            });
          } catch (err) {
            console.error("Chyba při resetu chatu na serveru:", err);
            // Můžeme zde zobrazit uživateli chybu, pokud je to žádoucí
          } finally {
            setTimeout(() => {
              conversation = [];
              topicId = null;
              sessionStorage.removeItem(STORAGE_KEY);
              sessionStorage.removeItem(TOPIC_KEY);
              if (chatRefresh) chatRefresh.classList.remove('rotate');
              sendInitial();
            }, 600);
          }
        }

        async function sendInitial() {
          if (!chatBoxContainer || !inputBox || !chatBox) return; // Kontrola existence prvků

          chatBoxContainer.classList.add('open');
          inputBox.focus();
          const text = 'Dobrý den, s čím Vám mohu pomoci?😉 Můžete se mě zeptat na cokoli ohledně nabízených služeb AiSimplify! Odpovím Vám do pár vteřin😉';
          const bubble = document.createElement('div');
          bubble.className = 'message assistant-message';
          bubble.style.filter = 'blur(10px)'; bubble.style.opacity = '0';
          chatBox.append(bubble);
          bubble.scrollIntoView({ behavior: 'smooth', block: 'start' });
          bubble.style.transition = 'opacity 1s ease,filter 1s ease';
          setTimeout(() => { bubble.style.opacity = '1'; bubble.style.filter = 'blur(0)'; }, 50);

          let idx = 0, revealSpeed = 40;
          const ti = setInterval(() => {
            bubble.textContent += text[idx++];
            bubble.scrollIntoView({ behavior: 'smooth', block: 'start' });
            if (idx >= text.length) {
              clearInterval(ti);
              // Pouze přidáme do konverzace, pokud ještě neexistuje stejná úvodní zpráva
              if (!conversation.find(m => m.role === 'assistant' && m.content === bubble.textContent)) {
                  conversation.push({ role:'assistant', content:bubble.textContent });
                  saveHistory();
              }
            }
          }, revealSpeed);
        }

        async function sendMessage() {
          if (!inputBox || !chatBox) return; // Kontrola existence prvků

          const userText = inputBox.value.trim();
          if (!userText) return;
          conversation.push({ role:'user', content:userText });
          saveHistory(); addMessage('user', userText);
          inputBox.value = '';

          const loadingTexts = ['Přemýšlím....','Momentík...','Ještě chvilinku...','Děkuji za trpělivost😉','Už to bude...'];
          let loadingIndex=0;
          const loadingBubble = addMessage('assistant', loadingTexts[loadingIndex]);
          loadingBubble.classList.add('loading');
          loadingBubble.style.transition='opacity .8s ease'; loadingBubble.style.opacity='1';
          const loadingInterval = setInterval(()=>{
            loadingBubble.style.opacity='0';
            setTimeout(()=>{
              loadingBubble.textContent = loadingTexts[++loadingIndex % loadingTexts.length];
              loadingBubble.style.opacity='1';
              loadingBubble.scrollIntoView({ behavior: 'smooth', block: 'start' });
            },500);
          },2000);

          let assistantText='';
          let isGeneratingForm = false;
          let formLoadingElement = null;
          let formTimeout = null;
          let textBeforeForm = '';
          
          try {
            const res = await fetch(`${API_BASE}/chat`, {
              method:'POST',
              headers:{'Content-Type':'application/json'},
              body: JSON.stringify({ clientID, history:conversation, topic_id:topicId })
            });
            const newTopic = res.headers.get('X-Trieve-Topic-ID');
            if(newTopic){ topicId=newTopic; sessionStorage.setItem(TOPIC_KEY,topicId); }

            const reader = res.body.getReader(), dec=new TextDecoder();
            let firstChunkReceived=false;
            
            // Funkce pro ukončení generování formuláře
            const finishFormGeneration = () => {
              if (isGeneratingForm && formLoadingElement) {
                clearTimeout(formTimeout);
                formLoadingElement.remove();
                isGeneratingForm = false;
                formLoadingElement = null;
                formTimeout = null;
                
                // Zobrazíme kompletní obsah
                loadingBubble.innerHTML = marked.parse(assistantText);
                loadingBubble.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            };
            
            while(true){
              const {value,done} = await reader.read();
              if(done) break;
              const chunk = dec.decode(value,{stream:true});
              
              if(!firstChunkReceived){
                clearInterval(loadingInterval);
                loadingBubble.classList.remove('loading');
                loadingBubble.innerHTML=''; // Vyčistíme "Přemýšlím..."
                firstChunkReceived=true;
              }
              
              assistantText += chunk;
              
              // Detekce začátku formuláře - kontrolujeme různé varianty
              const formTriggers = [
                '<form',
                'formulář na míru',
                'vyplňte formulář',
                'poptávkový formulář',
                'kontaktní formulář'
              ];
              
              const shouldGenerateForm = !isGeneratingForm && 
                formTriggers.some(trigger => assistantText.toLowerCase().includes(trigger.toLowerCase()));
              
              if (shouldGenerateForm) {
                isGeneratingForm = true;
                
                // Uložíme text před formulářem
                const formIndex = assistantText.toLowerCase().indexOf('<form');
                if (formIndex !== -1) {
                  textBeforeForm = assistantText.substring(0, formIndex);
                } else {
                  // Pokud ještě není <form tag, použijeme celý text dosud
                  textBeforeForm = assistantText;
                }
                
                // Vytvoříme načítací element
                formLoadingElement = document.createElement('div');
                formLoadingElement.className = 'form-generator-loading';
                formLoadingElement.innerHTML = `
                  <div class="form-spinner"></div>
                  <span>Generuji formulář na míru, prosím chvilinku strpení...</span>
                `;
                
                // Zobrazíme pouze text před formulářem + loading (bez blikání)
                loadingBubble.innerHTML = marked.parse(textBeforeForm);
                loadingBubble.appendChild(formLoadingElement);
                loadingBubble.scrollIntoView({ behavior: 'smooth', block: 'start' });
                
                // Timeout pro případ zaseknutí (15 sekund)
                formTimeout = setTimeout(() => {
                  console.log('Form generation timeout, showing content anyway');
                  finishFormGeneration();
                }, 15000);
                
                continue; // Přeskočíme další zpracování tohoto chunku
              }
              
              // Pokud generujeme formulář, NESPRACOVÁVÁME obsah dokud není hotový
              if (isGeneratingForm) {
                // Kontrolujeme ukončovací podmínky
                const shouldFinishForm = 
                  assistantText.includes('</form>') || 
                  assistantText.length > 8000 || // Zvýšený limit
                  assistantText.includes('\n\n---') ||
                  assistantText.includes('Pokud máte další dotazy') ||
                  assistantText.includes('S pozdravem') ||
                  assistantText.includes('Děkuji za váš zájem');
                
                if (shouldFinishForm) {
                  finishFormGeneration();
                }
                // Během generování formuláře NEAKTUALIZUJEME obsah bubliny
              } else {
                // Normální streamování - pouze když NEgenerujeme formulář
                loadingBubble.innerHTML = marked.parse(assistantText);
                loadingBubble.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }
            
            // Ujistíme se, že formulář je ukončen po dokončení streamu
            if (isGeneratingForm) {
              finishFormGeneration();
            }
            
            // Přidáme do konverzace, pouze pokud assistantText není prázdný
            if (assistantText.trim()) {
                conversation.push({ role:'assistant', content:assistantText });
                saveHistory();
            } else if (!firstChunkReceived) { // Pokud nepřišel žádný chunk, ale fetch byl úspěšný (např. 204 No Content)
                clearInterval(loadingInterval);
                loadingBubble.remove(); // Odstraníme "Přemýšlím..." bublinu
            }

          } catch(err){
            clearInterval(loadingInterval);
            loadingBubble.classList.remove('loading');
            loadingBubble.textContent = 'Omlouváme se, došlo k chybě při komunikaci se serverem.';
            loadingBubble.scrollIntoView({ behavior: 'smooth', block: 'start' });
            console.error("Chyba při odesílání zprávy:", err);
            
            // Vyčistíme form timeout při chybě
            if (formTimeout) {
              clearTimeout(formTimeout);
            }
          }
          inputBox.focus();
        }

        function renderHistory(){
          if (!chatBox || !inputBox) return; // Kontrola
          chatBox.innerHTML = '';
          conversation.forEach(m => addMessage(m.role, m.content));
          inputBox.focus();
           // Po vykreslení historie srolujeme na poslední zprávu
          if (chatBox.lastChild) {
            chatBox.lastChild.scrollIntoView({ behavior: 'auto', block: 'end' });
          }
        }

        function toggleChat(openState){
          if (!chatIcon || !chatBoxContainer) return; // Kontrola

          if(openState){
            chatIcon.style.display='none';
            chatBoxContainer.style.display='flex';
            setTimeout(()=>{
                chatBoxContainer.classList.remove('close'); // Odebere 'close'
                chatBoxContainer.classList.add('open');    // Přidá 'open'
            },10);
            // Pokud je konverzace prázdná, pošle úvodní zprávu, jinak vykreslí historii
            if (conversation.length === 0) {
                sendInitial();
            } else {
                renderHistory();
            }
          } else {
            chatBoxContainer.classList.remove('open'); // Odebere 'open'
            chatBoxContainer.classList.add('close');   // Přidá 'close'
            setTimeout(()=>{
              chatBoxContainer.style.display='none';
              chatIcon.style.display='flex';
            },400); // Čas musí odpovídat délce animace v CSS
          }
        }

        function sendForm(formElement) {
    const submitButton = formElement.querySelector('button[type="submit"]');
    submitButton.textContent = 'Odesílám...';
    submitButton.disabled = true;

    const formData = new FormData(formElement);
    fetch(formElement.action, {
      method: 'POST',
      body: formData
    })
    .then(response => {
      if (response.ok) {
        const fields = formElement.querySelectorAll('input, textarea');
        fields.forEach(field => { field.disabled = true; });
        const thankYouMessage = document.createElement('div');
        thankYouMessage.className = 'thank-you-message';
        thankYouMessage.innerHTML = '<h3>✅ Děkujeme!</h3><p>Vaše poptávka byla odeslána.</p>';
        submitButton.parentNode.replaceChild(thankYouMessage, submitButton);
      } else {
        throw new Error('Odpověď serveru nebyla v pořádku.');
      }
    })
    .catch(error => {
      console.error('Chyba při odesílání formuláře:', error);
      formElement.innerHTML = '<h3>❌ Chyba</h3><p>Při odesílání došlo k chybě.</p>';
    });
  }
        
        // Event Listeners - přidat kontroly existence prvků
        if (chatIcon) chatIcon.addEventListener('click', ()=>toggleChat(true));
        if (chatClose) chatClose.addEventListener('click', ()=>toggleChat(false));
        if (chatRefresh) chatRefresh.addEventListener('click', clearChat);
        if (sendButton) sendButton.addEventListener('click', sendMessage);
        if (inputBox) inputBox.addEventListener('keypress', e=>{ if(e.key==='Enter') sendMessage(); });

        // Automatické otevření chatu, pokud je v sessionStorage nějaká historie a uživatel se vrátí na stránku
        // Můžete tuto logiku upravit/odstranit dle potřeby
        if (conversation.length > 0 && chatBoxContainer && chatBoxContainer.classList.contains('close')) {
            // toggleChat(true); // Volitelně automaticky otevřít, pokud existuje historie
        }
    }

    // --- 5. SPOUŠTĚNÍ WIDGETU ---
    // Zajistíme, že DOM je načtený před manipulací
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectWidget);
    } else {
        injectWidget(); // DOM je již připraven
    }

})();
