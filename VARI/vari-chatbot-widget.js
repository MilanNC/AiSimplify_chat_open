(function() {
    // --- Configuration ---
    const WIDGET_ROOT_ID = 'vari-chatbot-host'; // ID for the div user places on their page
    const CHAT_CONTAINER_ID = 'variChatContainer'; // Main container for the widget's UI elements
    const MARKED_JS_URL = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
    const POPPINS_FONT_URL = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap';

    // --- Helper to load external scripts ---
    function loadScript(src, callback) {
        const script = document.createElement('script');
        script.src = src;
        script.onload = callback;
        script.onerror = () => console.error(`Vari Chatbot: Failed to load script: ${src}`);
        document.head.appendChild(script);
    }

    // --- Helper to load CSS ---
    function loadCSS() {
        const style = document.createElement('style');
        style.textContent = `
            /* CSS Variables for the widget - consider prefixing if collision is likely */
            :root {
              --vari-widget-header-gradient: linear-gradient(90deg,#ff0101,#000000);
              --vari-widget-user-gradient: #e4032e; /* Solid color from gradient for specific uses */
              --vari-widget-assistant-color: #F4F4F9;
              --vari-widget-text-light: #ffffff;
              --vari-widget-text-dark: #000000;
              --vari-widget-bg: #fff;
              --vari-widget-shadow: rgba(0,0,0,0.1) 0 4px 12px;
              --vari-widget-shadow-hover: rgba(0,0,0,0.2) 0 6px 16px;
            }

            /* Main widget container - ensure it doesn't inherit unwanted styles */
            #${CHAT_CONTAINER_ID} {
              font-family: 'Poppins', sans-serif;
              position: fixed;
              bottom: 20px;
              right: 20px;
              z-index: 99999; /* High z-index */
              font-size: 16px; /* Base font size */
              line-height: 1.4;
              box-sizing: border-box;
            }
            #${CHAT_CONTAINER_ID} *, #${CHAT_CONTAINER_ID} *::before, #${CHAT_CONTAINER_ID} *::after {
                box-sizing: border-box;
                /* Resetting common inherited properties that might interfere */
                margin: 0;
                padding: 0;
                border-width: 0; /* If borders are explicitly set, this is fine */
                font: inherit; /* Inherit from #variChatContainer or set explicitly */
                color: inherit;
                background: transparent;
                text-align: left; /* Default text alignment */
                pointer-events: auto; /* Enable pointer events for children */
            }
             #${CHAT_CONTAINER_ID} button, #${CHAT_CONTAINER_ID} input {
                font-family: 'Poppins', sans-serif; /* Ensure form elements inherit font */
             }


            @keyframes vari-widget-gradientFlow {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
            @keyframes vari-widget-pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.1); }
            }
            @keyframes vari-widget-slideIn {
              from { transform: translateX(-10px); opacity: 0; }
              to   { transform: translateX(0); opacity: 1; }
            }

            #${CHAT_CONTAINER_ID} #chatIcon {
              width: 64px; height: 64px; border-radius: 50%;
              display: flex; align-items: center; justify-content: center;
              color: var(--vari-widget-text-light); font-size: 36px;
              cursor: pointer; animation: vari-widget-pulse 2s infinite;
              box-shadow: var(--vari-widget-shadow); position: relative; overflow: hidden;
              /* background: transparent; ensure this is explicitly set if needed after reset */
            }
            #${CHAT_CONTAINER_ID} #chatIcon::before {
              content:""; position:absolute; inset:0;
              background:var(--vari-widget-header-gradient); background-size:200% 200%;
              animation:vari-widget-gradientFlow 8s infinite;
              filter:blur(20px); transform:scale(1.2); z-index:-1;
            }
            #${CHAT_CONTAINER_ID} #chatIcon .tooltip {
              position:absolute; bottom:70px; right:0;
              background:var(--vari-widget-header-gradient); color:var(--vari-widget-text-light);
              padding:6px 10px; border-radius:12px; font-size:.85rem;
              white-space:nowrap; opacity:0; transition:opacity .3s;
              pointer-events:none;
            }
            #${CHAT_CONTAINER_ID} #chatIcon:hover .tooltip { opacity:1; }

            #${CHAT_CONTAINER_ID} #chatBoxContainer {
              display: none;
              width: clamp(350px, 85vw, 600px); /* Max width adjusted slightly */
              border-radius: 24px;
              background: var(--vari-widget-bg);
              box-shadow: var(--vari-widget-shadow);
              position: absolute;
              bottom: 85px; /* Approx icon height + spacing */
              right: 0;
              flex-direction: column;
              opacity: 0;
              overflow: hidden;
              transform: translateY(20px);
              transition: opacity .6s ease, transform .6s ease, height .6s ease;
              height: 0; /* Start with height 0 */
            }
            #${CHAT_CONTAINER_ID} #chatBoxContainer.open {
              display: flex;
              opacity: 1;
              transform: translateY(0);
              height: min(70vh, 600px) !important; /* Max height for chatbox */
            }

            #${CHAT_CONTAINER_ID} #chatHeader {
              padding: 10px 16px;
              display: flex; justify-content: space-between; align-items: center;
              border-top-left-radius: 24px; border-top-right-radius: 24px;
              position: relative;
              overflow: visible;
              /* background: transparent; */ /* from reset */
              color: var(--vari-widget-text-light); /* Text color for header */
            }
            #${CHAT_CONTAINER_ID} #chatHeader::before {
              content:""; position:absolute; inset:0;
              background:var(--vari-widget-header-gradient);
              filter:blur(20px); transform:scale(1.2);
              z-index:-1; border-top-left-radius: 24px; border-top-right-radius: 24px;
            }
            #${CHAT_CONTAINER_ID} .assistant-title {
                position: relative; font-size: 20px; color: var(--vari-widget-text-light); font-weight: 500;
            }
            #${CHAT_CONTAINER_ID} .assistant-title b { font-weight: 700; }
            #${CHAT_CONTAINER_ID} .assistant-title:hover::after {
              content:'😉'; position:absolute; right:-25px; top:0;
              animation:vari-widget-slideIn .8s forwards;
            }

            #${CHAT_CONTAINER_ID} .icon-container {
              position: relative;
              display: inline-block; /* Corrected from flex to inline-block if not a flex item directly */
              margin-left: 12px;
            }
            #${CHAT_CONTAINER_ID} .icon-container .icon {
              cursor: pointer;
              font-size: 20px;
              color: var(--vari-widget-text-light);
              transition: transform .3s ease;
              padding: 5px; /* Add some padding for easier clicking */
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
              background: var(--vari-widget-bg);
              color: var(--vari-widget-text-dark);
              padding: 4px 8px;
              border-radius: 6px;
              font-size: .8rem;
              white-space: nowrap;
              opacity: 0;
              transition: opacity .2s ease;
              pointer-events: none;
              box-shadow: var(--vari-widget-shadow);
              z-index: 100000; /* Ensure tooltip is above other elements */
            }
            #${CHAT_CONTAINER_ID} .icon-container:hover .icon-tooltip {
              opacity: 1;
            }

            #${CHAT_CONTAINER_ID} #chatBox {
              flex: 1; padding: 16px;
              display: flex; flex-direction: column; gap: 12px;
              overflow-y: auto;
              background: var(--vari-widget-bg); /* Ensure chatbox has background */
              scrollbar-width: thin;
              scrollbar-color: var(--vari-widget-user-gradient) var(--vari-widget-assistant-color);
            }
            #${CHAT_CONTAINER_ID} #chatBox::-webkit-scrollbar { width: 6px; }
            #${CHAT_CONTAINER_ID} #chatBox::-webkit-scrollbar-thumb {
              background: var(--vari-widget-user-gradient);
              border-radius: 3px;
            }

            #${CHAT_CONTAINER_ID} #chatBox .message {
              /* display: inline-block; Removed, flex properties from parent handle alignment */
              width: auto;
              max-width: 85%;
              white-space: pre-wrap;
              overflow-wrap: break-word;
              padding: 12px 18px; /* Adjusted padding */
              border-radius: 18px; /* Adjusted radius */
              box-shadow: var(--vari-widget-shadow);
              line-height: 1.5;
              transition: transform .3s cubic-bezier(.45,1.35,.55,1.02), box-shadow .3s cubic-bezier(.45,1.35,.55,1.02);
              position: relative; /* For save icon */
            }
             #${CHAT_CONTAINER_ID} #chatBox .message p {
                /* display: inline; Removed, causes issues with block elements from marked.js */
                margin:0; /* Keep margin reset for p */
                color: inherit; /* Ensure p inherits message text color */
                font-size: 0.95rem; /* Control paragraph font size */
             }
            #${CHAT_CONTAINER_ID} #chatBox .message:hover {
              transform: scale(1.02); /* Subtle hover effect */
              box-shadow: var(--vari-widget-shadow-hover);
            }

            #${CHAT_CONTAINER_ID} .assistant-message {
              background: var(--vari-widget-assistant-color);
              color: var(--vari-widget-text-dark);
              align-self: flex-start;
            }
            #${CHAT_CONTAINER_ID} .assistant-message.loading { font-style: italic; opacity: .7; }

            #${CHAT_CONTAINER_ID} .user-message {
              background: var(--vari-widget-user-gradient);
              color: var(--vari-widget-text-light);
              align-self: flex-end;
            }

            #${CHAT_CONTAINER_ID} .save-icon {
              display: inline-block; /* Corrected */
              position: absolute;
              top: 8px;
              right: 10px;
              opacity: 0;
              transform: scale(0.8);
              transition: opacity 0.25s cubic-bezier(.45,1.35,.55,1.02), transform 0.25s cubic-bezier(.45,1.35,.55,1.02);
              cursor: pointer;
              user-select: none;
              font-size: 1.1em; /* Adjusted size */
              background: var(--vari-widget-bg);
              color: var(--vari-widget-text-dark); /* Icon color */
              border-radius: 7px;
              padding: 2px 6px; /* Adjusted padding */
              box-shadow: var(--vari-widget-shadow);
              z-index: 2;
              pointer-events: all; /* Make sure it's clickable */
            }
            #${CHAT_CONTAINER_ID} .save-icon.visible {
              opacity: 1;
              transform: scale(1);
            }

            #${CHAT_CONTAINER_ID} #inputContainer {
              display: flex;
              border-top: 1px solid #eee;
              padding: 10px 16px;
              background: var(--vari-widget-bg);
              border-bottom-left-radius: 24px;
              border-bottom-right-radius: 24px;
            }
            #${CHAT_CONTAINER_ID} #inputBox {
              flex: 1;
              padding: 10px 14px;
              border: 1px solid #ddd;
              border-radius: 20px;
              font-size: 1rem;
              outline: none;
              transition: border-color .3s ease;
              font-style: italic;
              color: var(--vari-widget-text-dark); /* Explicit color for input text */
              background-color: #fff; /* Explicit background for input */
            }
            #${CHAT_CONTAINER_ID} #inputBox:focus {
                border-color: var(--vari-widget-user-gradient); /* Use solid color for border */
                font-style: normal;
            }
             #${CHAT_CONTAINER_ID} #inputBox::placeholder {
                color: #aaa; /* Placeholder color */
                font-style: italic;
             }


            #${CHAT_CONTAINER_ID} #sendButton {
              background: none; /* from reset */
              border: none; /* from reset */
              margin-left: 12px;
              width: 40px; height: 40px;
              display: flex; align-items: center; justify-content: center;
              cursor: pointer;
              transition: transform .2s ease, background-color .3s ease;
              position: relative;
              border-radius: 50%;
              padding:0; /* from reset */
            }
            #${CHAT_CONTAINER_ID} #sendButton:hover {
              transform: scale(1.05);
              background-color: rgba(228, 3, 46, 0.1); /* Use a color based on --vari-widget-user-gradient */
            }
            #${CHAT_CONTAINER_ID} #sendButton .send-tooltip {
              position: absolute;
              bottom: 100%;
              left: 50%;
              transform: translateX(-50%);
              margin-bottom: 6px;
              background: var(--vari-widget-bg);
              color: var(--vari-widget-text-dark);
              padding: 4px 8px;
              border-radius: 6px;
              font-size: .8rem;
              white-space: nowrap;
              opacity: 0;
              transition: opacity .2s ease;
              pointer-events: none;
              box-shadow: var(--vari-widget-shadow);
              z-index: 100000; /* High z-index */
            }
            #${CHAT_CONTAINER_ID} #sendButton:hover .send-tooltip {
              opacity: 1;
            }

            #${CHAT_CONTAINER_ID} #sendIcon {
              width: 20px; height: 20px;
              fill: var(--vari-widget-user-gradient); /* Solid color */
            }

            /* Responsive adjustments */
            @media (max-width: 600px) {
              #${CHAT_CONTAINER_ID} {
                bottom: 10px; right: 10px; left: 10px;
                width: auto; /* Occupy available width */
              }
              #${CHAT_CONTAINER_ID} #chatIcon { width: 50px; height: 50px; font-size: 28px; }
              #${CHAT_CONTAINER_ID} #chatBoxContainer {
                right: 0; left: 0; /* Span full width of #variChatContainer */
                width: 100%;
                bottom: 70px; /* (50px icon height + 20px spacing) */
                /* height set by .open class */
              }
              #${CHAT_CONTAINER_ID} #chatBoxContainer.open {
                 height: min(75vh, 500px) !important; /* Adjusted height for smaller screens */
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

        const fontLink = document.createElement('link');
        fontLink.href = POPPINS_FONT_URL;
        fontLink.rel = 'stylesheet';
        document.head.appendChild(fontLink);
    }

    function createHTML() {
        let hostElement = document.getElementById(WIDGET_ROOT_ID);
        if (!hostElement) {
            hostElement = document.createElement('div');
            hostElement.id = WIDGET_ROOT_ID;
            document.body.appendChild(hostElement);
        }
        // Clear host element in case of re-initialization or pre-existing content
        hostElement.innerHTML = '';

        const chatWidgetContainer = document.createElement('div');
        chatWidgetContainer.id = CHAT_CONTAINER_ID;
        chatWidgetContainer.innerHTML = `
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
        `;
        hostElement.appendChild(chatWidgetContainer);
        initializeChatLogic();
    }

    function initializeChatLogic() {
        const API_BASE = 'https://chatbot-production-4d1d.up.railway.app';
        const clientID = 'VARI';
        const STORAGE_KEY = 'vari_chat_history_widget_v1'; // Namespaced and versioned
        const TOPIC_KEY = 'vari_etrieve_topic_id_widget_v1'; // Namespaced and versioned
        let conversation = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]');
        let topicId = sessionStorage.getItem(TOPIC_KEY) || null;

        const chatIconEl = document.getElementById('chatIcon');
        const chatBoxContainerEl = document.getElementById('chatBoxContainer');
        const chatCloseEl = document.getElementById('chatClose');
        const chatRefreshEl = document.getElementById('chatRefresh');
        const chatBoxEl = document.getElementById('chatBox');
        const inputBoxEl = document.getElementById('inputBox');
        const sendButtonEl = document.getElementById('sendButton');

        if (!chatIconEl || !chatBoxContainerEl || !chatCloseEl || !chatRefreshEl || !chatBoxEl || !inputBoxEl || !sendButtonEl) {
            console.error("Vari Chatbot: Essential HTML elements not found. Initialization failed.");
            return;
        }

        function saveHistory() {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(conversation));
        }

        function addMessage(sender, content = '') {
            const msg = document.createElement('div');
            msg.className = `message ${sender}-message`;

            if (typeof marked !== 'undefined' && marked.parse) {
                // Sanitize content before parsing if it can come from untrusted user input directly into HTML
                // For chatbot responses, usually it's fine. For user messages displayed back, sanitize if needed.
                msg.innerHTML = marked.parse(content || ""); // Ensure content is string
            } else {
                const p = document.createElement('p');
                p.textContent = content;
                msg.appendChild(p);
                if (typeof marked === 'undefined') console.warn("Vari Chatbot: marked.js not loaded, displaying plain text.");
            }

            msg.addEventListener('mouseenter', () => {
                document.querySelectorAll(`#${CHAT_CONTAINER_ID} .save-icon.visible`).forEach(icon => {
                    icon.classList.remove('visible');
                    setTimeout(() => { if (icon.parentElement) icon.remove(); }, 250);
                });

                if (!msg.querySelector('.save-icon')) {
                    const saveIcon = document.createElement('span');
                    saveIcon.className = 'save-icon';
                    saveIcon.textContent = '💾';
                    saveIcon.setAttribute('title', 'Zkopírovat zprávu');
                    msg.appendChild(saveIcon); // Append before making visible
                    setTimeout(() => saveIcon.classList.add('visible'), 10);

                    let removeTimer;
                    const scheduleRemove = () => {
                        clearTimeout(removeTimer);
                        removeTimer = setTimeout(() => {
                            saveIcon.classList.remove('visible');
                            setTimeout(() => { if (saveIcon.parentElement) saveIcon.remove(); }, 250);
                        }, 3000);
                    };
                    scheduleRemove(); // Auto-hide after 3s

                    saveIcon.addEventListener('click', (e) => {
                        e.stopPropagation();
                        clearTimeout(removeTimer);
                        const textToCopy = msg.textContent.replace(saveIcon.textContent, '').trim();
                        navigator.clipboard.writeText(textToCopy)
                            .then(() => {
                                saveIcon.textContent = '✅'; // Shorter "Copied"
                                saveIcon.setAttribute('title', 'Zkopírováno!');
                            })
                            .catch(err => {
                                console.error('Vari Chatbot: Failed to copy text:', err);
                                saveIcon.textContent = '⚠️';
                                saveIcon.setAttribute('title', 'Chyba kopírování');
                            });
                        setTimeout(() => { // Revert icon or remove after a short delay
                             saveIcon.classList.remove('visible');
                             setTimeout(() => { if (saveIcon.parentElement) saveIcon.remove(); }, 250);
                        }, 1200);
                    });
                }
            });

            msg.addEventListener('mouseleave', () => {
                const saveIcon = msg.querySelector('.save-icon.visible');
                if (saveIcon) {
                     let removeTimerLeave = setTimeout(() => {
                        saveIcon.classList.remove('visible');
                        setTimeout(() => { if (saveIcon.parentElement) saveIcon.remove(); }, 250);
                    }, 300); // Short delay on mouse leave
                     saveIcon.addEventListener('mouseenter', () => clearTimeout(removeTimerLeave)); // Cancel removal if mouse re-enters icon
                }
            });

            chatBoxEl.appendChild(msg);

            if (sender === 'assistant') {
                msg.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                chatBoxEl.scrollTop = chatBoxEl.scrollHeight;
            }
            return msg;
        }

        async function clearChat() {
            chatBoxEl.innerHTML = '';
            // Add visual feedback for refresh icon if CSS for .rotate is defined
            // chatRefreshEl.classList.add('rotate');
            // setTimeout(() => chatRefreshEl.classList.remove('rotate'), 600);

            try {
                const response = await fetch(`${API_BASE}/reset`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ clientID })
                });
                if (!response.ok) {
                    console.warn("Vari Chatbot: Server-side reset might have failed.", response.status);
                }
            } catch (err) {
                console.error("Vari Chatbot: Error resetting chat session on server:", err);
            }

            conversation = [];
            topicId = null;
            sessionStorage.removeItem(STORAGE_KEY);
            sessionStorage.removeItem(TOPIC_KEY);
            sendInitial();
        }

        async function sendInitial() {
            if (!chatBoxContainerEl.classList.contains('open')) {
                // Don't send if chat isn't open, toggleChat will handle it
                return;
            }
            inputBoxEl.focus();
            const initialText = 'Dobrý den, s čím Vám mohu pomoci?😉 Můžete se mě zeptat na cokoli ohledně současné nabídky VARI😉';

            if (conversation.some(m => m.role === 'assistant' && m.content === initialText)) {
                // Avoid re-adding if already present (e.g. after history render)
                return;
            }

            const bubble = addMessage('assistant', '');
            const textElement = bubble.querySelector('p') || bubble;
            textElement.textContent = ''; // Clear any default from addMessage with empty content

            bubble.style.filter = 'blur(8px)';
            bubble.style.opacity = '0';
            bubble.style.transition = 'opacity 0.8s ease, filter 0.8s ease';

            setTimeout(() => {
                bubble.style.opacity = '1';
                bubble.style.filter = 'blur(0)';
            }, 50);

            let idx = 0;
            const revealSpeed = 30; // Slightly faster
            function typeCharacter() {
                if (idx < initialText.length) {
                    textElement.textContent += initialText[idx++];
                    bubble.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); // 'nearest' can be smoother
                    setTimeout(typeCharacter, revealSpeed);
                } else {
                    if (!conversation.find(m => m.role === 'assistant' && m.content === initialText)) {
                        conversation.push({ role: 'assistant', content: initialText });
                        saveHistory();
                    }
                }
            }
            typeCharacter();
        }

        async function sendMessage() {
            const userText = inputBoxEl.value.trim();
            if (!userText) return;

            conversation.push({ role: 'user', content: userText });
            saveHistory();
            addMessage('user', userText);
            inputBoxEl.value = '';
            inputBoxEl.focus();

            const loadingMessages = ['Přemýšlím....', 'Momentík...', 'Ještě chvilinku...', 'Děkuji za trpělivost😉', 'Už to bude...'];
            let loadingMsgIndex = 0;
            const assistantBubble = addMessage('assistant', loadingMessages[loadingMsgIndex]);
            assistantBubble.classList.add('loading');
            const assistantTextElement = assistantBubble.querySelector('p') || assistantBubble;

            const loadingInterval = setInterval(() => {
                loadingMsgIndex = (loadingMsgIndex + 1) % loadingMessages.length;
                assistantBubble.style.opacity = '0.3'; // Fade out slightly
                setTimeout(() => {
                    assistantTextElement.textContent = loadingMessages[loadingMsgIndex];
                    assistantBubble.style.opacity = '1';
                    assistantBubble.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 400);
            }, 2000);

            let assistantResponseText = '';
            try {
                const response = await fetch(`${API_BASE}/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ clientID, history: conversation, topic_id: topicId })
                });

                if (!response.ok) {
                    throw new Error(`Server error: ${response.status} ${response.statusText}`);
                }

                const newTopic = response.headers.get('X-Trieve-Topic-ID');
                if (newTopic) {
                    topicId = newTopic;
                    sessionStorage.setItem(TOPIC_KEY, topicId);
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let firstChunkReceived = false;

                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    if (!firstChunkReceived) {
                        clearInterval(loadingInterval);
                        assistantBubble.classList.remove('loading');
                        assistantTextElement.innerHTML = ''; // Clear loading text
                        firstChunkReceived = true;
                    }
                    assistantResponseText += chunk;
                    assistantTextElement.innerHTML = marked.parse(assistantResponseText);
                    assistantBubble.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
                conversation.push({ role: 'assistant', content: assistantResponseText });
                saveHistory();
            } catch (error) {
                clearInterval(loadingInterval);
                assistantBubble.classList.remove('loading');
                assistantTextElement.textContent = 'Omlouvám se, došlo k chybě. Zkuste to prosím později.';
                console.error('Vari Chatbot: Error sending message:', error);
                // Add error to conversation for user visibility
                conversation.push({ role: 'assistant', content: assistantTextElement.textContent });
                saveHistory();
            } finally {
                inputBoxEl.focus();
            }
        }

        function renderHistory() {
            chatBoxEl.innerHTML = '';
            conversation.forEach(msg => addMessage(msg.role, msg.content));
            if (chatBoxEl.lastChild) {
                chatBoxEl.lastChild.scrollIntoView({ behavior: 'auto', block: 'end' });
            }
            inputBoxEl.focus();
        }

        function toggleChat(openState) {
            const isOpen = chatBoxContainerEl.classList.contains('open');
            if (openState === isOpen) return; // Already in desired state

            if (openState) {
                chatIconEl.style.display = 'none';
                chatBoxContainerEl.style.display = 'flex';
                setTimeout(() => {
                    chatBoxContainerEl.classList.remove('close');
                    chatBoxContainerEl.classList.add('open');
                }, 10);

                if (conversation.length === 0) {
                    sendInitial();
                } else {
                    renderHistory();
                }
                inputBoxEl.focus();
            } else {
                chatBoxContainerEl.classList.remove('open');
                chatBoxContainerEl.classList.add('close');
                setTimeout(() => {
                    chatBoxContainerEl.style.display = 'none';
                    chatIconEl.style.display = 'flex';
                }, 600); // Match CSS transition duration
            }
        }

        chatIconEl.addEventListener('click', () => toggleChat(true));
        chatCloseEl.addEventListener('click', () => toggleChat(false));
        chatRefreshEl.addEventListener('click', clearChat);
        sendButtonEl.addEventListener('click', sendMessage);
        inputBoxEl.addEventListener('keypress', e => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        // Optional: Restore chat state if it was open previously (using a flag in sessionStorage)
        // if (sessionStorage.getItem('vari_chat_was_open') === 'true' && conversation.length > 0) {
        //    toggleChat(true);
        // }
        // document.addEventListener('visibilitychange', () => {
        //    if (document.visibilityState === 'hidden') {
        //        if (chatBoxContainerEl.classList.contains('open')) {
        //            sessionStorage.setItem('vari_chat_was_open', 'true');
        //        } else {
        //            sessionStorage.removeItem('vari_chat_was_open');
        //        }
        //    }
        // });
    }

    function init() {
        // Ensure this runs after DOM is ready, especially if script is in <head>
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                loadCSS();
                loadScript(MARKED_JS_URL, createHTML); // createHTML calls initializeChatLogic
            });
        } else {
            loadCSS();
            loadScript(MARKED_JS_URL, createHTML);
        }
    }

    init();

})();
