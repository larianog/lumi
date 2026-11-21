# Testes de risco antes do evento

Objetivo: até **20/11**, descobrir se as apostas técnicas do produto (ver [docs/08](../docs/08-ideia-escolhida-avatar-infantil.md)) funcionam **antes** de construir em cima delas.

O laboratório fica em [`lab/`](lab/). É uma página web com um backend Python pequeno. Nela dá para trocar a configuração do agente (idioma, fim de fala, voz, avatar, imagem), conversar e anotar o resultado.

## O que já descobrimos só lendo a doc e o SDK (19/11)

| Risco | Achado | Consequência |
| --- | --- | --- |
| 2. Português | O ASR da própria Agora (**ARES**) aceita **pt-PT, não pt-BR**. O **Deepgram nova-3** (gerenciado, sem chave) aceita `pt-BR` e também `multi` (vários idiomas na mesma conversa) | Usar Deepgram. Testar `pt-BR` × `multi` com crianças |
| 3. Pausas | O fim de fala **semântico** (o mais "esperto") só funciona em **inglês e chinês**, e o SDK recusa em português. Sobra o modo **VAD** (silêncio), com `silence_duration_ms` ajustável | Achar o valor de silêncio certo para criança (padrão: 640 ms) |
| 6. Imagem | A imagem vai ao agente por mensagem RTM (`image.upload`) por **URL pública ou base64**, e o LLM precisa de `input_modalities: ["text","image"]`. O recurso está em **Beta** | O lab envia a foto da webcam em base64. Falta ver se o LLM gerenciado (gpt-4o-mini) enxerga |
| 4. Avatar | O LemonSlice aceita **imagem por URL ou base64** (`agent_image_url` / `agent_image_base64`) e é BYOK | Dá para usar o nosso mascote. Precisa de conta no LemonSlice |
| Latência | O agente manda métricas por módulo (ASR, LLM, TTS) e o tempo fim a fim de cada turno | O lab mostra isso numa tabela, para medirmos de verdade |
| Região | Os exemplos oficiais usam a API dos **EUA**. A plataforma nova ("Preview") só roda nos EUA | O lab usa a API estável. A latência a partir do Brasil precisa ser medida |

## Passo 1: contas (cada um faz no seu computador, ~10 min)

1. Criar conta no [Agora Console](https://console.agora.io/) e um projeto. O Conversational AI vem ligado em projetos novos.
2. Copiar o **App ID** e o **App Certificate** do projeto.
3. *(Opcional, para o teste de avatar)* criar conta no [LemonSlice](https://lemonslice.com) e gerar uma API key.

> O lab usa o **modo gerenciado** da Agora para ASR, LLM e TTS, então não precisa de chave da OpenAI nem da Deepgram. O custo é de US\$ 0,10/min de agente, e a conta tem 300 min grátis por mês.

## Passo 2: rodar o lab

No PowerShell, dentro da pasta do projeto:

```powershell
cd "testes\lab"
```

```powershell
python -m venv .venv
```

```powershell
.venv\Scripts\python -m pip install -r requirements.txt
```

```powershell
Copy-Item .env.example .env
```

Abra o `.env` e preencha `AGORA_APP_ID` e `AGORA_APP_CERTIFICATE` (e `LEMONSLICE_API_KEY`, se tiver). Depois:

```powershell
.venv\Scripts\python -m uvicorn server:app --port 3000
```

Abra **http://localhost:3000**. Tem que ser `localhost`, senão o navegador bloqueia o microfone. **Use fone de ouvido**, senão o agente se ouve e responde a si mesmo.

Para ver o mascote no avatar, salve uma imagem como `testes/lab/mascote.png` ou cole uma URL pública na página.

## Passo 3: os testes

Cada cenário é um botão na página. Para cada um: escolher o cenário → **Iniciar conversa** → conversar ~2 min → **Parar** → preencher as anotações → **Baixar registro do teste**. Salvar o arquivo em `testes/lab/resultados/`.

| # | Cenário | Quem fala | Roteiro | O que medir |
| --- | --- | --- | --- | --- |
| 1 | Voz infantil pt-BR | **Uma criança de 4–8 anos** (com autorização dos pais) | Responder ao Pipo, dizer o nome de 3 brinquedos, repetir 3 palavras em inglês | Das falas da criança, quantas o agente entendeu? |
| 2 | Mistura pt + en | Criança ou adulto | "Eu tenho um *car* azul", "o *dog* da minha vó" | Comparar `multi` × `pt-BR`: as palavras em inglês aparecem certas na transcrição? |
| 2b | ARES pt-PT | Adulto | As mesmas frases do teste 2 | O ASR da Agora em pt-PT entende sotaque brasileiro? |
| 3 | Pausas longas | Criança ou adulto imitando | Frases com pausa: "eu gosto de... de... cachorro" | Testar 800, 1200 e 2000 ms. Em qual valor o agente para de cortar sem ficar lento? |
| 4 | Avatar mascote | Adulto | Conversa curta | O mascote anima? A boca acompanha a voz? Quanto tempo leva para aparecer? |
| 5 | Ruído (SAL) | Adulto, com TV ou vídeo ligado ao fundo | Conversa normal | O agente responde à TV? Comparar com e sem SAL |
| 6 | Mostra pra mim | Qualquer pessoa | Ligar câmera → mostrar um objeto → 📸 | O agente reconhece o objeto? Testar os 2 formatos de base64 |

**Latência:** em todos os testes, olhar a tabela "Latência" (coluna "fim a fim"). Meta: abaixo de ~1,5 s sem avatar.

**Crianças:** só com autorização dos pais. Não gravar nem publicar o rosto. O registro do lab guarda só texto, nunca áudio nem vídeo.

## Passo 4: decidir (manhã de 21/11)

| Se… | Então… |
| --- | --- |
| A voz infantil for mal entendida (< 70% das falas) | O produto faz perguntas de resposta curta e usa palavras-chave. Na demo, um adulto conduz junto |
| `multi` não funcionar | O personagem fala inglês, mas espera respostas em português (pt-BR) |
| O avatar LemonSlice não animar bem o mascote | Plano B: Anam ou Akool. Plano C: voz + animação simples nossa |
| O "mostra pra mim" falhar no LLM gerenciado | Usar um LLM com chave própria (BYOK) com visão, ou tirar da demo |

## Arquivos

- `lab/server.py`: backend. Gera tokens, inicia e para o agente, e mostra o JSON enviado (botão "Ver JSON enviado", que funciona até sem credenciais).
- `lab/static/index.html`: página do teste. Usa os SDKs web da Agora (RTC 4.24.9 e RTM 2.3.0).
- `lab/.env.example`: modelo do arquivo de credenciais. O `.env` de verdade fica fora do git.
