# Ideia escolhida: avatar para crianças (ensino, companhia, línguas)

> Decisão do grupo em 19/11/2026. Evoluiu da ideia 3 (aprendizagem de línguas), agora com avatar e foco no público infantil.

## Em uma frase

Um **personagem animado** que conversa **por voz** com crianças, ensinando inglês brincando, com um **painel para os pais** acompanharem o que aconteceu.

## Primeira decisão: qual das três frentes é o centro?

"Ensino, babá e línguas" são três produtos. Para 24h e para o pitch, precisamos de **um centro** e os outros como apoio.

| Frente | A favor | Contra |
| --- | --- | --- |
| **Línguas (inglês)** | Resultado mensurável (palavras aprendidas, pronúncia); pais já pagam por inglês infantil; a voz é essencial (falar e ouvir) | Mercado com concorrentes (Lingokids, Duolingo ABC, Novakid) |
| **Ensino geral** | Público enorme | Amplo demais para 24h; difícil mostrar resultado em 2 min |
| **Babá / companhia** | Dor real dos pais | **Risco de imagem:** "IA que substitui a babá" assusta pais e a banca, e levanta questões éticas e legais |

**Recomendação:** **línguas é o núcleo**, **brincar é o método** (ensino lúdico) e a "babá" vira **"companhia enquanto um adulto está por perto"**. Nunca prometemos supervisão.

**Faixa etária sugerida: 4 a 8 anos.** Nessa idade a criança ainda **não lê nem digita bem**, então **voz é a única interface natural**. Esse é o nosso melhor argumento de "por que voz", e pesa nos 25% de experiência de voz.

## Como a ideia encaixa no regulamento

| Critério (peso) | Como a ideia responde |
| --- | --- |
| Experiência de voz (25%) | A criança só fala e ouve. Crianças interrompem o tempo todo, o que mostra bem a Agora lidando com interrupção |
| Técnica + Agora (25%) | Avatar, ajuste de fim de fala, envio de imagem ao agente, filtro de ruído (SAL), transcrição para o painel dos pais |
| Impacto (20%) | Inglês abre portas, e só uma pequena parte dos brasileiros fala o idioma (estudo do British Council, 2014: cerca de 5%) |
| Inovação (15%) | **Ponto fraco se ficar genérico.** Precisamos de 1 ou 2 diferenciais (abaixo) |
| Validação (10%) | Difícil: não haverá crianças no evento. Plano mais abaixo |
| Clareza (5%) | Demo muito visual e fácil de entender |

## Diferenciais (escolher 1 ou 2)

1. **"Mostra pra mim"** ⭐: a criança mostra um brinquedo ou desenho para a câmera, e o personagem reconhece e ensina a palavra em inglês (*"Wow, a red car! Can you say car?"*). A Agora tem recurso para **enviar imagens ao agente**, e o LLM precisa enxergar imagens. É o "uau" da demo.
2. **Bilíngue de verdade:** a criança fala português, e o personagem responde misturando e aumenta o inglês aos poucos. A criança não precisa saber inglês para começar.
3. **Personagem próprio, não humano realista:** um mascote nosso. O fornecedor **LemonSlice** (integrado à Agora) **anima um avatar a partir de uma imagem**, então podemos criar o personagem. Avatares humanos realistas podem causar estranheza em criança.
4. **Painel dos pais:** resumo da sessão (palavras novas, tempo, alertas) gerado das transcrições. Responde à pergunta que todo pai faz: *"o que meu filho conversou com a IA?"*.
5. **Histórias interativas:** o personagem conta uma história em que a criança decide o que acontece.

Sugestão: **1 + 3 + 4** (o "mostra pra mim" com o nosso mascote, mais o painel dos pais).

## Segurança infantil (vai cair nas perguntas da banca)

- **Lei:** a LGPD (art. 14) exige consentimento específico de um dos pais para dados de crianças. Há também o **ECA Digital** (Lei 15.211/2025) para produtos digitais usados por menores. No pitch: "feito para cumprir LGPD e ECA Digital desde o início".
- **Regras do personagem:**
  - Fala só de temas permitidos.
  - Nunca pede dados pessoais (nome completo, endereço, escola).
  - Nunca propõe "segredos".
  - Em assuntos sensíveis, diz: *"isso é uma ótima pergunta pro papai ou pra mamãe"*.
- **Limites:** sessões curtas com tempo máximo, sem guardar áudio, e o painel dos pais com tudo visível.
- **Posicionamento:** companhia com adulto por perto, não babá.

## Riscos técnicos: testar ANTES do evento

> **Atualização 19/11:** o laboratório de testes está em [`testes/`](../testes/README.md). Já lendo a doc e o SDK, descobrimos duas coisas:
> - O ASR da Agora (ARES) **não tem pt-BR**, só pt-PT. O caminho é o Deepgram nova-3, que aceita `pt-BR` e `multi`.
> - O fim de fala "semântico" **só funciona em inglês e chinês**. Para português, o ajuste é o tempo de silêncio (modo VAD).

| # | Risco | Por quê | O que fazer |
| --- | --- | --- | --- |
| 1 | **Reconhecer a voz de criança** | Os modelos de voz são treinados com adultos. Voz aguda e pronúncia em formação geram mais erros | Gravar 3–5 crianças e testar no quickstart, comparando Deepgram nova-3 e ARES. Fazer o LLM interpretar a intenção e usar perguntas de resposta curta |
| 2 | **Português e inglês na mesma frase** | O reconhecimento de voz trabalha com um idioma fixo (o padrão é `en-US`), e a mistura pode falhar | Testar `pt-BR` como idioma principal, com o inglês entrando como palavras soltas. **Maior risco do produto** |
| 3 | **Pausas longas da criança** | A criança para no meio da frase, e o agente responde antes da hora | Ajustar `turn_detection.end_of_speech`: `silence_duration_ms` maior, `max_wait_ms`, `pause_state_enabled` |
| 4 | **Avatar de personagem** | O LemonSlice é a integração mais nova na Agora (a própria doc avisa) e o avatar é BYOK | Criar a conta e testar já com uma imagem de mascote. Plano B: Anam ou Akool. Plano C: só voz com uma animação simples nossa |
| 5 | **Ruído de casa** (TV, irmãos) | O agente pode responder à TV | SAL no modo `locking` (Beta), que trava na voz de quem fala |
| 6 | **Imagem no LLM** | O "mostra pra mim" depende do LLM aceitar imagem | Testar o envio de imagem com o LLM gerenciado (GPT-4o-mini ou 4.1-mini). Se falhar, usar um LLM nosso (BYOK) |
| 7 | **Latência com avatar** | O avatar adiciona 50–200 ms, e criança tem pouca paciência | Respostas curtas e frases de preenchimento ("Hmm, deixa eu ver...") |

## Negócio e custo (a banca de executivos financeiros vai perguntar)

> ⚠️ **Revisto em 20/11 pelo estudo de mercado** (`reports/Mercado de IA por voz infantil.md`):
> - A Resolução CNE/CP 1/2026 (11/11/2026) aparentemente veda IA conversacional para alunos de 4 a 8 anos na escola, então o B2B2C com escolas abaixo provavelmente cai. O modelo passa a ser **B2C para a família**, com uso em casa, e escolas e franquias só indicam.
> - Avatar em vídeo no servidor não fecha a conta. Em produção, a saída é avatar 2D animado no aparelho.
> - Ainda falta conferir o texto oficial da resolução.

- **Custo:** o agente custa US\$ 0,10/min, e o avatar é cobrado à parte pelo fornecedor. 15 min/dia × 30 dias = 450 min ≈ **US\$ 45/mês só de agente**. Isso é caro para B2C no Brasil.
- **Saída sugerida para o pitch: B2B2C com escolas.** Escolas bilíngues e cursos de inglês oferecem o personagem como "reforço em casa": quem paga é a escola, e os pais confiam por ser a escola. Isso dilui o custo e resolve a confiança.
- **Alternativa B2C:** assinatura com sessões curtas (10 min/dia).
- **Roadmap:** um brinquedo ou dispositivo com o personagem (trilha "Dispositivos que escutam"). Lição de mercado: o robô **Moxie** (Embodied) encerrou as atividades em 2024, e hardware caro sem modelo sustentável não para de pé. Começamos pelo app.

## MVP para 24h

- **Base:** starter web da Agora (`agora init --template nextjs`).
- **Tela da criança:**
  - Personagem grande, quase sem texto.
  - Um botão gigante para mostrar algo à câmera.
- **Atividade principal:** "Mostra pra mim". A criança mostra um objeto, o personagem diz a palavra em inglês, a criança repete e recebe um elogio ou uma correção gentil. Depois, uma conversa livre curta.
- **Tela dos pais:** resumo da sessão (palavras aprendidas, tempo, transcrição).
- **Peças da Agora:**
  - Canal RTC.
  - Agente (ASR, LLM com visão, TTS).
  - Avatar (LemonSlice).
  - Ajuste de fim de fala.
  - Envio de imagem.
  - Transcrição ao vivo.
  - Histórico da conversa.

## Rascunho da demo (2 min)

1. A criança (ou um voluntário) diz oi, e o personagem cumprimenta misturando português e inglês.
2. A criança mostra um carrinho para a câmera: *"Car! A red car! Can you say car?"*, e a criança repete.
3. A criança **interrompe** ("eu tenho um azul também!"), e o personagem acompanha naturalmente. Isso mostra a qualidade de voz da Agora.
4. Corte para o celular dos pais: *"Hoje a Ana aprendeu 4 palavras: car, red, blue, ball"*.

## Validação (10% da nota)

- **Antes do evento:** quem tiver filhos, sobrinhos ou afilhados grava um teste curto, **com autorização dos pais e sem mostrar o rosto em público**. Isso serve para testar o reconhecimento de voz e, se der certo, vira um trecho poderoso no pitch.
- **No evento:** adultos fazem o papel de criança, e quem for pai ou mãe testa o painel. Pergunta-chave: *"você deixaria seu filho usar?"*.
- **Métricas simples:**
  - % das falas da criança entendidas.
  - Tempo de resposta.
  - Palavras repetidas corretamente.

## Decisões para o grupo

1. A faixa etária é **4 a 8 anos**?
2. Quais serão o **nome e a cara do personagem**? (Precisamos de uma imagem para o avatar.)
3. O diferencial principal é o **"mostra pra mim"** ou o **bilíngue gradual**?
4. O modelo de negócio do pitch é **escola (B2B2C)** ou **pais (B2C)**?
5. **Quem consegue gravar crianças** até amanhã?

## Até amanhã (20/11)

- [ ] Contas na Agora e no LemonSlice (trial)
- [ ] Quickstart rodando
- [ ] Teste de **pt-BR** e de **voz infantil** (riscos 1 e 2)
- [ ] Avatar animado a partir de uma imagem de mascote (risco 4)
- [ ] Envio de imagem ao agente funcionando (risco 6)
