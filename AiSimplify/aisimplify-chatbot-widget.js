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
      --header-gradient: linear-gradient(90deg,#b477ff,#000000);
      --user-gradient: #b477ff;
      --assistant-color: #F4F4F9;
      --text-light: #ffffff;
      --text-dark: #000000;
      --bg: #fff;
      --shadow: rgba(0,0,0,0.1) 0 4px 12px;
      --shadow-hover: rgba(0,0,0,0.2) 0 6px 16px;
    }

    /* Toto pravidlo by mělo být ideálně řešeno na stránce, kam widget vkládáte.
    body::before {
      content: "";
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: url('pozadi.png') no-repeat center center/cover; // Upravte cestu k pozadi.png!
      z-index: -2; // Může kolidovat s jinými prvky na stránce
      opacity: 1;
      pointer-events: none;
    }
    */

    #${WIDGET_CONTAINER_ID} {
        font-family: 'Poppins', sans-serif;
        position: relative; /* Nebo dle potřeby widgetu */
        z-index: 0; /* Nebo dle potřeby widgetu */
    }
    #${WIDGET_CONTAINER_ID} html, #${WIDGET_CONTAINER_ID} body { width: 100%; height: 100%; margin: 0; } /* Scoped to widget if needed, but likely not */


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

    #chatContainer { /* Bude uvnitř ${WIDGET_CONTAINER_ID} */
      position: fixed; bottom: 20px; right: 20px;
      z-index: 9999;
    }
    #chatContainer * { pointer-events: auto; }

    #chatIcon {
      width: 64px; height: 64px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      color: var(--text-light); font-size: 36px;
      cursor: pointer; animation: pulse 2s infinite;
      box-shadow: var(--shadow); position: relative; overflow: hidden;
      background: transparent;
    }
    #chatIcon::before {
      content:""; position:absolute; inset:0;
      background:var(--header-gradient); background-size:200% 200%;
      animation:gradientFlow 8s infinite;
      filter:blur(20px); transform:scale(1.2); z-index:-1;
    }
    #chatIcon .tooltip {
      position:absolute; bottom:70px; right:0;
      background:var(--header-gradient); color:var(--text-light);
      padding:6px 10px; border-radius:12px; font-size:.85rem;
      white-space:nowrap; opacity:0; transition:opacity .3s;
      pointer-events:none;
    }
    #chatIcon:hover .tooltip { opacity:1; }

    #chatBoxContainer {
      display: none;
      width: clamp(350px, 90vw, 900px);
      border-radius: 24px;
      background: rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      box-shadow: var(--shadow);
      position: fixed; bottom:100px; right:20px;
      flex-direction: column;
      opacity: 0;
      overflow: hidden;
      transform: translateY(20px);
      transition: all .8s ease;
    }
    #chatBoxContainer.open {
      display: flex;
      opacity: 1;
      transform: translateY(0);
      height: 70vh !important;
    }

    #chatHeader {
      padding: 10px 16px;
      display: flex; justify-content: space-between; align-items: center;
      border-top-left-radius: 24px; border-top-right-radius: 24px;
      position: relative;
      overflow: visible;
      background: transparent;
    }
    #chatHeader::before {
      content:""; position:absolute; inset:0;
      background:var(--header-gradient);
      filter:blur(20px); transform:scale(1.2);
      z-index:-1;
    }
    .assistant-title { position: relative; font-size: 20px; color: white;}
    .assistant-title:hover::after {
      content:'😉'; position:absolute; right:-25px; top:0;
      animation:slideIn .8s forwards;
    }

    .icon-container {
      position: relative;
      display: inline-block;
      margin-left: 12px;
    }
    .icon-container .icon {
      cursor: pointer;
      font-size: 20px;
      color: var(--text-light);
      transition: transform .3s ease;
    }
    .icon-container .icon:hover {
      transform: rotate(90deg);
    }
    .icon-container .icon-tooltip {
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-top: 6px;
      background: #fff;
      color: var(--text-dark);
      padding: 4px 8px;
      border-radius: 6px;
      font-size: .8rem;
      white-space: nowrap;
      opacity: 0;
      transition: opacity .2s ease;
      pointer-events: none;
      box-shadow: var(--shadow);
      z-index: 1;
    }
    .icon-container:hover .icon-tooltip {
      opacity: 1;
    }

    #chatBox {
      flex: 1; padding: 16px;
      display: flex; flex-direction: column; gap: 12px;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: var(--header-gradient) var(--assistant-color);
    }
    #chatBox::-webkit-scrollbar { width: 6px; }
    #chatBox::-webkit-scrollbar-thumb {
      background: var(--header-gradient);
      border-radius: 3px;
    }

    #chatBox .message {
      display: inline-block;
      width: auto;
      max-width: 85%;
      white-space: pre-wrap;
      overflow-wrap: break-word;
      transition: transform .8s cubic-bezier(.45,1.35,.55,1.02), box-shadow .8s cubic-bezier(.45,1.35,.55,1.02);
      font-size:15px;
    }
    #chatBox .message p {
      display: inline;
      margin: 0;
    }

    .message {
      position: relative;
      background: var(--assistant-color);
      color: var(--text-dark);
      align-self: flex-start;
      padding: 16px 24px;
      border-radius: 24px;
      box-shadow: var(--shadow);
      line-height: 1.5;
    }
    .message:hover {
      transform: scale(1.03);
      box-shadow: var(--shadow-hover);
    }
    .assistant-message.loading { font-style: italic; opacity: .7; }
    .user-message {
      background: var(--user-gradient);
      color: var(--text-light);
      align-self: flex-end;
      text-align: right;
    }

    .save-icon {
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
      background: #fff;
      border-radius: 7px;
      padding: 1px 8px;
      box-shadow: var(--shadow);
      z-index: 2;
      pointer-events: all;
    }
    .save-icon.visible {
      opacity: 1;
      transform: scale(1);
    }

    #inputContainer {
      display: flex;
      padding: 10px 16px;
    }
    #inputBox {
      flex: 1;
      padding: 10px 14px;
      border: 1px solid #ddd;
      border-radius: 20px;
      font-size: 1rem;
      outline: none;
      transition: border-color .8s ease;
      font-style: italic;
    }
    #inputBox:focus { border-color: var(--header-gradient); }

    #sendButton {
      background: none;
      border: none;
      margin-left: 12px;
      width: 40px; height: 40px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      transition: transform .4s ease, background-color .8s ease;
      position: relative;
    }
    #sendButton:hover {
      transform: scale(1.05);
      background: rgba(113,93,228,0.1);
      border-radius: 50%;
    }
    #sendButton .send-tooltip {
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-bottom: 6px;
      background: #fff;
      color: var(--text-dark);
      padding: 4px 8px;
      border-radius: 6px;
      font-size: .8rem;
      white-space: nowrap;
      opacity: 0;
      transition: opacity .2s ease;
      pointer-events: none;
      box-shadow: var(--shadow);
      z-index: 1;
    }
    #sendButton:hover .send-tooltip {
      opacity: 1;
    }

    #sendIcon {
      width: 20px; height: 20px;
      /* fill: var(--header-gradient); Nejde použít CSS proměnná přímo zde, řešeno v JS */
    }
    /* Vyřešeno nastavením fill barvy v JS nebo vložením SVG s fill="currentColor" a nastavením color rodiče */
    #sendIcon path {
        fill: var(--header-gradient); /* Toto by mělo fungovat pro path uvnitř SVG */
    }


    @media (max-width: 600px) {
      #chatIcon { width: 50px; height: 50px; font-size: 28px; }
      #chatBoxContainer { bottom: 80px; right: 10px; width: 90vw; }
      #chatHeader { padding: 8px 12px; }
      .message { padding: 12px 16px; }
      #inputContainer { padding: 8px 12px; }
      #inputBox { font-size: .9rem; }
      #sendButton { width: 36px; height: 36px; }
    }
    `;

    // --- 2. HTML STRUKTURA WIDGETU ---
    const widgetHTML = `
      <div id="chatContainer">
        <div id="chatIcon">
          🤖<div class="tooltip">Potřebujete poradit?</div>
        </div>
        <div id="chatBoxContainer" class="close">
          <div id="chatHeader">
            <span class="assistant-title">🤖Virtuální asistent <b>Milan</b></span>
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
          const text = 'Dobrý den, s čím Vám mohu pomoci?😉 Můžete se mě zeptat na cokoli ohledně nabízených služeb AiSimplify!😉';
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
              loadingBubble.innerHTML = marked.parse(assistantText); // Použijte marked.parse
              loadingBubble.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
