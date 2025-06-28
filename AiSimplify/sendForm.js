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
