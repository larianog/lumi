# Conversational AI Engine: como funciona

> Base: documentação "Main" (Voice Agent API v2), release **v2.14 de 06/11/2026**.

## Arquitetura

```
 ┌──────────────┐        canal RTC (áudio/vídeo)        ┌───────────────────────────────┐
 │  Nosso app   │ ◄───────────────────────────────────► │  Agente (roda na nuvem Agora) │
 │ (web/mobile) │        RTM (transcrição, eventos)      │                               │
 └──────┬───────┘                                        │  ASR → LLM → TTS  (+ avatar)  │
        │ pede token / "chama o agente"                  │   ou MLLM (voz→voz direto)    │
 ┌──────▼───────┐   REST: join / leave / speak / ...    │  tools HTTP · MCP · LLM custom │
 │ Nosso backend│ ─────────────────────────────────────►│                               │
 └──────────────┘                                        └───────────────────────────────┘
```

1. O usuário abre o app, que pede ao **nosso backend** um token RTC/RTM.
2. O app entra num **canal** da Agora com o SDK RTC (captura o microfone).
3. O backend chama `join` na API da Agora: o **agente** entra no mesmo canal.
4. O agente ouve o áudio do usuário, transcreve (ASR), gera a resposta (LLM) e fala (TTS). Se tiver avatar, um participante de vídeo extra aparece no canal, com o rosto sincronizado com a fala.
5. Transcrições e eventos chegam ao app via **RTM**.
6. Ao final, o backend chama `leave`.

> O App Certificate fica só no backend, nunca no navegador. Por isso o backend é obrigatório, mesmo que seja mínimo (3 rotas).

### Dois modos de "cérebro"

| Modo | Como é | Prós | Contras |
| --- | --- | --- | --- |
| **Cascata** (`asr` + `llm` + `tts`) | Fala → texto → LLM → texto → fala | Escolhemos cada peça; LLM próprio/RAG; ferramentas; avatar; `speak`; modo gerenciado (sem chave) | Mais latência somada |
| **MLLM** (`mllm`) | Modelo voz-para-voz (OpenAI Realtime, GPT-Live, Gemini Live, xAI Grok, Azure) | Mais natural e rápido, entende tom de voz | Precisa da nossa chave; `speak` não é suportado; menos controle |

## API REST (Voice Agent API v2)

Base: `https://api.agora.io/api/conversational-ai-agent/v2/projects/{appid}`
Autenticação: Basic (Customer ID + Secret) ou token (desde a v2.14 o mesmo token serve para REST e canal).

| Endpoint | Para que serve |
| --- | --- |
| `POST /join` | Cria o agente e coloca no canal (toda a configuração vai aqui) |
| `POST /agents/{id}/leave` | Encerra o agente |
| `POST /agents/{id}/update` | Muda configuração em tempo de execução (ex.: novo system prompt, renovar token) |
| `POST /agents/{id}/speak` | Faz o agente **falar um texto nosso** na hora (interrompe o que estiver dizendo) |
| `POST /agents/{id}/think` | Injeta uma **instrução de texto** como se fosse entrada do usuário (ex.: "o usuário clicou no botão X") |
| `POST /agents/{id}/interrupt` | Interrompe o agente |
| `GET /agents/{id}` / `GET /agents` | Status / lista de agentes |
| `GET /agents/{id}/history` | Histórico da conversa |
| `GET /agents/{id}/turns` | Métricas de latência por turno |

## SDKs

- **Servidor (orquestra o agente):** `agora-agents` em Python (`pip install agora-agents`) e TypeScript (`npm install agora-agents`), e `github.com/AgoraIO/agora-agents-go/v2` em Go. API fluente:

```python
agent = (Agent(client)
    .with_stt(DeepgramSTT(model='nova-3', language='...'))
    .with_llm(OpenAI(model='gpt-4o-mini', system_messages=[...], greeting_message='...'))
    .with_tts(MiniMaxTTS(model='speech-2.6-turbo', voice_id='...'))
    .with_avatar(AnamAvatar(api_key='...', avatar_id='...')))   # opcional
session = agent.create_session(channel='canal', agent_uid='0', remote_uids=['1002'], idle_timeout=120)
agent_id = session.start()   # ... session.stop()
```

- **Cliente:** `agora-rtc-sdk-ng` (web RTC) + `agora-rtm-sdk` (sinalização). Existe um **toolkit de cliente** (iOS, Android, Web) com transcrição ao vivo, interrupção, eventos, envio de imagem e parâmetros de áudio otimizados.
- **Tokens:** `agora-token` (Node) / `agora-token-builder` (Python).
- **Starters oficiais:** `agora init <nome> --template nextjs | python | go`, baseados em [agent-quickstart-nextjs](https://github.com/AgoraIO-Conversational-AI/agent-quickstart-nextjs) e [agent-quickstart-python](https://github.com/AgoraIO-Conversational-AI/agent-quickstart-python).

## Provedores suportados

**Modo gerenciado** (`credential_mode: "managed"`): a Agora fornece a chave e o custo já está no preço por minuto. **BYOK**: usamos a nossa chave.

| Camada | Gerenciado pela Agora (sem chave) | Outros (BYOK) |
| --- | --- | --- |
| **ASR** (fala→texto) | ARES (da Agora), Deepgram nova-2 / nova-3 | Azure, OpenAI, Google, Gemini, Amazon, AssemblyAI, Speechmatics, Sarvam, Smallest AI, xAI |
| **LLM** | OpenAI GPT-4o-mini, GPT-4.1-mini, GPT-5-nano, GPT-5-mini | **Claude (Anthropic)**, Gemini, Vertex, Azure OpenAI, Bedrock, Groq, xAI, Dify, **qualquer endpoint compatível com OpenAI** |
| **TTS** (texto→fala) | MiniMax 2.6/2.8 Turbo, OpenAI TTS-1, Fish Audio, Cartesia | ElevenLabs, Azure, Google, Gemini, Amazon Polly, Deepgram, Hume AI, Murf, Rime, Mistral, Typecast, Sarvam, Smallest AI, xAI, **TTS genérico (protocolo OpenAI)** |
| **MLLM** | (nenhum) | OpenAI Realtime, OpenAI GPT-Live, Gemini Live, Gemini Live (Vertex), Azure Realtime, xAI Grok |
| **Avatar** | (nenhum) | Akool, Anam, LiveAvatar (HeyGen), e via `generic`: Tavus, LemonSlice, Protoface ou qualquer provedor compatível |

## Recursos do motor (o que dá para usar)

### Conversa natural
- **Detecção de turno** (VAD / semântica) e **interrupção** por voz, por palavra-chave ou manual
- **Filler words:** o agente fala "hmm, deixa eu ver..." enquanto o LLM pensa (estáticas ou geradas)
- **Saudação** em texto ou áudio pré-gravado, e **despedida** controlada (`farewell_config`)
- **Silêncio:** comportamento configurável quando o usuário fica calado (`silence_config`)
- **Selective Attention Locking (SAL, Beta):** foca na voz de um falante específico (voiceprint) e ignora ruído/outras vozes
- **Palavras-chave de ASR:** melhora o reconhecimento de termos do domínio
- **Memória de curto prazo** (`max_history`) e **variáveis de template** no prompt (ex.: nome do usuário)

### Inteligência e integração
- **Custom tools:** o LLM chama endpoints HTTPS nossos (GET/POST síncronos). Ex.: consultar pedido, agendar, buscar dados
- **MCP servers:** o agente usa ferramentas de servidores MCP (`streamable_http`). Até 32 ferramentas no total
- **Custom LLM:** apontamos o agente para **nosso próprio serviço compatível com OpenAI** (SSE). É aqui que entra RAG, agentes multi-etapa, lógica de negócio, uso de Claude etc.
- **Saída de áudio direta do LLM:** nosso LLM custom pode devolver áudio pronto (sem TTS)
- **Imagens (Beta, grátis por tempo limitado):** o app envia uma foto e o LLM considera nas próximas respostas (requer LLM com visão)
- **`speak` e `think`:** o backend faz o agente falar algo ou reagir a eventos da UI

### Observabilidade
- Transcrição ao vivo no cliente (usuário e agente, com estado em andamento/finalizado/interrompido)
- Eventos de estado do agente (ouvindo, pensando, falando), métricas de latência por turno, erros
- Webhooks (Notification Center), histórico da conversa, gravação (Cloud Recording)

## Avatares

O avatar entra no canal como **mais um participante de vídeo** (com UID próprio), animado em sincronia com o TTS.

- Configuração: bloco `avatar` no `join` (ou `.with_avatar(...)` no SDK)
- **Sempre BYOK:** precisamos de conta e chave no provedor (Anam, HeyGen LiveAvatar, Akool, Tavus...)
- Cada provedor exige uma **taxa de amostragem de TTS** (ex.: LiveAvatar 24 kHz, Akool 16 kHz). O TTS escolhido tem que bater
- Qualidade: tipicamente 360p, 480p ou 720p
- Latência extra estimada: **50–200 ms** por turno
- Com o modo `generic`, dá para plugar outros provedores ou até um renderizador próprio
