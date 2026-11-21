# Até onde podemos ir: limites, custos e riscos

## O que dá para construir (com tranquilidade em 1,5 dia)

- Um app **web** (Next.js ou Python + página) onde o usuário conversa por voz com um agente com personalidade, prompt e voz próprios
- Agente com **rosto** (avatar) em vídeo, se tivermos chave de um provedor de avatar
- Agente que **age no mundo** via ferramentas HTTP ou MCP: consultar/gravar dados, agendar, buscar informações, acionar outros sistemas
- Agente com **conhecimento próprio** (RAG) ou lógica complexa, através de um **LLM custom** nosso (endpoint compatível com OpenAI), inclusive usando Claude
- Agente que **vê** (o usuário envia uma foto; Beta)
- App que **reage à conversa** na tela: transcrição ao vivo, estados do agente (ouvindo/pensando/falando) e eventos que disparam UI
- Backend que **conduz** o agente: fazer falar (`speak`), injetar contexto (`think`), trocar o prompt em tempo real (`update`)

## O que é arriscado ou fora de alcance

| Item | Por quê |
| --- | --- |
| Ligação telefônica real (PSTN) | Requer SIP trunk de operadora e número importado. A Platform (Preview) só roda nos EUA. Dá para fazer, mas consome muito tempo de configuração |
| Hardware (Device Kit) | Requer o kit físico R1 |
| Ferramentas assíncronas / PUT / DELETE / OAuth nas tools | Não suportado: só GET/POST síncronos via HTTPS com headers fixos. Contorno: nosso próprio endpoint (ou LLM custom) faz o trabalho pesado |
| Avatar 100% personalizado do zero | Possível via `generic`, mas é um projeto por si só. Usar Anam/HeyGen/Akool/Tavus |

## Limites técnicos documentados

| Limite | Valor |
| --- | --- |
| Usuários simultâneos chamando a API por App ID (PCU) | **20** (aumento só via suporte) |
| Duração máxima de uma sessão de agente | 72 h |
| Ferramentas expostas ao LLM (custom + MCP + nativas) | **32** no máximo |
| Timeout de custom tool | 1 a 100 s (padrão 10 s) |
| Resposta de custom tool | até 1 MiB |
| Corpo de requisição POST de tool | até 64 KiB |
| Transporte MCP | apenas `streamable_http` |
| Envio de imagens | Beta (grátis por tempo limitado). Exige LLM com visão |
| Conversational AI Platform (Preview) | Só região EUA, sem geofencing |
| `speak` | Não funciona em modo MLLM |

## Custos

| Item | Preço | Gratuidade |
| --- | --- | --- |
| Conversational AI Engine (tarefa de áudio do agente) | **US$ 0,10/min**, já incluindo ASR+LLM+TTS gerenciados | **300 min/mês grátis** por conta |
| BYOK (nossa chave) | Mesmo US$ 0,10/min da Agora + o custo do provedor | — |
| RTC áudio (usuário no canal) | US$ 0,99 / 1.000 min | 10.000 min/mês grátis por conta |
| RTC vídeo HD (assistir o avatar) | Conta como 4× o minuto de áudio (~US$ 3,99 / 1.000 min) | Sai dos mesmos 10.000 min |
| Avatar (Anam, HeyGen, Akool, Tavus...) | Cobrado pelo provedor | Depende do trial de cada um (verificar) |

**Na prática:** 300 minutos grátis de agente por conta dão folga para desenvolver e gravar a demo. Cada membro pode ter a própria conta. Atenção a sessões esquecidas abertas: usar `idle_timeout` curto (ex.: 60–120 s) e sempre chamar `leave`.

## Latência (o que esperar)

Dados da própria Agora para a arquitetura em cascata:

| Etapa | Faixa típica |
| --- | --- |
| Rede RTC | 150–300 ms |
| Pré-processamento (VAD/turno) | 720–940 ms (com 640 ms de silêncio configurado) |
| ASR (último trecho) | 400–700 ms |
| LLM (primeira frase) | 250–1000 ms (**é o maior gargalo**) |
| TTS (primeiro byte) | 100–350 ms |
| Avatar | +50–200 ms |

Dicas: LLM rápido (gpt-4o-mini, gpt-5-nano, Groq), `max_tokens` baixo, respostas curtas no prompt, filler words, ou MLLM para máxima naturalidade.

## Riscos que precisamos testar ANTES do dia 21

1. **Português do Brasil.** A documentação da Agora não cita pt-BR explicitamente; os exemplos são todos em inglês. O ARES usa a língua de `turn_detection` (padrão `en-US`). O Deepgram e os TTS (MiniMax, OpenAI, ElevenLabs, Azure) suportam português pelos próprios fornecedores, mas é preciso **testar no motor da Agora**: reconhecimento, sotaque da voz, detecção de turno em português.
2. **Avatar.** Escolher fornecedor, criar conta, ver se o trial cobre a demo, e casar a taxa de amostragem do TTS.
3. **Latência real** a partir do Brasil (o exemplo usa `Area.US`; ver se há área mais próxima).
4. **Rede do evento.** WebRTC em rede de evento lotada pode sofrer. Ter um plano B (hotspot do celular) para a demo e gravar a demo com antecedência.
5. **Créditos.** Confirmar com a organização se a Agora vai dar créditos/cotas extras para os participantes.
