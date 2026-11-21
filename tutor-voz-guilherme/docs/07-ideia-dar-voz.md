# Ideia 1 aprofundada: dar voz a quem não fala

> Discovery, 19/11/2026. **Status: estacionada.** Ao ser reavaliada pelo regulamento, caiu para 15 pontos (ver `06-avaliacao-ideias.md`): pouca "experiência de voz" com o agente, negócio pouco claro, e ficava entre simples demais e aberta demais.

## O problema real não é a voz, é a entrada

Gerar uma voz natural já é um problema resolvido: TTS e clonagem de voz funcionam muito bem. O gargalo é o caminho **intenção → máquina**:

- Uma pessoa fala cerca de **150 palavras por minuto**.
- Quem usa comunicação alternativa (pranchas, digitação, olhar) fica em geral **abaixo de 15–20**. Numa conversa real, quando a frase fica pronta, o assunto já mudou.

Então o desafio é: **como a pessoa expressa o que quer com o mínimo de esforço e o máximo de velocidade?**

## "Quem não fala" são vários públicos, com problemas diferentes

| Grupo | Exemplos | O que consegue fazer | Atalho de IA |
| --- | --- | --- | --- |
| **A. Fala, mas não é entendido** | Disartria (AVC, Parkinson, ELA inicial, paralisia cerebral), fala anasalada ("fanho"), surdez | Produz som e palavras, mas pouco inteligíveis | ASR adaptado à fala da pessoa → a IA **repete com voz clara** |
| **B. Sabe o que quer, mas a linguagem falha** | Afasia pós-AVC (comum após AVC) | Palavras soltas, trocadas ou fragmentos ("água... frio... copo") | LLM **reconstrói a frase** a partir dos fragmentos e do contexto, e a pessoa confirma |
| **C. Não produz fala** | Laringectomia, ELA avançada, traqueostomia, *locked-in* | Mão, olhar, cabeça, piscar, às vezes movimento dos lábios | **Prever e sugerir** frases para a pessoa só escolher |
| **D. Não verbal desde o nascimento** | Autismo não verbal, paralisia cerebral grave | Pranchas de símbolos, toque | Símbolos → frase natural com contexto |

Cada linha é um produto diferente. Para o hackathon, escolher **um** público e fazer bem.

## O atalho: a IA ouve a conversa e a pessoa só escolhe

O agente da Agora já está **dentro da conversa**. Ele ouve e transcreve o que os outros dizem. Com isso:

1. Alguém pergunta: *"Você quer almoçar agora ou mais tarde?"*
2. A IA já sugere 3 ou 4 respostas completas, no estilo da pessoa: *"Agora, estou com fome"*, *"Mais tarde, por favor"*, *"Pode ser, mas algo leve"*.
3. A pessoa **escolhe com um gesto mínimo**: toque, olhar, movimento de cabeça, piscada, ou uma palavra mal articulada que a IA entende no contexto.
4. O agente **fala na voz dela**, que pode ser a voz original, clonada de vídeos e áudios antigos. Opcionalmente, um **avatar** é o rosto dela numa videochamada.

Em vez de digitar uma frase em 1 minuto, a resposta sai em ~2 segundos. Isso tem respaldo em pesquisa: o Google publicou o **SpeakFaster** (2023/24), em que LLMs expandiram abreviações para usuários com ELA que digitam com o olhar e aumentaram muito a velocidade de comunicação.

## Escada de modos de entrada (do viável ao visionário)

| Nível | Entrada | Viável em 24h? |
| --- | --- | --- |
| 1 | Toque/clique nas sugestões; digitação abreviada ("qr agua" → frase) | ✅ trivial |
| 2 | **Cabeça ou piscada pela webcam** (MediaPipe no navegador): olhar/virar para uma das 4 opções, piscar para confirmar | ✅ viável, e é o "uau" da demo |
| 3 | Fala parcial ou mal articulada + contexto (grupos A e B) | ⚠️ depende de quão bem o ASR entende; testar antes |
| 4 | Leitura labial (laringectomizados mexem os lábios sem som) | ❌ pesquisa, sem bom suporte em português |
| 5 | EEG de consumo (faixa na cabeça) | ❌ hoje só dá sinais simples (sim/não, atenção), não palavras |
| 6 | **Interface cérebro-computador implantada** | ❌ pesquisa clínica (ex.: UCSF e Stanford em 2023 decodificaram fala de pacientes; a UCSF chegou a dar voz e **um avatar** a uma paciente com AVC) |

**Como usar a "conexão neural" sem prometer o impossível:** o produto tem uma **camada de entrada trocável**. Na demo, webcam e toque. No pitch, o roadmap mostra que a mesma camada pode receber EEG e, no futuro, BCI. O que fazemos hoje (contexto + previsão + voz própria + avatar) é exatamente o que essas interfaces neurais vão precisar. É disruptivo na visão e realista na entrega.

## MVP sugerido para 24h

- **Público:** grupo C (não produz fala), com o grupo B como extensão.
- **Cenário:** videochamada (Agora RTC) entre a pessoa e um familiar ou médico, com o agente como terceiro participante.
- **Fluxo:** ASR transcreve o interlocutor → LLM gera 4 respostas sugeridas + permite digitação abreviada → a pessoa seleciona por toque ou por cabeça/piscada (webcam) → `speak` fala na voz escolhida → avatar opcional.
- **Peças da Agora:** canal RTC com vários participantes, ASR, transcrição ao vivo, `speak`, LLM (ou um LLM custom nosso para a lógica de sugestões), TTS com voz clonada (ElevenLabs, BYOK), avatar opcional.

### Pontos de atenção técnicos
- O motor da Agora foi feito para o agente **responder sozinho** a quem fala. Aqui ele precisa **sugerir e esperar a escolha**, então provavelmente vamos usar o agente para ouvir e falar (`speak`) e controlar a lógica de sugestões no nosso backend. **É a primeira coisa a validar.**
- Latência: transcrição do interlocutor → sugestões na tela precisa ficar em ~1–2 s.

## Validação no dia 22 (vale 10% da nota)

- Qualquer voluntário pode testar **sem falar**: conversa curta usando só a ferramenta.
- Métrica simples: tempo por resposta, comparando digitar a frase inteira com escolher uma sugestão.
- Se alguém do grupo conhecer um(a) **fonoaudiólogo(a)** ou paciente, uma conversa de 15 min antes do evento vale ouro para o pitch.

## Referências de mercado (para o pitch)

- **Livox** (brasileiro): app de comunicação alternativa com símbolos, premiado.
- **Proloquo2Go, TD Snap:** pranchas de comunicação.
- **Voiceitt, Google Project Relate:** reconhecimento de fala atípica (foco em inglês).
- **Programas de "voice banking"** para ELA: gravar a voz antes de perdê-la.

O espaço livre está em juntar **contexto da conversa + previsão + voz própria + tempo real**. Os produtos existentes são, em geral, pranchas ou teclados que não ouvem a conversa.

## Perguntas para o grupo

1. Qual público abraçamos: C (não produz fala), B (afasia) ou A (fala não compreendida)?
2. Alguém tem contato com fonoaudiologia, neurologia, associações (ELA, AVC, autismo) ou pacientes?
3. O avatar entra (rosto da pessoa na chamada) ou focamos só na voz?
