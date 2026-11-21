# Agora: visão geral

## O que é

A Agora é uma plataforma de infraestrutura de **comunicação em tempo real**: voz, vídeo, streaming e mensagens com baixa latência, rodando na rede global própria deles (SD-RTN™). Em cima dessa infraestrutura, eles oferecem um produto de **agentes de voz com IA**: um "bot" entra numa chamada de áudio/vídeo como se fosse mais um participante, ouve o usuário, pensa com um LLM e responde falando, opcionalmente com um rosto (avatar).

O ponto forte deles não é o modelo de IA (eles usam OpenAI, Deepgram, ElevenLabs etc.), e sim **a orquestração em tempo real**: transporte de áudio com baixa latência, detecção de turno (quando o usuário parou de falar), interrupção natural, cancelamento de eco/ruído e sincronização com avatar.

## Mapa de produtos

| Produto | Para que serve | Relevância para nós |
| --- | --- | --- |
| **Conversational AI Engine** (Voice Agents) | Agente de IA que entra num canal e conversa por voz. Orquestra ASR → LLM → TTS (ou um modelo multimodal ponta a ponta) e opcionalmente um avatar | **Núcleo do projeto** |
| **RTC** (Voice/Video Calling, Live Streaming) | SDK de chamada de voz/vídeo. É o "canal" onde usuário e agente se encontram | Obrigatório (é o transporte) |
| **Signaling (RTM)** | Mensagens em tempo real, presença e estado | Necessário para transcrições ao vivo, eventos do agente no cliente e envio de imagens |
| **Agent Studio** | Construtor visual no Console: prompt, modelos, ferramentas, base de conhecimento, telefonia, analytics, sem código | Ótimo para prototipar e testar prompt/voz rápido |
| **Conversational AI Platform** (Preview) | Versão nova da API: agentes salvos, secrets, sessões, números de telefone, campanhas | Interessante se a ideia envolver **ligação telefônica**. Só roda nos EUA durante o Preview |
| **Convo AI Device Kit** | Hardware de referência (R1) para agentes em dispositivos (brinquedos, wearables, quiosques) | Só se a ideia for hardware |
| **TEN Framework** | Framework open source (da Agora) para montar pipelines de agentes em grafo | Alternativa avançada; provavelmente desnecessário em 1,5 dia |
| Cloud Recording, Speech-to-Text, Media Push/Pull | Gravar, transcrever, levar a mídia para RTMP/CDN etc. | Opcional (gravação da demo, por exemplo) |

## Os 3 caminhos para construir um agente de voz

A documentação divide em três trilhas, com a mesma base técnica:

1. **In apps (código):** web, mobile ou desktop. Um backend nosso gera tokens e manda o agente entrar no canal via REST/SDK; o front entra no mesmo canal com o SDK RTC. **É o caminho mais provável para o hackathon.**
2. **Agent Studio (sem código):** tudo no Console da Agora, inclusive telefonia (SIP trunk), campanhas de ligação e analytics. Um agente publicado no Studio pode ser chamado pela API usando `pipeline_id`, então dá para **configurar no Studio e disparar pelo nosso app**.
3. **Dedicated devices:** hardware embarcado (Device Kit R1).

## Kit para desenvolver com IA

A Agora tem um kit pensado para agentes de código (Claude Code, Cursor, Codex):

- **Agora CLI:** cria projeto, grava credenciais em `.env`, gera starters e faz diagnóstico (`agora project doctor`). No Windows: `irm https://dl.agora.io/cli/install.ps1 | iex`
- **Agora Skills:** `npx skills add AgoraIO/skills`. Dá ao agente de código os fluxos corretos de integração
- **Recipes:** exemplos executáveis em [recipes.agora.io](https://recipes.agora.io/)
- **Docs em formato LLM:** [docs.agora.io/llms.txt](https://docs.agora.io/llms.txt). Já baixamos uma cópia em [../referencias/agora-docs/](../referencias/agora-docs/)
