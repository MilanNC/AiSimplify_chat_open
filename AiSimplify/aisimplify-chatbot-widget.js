/*
 * =====================================================
 * AiSimplify Chatbot Widget - Proprietární Software
 * =====================================================
 * 
 * Copyright © 2025 AiSimplify s.r.o.
 * Všechna práva vyhrazena.
 * 
 * Autor: Milan Roušavý
 * Web: www.aisimplify.cz
 * Email: milan@aisimplify.cz
 * 
 * VAROVÁNÍ - AUTORSKÁ PRÁVA:
 * Tento software je chráněn autorským zákonem České republiky
 * a mezinárodními úmluvami o autorských právech.
 * 
 * PŘÍSNĚ ZAKÁZÁNO:
 * - Neautorizované kopírování, distribuce nebo modifikace
 * - Reverzní inženýrství nebo dekompilace
 * - Použití v komerčních projektech bez licence
 * - Odstranění tohoto upozornění o autorských právech
 * 
 * PRÁVNÍ DŮSLEDKY:
 * Porušení těchto podmínek může vést k:
 * - Občanskoprávnímu řízení o náhradu škody
 * - Trestnímu stíhání podle § 270 trestního zákoníku
 * - Peněžitému trestu až do výše 5 000 000 Kč
 * - Náhradě škody včetně ušlého zisku
 * 
 * Pro licencování kontaktujte: milan@aisimplify.cz
 * 
 * =====================================================
 */

(function() {
    // =====================================================
    // KONFIGURAČNÍ PROMĚNNÉ - ČASTO MĚNĚNÉ NASTAVENÍ
    // =====================================================
    
    // Základní identifikace
    const CLIENT_ID = 'AiSimplify';
    const ASSISTANT_NAME = 'Milan';
    
    // Barvy a vzhled
    const BRAND_GRADIENT = 'linear-gradient(90deg, #b477ff, #000000)'; // Hlavní gradient pro hlavičku a ikony - fialová do černé
    const PRIMARY_COLOR = '#b477ff'; // Hlavní fialová barva pro zvýraznění a UI prvky
    const USER_BUBBLE_COLOR = '#b477ff'; // Barva pozadí pro bubliny uživatelských zpráv
    const ASSISTANT_BUBBLE_COLOR = '#f0f0f5'; // Světle šedá barva pro bubliny zpráv asistenta
    const USER_BUBBLE_TEXT_COLOR = '#ffffff'; // Barva textu v uživatelských bublinách (bílá na fialovém pozadí)
    const ASSISTANT_BUBBLE_TEXT_COLOR = '#000000'; // Barva textu v bublinách asistenta (černá na světlém pozadí)
    const TEXT_LIGHT = '#ffffff'; // Bílá barva textu - používá se na tmavých pozadích (hlavička, tooltips)
    const TEXT_DARK = '#000000'; // Černá barva textu - používá se na světlých pozadích
    const BACKGROUND_COLOR = '#fff'; // Bílá barva pozadí pro obecné použití
    
    // Avatar a obrázky
    const AVATAR_URL = 'https://static.wixstatic.com/media/ae7bf7_4c28c0f4765b482182668193d4f80fed~mv2.png';
    
    // Úvodní zpráva asistenta
    const INITIAL_MESSAGE = 'Dobrý den, s čím Vám mohu pomoci?😉 Můžete se mě zeptat na cokoli ohledně nabízených služeb AiSimplify! Odpovím Vám do pár vteřin😉';
    
    // Server API
    const API_BASE_URL = 'https://chatbot-production-4d1d.up.railway.app';
    
    // =====================================================
    // KONEC KONFIGURAČNÍCH PROMĚNNÝCH
    // =====================================================

    const WIDGET_CONTAINER_ID = 'ai-simplify-chat-widget-container';

    const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
    
    :root {
      --header-gradient: ${BRAND_GRADIENT};
      --primary-color: ${PRIMARY_COLOR};
      --user-bubble-color: ${USER_BUBBLE_COLOR};
      --assistant-color: ${ASSISTANT_BUBBLE_COLOR};
      --user-bubble-text: ${USER_BUBBLE_TEXT_COLOR};
      --assistant-bubble-text: ${ASSISTANT_BUBBLE_TEXT_COLOR};
      --text-light: ${TEXT_LIGHT};
      --text-dark: ${TEXT_DARK};
      --bg: ${BACKGROUND_COLOR};
      --shadow: rgba(0, 0, 0, 0.1) 0 4px 12px;
      --shadow-hover: rgba(0, 0, 0, 0.2) 0 6px 16px;
    }

    #${WIDGET_CONTAINER_ID} {
      font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      position: relative;
      z-index: 0;
    }
    
    #${WIDGET_CONTAINER_ID} * {
      font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }

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
      width: 3vw; height: 3vw; border-radius: 50%;
      min-width: 60px; min-height: 60px;
      max-width: 80px; max-height: 80px;
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
      overflow: hidden; /* Vráceno na hidden */
      transform: translateY(20px);
      transition: all 0.5s ease-out; /* Zpomalená animace */
    }
    #chatBoxContainer.open {
      display: flex;
      opacity: 1;
      transform: translateY(0);
    }
    
    /* Tooltip pro resize - přesunut do levého horního rohu */
    #chatBoxContainer::after {
      content: "Přizpůsobte si velikost chatu chytnutím a tažením";
      position: absolute;
      top: -35px; /* Nad oknem */
      left: 0; /* Levý horní roh */
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 6px 10px;
      border-radius: 8px;
      font-size: 0.75rem;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
      z-index: 10000;
    }
    
    /* Zobrazení resize tooltip při hoveru */
    #chatBoxContainer:hover::after {
      opacity: 1;
    }
    
    /* Resize funkcionalita odstraněna */

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
      cursor: pointer; /* Přidáme cursor pointer pro interaktivitu */
      position: relative; /* Pro tooltip */
    }
    .assistant-title img {
      width: 40px; /* Zvětšeno z 32px na 40px */
      height: 40px; /* Zvětšeno z 32px na 40px */
      border-radius: 50%;
      object-fit: cover;
      transition: transform 0.3s ease; /* Animace pro hover efekt */
    }
    .assistant-title:hover img {
      transform: scale(1.1); /* Mírné zvětšení při hoveru */
    }
    /* Tooltip pro asistent title */
    .assistant-title .title-tooltip {
      position: absolute;
      bottom: -45px; /* Pod názvem */
      left: 0;
      background: white;
      color: #333;
      padding: 8px 12px;
      border-radius: 12px;
      font-size: 0.8rem;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
      box-shadow: var(--shadow);
      z-index: 1000;
      transform: translateY(-5px);
    }
    .assistant-title .title-tooltip::before {
      content: '';
      position: absolute;
      top: -5px;
      left: 20px;
      width: 0;
      height: 0;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-bottom: 5px solid white;
    }
    .assistant-title:hover .title-tooltip {
      opacity: 1;
      transform: translateY(0);
      pointer-events: all;
    }
    /* Pomalý fadeout tooltip po 2 sekundách */
    .assistant-title .title-tooltip.fade-out {
      opacity: 0;
      transform: translateY(-5px);
      transition: opacity 2s ease, transform 2s ease; /* Pomalý 2s fadeout */
    }
    #chatHeader > div {
      display: flex;
      align-items: center;
      gap: 25px; /* Větší mezera mezi tlačítky - více doleva */
      margin-right: 10px; /* Posun celé skupiny ikon více doleva */
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
      top: 50px;
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
      z-index: 1000;
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
      scrollbar-color: var(--primary-color) transparent;
    }
    #chatBox::-webkit-scrollbar { width: 6px; }
    #chatBox::-webkit-scrollbar-thumb {
      background: var(--primary-color);
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
      transition: box-shadow 0.6s ease; /* Pomalá transition pouze pro stín */
      font-size: 15px;
      padding: 12px 20px;
      border-radius: 18px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
      line-height: 1.6;
      margin: 6px 0; /* Přidána mezera pro plynulejší animace */
    }
    /* Hover efekt pro všechny zprávy - pouze postupné zvýraznění stínu */
    #chatBox .message:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
    }
    /* Uživatelské zprávy bez hover efektu */
    #chatBox .user-message:hover {
      /* Žádný hover efekt pro uživatelské zprávy */
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
      color: var(--assistant-bubble-text);
      align-self: flex-start;
      border-top-left-radius: 4px; /* "Ocas" bubliny */
    }
    #chatBox .user-message {
      background: var(--user-bubble-color);
      color: var(--user-bubble-text);
      align-self: flex-end;
      border-top-right-radius: 4px; /* "Ocas" bubliny */
    }

    #chatBox .assistant-message.loading {
      font-style: italic;
      opacity: .7;
      display: flex !important;
      flex-direction: row !important;
      align-items: center !important;
      justify-content: flex-start;
      gap: 10px;
    }

    .thinking-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(180, 119, 255, 0.3);
      border-top: 2px solid var(--primary-color);
      border-radius: 50%;
      animation: formSpinner 1s linear infinite;
      flex-shrink: 0;
      order: 0;
      align-self: center;
    }
    
    .thinking-text {
      animation: thinkingTextBlink 1.5s ease-in-out infinite;
      order: 1;
      flex: 1;
      align-self: center;
      line-height: 1;
    }
    
    @keyframes thinkingTextBlink {
      0%, 100% { opacity: 0.7; }
      50% { opacity: 1; }
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
      color: var(--primary-color);
      font-weight: bold;
    }
    #chatBox .assistant-message li strong {
        color: #000; /* Zvýraznění tučného textu v seznamu */
    }

    /* --- Vstupní pole a tlačítko --- */
    #inputContainer {
      display: flex;
      padding: 10px 16px;
      /* border-top: 1px solid rgba(0, 0, 0, 0.08); Odebrána oddělovací čára */
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
    
    #sendButton:hover #sendIcon {
      animation: sendIconTap 0.8s ease-out;
    }
    
    /* Animace odletu při kliknutí */
    #sendButton.flying {
      animation: sendButtonFly 0.8s ease-out forwards;
    }
    
    @keyframes sendIconTap {
      0% { transform: scale(1); }
      20% { transform: scale(0.7); }
      40% { transform: scale(1.1); }
      60% { transform: scale(0.9); }
      80% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
    
    @keyframes sendButtonFly {
      0% { 
        transform: translateX(0) scale(1);
        opacity: 1;
      }
      100% { 
        transform: translateX(100px) scale(0.5);
        opacity: 0;
      }
    }
    #sendIcon path {
      fill: var(--primary-color); /* Správné nastavení barvy ikony */
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
      #chatIcon { 
        width: 64px !important; 
        height: 64px !important; 
        min-width: 64px !important; 
        min-height: 64px !important;
        font-size: 28px; 
      }
      #chatBoxContainer {
        bottom: 0 !important; 
        right: 0 !important; 
        top: 0 !important; 
        left: 0 !important;
        width: 100vw !important; 
        height: 100vh !important;
        border-radius: 0 !important;
        resize: none !important; /* V mobilní verzi nelze měnit velikost */
        min-width: unset !important;
        max-width: unset !important;
        min-height: unset !important;
        max-height: unset !important;
        position: fixed !important;
      }
      
      /* Skrytí resize tooltip na mobilu */
      #chatBoxContainer::after {
        display: none !important;
      }
      
      #chatBox .message { max-width: 90%; }
      #inputContainer { padding-bottom: 20px; }
      
      /* Explicitně bílá barva pro ikony v mobilní verzi */
      #chatHeader .icon-container .icon {
        color: #ffffff !important;
      }
      
      /* Zvětšení avatara v mobilní verzi také */
      .assistant-title img {
        width: 36px !important; /* Větší i v mobilní verzi */
        height: 36px !important;
      }
      
      /* Zajistíme, že se header správně zobrazuje v mobilní verzi */
      #chatHeader {
        display: flex !important;
        padding: 10px 12px !important; /* Zmenšeno z 12px 16px */
        justify-content: space-between !important;
        align-items: center !important;
      }
      
      .assistant-title {
        display: flex !important;
        font-size: 16px !important; /* Zmenšeno z 18px na 16px */
        white-space: nowrap !important; /* Zabrání zalomení textu */
        overflow: hidden !important; /* Skryje přetečený text */
        text-overflow: ellipsis !important; /* Přidá trojtečku při přetečení */
        max-width: calc(100vw - 120px) !important; /* Zajistí místo pro ikony */
      }
      
      #chatHeader > div {
        display: flex !important;
        gap: 15px !important; /* Zmenšeno z default 25px */
        margin-right: 5px !important; /* Zmenšeno z default 10px */
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
      color: var(--primary-color);
    }
    .form-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(180, 119, 255, 0.3);
      border-top: 2px solid var(--primary-color);
      border-radius: 50%;
      animation: formSpinner 1s linear infinite;
    }
`;

    // --- 2. HTML STRUKTURA WIDGETU ---
    const widgetHTML = `
      <div id="chatContainer">
        <div id="chatIcon">
          <img src="${AVATAR_URL}" alt="Virtuální asistent ${ASSISTANT_NAME}" />
          <div class="tooltip">Potřebujete poradit?</div>
        </div>
        <div id="chatBoxContainer" class="close">
          <div id="chatHeader">
            <span class="assistant-title">
              <img src="${AVATAR_URL}" alt="Avatar" />
              Virtuální asistent <b>${ASSISTANT_NAME}</b>
              <div class="title-tooltip">
                Vytvořili mě v <a href="https://www.aisimplify.cz" target="_blank" style="color: ${PRIMARY_COLOR}; text-decoration: none; font-weight: bold;">www.aisimplify.cz</a> 😉
              </div>
            </span>
            <div>
              <div class="icon-container">
                <span id="chatRefresh" class="icon">⟲</span>
                <div class="icon-tooltip">Nový chat</div>
              </div>
              <div class="icon-container">
                <span id="chatClose" class="icon">✖</span>
                <div class="icon-tooltip">Zavřít chat</div>
              </div>
            </div>
          </div>
          <div id="chatBox"></div>
          <div id="inputContainer">
            <input id="inputBox" type="text" placeholder="Zde můžete napsat Váš dotaz..." />
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

        const API_BASE = API_BASE_URL;
        const clientID = CLIENT_ID;
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
          const text = INITIAL_MESSAGE;
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

        // === KONFIGURACE PRO SCRAPOVÁNÍ ===
        let scrapeConfig = null;
        let lastScrapedContent = '';
        let lastScrapedUrl = '';

        // Načtení konfigurace scrapování ze serveru
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

        // === INTELIGENTNÍ SCRAPOVÁNÍ OBSAHU STRÁNKY ===
        function scrapePageContent() {
            if (!scrapeConfig || !scrapeConfig.enabled) {
                return null;
            }

            try {
                const currentUrl = window.location.href;
                
                // Cache: pokud se URL nezměnila, použij cache
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

                // Meta description
                const metaDesc = document.querySelector('meta[name="description"]');
                if (metaDesc) {
                    extractedContent.metadata.description = metaDesc.getAttribute('content');
                }

                // Extrakce podle selektorů
                const includeSelectors = scrapeConfig.selectors?.include || ['h1', 'h2', 'h3', 'p'];
                const excludeSelectors = scrapeConfig.selectors?.exclude || [];

                // Nejdříve odebereme nežádoucí elementy (ale pouze pro scrapování, ne ze stránky)
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

                // Odebereme náš widget a podobné elementy
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

                // Extrakce obsahu podle include selektorů
                includeSelectors.forEach(selector => {
                    try {
                        const elements = tempContainer.querySelectorAll(selector);
                        elements.forEach(el => {
                            const text = cleanText(el.textContent);
                            if (text && text.length > 10) { // Ignoruj krátké texty
                                
                                if (selector.match(/h[1-6]/i) || selector.includes('heading')) {
                                    extractedContent.headings.push(text);
                                }
                                
                                // Detekce produktových informací
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

                // Pokud jsme nic nezískali, použij fallback
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

                // Formátování pro AI
                const formattedContent = formatContentForAI(extractedContent);
                
                // Oříznutí podle max_content_length
                const maxLength = scrapeConfig.max_content_length || 5000;
                const finalContent = formattedContent.length > maxLength ? 
                    formattedContent.substring(0, maxLength) + '...' : formattedContent;

                // Cache
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

        // Pomocné funkce
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

        // === FUNKCE PRO ZÍSKÁNÍ OBSAHU STRÁNKY ===
        function getCurrentPageHTML() {
            // Tato funkce je nyní nahrazena scrapePageContent()
            return scrapePageContent();
        }

        async function sendMessage() {
          if (!inputBox || !chatBox) return; // Kontrola existence prvků

          const userText = inputBox.value.trim();
          if (!userText) return;
          
          // Animace odletu send buttonu
          if (sendButton) {
            sendButton.classList.add('flying');
            setTimeout(() => {
              sendButton.classList.remove('flying');
            }, 800);
          }
          
          conversation.push({ role:'user', content:userText });
          saveHistory(); addMessage('user', userText);
          inputBox.value = '';

          const loadingTexts = ['Přemýšlím....','Momentík...','Ještě chvilinku...','Děkuji za trpělivost😉','Už to bude...'];
          let loadingIndex=0;
          const loadingBubble = addMessage('assistant', '');
          
          // Vytvoříme loading obsah se spinnerem
          const updateLoadingContent = (text) => {
            const textElement = loadingBubble.querySelector('.thinking-text');
            if (textElement) {
              // Plynulé prolínání - fade out současný text
              textElement.style.opacity = '0';
              setTimeout(() => {
                textElement.textContent = text;
                textElement.style.opacity = '1';
              }, 300); // Polovina transition času
            } else {
              loadingBubble.innerHTML = `
                <div style="display: flex; flex-direction: row; align-items: center; gap: 10px;">
                  <div class="thinking-spinner"></div>
                  <span class="thinking-text" style="transition: opacity 0.6s ease;">${text}</span>
                </div>
              `;
            }
          };
          
          updateLoadingContent(loadingTexts[loadingIndex]);
          loadingBubble.classList.add('loading');
          
          const loadingInterval = setInterval(()=>{
            if (loadingBubble.classList.contains('loading')) { // Kontrola zda stále načítáme
              loadingIndex = (loadingIndex + 1) % loadingTexts.length;
              updateLoadingContent(loadingTexts[loadingIndex]);
              loadingBubble.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          },2000); // Zrychleno na 2 sekundy

          let assistantText='';
          let isGeneratingForm = false;
          let formLoadingElement = null;
          let formTimeout = null;
          let textBeforeForm = '';
          
          try {
            // Získání obsahu stránky (rychlé frontend scrapování)
            const pageContent = scrapePageContent();
            
            const requestBody = {
              clientID,
              history: conversation,
              topic_id: topicId
            };
            
            // Přidáme zpracovaný obsah stránky
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
                loadingBubble.innerHTML=''; // Vyčistíme loading obsah
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
            loadingBubble.innerHTML = 'Omlouváme se, došlo k chybě při komunikaci se serverem.'; // Vyčištěný obsah
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

        // Tooltip fadeout logika - nezačne mizet dokud uživatel neopustí celou oblast
        const assistantTitle = document.querySelector(`#${WIDGET_CONTAINER_ID} .assistant-title`);
        if (assistantTitle) {
          let tooltipTimeout;
          
          assistantTitle.addEventListener('mouseenter', () => {
            const tooltip = assistantTitle.querySelector('.title-tooltip');
            if (tooltip) {
              tooltip.classList.remove('fade-out');
              clearTimeout(tooltipTimeout);
              // Odebrali jsme automatický fadeout po 2 sekundách
            }
          });
          
          assistantTitle.addEventListener('mouseleave', () => {
            const tooltip = assistantTitle.querySelector('.title-tooltip');
            if (tooltip) {
              clearTimeout(tooltipTimeout);
              tooltip.classList.add('fade-out');
            }
          });
        }

        // Inicializace - načtení konfigurace
        loadScrapeConfig().catch(err => {
            console.warn('Nepodařilo se načíst konfiguraci scrapování:', err);
        });

        // Sledování změn URL pro invalidaci cache
        let currentUrl = window.location.href;
        const urlChangeObserver = new MutationObserver(() => {
            if (window.location.href !== currentUrl) {
                currentUrl = window.location.href;
                lastScrapedContent = '';
                lastScrapedUrl = '';
                console.log('🔄 URL changed, cache invalidated');
            }
        });
        
        // Pozorování změn v DOM (pro SPA aplikace)
        urlChangeObserver.observe(document, { subtree: true, childList: true });
        
        // Poslouchání popstate událostí (historie prohlížeče)
        window.addEventListener('popstate', () => {
            lastScrapedContent = '';
            lastScrapedUrl = '';
            console.log('🔄 Navigation detected, cache invalidated');
        });

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
