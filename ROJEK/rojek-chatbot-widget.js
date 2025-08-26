(function() {
    // Unikátní ID pro kontejner widgetu na cílové stránce
    const WIDGET_CONTAINER_ID = 'rojek-chat-widget-container';

    // --- 1. CSS STYLY ---
    const styles = `
    :root {
      --header-gradient: linear-gradient(90deg, rgb(251, 221, 0), #000000);
      --user-gradient: rgb(251, 221, 0);
      --assistant-color: #f0f0f5;
      --text-light: #ffffff;
      --text-dark: #000000;
      --bg: #fff;
      --shadow: rgba(0, 0, 0, 0.1) 0 4px 12px;
      --shadow-hover: rgba(0, 0, 0, 0.2) 0 6px 16px;
      --rojek-yellow: rgb(251, 221, 0);
      --rojek-black: #000000;
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
      background: linear-gradient(45deg, var(--rojek-yellow), transparent, var(--rojek-black), transparent, var(--rojek-yellow));
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
      height: 70vh;
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
      transition: all 0.5s ease-out;
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
      flex-shrink: 0;
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
      gap: 15px;
    }
    #chatHeader .icon-container {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 40px;
    }
    #chatHeader .icon-container .icon {
      cursor: pointer;
      font-size: 20px;
      color: var(--text-light);
      transition: transform 0.3s ease;
      padding: 8px;
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
      transform: translateX(-50%);
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
      scrollbar-color: var(--rojek-yellow) transparent;
    }
    #chatBox::-webkit-scrollbar { width: 6px; }
    #chatBox::-webkit-scrollbar-thumb {
      background: var(--rojek-yellow);
      border-radius: 3px;
    }

    /* ======================================================= */
    /* === VYLEPŠENÉ STYLY PRO SAMOTNÉ ZPRÁVY (DŮLEŽITÉ) === */
    /* ======================================================= */

    #chatBox .message {
      display: flex;
      flex-direction: column;
      width: auto;
      max-width: 85%;
      position: relative;
      white-space: normal;
      overflow-wrap: break-word;
      transition: transform 0.6s ease, box-shadow 0.6s ease;
      font-size: 15px;
      padding: 12px 20px;
      border-radius: 18px;
      box-shadow: var(--shadow);
      line-height: 1.6;
    }
    #chatBox .message:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-hover);
    }

    /* -- Styly pro obsah generovaný z Markdownu -- */
    #chatBox .message > * {
      margin: 0 0 10px 0;
    }
    #chatBox .message > *:last-child {
      margin-bottom: 0;
    }
    
    #chatBox .assistant-message {
      background: var(--assistant-color);
      color: var(--text-dark);
      align-self: flex-start;
      border-top-left-radius: 4px;
    }
    #chatBox .user-message {
      background: var(--rojek-yellow);
      color: var(--rojek-black);
      align-self: flex-end;
      border-top-right-radius: 4px;
    }

    #chatBox .assistant-message.loading {
      font-style: italic;
      opacity: .7;
    }

    /* -- Styly pro seznamy (<ul>, <li>) -- */
    #chatBox .assistant-message ul {
      padding-left: 20px;
    }
    #chatBox .assistant-message li {
      margin-bottom: 8px;
    }
    #chatBox .assistant-message li::marker {
      color: var(--rojek-yellow);
      font-weight: bold;
    }
    #chatBox .assistant-message li strong {
        color: #000;
    }

    /* --- Ikona pro kopírování zprávy --- */
    .save-icon {
      position: absolute;
      top: -10px;
      right: 10px;
      opacity: 0;
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
      pointer-events: none;
    }
    .message:hover .save-icon {
      opacity: 1;
      transform: translateY(0);
      pointer-events: all;
    }

    /* --- Vstupní pole a tlačítko --- */
    #inputContainer {
      display: flex;
      padding: 10px 16px;
      border-top: 1px solid rgba(0, 0, 0, 0.08);
      flex-shrink: 0;
    }
    #inputBox {
      flex: 1;
      padding: 10px 16px;
      border: 1px solid transparent;
      background-color: #f0f0f5;
      border-radius: 20px;
      font-size: 1rem;
      outline: none;
      transition: border-color .3s ease, box-shadow .3s ease;
    }
    #inputBox:focus {
      border-color: var(--rojek-yellow);
      box-shadow: 0 0 0 3px rgba(251, 221, 0, 0.2);
    }
    #sendButton {
      background: none; border: none;
      margin-left: 10px;
      width: 44px; height: 44px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      transition: transform .2s ease, background-color .2s ease;
      border-radius: 50%;
      position: relative;
    }
    #sendButton:hover {
      background: rgba(251, 221, 0, 0.1);
    }
    #sendIcon path {
      fill: var(--rojek-yellow);
    }
    #sendButton .send-tooltip {
      position: absolute;
      top: -35px;
      left: 50%;
      transform: translateX(-50%);
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
      background: rgba(251, 221, 0, 0.1);
      border-radius: 12px;
      margin: 10px 0;
      font-style: italic;
      color: var(--rojek-yellow);
    }
    .form-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(251, 221, 0, 0.3);
      border-top: 2px solid var(--rojek-yellow);
      border-radius: 50%;
      animation: formSpinner 1s linear infinite;
    }
`;

    // --- 2. HTML STRUKTURA WIDGETU ---
    const widgetHTML = `
      <div id="chatContainer">
        <div id="chatIcon">
          <img src="https://static.wixstatic.com/media/ae7bf7_a582038f3fff4fbaba6db0a86c3c21ab~mv2.png" alt="Evžen - ROJEK AI asistent" />
          <div class="tooltip">Potřebujete pomoc?</div>
        </div>
        <div id="chatBoxContainer" class="close">
          <div id="chatHeader">
            <span class="assistant-title">
              <img src="https://static.wixstatic.com/media/ae7bf7_a582038f3fff4fbaba6db0a86c3c21ab~mv2.png" alt="Avatar" />
              AI asistent <b>Evžen</b>
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
        // Vložení Google Fonts pro Poppins
        if (!document.querySelector('link[href*="fonts.googleapis.com"][href*="Poppins"]')) {
            const fontLink = document.createElement("link");
            fontLink.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap";
            fontLink.rel = "stylesheet";
            document.head.appendChild(fontLink);
        }

        // Vložení CSS
        const styleSheet = document.createElement("style");
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);

        // Vložení HTML
        const widgetContainer = document.getElementById(WIDGET_CONTAINER_ID);
        if (widgetContainer) {
            widgetContainer.innerHTML = widgetHTML;
            initializeChatLogic();
        } else {
            console.error(`Kontejner pro ROJEK Chat Widget (ID: ${WIDGET_CONTAINER_ID}) nebyl na stránce nalezen.`);
        }
    }

    // --- 4. JAVASCRIPT LOGIKA CHATU ---
    function initializeChatLogic() {
        if (typeof marked === 'undefined') {
            console.error('Knihovna Marked.js není načtena. Prosím, vložte ji před script widgetu.');
            return;
        }

        const API_BASE = 'https://chatbot-production-4d1d.up.railway.app';
        const clientID = 'ROJEK';
        const STORAGE_KEY = 'chat_history_' + clientID;
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
        const sendIconSVG = document.getElementById('sendIcon');

        // Aplikace barvy na sendIcon
        if (sendIconSVG) {
            const sendIconPath = sendIconSVG.querySelector('path');
            if (sendIconPath) {
                sendIconPath.style.fill = 'rgb(251, 221, 0)';
            }
        }

        function saveHistory() {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(conversation));
        }

        function addMessage(sender, content = '') {
          const msg = document.createElement('div');
          msg.className = `message ${sender}-message`;
          msg.innerHTML = marked.parse(content);

          msg.addEventListener('mouseenter', () => {
            document.querySelectorAll(`#${WIDGET_CONTAINER_ID} .save-icon`).forEach(el => {
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
                e.stopPropagation();
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
            if (saveIconInstance && saveIconInstance.textContent === '💾') {
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
          document.querySelectorAll(`#${WIDGET_CONTAINER_ID} #chatBox .message`).forEach(m => m.remove());
          if (chatRefresh) chatRefresh.classList.add('rotate');
          try {
            await fetch(`${API_BASE}/reset`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ clientID })
            });
          } catch (err) {
            console.error("Chyba při resetu chatu na serveru:", err);
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
          if (!chatBoxContainer || !inputBox || !chatBox) return;

          chatBoxContainer.classList.add('open');
          inputBox.focus();
          const text = 'Ahoj! Jsem Evžen, váš AI asistent. Toto je zatím nenakonfigurovaný AI chatbot, bez instrukcí a se znalostní bází sdílenou s Áďou, ale funguje 😉';
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
              if (!conversation.find(m => m.role === 'assistant' && m.content === bubble.textContent)) {
                  conversation.push({ role:'assistant', content:bubble.textContent });
                  saveHistory();
              }
            }
          }, revealSpeed);
        }

        // === KONFIGURACE PRO SCRAPOVÁNÍ ===
        let scrapeConfig = null;
        let lastScrapedContent = '';
        let lastScrapedUrl = '';

        async function loadScrapeConfig() {
            try {
                const response = await fetch(`${API_BASE}/config/${clientID}`);
                if (response.ok) {
                    const config = await response.json();
                    scrapeConfig = config.current_page_scrape;
                    console.log('📄 Scrape config loaded:', scrapeConfig);
                }
            } catch (error) {
                console.warn('Nepodařilo se načíst konfiguraci scrapování:', error);
            }
        }

        function scrapePageContent() {
            if (!scrapeConfig || !scrapeConfig.enabled) {
                return null;
            }

            try {
                const currentUrl = window.location.href;
                
                if (currentUrl === lastScrapedUrl && lastScrapedContent) {
                    console.log('📄 Using cached page content');
                    return lastScrapedContent;
                }

                console.log('🔍 Scrapování obsahu stránky...');
                
                let extractedContent = {
                    url: currentUrl,
                    title: document.title || '',
                    headings: [],
                    content: [],
                    products: [],
                    metadata: {}
                };

                const metaDesc = document.querySelector('meta[name="description"]');
                if (metaDesc) {
                    extractedContent.metadata.description = metaDesc.getAttribute('content');
                }

                const includeSelectors = scrapeConfig.selectors?.include || ['h1', 'h2', 'h3', 'p'];
                const excludeSelectors = scrapeConfig.selectors?.exclude || [];

                const tempContainer = document.createElement('div');
                tempContainer.innerHTML = document.body.innerHTML;

                excludeSelectors.forEach(selector => {
                    try {
                        const elements = tempContainer.querySelectorAll(selector);
                        elements.forEach(el => el.remove());
                    } catch (e) {
                        // Ignoruj chybné selektory
                    }
                });

                const widgetSelectors = [
                    `#${WIDGET_CONTAINER_ID}`,
                    '[id*="chat"]',
                    '[class*="chat"]',
                    '[id*="widget"]',
                    '[class*="widget"]'
                ];
                
                widgetSelectors.forEach(selector => {
                    try {
                        const elements = tempContainer.querySelectorAll(selector);
                        elements.forEach(el => el.remove());
                    } catch (e) {
                        // Ignoruj chybné selektory
                    }
                });

                includeSelectors.forEach(selector => {
                    try {
                        const elements = tempContainer.querySelectorAll(selector);
                        elements.forEach(el => {
                            const text = cleanText(el.textContent);
                            if (text && text.length > 10) {
                                
                                if (selector.match(/h[1-6]/i) || selector.includes('heading')) {
                                    extractedContent.headings.push(text);
                                }
                                
                                if (selector.toLowerCase().includes('product') || 
                                    selector.toLowerCase().includes('price') ||
                                    selector.toLowerCase().includes('cena')) {
                                    extractedContent.products.push(text);
                                }
                                
                                extractedContent.content.push(text);
                            }
                        });
                    } catch (e) {
                        console.warn('Chyba při zpracování selektoru:', selector, e);
                    }
                });

                if (extractedContent.content.length === 0) {
                    const mainContent = tempContainer.querySelector('main') || 
                                      tempContainer.querySelector('[role="main"]') || 
                                      tempContainer.querySelector('.content') ||
                                      tempContainer.querySelector('#content') ||
                                      tempContainer;
                    
                    if (mainContent) {
                        const text = cleanText(mainContent.textContent);
                        if (text) {
                            extractedContent.content.push(text);
                        }
                    }
                }

                const formattedContent = formatContentForAI(extractedContent);
                
                const maxLength = scrapeConfig.max_content_length || 5000;
                const finalContent = formattedContent.length > maxLength ? 
                    formattedContent.substring(0, maxLength) + '...' : formattedContent;

                lastScrapedContent = finalContent;
                lastScrapedUrl = currentUrl;

                console.log('✅ Obsah stránky úspěšně načten:', {
                    url: currentUrl,
                    contentLength: finalContent.length,
                    headingsCount: extractedContent.headings.length,
                    productsCount: extractedContent.products.length
                });

                return finalContent;

            } catch (error) {
                console.error('❌ Chyba při scrapování:', error);
                return null;
            }
        }

        function cleanText(text) {
            if (!text) return '';
            return text
                .replace(/\s+/g, ' ')
                .replace(/\n+/g, ' ')
                .trim();
        }

        function formatContentForAI(scrapedData) {
            let parts = [];

            if (scrapedData.title) {
                parts.push(`NÁZEV STRÁNKY: ${scrapedData.title}`);
            }

            if (scrapedData.url) {
                parts.push(`URL: ${scrapedData.url}`);
            }

            if (scrapedData.metadata.description) {
                parts.push(`POPIS STRÁNKY: ${scrapedData.metadata.description}`);
            }

            if (scrapedData.headings.length > 0) {
                parts.push(`HLAVNÍ NADPISY: ${scrapedData.headings.slice(0, 5).join(', ')}`);
            }

            if (scrapedData.products.length > 0) {
                parts.push(`PRODUKTOVÉ INFORMACE: ${scrapedData.products.slice(0, 3).join(', ')}`);
            }

            if (scrapedData.content.length > 0) {
                const contentText = scrapedData.content.join(' ');
                parts.push(`OBSAH STRÁNKY: ${contentText}`);
            }

            return parts.join('\n\n');
        }

        function getCurrentPageHTML() {
            return scrapePageContent();
        }

        async function sendMessage() {
          if (!inputBox || !chatBox) return;

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
            const pageContent = scrapePageContent();
            
            const requestBody = {
              clientID,
              history: conversation,
              topic_id: topicId
            };
            
            if (pageContent) {
              requestBody.page_content = pageContent;
            }
            
            const res = await fetch(`${API_BASE}/chat`, {
              method:'POST',
              headers:{'Content-Type':'application/json'},
              body: JSON.stringify(requestBody)
            });
            const newTopic = res.headers.get('X-Trieve-Topic-ID');
            if(newTopic){ topicId=newTopic; sessionStorage.setItem(TOPIC_KEY,topicId); }

            const reader = res.body.getReader(), dec=new TextDecoder();
            let firstChunkReceived=false;
            
            const finishFormGeneration = () => {
              if (isGeneratingForm && formLoadingElement) {
                clearTimeout(formTimeout);
                formLoadingElement.remove();
                isGeneratingForm = false;
                formLoadingElement = null;
                formTimeout = null;
                
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
                loadingBubble.innerHTML='';
                firstChunkReceived=true;
              }
              
              assistantText += chunk;
              
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
                
                const formIndex = assistantText.toLowerCase().indexOf('<form');
                if (formIndex !== -1) {
                  textBeforeForm = assistantText.substring(0, formIndex);
                } else {
                  textBeforeForm = assistantText;
                }
                
                formLoadingElement = document.createElement('div');
                formLoadingElement.className = 'form-generator-loading';
                formLoadingElement.innerHTML = `
                  <div class="form-spinner"></div>
                  <span>Generuji formulář na míru, prosím chvilinku strpení...</span>
                `;
                
                loadingBubble.innerHTML = marked.parse(textBeforeForm);
                loadingBubble.appendChild(formLoadingElement);
                loadingBubble.scrollIntoView({ behavior: 'smooth', block: 'start' });
                
                formTimeout = setTimeout(() => {
                  console.log('Form generation timeout, showing content anyway');
                  finishFormGeneration();
                }, 15000);
                
                continue;
              }
              
              if (isGeneratingForm) {
                const shouldFinishForm = 
                  assistantText.includes('</form>') || 
                  assistantText.length > 8000 ||
                  assistantText.includes('\n\n---') ||
                  assistantText.includes('Pokud máte další dotazy') ||
                  assistantText.includes('S pozdravem') ||
                  assistantText.includes('Děkuji za váš zájem');
                
                if (shouldFinishForm) {
                  finishFormGeneration();
                }
              } else {
                loadingBubble.innerHTML = marked.parse(assistantText);
                loadingBubble.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }
            
            if (isGeneratingForm) {
              finishFormGeneration();
            }
            
            if (assistantText.trim()) {
                conversation.push({ role:'assistant', content:assistantText });
                saveHistory();
            } else if (!firstChunkReceived) {
                clearInterval(loadingInterval);
                loadingBubble.remove();
            }

          } catch(err){
            clearInterval(loadingInterval);
            loadingBubble.classList.remove('loading');
            loadingBubble.textContent = 'Omlouváme se, došlo k chybě při komunikaci se serverem.';
            loadingBubble.scrollIntoView({ behavior: 'smooth', block: 'start' });
            console.error("Chyba při odesílání zprávy:", err);
            
            if (formTimeout) {
              clearTimeout(formTimeout);
            }
          }
          inputBox.focus();
        }

        function renderHistory(){
          if (!chatBox || !inputBox) return;
          chatBox.innerHTML = '';
          conversation.forEach(m => addMessage(m.role, m.content));
          inputBox.focus();
          if (chatBox.lastChild) {
            chatBox.lastChild.scrollIntoView({ behavior: 'auto', block: 'end' });
          }
        }

        function toggleChat(openState){
          if (!chatIcon || !chatBoxContainer) return;

          if(openState){
            chatIcon.style.display='none';
            chatBoxContainer.style.display='flex';
            setTimeout(()=>{
                chatBoxContainer.classList.remove('close');
                chatBoxContainer.classList.add('open');
            },10);
            if (conversation.length === 0) {
                sendInitial();
            } else {
                renderHistory();
            }
          } else {
            chatBoxContainer.classList.remove('open');
            chatBoxContainer.classList.add('close');
            setTimeout(()=>{
              chatBoxContainer.style.display='none';
              chatIcon.style.display='flex';
            },400);
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
        
        // Event Listeners
        if (chatIcon) chatIcon.addEventListener('click', ()=>toggleChat(true));
        if (chatClose) chatClose.addEventListener('click', ()=>toggleChat(false));
        if (chatRefresh) chatRefresh.addEventListener('click', clearChat);
        if (sendButton) sendButton.addEventListener('click', sendMessage);
        if (inputBox) inputBox.addEventListener('keypress', e=>{ if(e.key==='Enter') sendMessage(); });

        // Inicializace
        loadScrapeConfig().catch(err => {
            console.warn('Nepodařilo se načíst konfiguraci scrapování:', err);
        });

        // Sledování změn URL
        let currentUrl = window.location.href;
        const urlChangeObserver = new MutationObserver(() => {
            if (window.location.href !== currentUrl) {
                currentUrl = window.location.href;
                lastScrapedContent = '';
                lastScrapedUrl = '';
                console.log('🔄 URL changed, cache invalidated');
            }
        });
        
        urlChangeObserver.observe(document, { subtree: true, childList: true });
        
        window.addEventListener('popstate', () => {
            lastScrapedContent = '';
            lastScrapedUrl = '';
            console.log('🔄 Navigation detected, cache invalidated');
        });
    }

    // --- 5. SPOUŠTĚNÍ WIDGETU ---
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectWidget);
    } else {
        injectWidget();
    }

})();
