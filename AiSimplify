(function() {
    // --- Konfigurace Widgetu ---
    const WIDGET_CONFIG = {
        apiBase: 'https://chatbot-production-4d1d.up.railway.app',
        clientId: 'AiSimplify',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap',
        markedJsUrl: 'https://cdn.jsdelivr.net/npm/marked/marked.min.js', // Pro kontrolu a info
        assistantName: 'Milan',
        initialGreeting: 'Dobrý den, s čím Vám mohu pomoci?😉 Můžete se mě zeptat na cokoli ohledně nabízených služeb AiSimplify!😉',
        chatIconContent: '🤖',
        chatIconTooltip: 'Potřebujete poradit?',
        storageKey: 'aisimplify_chat_history', // Přidáno pro přehlednost
        topicKey: 'aisimplify_etrieve_topic_id' // Přidáno pro přehlednost
    };

    // --- CSS Styly ---
    // Styly jsou vloženy přímo sem. Odstraněny globální body/html styly a body::before.
    // Písmo 'Poppins' je aplikováno přímo na kontejner widgetu.
    const cssStyles = `
        :root {
            --header-gradient: linear-gradient(90deg,#b477ff,#000000);
            --user-gradient: #b477ff; /* Původně #e4032e, změněno dle vašeho kódu */
            --assistant-color: #F4F4F9;
            --text-light: #ffffff;
            --text-dark: #000000;
            --shadow: rgba(0,0,0,0.1) 0 4px 12px;
            --shadow-hover: rgba(0,0,0,0.2) 0 6px 16px;
        }

        #aisChatContainer { /* ID je mírně upraveno pro widget, aby se předešlo kolizím */
            font-family: 'Poppins', sans-serif;
            position: fixed; bottom: 20px; right: 20px;
            z-index: 99999; /* Vyšší z-index pro widget */
        }
        #aisChatContainer * {
            pointer-events: auto;
            box-sizing: border-box; /* Lepší box model pro widget */
        }

        @keyframes aisGradientFlow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        @keyframes aisPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        @keyframes aisSlideIn {
            from { transform: translateX(-10px); opacity: 0; }
            to   { transform: translateX(0); opacity: 1; }
        }

        #aisChatIcon {
            width: 64px; height: 64px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            color: var(--text-light); font-size: 36px;
            cursor: pointer; animation: aisPulse 2s infinite;
            box-shadow: var(--shadow); position: relative; overflow: hidden;
            background: transparent;
        }
        #aisChatIcon::before {
            content:""; position:absolute; inset:0;
            background:var(--header-gradient); background-size:200% 200%;
            animation:aisGradientFlow 8s infinite;
            filter:blur(20px); transform:scale(1.2); z-index:-1;
        }
        #aisChatIcon .ais-tooltip {
            position:absolute; bottom:70px; right:0;
            background:var(--header-gradient); color:var(--text-light);
            padding:6px 10px; border-radius:12px; font-size:.85rem;
            white-space:nowrap; opacity:0; transition:opacity .3s;
            pointer-events:none;
        }
        #aisChatIcon:hover .ais-tooltip { opacity:1; }

        #aisChatBoxContainer {
            display: none;
            width: clamp(350px, 90vw, 900px);
            border-radius: 24px;
            background: rgba(255, 255, 255, 0.6);
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
        #aisChatBoxContainer.open {
            display: flex;
            opacity: 1;
            transform: translateY(0);
            height: 70vh !important;
        }

        #aisChatHeader {
            padding: 10px 16px;
            display: flex; justify-content: space-between; align-items: center;
            border-top-left-radius: 24px; border-top-right-radius: 24px;
            position: relative;
            overflow: visible;
            background: transparent;
        }
        #aisChatHeader::before {
            content:""; position:absolute; inset:0;
            background:var(--header-gradient);
            filter:blur(20px); transform:scale(1.2);
            z-index:-1;
        }
        .ais-assistant-title { position: relative; font-size: 20px; color: white;}
        .ais-assistant-title:hover::after {
            content:'😉'; position:absolute; right:-25px; top:0;
            animation:aisSlideIn .8s forwards;
        }

        .ais-icon-container {
            position: relative;
            display: inline-block;
            margin-left: 12px;
        }
        .ais-icon-container .ais-icon {
            cursor: pointer;
            font-size: 20px;
            color: var(--text-light);
            transition: transform .3s ease;
        }
        .ais-icon-container .ais-icon:hover {
            transform: rotate(90deg);
        }
        .ais-icon-container .ais-icon-tooltip {
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
            z-index: 10; /* Ensure tooltips are above other elements within chatbox */
        }
        .ais-icon-container:hover .ais-icon-tooltip {
            opacity: 1;
        }

        #aisChatBox {
            flex: 1; padding: 16px;
            display: flex; flex-direction: column; gap: 12px;
            overflow-y: auto;
            scrollbar-width: thin;
            scrollbar-color: var(--header-gradient) var(--assistant-color);
        }
        #aisChatBox::-webkit-scrollbar { width: 6px; }
        #aisChatBox::-webkit-scrollbar-thumb {
            background: var(--header-gradient);
            border-radius: 3px;
        }

        #aisChatBox .ais-message { /* Prefix class */
            display: inline-block;
            width: auto;
            max-width: 85%;
            white-space: pre-wrap;
            overflow-wrap: break-word;
            transition: transform .8s cubic-bezier(.45,1.35,.55,1.02), box-shadow .8s cubic-bezier(.45,1.35,.55,1.02);
        }
        #aisChatBox .ais-message p {
            display: inline;
            margin: 0;
        }

        .ais-message { /* Prefix class */
            position: relative;
            background: var(--assistant-color);
            color: var(--text-dark);
            align-self: flex-start;
            padding: 16px 24px;
            border-radius: 24px;
            box-shadow: var(--shadow);
            line-height: 1.5;
        }
        .ais-message:hover {
            transform: scale(1.03);
            box-shadow: var(--shadow-hover);
        }
        .ais-assistant-message.loading { font-style: italic; opacity: .7; }
        .ais-user-message { /* Prefix class */
            background: var(--user-gradient);
            color: var(--text-light);
            align-self: flex-end;
            text-align: right;
        }

        .ais-save-icon { /* Prefix class */
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
        .ais-save-icon.visible {
            opacity: 1;
            transform: scale(1);
        }

        #aisInputContainer {
            display: flex;
            border-top: 1px solid rgba(238, 238, 238, 0.7); /* Slightly more opaque for better visibility */
            padding: 10px 16px;
        }
        #aisInputBox {
            flex: 1;
            padding: 10px 14px;
            border: 1px solid #ddd;
            border-radius: 20px;
            font-size: 1rem;
            outline: none;
            transition: border-color .8s ease;
            font-style: italic;
            background: rgba(255,255,255,0.8); /* Slightly more opaque for better visibility */
        }
        #aisInputBox:focus { border-image: var(--header-gradient) 1; border-width: 1px; border-style: solid; }


        #aisSendButton {
            background: none;
            border: none;
            margin-left: 12px;
            width: 40px; height: 40px;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer;
            transition: transform .4s ease, background-color .8s ease;
            position: relative;
        }
        #aisSendButton:hover {
            transform: scale(1.05);
            background: rgba(113,93,228,0.1); /* Example color, adjust if needed */
            border-radius: 50%;
        }
        #aisSendButton .ais-send-tooltip { /* Prefix class */
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
        #aisSendButton:hover .ais-send-tooltip {
            opacity: 1;
        }

        #aisSendIcon {
            width: 20px; height: 20px;
        }
        #aisSendIcon path { /* Make SVG fill adaptable */
            fill: url(#ais-send-icon-gradient);
        }


        @media (max-width: 600px) {
            #aisChatIcon { width: 50px; height: 50px; font-size: 28px; }
            #aisChatBoxContainer { bottom: 80px; right: 10px; width: calc(100vw - 20px); max-width: 90vw; }
            #aisChatHeader { padding: 8px 12px; }
            .ais-message { padding: 12px 16px; }
            #aisInputContainer { padding: 8px 12px; }
            #aisInputBox { font-size: .9rem; }
            #aisSendButton { width: 36px; height: 36px; }
        }
    `;

    // --- Proměnné a stav widgetu ---
    let chatIconEl, chatBoxContainerEl, chatCloseEl, chatRefreshEl, chatBoxEl, inputBoxEl, sendButtonEl;
    let conversation = [];
    let topicId = null;
    let markedLib = window.marked; // Odkaz na globální knihovnu marked

    // --- HTML Struktura ---
    function createChatHtml() {
        const container = document.createElement('div');
        container.id = 'aisChatContainer'; // ID pro hlavní kontejner widgetu
        container.innerHTML = `
            <div id="aisChatIcon">
                ${WIDGET_CONFIG.chatIconContent}<div class="ais-tooltip">${WIDGET_CONFIG.chatIconTooltip}</div>
            </div>
            <div id="aisChatBoxContainer" class="close">
                <div id="aisChatHeader">
                    <span class="ais-assistant-title">🤖Virtuální asistent <b>${WIDGET_CONFIG.assistantName}</b></span>
                    <div style="display:flex;align-items:center">
                        <div class="ais-icon-container">
                            <span id="aisChatRefresh" class="ais-icon">⟲</span>
                            <div class="ais-icon-tooltip">Nový chat</div>
                        </div>
                        <div class="ais-icon-container">
                            <span id="aisChatClose" class="ais-icon">✖</span>
                            <div class="ais-icon-tooltip">Zavřít</div>
                        </div>
                    </div>
                </div>
                <div id="aisChatBox"></div>
                <div id="aisInputContainer">
                    <input id="aisInputBox" type="text" placeholder="Zadejte zprávu…" />
                    <button id="aisSendButton" aria-label="Odeslat zprávu">
                        <svg id="aisSendIcon" viewBox="0 0 24 24">
                            <defs>
                                <linearGradient id="ais-send-icon-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" style="stop-color:${getComputedStyle(document.documentElement).getPropertyValue('--header-gradient').split(',')[1] || '#b477ff'}; stop-opacity:1" />
                                    <stop offset="100%" style="stop-color:${getComputedStyle(document.documentElement).getPropertyValue('--header-gradient').split(',')[2] || '#000000'}; stop-opacity:1" />
                                </linearGradient>
                            </defs>
                            <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
                        </svg>
                        <div class="ais-send-tooltip">Odeslat</div>
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(container);
    }

    // --- Vložení stylů ---
    function injectStyles() {
        const fontLink = document.createElement('link');
        fontLink.href = WIDGET_CONFIG.fontUrl;
        fontLink.rel = 'stylesheet';
        document.head.appendChild(fontLink);

        const styleElement = document.createElement('style');
        styleElement.type = 'text/css';
        styleElement.innerHTML = cssStyles;
        document.head.appendChild(styleElement);
    }

    // --- Logika Chatu (funkce z původního skriptu, mírně upravené) ---
    function saveHistory() {
        try { // sessionStorage může být nedostupný (např. v incognito v iframe)
            sessionStorage.setItem(WIDGET_CONFIG.storageKey, JSON.stringify(conversation));
        } catch (e) {
            console.warn('AiSimplify Chat: Failed to save history to sessionStorage.', e);
        }
    }

    function addMessage(sender, content = '') {
        const msg = document.createElement('div');
        msg.className = `ais-message ais-${sender}-message`; // Použij prefixované třídy
        
        // Bezpečnostní pojistka - pokud content je null/undefined, převede na prázdný string
        const safeContent = content === null || typeof content === 'undefined' ? '' : String(content);
        msg.innerHTML = markedLib.parse(safeContent);


        msg.addEventListener('mouseenter', () => {
            document.querySelectorAll('.ais-save-icon').forEach(el => {
                el.classList.remove('visible');
                setTimeout(() => { if (el.parentElement) el.remove(); }, 250);
            });
            if (!msg.querySelector('.ais-save-icon')) {
                const saveIcon = document.createElement('span');
                saveIcon.className = 'ais-save-icon';
                saveIcon.textContent = '💾';
                msg.append(saveIcon);
                setTimeout(() => { saveIcon.classList.add('visible'); }, 10);

                const removeIcon = () => {
                    saveIcon.classList.remove('visible');
                    setTimeout(() => { if (saveIcon.parentElement) saveIcon.remove(); }, 250);
                };
                let timer = setTimeout(removeIcon, 3000); // Změna: const na let kvůli clearTimeout
                saveIcon.addEventListener('click', (e) => {
                    e.stopPropagation(); // Zabrání propagaci na msg event listener
                    clearTimeout(timer);
                    const textToCopy = msg.innerText.replace(saveIcon.textContent, '').trim();
                    navigator.clipboard.writeText(textToCopy).then(() => {
                        saveIcon.textContent = '✅Zkopírováno';
                    }).catch(err => {
                        console.error('AiSimplify Chat: Could not copy text: ', err);
                        saveIcon.textContent = '❌Chyba';
                    });
                    setTimeout(removeIcon, 1000);
                });
            }
        });

        msg.addEventListener('mouseleave', () => {
             // Pouze pokud kurzor neopustil zprávu směrem na save ikonu
            setTimeout(() => {
                const isHoveringSaveIcon = msg.querySelector('.ais-save-icon:hover');
                if (!isHoveringSaveIcon) {
                    document.querySelectorAll('.ais-save-icon.visible').forEach(el => {
                         if (el.parentElement === msg) { // Jen ikona na této zprávě
                            el.classList.remove('visible');
                            setTimeout(() => { if (el.parentElement) el.remove(); }, 250);
                        }
                    });
                }
            }, 50); // Malé zpoždění pro zachycení hoveru na ikonu
        });


        chatBoxEl.append(msg);
        if (sender === 'assistant') {
            msg.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            chatBoxEl.scrollTop = chatBoxEl.scrollHeight;
        }
        return msg;
    }

    async function clearChat() {
        chatBoxEl.innerHTML = ''; // Efektivnější než querySelectorAll a remove
        if (chatRefreshEl) chatRefreshEl.classList.add('rotate'); // Přidána kontrola existence
        
        try {
            await fetch(`${WIDGET_CONFIG.apiBase}/reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientID: WIDGET_CONFIG.clientId })
            });
        } catch (err) {
            console.error('AiSimplify Chat: Error resetting chat on server.', err);
        }

        setTimeout(() => {
            conversation = [];
            topicId = null;
            try {
                sessionStorage.removeItem(WIDGET_CONFIG.storageKey);
                sessionStorage.removeItem(WIDGET_CONFIG.topicKey);
            } catch (e) {
                console.warn('AiSimplify Chat: Failed to remove items from sessionStorage.', e);
            }
            if (chatRefreshEl) chatRefreshEl.classList.remove('rotate');
            sendInitial();
        }, 600);
    }

    async function sendInitial() {
        if (!chatBoxContainerEl || !inputBoxEl) return; // Kontrola existence elementů
        chatBoxContainerEl.classList.add('open');
        inputBoxEl.focus();
        
        const text = WIDGET_CONFIG.initialGreeting;
        const bubble = document.createElement('div');
        bubble.className = 'ais-message ais-assistant-message';
        bubble.style.filter = 'blur(10px)'; bubble.style.opacity = '0';
        chatBoxEl.append(bubble);
        bubble.scrollIntoView({ behavior: 'smooth', block: 'start' });
        bubble.style.transition = 'opacity 1s ease,filter 1s ease';
        setTimeout(() => { bubble.style.opacity = '1'; bubble.style.filter = 'blur(0)'; }, 50);

        let idx = 0, revealSpeed = 40;
        const typingInterval = setInterval(() => { // Přejmenováno pro srozumitelnost
            bubble.textContent += text[idx++];
            bubble.scrollIntoView({ behavior: 'smooth', block: 'start' });
            if (idx >= text.length) {
                clearInterval(typingInterval);
                conversation.push({ role:'assistant', content:bubble.textContent });
                saveHistory();
            }
        }, revealSpeed);
    }

    async function sendMessage() {
        if (!inputBoxEl) return; // Kontrola existence
        const userText = inputBoxEl.value.trim();
        if (!userText) return;
        
        conversation.push({ role:'user', content:userText });
        saveHistory(); 
        addMessage('user', userText);
        inputBoxEl.value = '';

        const loadingMessages = ['Přemýšlím....','Momentík...','Ještě chvilinku...','Děkuji za trpělivost😉','Už to bude...'];
        let loadingMsgIndex = 0;
        const assistantBubble = addMessage('assistant', loadingMessages[loadingMsgIndex]);
        assistantBubble.classList.add('loading');
        assistantBubble.style.transition='opacity .8s ease'; assistantBubble.style.opacity='1';
        
        const loadingInterval = setInterval(()=>{
            assistantBubble.style.opacity='0';
            setTimeout(()=>{
                assistantBubble.textContent = loadingMessages[++loadingMsgIndex % loadingMessages.length];
                assistantBubble.style.opacity='1';
                assistantBubble.scrollIntoView({ behavior: 'smooth', block: 'start' });
            },500);
        },2000);

        let assistantTextAccumulated = '';
        try {
            const response = await fetch(`${WIDGET_CONFIG.apiBase}/chat`, {
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body: JSON.stringify({ 
                    clientID: WIDGET_CONFIG.clientId, 
                    history:conversation, 
                    topic_id:topicId 
                })
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }

            const newTopic = response.headers.get('X-Trieve-Topic-ID');
            if(newTopic){ 
                topicId=newTopic; 
                try {
                    sessionStorage.setItem(WIDGET_CONFIG.topicKey,topicId);
                } catch (e) {
                     console.warn('AiSimplify Chat: Failed to save topicId to sessionStorage.', e);
                }
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let firstChunk = true;

            while(true){
                const {value, done} = await reader.read();
                if(done) break;
                
                const chunk = decoder.decode(value,{stream:true});
                if(firstChunk){
                    clearInterval(loadingInterval);
                    assistantBubble.classList.remove('loading');
                    assistantBubble.innerHTML=''; // Vyčistit "Přemýšlím..."
                    firstChunk=false;
                }
                assistantTextAccumulated += chunk;
                assistantBubble.innerHTML = markedLib.parse(assistantTextAccumulated);
                assistantBubble.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            conversation.push({ role:'assistant', content:assistantTextAccumulated });
            saveHistory();
        } catch(err){
            clearInterval(loadingInterval);
            if (assistantBubble) { // Ujistěte se, že assistantBubble existuje
                assistantBubble.classList.remove('loading');
                assistantBubble.textContent = 'Omlouváme se, došlo k chybě při komunikaci se serverem.';
                assistantBubble.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            console.error('AiSimplify Chat: Error sending message or processing response.', err);
        }
        if (inputBoxEl) inputBoxEl.focus();
    }

    function renderHistory(){
        if (!chatBoxEl || !inputBoxEl) return; // Kontrola existence
        chatBoxEl.innerHTML = '';
        conversation.forEach(msg => addMessage(msg.role, msg.content));
        inputBoxEl.focus();
    }

    function toggleChat(open){
        if (!chatIconEl || !chatBoxContainerEl) return; // Kontrola existence

        if(open){
            chatIconEl.style.display='none';
            chatBoxContainerEl.style.display='flex';
            setTimeout(()=>{
                chatBoxContainerEl.classList.remove('close'); // Odebrat 'close'
                chatBoxContainerEl.classList.add('open');   // Přidat 'open'
            },10);
            if (conversation.length > 0) { // Opraveno: kontrola délky, ne existence
                 renderHistory();
            } else {
                 sendInitial();
            }
        } else {
            chatBoxContainerEl.classList.remove('open'); // Odebrat 'open'
            chatBoxContainerEl.classList.add('close');  // Přidat 'close'
            setTimeout(()=>{
                chatBoxContainerEl.style.display='none';
                chatIconEl.style.display='flex';
            },400); // Čas by měl odpovídat délce transition v CSS
        }
    }

    // --- Inicializace Widgetu ---
    function initializeWidget() {
        // Kontrola a fallback pro marked.js
        if (typeof window.marked === 'undefined') {
            console.warn(`AiSimplify Chat Widget: marked.min.js is not loaded. Please include it for rich text formatting. You can get it from: ${WIDGET_CONFIG.markedJsUrl}`);
            // Jednoduchý fallback, který escapuje HTML pro bezpečnost
            markedLib = { 
                parse: (text) => {
                    const div = document.createElement('div');
                    div.textContent = text;
                    return div.innerHTML;
                }
            };
        } else {
            markedLib = window.marked;
        }

        injectStyles();
        createChatHtml();

        // Načtení referencí na DOM elementy po jejich vytvoření
        chatIconEl = document.getElementById('aisChatIcon');
        chatBoxContainerEl = document.getElementById('aisChatBoxContainer');
        chatCloseEl = document.getElementById('aisChatClose');
        chatRefreshEl = document.getElementById('aisChatRefresh');
        chatBoxEl = document.getElementById('aisChatBox');
        inputBoxEl = document.getElementById('aisInputBox');
        sendButtonEl = document.getElementById('aisSendButton');

        // Načtení historie
        try {
            const storedConversation = sessionStorage.getItem(WIDGET_CONFIG.storageKey);
            if (storedConversation) {
                conversation = JSON.parse(storedConversation);
            }
            const storedTopicId = sessionStorage.getItem(WIDGET_CONFIG.topicKey);
            if (storedTopicId) {
                topicId = storedTopicId;
            }
        } catch (e) {
            console.warn('AiSimplify Chat: Failed to load data from sessionStorage.', e);
            conversation = []; // Reset v případě chyby
            topicId = null;
        }


        // Připojení event listenerů
        if (chatIconEl) chatIconEl.addEventListener('click', () => toggleChat(true));
        if (chatCloseEl) chatCloseEl.addEventListener('click', () => toggleChat(false));
        if (chatRefreshEl) chatRefreshEl.addEventListener('click', clearChat);
        if (sendButtonEl) sendButtonEl.addEventListener('click', sendMessage);
        if (inputBoxEl) inputBoxEl.addEventListener('keypress', e => { if(e.key==='Enter') sendMessage(); });
    }

    // Spuštění widgetu po načtení DOMu
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeWidget);
    } else {
        initializeWidget(); // DOM již načten
    }

})();
