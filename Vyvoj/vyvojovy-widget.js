(function() {
    // Unikátní ID pro kontejner widgetu na cílové stránce
    const WIDGET_CONTAINER_ID = 'vyvoj-chat-widget-container';

    // --- 1. CSS STYLY ---
    const styles = `
    :root {
      --header-gradient: linear-gradient(90deg, #2E8B57, #228B22);
      --user-gradient: #2E8B57;
      --assistant-color: #f0f8f0;
      --text-light: #ffffff;
      --text-dark: #000000;
      --bg: #fff;
      --shadow: rgba(0, 0, 0, 0.1) 0 4px 12px;
      --shadow-hover: rgba(0, 0, 0, 0.2) 0 6px 16px;
    }

    #${WIDGET_CONTAINER_ID} {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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
      background: var(--header-gradient); background-size: 300% 300%;
      border-radius: 50%; z-index: 0; opacity: 0.7;
    }

    /* --- Chat okno --- */
    #chatWindow {
      position: fixed; bottom: 100px; right: 20px;
      width: 350px; height: 500px; background: var(--bg);
      border-radius: 16px; box-shadow: var(--shadow-hover);
      display: none; flex-direction: column; overflow: hidden; z-index: 9998;
    }

    /* --- Header --- */
    #chatHeader {
      background: var(--header-gradient); background-size: 300% 300%;
      animation: gradientFlow 4s ease-in-out infinite;
      color: var(--text-light); padding: 15px 20px;
      font-weight: 600; position: relative; overflow: hidden;
      border-radius: 16px 16px 0 0;
    }

    #chatHeader::before {
      content: ""; position: absolute; inset: 0;
      background: var(--header-gradient); background-size: 300% 300%;
      animation: gradientFlow 3s ease-in-out infinite reverse;
      opacity: 0.5; z-index: 1;
    }

    #chatHeader span {
      position: relative; z-index: 2;
    }

    #closeButton {
      position: absolute; top: 50%; right: 15px;
      transform: translateY(-50%); background: none;
      border: none; color: var(--text-light); font-size: 20px;
      cursor: pointer; z-index: 3; border-radius: 50%;
      width: 30px; height: 30px; display: flex;
      align-items: center; justify-content: center;
      transition: background 0.3s ease;
    }

    #closeButton:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    /* --- Chat messages area --- */
    #chatMessages {
      flex: 1; overflow-y: auto; padding: 20px 15px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    }

    .message {
      margin-bottom: 15px; animation: slideIn 0.3s ease-out;
    }

    .user-message {
      text-align: right;
    }

    .user-message .message-content {
      background: var(--user-gradient);
      color: var(--text-light); padding: 12px 16px;
      border-radius: 18px 18px 4px 18px; display: inline-block;
      max-width: 80%; word-wrap: break-word; position: relative;
      box-shadow: 0 2px 8px rgba(46, 139, 87, 0.3);
    }

    .assistant-message .message-content {
      background: var(--assistant-color);
      color: var(--text-dark); padding: 12px 16px;
      border-radius: 18px 18px 18px 4px; display: inline-block;
      max-width: 80%; word-wrap: break-word;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    /* --- Input area --- */
    #chatInputArea {
      padding: 15px; border-top: 1px solid #e0e0e0;
      background: var(--bg); display: flex; gap: 10px;
      align-items: flex-end;
    }

    #chatInput {
      flex: 1; border: 2px solid #e0e0e0; border-radius: 20px;
      padding: 12px 16px; font-size: 14px; resize: none;
      outline: none; transition: border-color 0.3s ease;
      min-height: 20px; max-height: 80px; line-height: 1.4;
      font-family: inherit;
    }

    #chatInput:focus {
      border-color: var(--user-gradient);
    }

    #sendButton {
      background: var(--user-gradient); color: var(--text-light);
      border: none; border-radius: 50%; width: 44px; height: 44px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; font-size: 18px; transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(46, 139, 87, 0.3);
    }

    #sendButton:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(46, 139, 87, 0.4);
    }

    #sendButton:disabled {
      opacity: 0.6; cursor: not-allowed; transform: none;
    }

    /* --- Loading animation --- */
    .typing-indicator {
      display: flex; align-items: center; gap: 4px;
      padding: 12px 16px; background: var(--assistant-color);
      border-radius: 18px; max-width: 60px; margin-bottom: 15px;
    }

    .typing-dot {
      width: 6px; height: 6px; background: #666;
      border-radius: 50%; animation: typing 1.5s infinite;
    }

    .typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .typing-dot:nth-child(3) { animation-delay: 0.4s; }

    @keyframes typing {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
      30% { transform: translateY(-10px); opacity: 1; }
    }

    /* --- Scrollbar styling --- */
    #chatMessages::-webkit-scrollbar { width: 6px; }
    #chatMessages::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
    #chatMessages::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 10px; }
    #chatMessages::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }

    /* --- Responsive design --- */
    @media (max-width: 480px) {
      #chatWindow {
        width: calc(100% - 40px); height: 70%; bottom: 20px;
        right: 20px; left: 20px; max-width: none;
      }
      #chatContainer { bottom: 15px; right: 15px; }
    }
    `;

    // --- 2. HTML STRUKTURA ---
    const chatHTML = `
    <div id="chatContainer">
        <div id="chatIcon">
            🌱
        </div>
        
        <div id="chatWindow">
            <div id="chatHeader">
                <span>🌿 Vyvoj Chat Assistant</span>
                <button id="closeButton">×</button>
            </div>
            
            <div id="chatMessages">
                <div class="message assistant-message">
                    <div class="message-content">
                        Ahoj! 👋 Jsem váš asistent pro rostliny a zahradničení. Jak vám mohu pomoci?
                    </div>
                </div>
            </div>
            
            <div id="chatInputArea">
                <textarea id="chatInput" placeholder="Napište svou zprávu..." rows="1"></textarea>
                <button id="sendButton">➤</button>
            </div>
        </div>
    </div>
    `;

    // --- 3. HLAVNÍ FUNKCE ---
    function initVyvojChatWidget() {
        // Konfigurace pro klienta Vyvoj
        const clientID = 'Vyvoj';
        const STORAGE_KEY = 'chat_history_' + clientID;
        const TOPIC_KEY = 'etrieve_topic_id_' + clientID;
        
        // API konfigurace - můžete změnit na localhost pro vývoj
        const API_BASE = 'http://localhost:8080';
        // const API_BASE = 'https://chatbot-production-4d1d.up.railway.app';

        let currentTopicId = null;
        let isLoading = false;
        let chatConfig = null;

        // Načtení historie chatu
        function loadChatHistory() {
            try {
                const history = sessionStorage.getItem(STORAGE_KEY);
                return history ? JSON.parse(history) : [];
            } catch (error) {
                console.error('Chyba při načítání historie chatu:', error);
                return [];
            }
        }

        // Uložení historie chatu
        function saveChatHistory(messages) {
            try {
                sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
            } catch (error) {
                console.error('Chyba při ukládání historie chatu:', error);
            }
        }

        // Načtení topic ID
        function loadTopicId() {
            return localStorage.getItem(TOPIC_KEY);
        }

        // Uložení topic ID
        function saveTopicId(topicId) {
            if (topicId) {
                localStorage.setItem(TOPIC_KEY, topicId);
                currentTopicId = topicId;
            }
        }

        // Reset chatu
        async function resetChat() {
            try {
                await fetch(`${API_BASE}/reset`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ clientID })
                });
                
                // Vymazání lokálních dat
                sessionStorage.removeItem(STORAGE_KEY);
                localStorage.removeItem(TOPIC_KEY);
                currentTopicId = null;
                
                // Vymazání zpráv v UI
                const messagesContainer = document.getElementById('chatMessages');
                messagesContainer.innerHTML = `
                    <div class="message assistant-message">
                        <div class="message-content">
                            Ahoj! 👋 Jsem váš asistent pro rostliny a zahradničení. Jak vám mohu pomoci?
                        </div>
                    </div>
                `;
                
                console.log('Chat byl resetován');
            } catch (error) {
                console.error('Chyba při resetování chatu:', error);
            }
        }

        // Debug funkce pro výpis konverzace
        function logConversation() {
            const messages = [];
            const messageElements = document.querySelectorAll('.message');
            
            messageElements.forEach(msg => {
                if (msg.id === 'typingIndicator') return;
                
                const content = msg.querySelector('.message-content').textContent;
                const type = msg.classList.contains('user-message') ? 'user' : 'assistant';
                messages.push({ content, type });
            });
            
            console.log('💬 Aktuální konverzace:', messages);
            return messages;
        }

        // Načtení konfigurace klienta
        async function loadClientConfig() {
            try {
                const response = await fetch(`${API_BASE}/config/${clientID}`);
                if (response.ok) {
                    chatConfig = await response.json();
                    console.log('Konfigurace načtena:', chatConfig);
                } else {
                    console.warn('Chyba při načítání konfigurace:', response.status);
                }
            } catch (error) {
                console.error('Chyba při načítání konfigurace:', error);
            }
        }

        // Scraping obsahu stránky
        function scrapePageContent() {
            if (!chatConfig?.current_page_scrape?.enabled) {
                return null;
            }

            try {
                console.log('🔍 Scrapování obsahu stránky...');
                
                const currentUrl = window.location.href;
                let extractedContent = {
                    url: currentUrl,
                    title: document.title || '',
                    headings: [],
                    content: [],
                    products: [],
                    metadata: {}
                };

                // Meta description
                const metaDesc = document.querySelector('meta[name="description"]');
                if (metaDesc) {
                    extractedContent.metadata.description = metaDesc.getAttribute('content');
                }

                // Extrakce podle selektorů
                const includeSelectors = chatConfig.current_page_scrape.selectors?.include || ['h1', 'h2', 'h3', 'p'];
                const excludeSelectors = chatConfig.current_page_scrape.selectors?.exclude || [];

                // Vytvoření temp kontejneru pro bezpečné odebírání elementů
                const tempContainer = document.createElement('div');
                tempContainer.innerHTML = document.body.innerHTML;

                // Odebrání nežádoucích elementů
                excludeSelectors.forEach(selector => {
                    try {
                        const elements = tempContainer.querySelectorAll(selector);
                        elements.forEach(el => el.remove());
                    } catch (e) {
                        console.warn('Chybný exclude selector:', selector);
                    }
                });

                // Odebrání widgetu a podobných elementů
                const widgetSelectors = [
                    `#${WIDGET_CONTAINER_ID}`,
                    '[id*="chat"]',
                    '[class*="chat"]',
                    'script',
                    'style',
                    'noscript'
                ];
                
                widgetSelectors.forEach(selector => {
                    try {
                        const elements = tempContainer.querySelectorAll(selector);
                        elements.forEach(el => el.remove());
                    } catch (e) {
                        // Ignoruj chybné selektory
                    }
                });

                // Extrakce obsahu podle include selektorů
                includeSelectors.forEach(selector => {
                    try {
                        const elements = tempContainer.querySelectorAll(selector);
                        elements.forEach(element => {
                            const text = element.textContent.trim();
                            if (text && text.length > 10) {
                                if (selector.match(/^h[1-6]$/i)) {
                                    extractedContent.headings.push(text);
                                } else {
                                    extractedContent.content.push(text);
                                }
                            }
                        });
                    } catch (e) {
                        console.warn('Chybný include selector:', selector);
                    }
                });

                // Detekce produktů
                const productSelectors = ['.product', '.product-card', '[class*="product"]'];
                productSelectors.forEach(selector => {
                    try {
                        const elements = tempContainer.querySelectorAll(selector);
                        elements.forEach(element => {
                            const productData = {
                                name: element.querySelector('h1, h2, h3, .title, .name')?.textContent?.trim(),
                                price: element.querySelector('.price, [class*="price"]')?.textContent?.trim(),
                                description: element.querySelector('.description, .desc, p')?.textContent?.trim()?.substring(0, 200)
                            };
                            
                            if (productData.name) {
                                extractedContent.products.push(productData);
                            }
                        });
                    } catch (e) {
                        // Ignoruj chyby
                    }
                });

                // Formátování výsledku
                let formattedContent = '';
                
                if (extractedContent.title) {
                    formattedContent += `Název stránky: ${extractedContent.title}\n\n`;
                }
                
                if (extractedContent.metadata.description) {
                    formattedContent += `Popis: ${extractedContent.metadata.description}\n\n`;
                }
                
                if (extractedContent.headings.length > 0) {
                    formattedContent += `Nadpisy:\n${extractedContent.headings.slice(0, 5).join('\n')}\n\n`;
                }
                
                if (extractedContent.content.length > 0) {
                    const contentText = extractedContent.content.slice(0, 10).join(' ').substring(0, 1500);
                    formattedContent += `Obsah:\n${contentText}\n\n`;
                }
                
                if (extractedContent.products.length > 0) {
                    formattedContent += `Produkty na stránce:\n`;
                    extractedContent.products.slice(0, 3).forEach(product => {
                        formattedContent += `- ${product.name}${product.price ? ` (${product.price})` : ''}\n`;
                    });
                }

                console.log('📄 Extrakovaný obsah:', formattedContent.substring(0, 200) + '...');
                
                return {
                    url: currentUrl,
                    title: extractedContent.title,
                    content: formattedContent.trim().substring(0, 3000) // Limit na 3000 znaků
                };
                
            } catch (error) {
                console.error('Chyba při scrapingu stránky:', error);
                return null;
            }
        }

        // Odeslání zprávy
        async function sendMessage(message) {
            if (isLoading || !message.trim()) return;

            isLoading = true;
            const sendButton = document.getElementById('sendButton');
            const chatInput = document.getElementById('chatInput');
            
            sendButton.disabled = true;
            chatInput.disabled = true;

            // Přidání uživatelské zprávy
            addMessage(message, 'user');
            chatInput.value = '';
            
            // Zobrazení typing indikátoru
            showTypingIndicator();

            try {
                // Příprava dat pro odeslání
                const requestData = {
                    message,
                    clientID,
                    topicId: currentTopicId
                };

                // Přidání scrapovaného obsahu pokud je povolen
                const pageContent = scrapePageContent();
                if (pageContent) {
                    requestData.pageContent = pageContent;
                }

                const res = await fetch(`${API_BASE}/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestData)
                });

                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
                }

                const reader = res.body.getReader();
                const decoder = new TextDecoder();
                let assistantMessage = '';
                let messageElement = null;

                // Odstranění typing indikátoru
                hideTypingIndicator();

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n');

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.slice(6));
                                
                                if (data.type === 'topic_id' && data.topicId) {
                                    saveTopicId(data.topicId);
                                } else if (data.type === 'content' && data.content) {
                                    assistantMessage += data.content;
                                    
                                    if (!messageElement) {
                                        messageElement = addMessage('', 'assistant');
                                    }
                                    
                                    updateMessageContent(messageElement, assistantMessage);
                                }
                            } catch (parseError) {
                                console.warn('Chyba při parsování SSE:', parseError);
                            }
                        }
                    }
                }

                // Uložení konverzace
                saveConversation();

            } catch (error) {
                console.error('Chyba při odesílání zprávy:', error);
                hideTypingIndicator();
                addMessage('Omlouváme se, došlo k chybě. Zkuste to prosím znovu.', 'assistant');
            } finally {
                isLoading = false;
                sendButton.disabled = false;
                chatInput.disabled = false;
                chatInput.focus();
            }
        }

        // Přidání zprávy do chatu
        function addMessage(content, type) {
            const messagesContainer = document.getElementById('chatMessages');
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${type}-message`;
            
            const messageContent = document.createElement('div');
            messageContent.className = 'message-content';
            
            // Použití marked pro markdown rendering pokud je k dispozici
            if (typeof marked !== 'undefined') {
                messageContent.innerHTML = marked.parse(content);
            } else {
                messageContent.textContent = content;
            }
            
            messageDiv.appendChild(messageContent);
            
            // Přidání copy funkcionality pro zprávy asistenta
            if (type === 'assistant') {
                messageDiv.addEventListener('mouseenter', () => {
                    // Odebrání existujících ikon
                    document.querySelectorAll('.save-icon').forEach(el => {
                        el.classList.remove('visible');
                        setTimeout(() => el.remove(), 250);
                    });
                    
                    if (!messageDiv.querySelector('.save-icon')) {
                        const saveIcon = document.createElement('span');
                        saveIcon.className = 'save-icon';
                        saveIcon.textContent = '💾';
                        saveIcon.style.cssText = `
                            position: absolute;
                            top: 5px;
                            right: 5px;
                            cursor: pointer;
                            background: rgba(0,0,0,0.1);
                            border-radius: 50%;
                            width: 24px;
                            height: 24px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 12px;
                            opacity: 0;
                            transition: opacity 0.3s ease;
                        `;
                        
                        messageDiv.style.position = 'relative';
                        messageDiv.appendChild(saveIcon);
                        
                        setTimeout(() => saveIcon.style.opacity = '1', 10);
                        
                        const removeIcon = () => {
                            saveIcon.style.opacity = '0';
                            setTimeout(() => saveIcon.remove(), 250);
                        };
                        
                        const timer = setTimeout(removeIcon, 3000);
                        
                        saveIcon.addEventListener('click', (e) => {
                            e.stopPropagation();
                            clearTimeout(timer);
                            const textToCopy = messageContent.textContent.trim();
                            navigator.clipboard.writeText(textToCopy)
                                .then(() => {
                                    saveIcon.textContent = '✅';
                                    setTimeout(removeIcon, 1000);
                                })
                                .catch(err => {
                                    console.error('Chyba při kopírování:', err);
                                    saveIcon.textContent = '❌';
                                    setTimeout(removeIcon, 1000);
                                });
                        });
                    }
                });
                
                messageDiv.addEventListener('mouseleave', () => {
                    const saveIcon = messageDiv.querySelector('.save-icon');
                    if (saveIcon) {
                        saveIcon.style.opacity = '0';
                        setTimeout(() => saveIcon.remove(), 250);
                    }
                });
            }
            
            messagesContainer.appendChild(messageDiv);
            
            // Scroll na konec
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            return messageContent;
        }

        // Aktualizace obsahu zprávy (pro streaming)
        function updateMessageContent(element, content) {
            element.textContent = content;
            const messagesContainer = document.getElementById('chatMessages');
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        // Zobrazení typing indikátoru
        function showTypingIndicator() {
            const messagesContainer = document.getElementById('chatMessages');
            const typingDiv = document.createElement('div');
            typingDiv.className = 'typing-indicator';
            typingDiv.id = 'typingIndicator';
            typingDiv.innerHTML = `
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            `;
            messagesContainer.appendChild(typingDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        // Skrytí typing indikátoru
        function hideTypingIndicator() {
            const typingIndicator = document.getElementById('typingIndicator');
            if (typingIndicator) {
                typingIndicator.remove();
            }
        }

        // Uložení konverzace
        function saveConversation() {
            const messages = [];
            const messageElements = document.querySelectorAll('.message');
            
            messageElements.forEach(msg => {
                if (msg.id === 'typingIndicator') return;
                
                const content = msg.querySelector('.message-content').textContent;
                const type = msg.classList.contains('user-message') ? 'user' : 'assistant';
                messages.push({ content, type });
            });
            
            saveChatHistory(messages);
        }

        // Načtení historie zpráv
        function loadMessages() {
            const history = loadChatHistory();
            const messagesContainer = document.getElementById('chatMessages');
            
            // Vymazání existujících zpráv kromě úvodní
            const existingMessages = messagesContainer.querySelectorAll('.message');
            existingMessages.forEach((msg, index) => {
                if (index > 0) msg.remove(); // Ponechat první úvodní zprávu
            });
            
            // Přidání zpráv z historie
            history.forEach(msg => {
                addMessage(msg.content, msg.type);
            });
        }

        // Auto-resize textarey
        function setupAutoResize() {
            const textarea = document.getElementById('chatInput');
            
            textarea.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = Math.min(this.scrollHeight, 80) + 'px';
            });
        }

        // Event listenery
        function setupEventListeners() {
            const chatIcon = document.getElementById('chatIcon');
            const chatWindow = document.getElementById('chatWindow');
            const closeButton = document.getElementById('closeButton');
            const sendButton = document.getElementById('sendButton');
            const chatInput = document.getElementById('chatInput');

            let clickCount = 0;
            let clickTimer = null;

            // Otevření/zavření chatu s multi-click funkcemi
            chatIcon.addEventListener('click', (e) => {
                clickCount++;
                
                if (clickCount === 1) {
                    clickTimer = setTimeout(() => {
                        // Single click - otevření/zavření chatu
                        const isVisible = chatWindow.style.display === 'flex';
                        chatWindow.style.display = isVisible ? 'none' : 'flex';
                        
                        if (!isVisible) {
                            chatInput.focus();
                            loadMessages();
                        }
                        clickCount = 0;
                    }, 300);
                } else if (clickCount === 2) {
                    clearTimeout(clickTimer);
                    clickTimer = setTimeout(() => {
                        // Double click - reset chatu
                        e.preventDefault();
                        if (confirm('Opravdu chcete vymazat historii chatu?')) {
                            resetChat();
                        }
                        clickCount = 0;
                    }, 300);
                } else if (clickCount === 3) {
                    clearTimeout(clickTimer);
                    // Triple click - výpis konverzace do konzole
                    e.preventDefault();
                    logConversation();
                    clickCount = 0;
                }
            });

            closeButton.addEventListener('click', () => {
                chatWindow.style.display = 'none';
            });

            // Odeslání zprávy
            sendButton.addEventListener('click', () => {
                const message = chatInput.value.trim();
                if (message) {
                    sendMessage(message);
                }
            });

            // Enter pro odeslání (Shift+Enter pro nový řádek)
            chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    const message = chatInput.value.trim();
                    if (message) {
                        sendMessage(message);
                    }
                }
            });
        }

        // Inicializace
        async function init() {
            // Načtení konfigurace
            await loadClientConfig();
            
            // Načtení topic ID
            currentTopicId = loadTopicId();
            
            // Nastavení event listenerů
            setupEventListeners();
            setupAutoResize();
            
            console.log('Vyvoj Chat Widget inicializován');
        }

        // Spuštění inicializace
        init();
    }

    // --- 4. VLOŽENÍ DO STRÁNKY ---
    function injectVyvojWidget() {
        // Kontrola, zda widget už není vložen
        if (document.getElementById(WIDGET_CONTAINER_ID)) {
            console.warn('Vyvoj Chat Widget je již vložen');
            return;
        }

        // Vložení CSS stylů
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);

        // Vytvoření kontejneru widgetu
        const widgetContainer = document.createElement('div');
        widgetContainer.id = WIDGET_CONTAINER_ID;
        widgetContainer.innerHTML = chatHTML;
        document.body.appendChild(widgetContainer);

        // Inicializace funkcionality
        initVyvojChatWidget();
    }

    // Spuštění po načtení stránky
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectVyvojWidget);
    } else {
        injectVyvojWidget();
    }

})();
