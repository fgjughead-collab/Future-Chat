// === CONFIGURAÇÕES - MUDE AQUI ===
const API_PROVIDER = "groq"; // ou "openrouter", "openai", etc.
const API_KEY = "SUA_CHAVE_API_AQUI"; // NUNCA commit isso no GitHub! Use .env ou insira manualmente após clonar
const MODEL = "llama-3.3-70b-versatile"; // Groq exemplo; para OpenRouter: "deepseek/deepseek-r1" ou "openai/gpt-4o-mini"

// Endpoints (compatíveis OpenAI)
const ENDPOINTS = {
  groq: "https://api.groq.com/openai/v1/chat/completions",
  openrouter: "https://openrouter.ai/api/v1/chat/completions",
  openai: "https://api.openai.com/v1/chat/completions",
  // adicione outros se quiser
};

const API_URL = ENDPOINTS[API_PROVIDER] || ENDPOINTS.groq;

// === NÃO MUDE ABAIXO ===
const messagesDiv = document.getElementById("chat-messages");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

let conversation = [
  { role: "system", content: "Você é Future, uma IA avançada, útil, direta e com senso de humor sutil. Responda em português do Brasil, de forma natural e inteligente." }
];

function addMessage(text, isUser = false, isThinking = false) {
  const msg = document.createElement("div");
  msg.classList.add("message");
  msg.classList.add(isUser ? "user" : "bot");
  if (isThinking) msg.classList.add("thinking");
  msg.textContent = text;
  messagesDiv.appendChild(msg);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
  return msg; // para editar depois (streaming)
}

async function sendToAI() {
  if (!API_KEY || API_KEY === "SUA_CHAVE_API_AQUI") {
    addMessage("Erro: Insira sua API Key no código (script.js) e recarregue a página.");
    return;
  }

  const userText = input.value.trim();
  if (!userText) return;

  addMessage(userText, true);
  input.value = "";

  const thinkingMsg = addMessage("Pensando...", false, true);

  try {
    conversation.push({ role: "user", content: userText });

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: conversation,
        temperature: 0.7,
        max_tokens: 2048,
        stream: true // para streaming (resposta aparecendo aos poucos)
      })
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    thinkingMsg.remove();

    const botMsg = addMessage("");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullResponse += delta;
              botMsg.textContent = fullResponse;
              messagesDiv.scrollTop = messagesDiv.scrollHeight;
            }
          } catch (e) {}
        }
      }
    }

    conversation.push({ role: "assistant", content: fullResponse });

  } catch (err) {
    thinkingMsg?.remove();
    addMessage(`Erro: ${err.message}\nVerifique sua API key, provedor ou conexão.`);
  }
}

sendBtn.addEventListener("click", sendToAI);

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendToAI();
  }
});

// Boas-vindas
addMessage("Olá! Eu sou o Future — IA real e sem limites bobos. Pergunte qualquer coisa, estou pronto. 🚀 O que você quer saber hoje?");