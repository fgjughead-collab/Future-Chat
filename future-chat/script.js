const messagesDiv = document.getElementById("chat-messages");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

function addMessage(text, isUser = false) {
  const msg = document.createElement("div");
  msg.classList.add("message");
  msg.classList.add(isUser ? "user" : "bot");
  msg.textContent = text;
  messagesDiv.appendChild(msg);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function botResponse(userText) {
  let resposta = "Hmm... interessante. ";
  
  if (userText.toLowerCase().includes("oi") || userText.toLowerCase().includes("olá")) {
    resposta = "E aí, viajante do tempo! Como posso te ajudar hoje? 🚀";
  } else if (userText.length < 10) {
    resposta = "Fala mais, estou curioso... 😏";
  } else {
    resposta += "Você disse: \"" + userText + "\". O futuro parece promissor com perguntas assim!";
  }
  
  setTimeout(() => {
    addMessage(resposta);
  }, 800 + Math.random() * 1200);
}

function handleSend() {
  const text = input.value.trim();
  if (!text) return;
  
  addMessage(text, true);
  input.value = "";
  botResponse(text);
}

// Enviar com botão
sendBtn.addEventListener("click", handleSend);

// Enviar com Enter (Shift+Enter = nova linha)
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
});

// Mensagem de boas-vindas
setTimeout(() => {
  addMessage("Olá! Eu sou o Future. Uma IA que pensa alguns passos à frente... No que você está pensando hoje?");
}, 600);