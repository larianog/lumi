# Discovery de ideias (rodada 1, 17/11/2026)

## Enquadramento: contra o que estamos avaliando

- **Restrições:** ~1,5 dia de construção, demo de **2 minutos**, banca num evento da Agora cujo tema é **voz + avatares**.
- **O que a Agora faz de único** (doc 02): o agente é **mais um participante numa chamada em tempo real**. Ele pode ouvir várias pessoas (`remote_rtc_uids` é uma lista), ser interrompido, falar o que o backend mandar (`speak`), reagir a eventos da tela (`think`), chamar ferramentas e aparecer com rosto (avatar).
- **Critérios prováveis da banca** (a confirmar com a organização): uso da tecnologia da Agora, impacto/negócio, inovação, execução técnica, qualidade do pitch.

Pergunta-guia: **qual problema só fica bem resolvido com voz em tempo real e interrupção natural, e não com um chat de texto ou um áudio gravado?**

## As ideias

### 1. Totem de autoatendimento em drive-in/drive-thru (David/Larissa)
- **Problema:** fila e gargalo no pedido; atendente sobrecarregado; erro de pedido; upsell inconsistente.
- **Encaixe na Agora:** muito alto. Avatar no totem, ruído de motor (cancelamento de ruído + SAL para travar na voz do motorista), tools para mandar o pedido ao sistema da cozinha, upsell no prompt, interrupção ("não, sem cebola").
- **Demo:** excelente e visual: falo com o avatar, o pedido aparece montando na tela e cai num "painel da cozinha".
- **Contra:** mercado já testado lá fora (Wendy's, Taco Bell, SoundHound, Presto) e o McDonald's encerrou o teste com a IBM em 2024 por erros de pedido. A banca pode achar "já vi". Diferencial teria que ser Brasil (sotaques, gírias, "um X-tudo sem tomate"), totem multiuso ou acessibilidade.
- **Maior incógnita:** precisão em português com ruído real.

### 2. Agentes de cobrança e negociação (David/Larissa)
- **Problema:** dezenas de milhões de brasileiros inadimplentes; cobrança humana é cara, agressiva e a pessoa evita atender.
- **Encaixe na Agora:** médio. Voz é o canal certo, mas o canal natural é **telefone**, que na Agora exige SIP trunk e a versão nova só roda nos EUA (doc 03). No hackathon a demo seria via app/web, não ligação real.
- **Forças:** caso de negócio mais claro de todos (ROI fácil de contar), tools de verdade (consultar dívida, simular parcelas dentro de uma política, gerar PIX).
- **Contra:** mercado lotado de voicebots de cobrança; avatar pouco relevante (deixa metade do tema de fora); regras de compliance (CDC art. 42, LGPD, autorregulação de ligações).
- **Ângulo para diferenciar:** a **negociação empática** de verdade (agente que detecta a situação da pessoa e adapta a proposta) e não o robô de "pressione 1".

### 3. Soluções para pessoas com dificuldade na fala ou que não falam (Guilherme)
- **Problema:** quem não fala (AVC, ELA, autismo não verbal, laringectomia, paralisia cerebral) depende de pranchas de comunicação ou apps de texto-para-voz lentos e robóticos. Numa **ligação** ou conversa em tempo real, a pessoa fica de fora.
- **Encaixe na Agora:** **altíssimo e pouco óbvio.** O agente entra na chamada como a **voz da pessoa**: ela digita ou toca em atalhos; o LLM expande ("água gelada" → "Você me traz um copo de água gelada, por favor?"); o agente fala com voz natural (até a voz própria, clonada de gravações antigas, via ElevenLabs). Ao mesmo tempo, ele transcreve o outro lado e **sugere respostas** com base no que foi dito. Usa `speak`, transcrição, o canal com vários participantes e, opcionalmente, um avatar como "rosto" da pessoa.
- **Demo:** emocionante e clara em 2 min (ligação para pedir uma pizza ou marcar consulta, feita por alguém que não fala).
- **Contra:** modelo de negócio menos óbvio (B2C/assistivo, SUS, planos de saúde, operadoras); entender fala disártrica (fala difícil) é muito difícil e fica fora do escopo. Focar em **quem não fala**.
- **Maior incógnita:** latência total de digitar → expandir → falar numa conversa ao vivo.

### 4. Dublagem com IA (filmes, animações, games) (Guilherme)
- **Encaixe na Agora:** **baixo.** Dublagem é pós-produção (offline), não conversa em tempo real. Já há players fortes (ElevenLabs Dubbing, HeyGen, Rask). A Agora não agrega nada aqui.
- **Pivô possível:** **interpretação ao vivo**, um agente que traduz em tempo real numa chamada entre duas pessoas de idiomas diferentes. Isso usa o diferencial da Agora, mas é um caso clássico e concorrido.
- **Variação com games:** NPCs que conversam por voz. Interessante, mas fora do "ao vivo com humanos".

### 5. Aprendizagem: professores de línguas e de música (Guilherme)
- **Línguas:** encaixe alto (tutor com avatar para conversação, correção, role-play), mas é **o caso mais concorrido** de todos (Duolingo Max com videochamada, Speak, Praktika, ELSA). Precisaria de um nicho afiado (ex.: simulador de entrevista de emprego em inglês, português para imigrantes e refugiados).
- **Música:** encaixe **baixo** hoje. ASR transcreve fala, não notas; avaliar afinação/ritmo exige um modelo de áudio musical próprio. Um MLLM até "ouve", mas a precisão é duvidosa. Alto risco de a demo falhar.

### 6. Soluções para cegos em ambientes públicos (Guilherme) ⭐ marcada
- **Problema:** no ponto de ônibus, o cego não sabe qual ônibus está chegando; em shopping/estação não acha lojas, saídas e banheiros. Hoje depende de pedir ajuda a estranhos.
- **Encaixe na Agora:** alto. Agente de voz com **ferramentas de dados reais** (ex.: API Olho Vivo da SPTrans para previsão de ônibus em SP), visão (foto do ambiente, Beta) e interrupção natural. Pode viver no celular ou num **totem com botão** no ponto/shopping.
- **Demo:** boa ("o 875A já está chegando?" → resposta com dado real).
- **Contra:** Be My Eyes / Be My AI e Seeing AI já fazem a descrição visual; navegação indoor de verdade é difícil (precisa de mapa/beacons). O valor está na **informação contextual do lugar** (ônibus, mapa do shopping), não em "descrever a imagem".

### 7. Atendimento por ligação, vídeo ou áudio (Guilherme)
- **Encaixe:** alto, mas é o **caso padrão** da própria Agora. A banca vai ver muitos. Só vale com vertical e problema afiados (o que, na prática, vira as ideias 1, 2 ou 6).

## Placar (1 a 5, opinião inicial)

| Ideia | Encaixe Agora (voz+avatar) | Demo em 2 min | Viável em 1,5 dia | Negócio | Diferenciação | Impacto | **Total** |
| --- | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| 3. Voz para quem não fala | 5 | 5 | 4 | 3 | 5 | 5 | **27** |
| 1. Totem drive-thru | 5 | 5 | 4 | 4 | 2 | 3 | **23** |
| 6. Cegos em espaços públicos | 4 | 4 | 4 | 3 | 3 | 5 | **23** |
| 2. Cobrança/negociação | 3 | 3 | 4 | 5 | 2 | 3 | **20** |
| 5a. Tutor de línguas | 4 | 4 | 5 | 3 | 1 | 3 | **20** |
| 7. Atendimento genérico | 4 | 3 | 5 | 4 | 1 | 2 | **19** |
| 4. Dublagem | 1 | 3 | 3 | 3 | 2 | 2 | **14** |
| 5b. Professor de música | 2 | 2 | 2 | 3 | 4 | 3 | **16** |

## Padrões e combinações

- **Insight principal:** quase todo mundo vai fazer "humano conversa com bot". A Agora permite algo menos óbvio: **o agente como terceiro participante numa conversa entre humanos** (voz de quem não fala, intérprete, mediador de negociação, apoio ao atendente). É um território pouco explorado e conversa direto com a tecnologia.
- **Totem acessível (1 + 6):** a mesma base técnica (totem de voz com avatar em espaço público) atende a um negócio (drive-thru, shopping) **e** à acessibilidade (cego no ponto de ônibus). Acessibilidade vira o diferencial do totem, em vez de mais um drive-thru.
- **Cobrança como mediação (2 + insight):** em vez de bot que liga, um agente que **media** a negociação entre credor e devedor em tempo real, com proposta dentro da política. É mais original, mas mais difícil de demonstrar.

## Recomendação desta rodada

Aprofundar **três** finalistas:
1. **Voz para quem não fala** (maior impacto e originalidade, uso elegante da Agora).
2. **Totem de voz com avatar** (drive-thru com acessibilidade como diferencial): a demo mais "uau" e o negócio mais claro.
3. **Cobrança/negociação empática:** o negócio mais forte, se a equipe preferir B2B.

Deixados de lado por agora: dublagem (não é tempo real), professor de música (risco técnico alto), tutor de línguas e atendimento genérico (concorridos demais sem um nicho).

## Perguntas em aberto para a equipe

1. A banca vai premiar mais **impacto social** ou **potencial de negócio**? (perguntar à organização)
2. Queremos que o **avatar** seja protagonista? (o tema do evento é "voz **e** avatares")
3. Quem da equipe tem acesso a usuários reais (pessoa não verbal, cego, operador de drive-thru, área de cobrança) para validar até o dia 21?
4. Quais as habilidades do time (front, back, design, pitch)?

## Próximos testes baratos (antes do dia 21)

- Rodar o quickstart e testar **português** com sotaque e ruído (vale para todas as ideias).
- Ideia 3: medir a latência de "texto digitado → `speak`" numa chamada com 2 pessoas + agente.
- Ideia 1: testar o reconhecimento com áudio de motor/ruído de fundo e com o SAL ligado.
- Ideia 6: confirmar o acesso à API Olho Vivo (SPTrans) ou a outra fonte de dados real.
