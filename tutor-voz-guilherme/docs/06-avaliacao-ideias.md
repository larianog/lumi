---
title: "newDirections · Avaliação das ideias"
subtitle: "UNMUTE by Agora · 21 e 22/11/2026"
---

> **Decisão do grupo (19/11):** seguimos com **avatar para crianças (ensino, companhia, línguas)**. Ver `docs/08-ideia-escolhida-avatar-infantil.md`.

# Antes de tudo: o que diz o regulamento

Fonte: [regulamento oficial](https://newhack.vc/hackathon/agora/regulamento) (versão de 17/11/2026).

**Como a banca pontua** (nota de 1 a 5 em cada item):

| Critério da banca | Peso | O que olham |
|---|:-:|---|
| Experiência de voz e interação | **25%** | Clareza, fluidez, tempo de resposta, interrupções, recuperação de falhas |
| Execução técnica e integração com a Agora | **25%** | Fluxo funcionando, integração efetiva, consistência |
| Relevância do problema e impacto | 20% | Público, problema concreto, benefício |
| Inovação e diferenciação | 15% | Quanto a voz melhora a experiência |
| Validação e potencial de evolução | 10% | Testes, aprendizados, limitações, próximos passos |
| Clareza da apresentação | 5% | Explicação e demo dentro do tempo |

**Outras regras que importam:**

- **Equipe de 3 a 5 pessoas**, todas presentes nos dois dias.
- **Uso funcional da Agora é obrigatório e precisa aparecer na demo.** Só citar a marca não vale.
- **Pitch:** 3 min de apresentação + 2 min de demo + até 3 min de perguntas.
- **Entregas até 22/11 às 12h:** descrição, até 10 slides, vídeo narrado de até 2 min e repositório público com README.
- **Código feito antes do evento:** pode ser usado, desde que seja identificado como pré-existente.
- **Simulações são permitidas,** desde que sinalizadas. Não é obrigatório ter hardware.
- **Trilhas sugeridas (opcionais):** "Agentes que fazem", "Avatares que aproximam", "Dispositivos que escutam" e "Robôs que interagem".
- **Prêmios:** US\$ 2.000, US\$ 1.000 e US\$ 500, mais créditos da Agora. **Os 3 primeiros fazem pitch num jantar da Agora para executivos do setor financeiro.**
- **No dia 22 o roteiro prevê "observar pessoas usando o protótipo".** Ideias fáceis de testar com qualquer pessoa ganham pontos em validação.

**Leitura rápida:** metade da nota (50%) é **a conversa funcionar bem e a Agora estar bem integrada**. Ideia boa com demo travando perde para ideia simples com voz fluida.

# Notas por ideia

Escala de 1 a 5, sempre "quanto maior, melhor". Em **Execução 24h**, 5 significa *fácil de entregar*. **Regulamento** é a estimativa de como a ideia pontuaria na tabela da banca acima.

| # | Ideia (autor) | Execução 24h | Rentabilidade | Uso da Agora | Regulamento | Inovação | **Total** |
|:-:|---|:-:|:-:|:-:|:-:|:-:|:-:|
| 10 | Totem de autoatendimento em drive-in (David) | 4 | 4 | 5 | 4 | 2 | **19** |
| 7 | Agente de voz para cozinha de restaurante (Guilherme) | 3 | 4 | 4 | 4 | 4 | **19** |
| 11 | Agente de cobrança e negociação (David) | 4 | 5 | 3 | 4 | 2 | **18** |
| 4 | Cegos em ambientes públicos (Guilherme) | 3 | 3 | 4 | 4 | 3 | **17** |
| 8 | Pedir comida falando livremente, estilo iFood (Larissa) | 4 | 3 | 4 | 3 | 2 | **16** |
| 5 | Atendimento por ligação, vídeo ou áudio (Guilherme) | 4 | 4 | 4 | 3 | 1 | **16** |
| 1 | Voz para quem não fala (Guilherme) — *revisada* | 3 | 2 | 3 | 3 | 4 | **15** |
| 6 | Assistente para casa ou ambientes mapeados (Guilherme) | 3 | 3 | 4 | 3 | 2 | **15** |
| 3 | Aprendizagem: línguas e música (Guilherme) | 3 | 3 | 4 | 3 | 2 | **15** |
| 9 | Agente multitarefa: compras, docs, e-mails (Larissa) | 2 | 3 | 4 | 2 | 1 | **12** |
| 2 | Dublagem com IA (Guilherme) | 2 | 4 | 1 | 2 | 2 | **11** |

> As notas são uma opinião inicial para puxar a discussão, não uma verdade. O que mais pode mudar o ranking é "Rentabilidade × Impacto": depende do que o grupo quer priorizar.

# Apontamentos por ideia

**1. Voz para quem não fala** (*revisada: caiu de 21 para 15*): a IA ouve a conversa, sugere respostas e fala no lugar da pessoa.

- **Prós:** impacto alto; pouca gente vai pensar nisso.
- **Por que caiu:**
  - Na hora de pontuar pelo regulamento, eu superestimei. **Metade da nota é "experiência de voz" e "integração com a Agora"**, e aqui a pessoa principal *não conversa por voz com o agente*. A Agora vira só "ouvir e falar", sem mostrar o que ela faz de melhor (turnos, interrupção, conversa fluida).
  - Ou a solução é simples demais (um teclado de sugestões, e já existem apps como o Livox), ou fica aberta demais (interfaces neurais).
  - Dinheiro pouco claro, validação com usuários reais difícil em 2 dias, e o motor da Agora precisaria de adaptações (ele foi feito para responder sozinho).
- **Status:** estacionada. Detalhes da exploração em `docs/07-ideia-dar-voz.md`.

**7. Cozinha de restaurante**: assistente por voz que vários cozinheiros usam ao mesmo tempo (mãos ocupadas e sujas) para saber o próximo preparo, dar baixa em etapas e organizar a ordem de saída.

- **Prós:** voz faz sentido de verdade (*hands-free*); B2B claro (SaaS para restaurantes, integração com sistema de pedidos); pouco explorado.
- **Contras:** **várias pessoas falando num ambiente barulhento** é o ponto tecnicamente mais arriscado (quem disse o quê?); demo exige simular uma cozinha.
- **Trilha:** "Dispositivos que escutam".

**10. Totem drive-in**: avatar no totem anota o pedido por voz e manda para a cozinha.

- **Prós:** a demo mais visual (avatar + pedido montando na tela); a Agora brilha aqui (avatar, cancelamento de ruído, travar na voz do motorista); negócio claro.
- **Contras:** já testado lá fora (Wendy's, Taco Bell; o McDonald's encerrou o teste com a IBM em 2024). Precisa de um diferencial: português/sotaques brasileiros, acessibilidade ou integração com a cozinha (ideia 7).
- **Trilha:** "Avatares que aproximam".

**11. Cobrança e negociação**: agente que contata o cliente, entende a situação e negocia dentro de uma política (parcelas, desconto, PIX).

- **Prós:** melhor caso de negócio; **casa com o prêmio** (jantar com executivos do setor financeiro); fácil de testar com qualquer pessoa fazendo o papel de devedor.
- **Contras:** o canal real é telefone, e ligação na Agora exige configurar telefonia (a versão nova só roda nos EUA), então a demo seria no app/web; o avatar quase não entra; mercado cheio de robôs de cobrança; atenção a CDC e LGPD.
- **Para diferenciar:** negociação empática de verdade, não "pressione 1".

**4. Cegos em ambientes públicos**: "o 875A já está chegando?", "onde fica o banheiro?", com dados reais (ex.: API da SPTrans).

- **Prós:** impacto alto; usa ferramentas com dados reais.
- **Contras:** Be My Eyes e Seeing AI já descrevem imagens; navegação dentro de shopping é difícil sem mapa.
- **Observação:** combina com a ideia 6 (ambiente mapeado).

**8. Pedir comida falando livremente (estilo iFood)**

- **Prós:** fácil de construir; demo simples.
- **Contras:** é, no fundo, o mesmo produto do totem (pedido por voz) em outro canal; a voz no celular compete com o texto, que já é rápido. O valor seria entender pedidos vagos ("algo leve até R\$ 40").

**5. Atendimento por ligação, vídeo ou áudio**

- **Prós:** caso clássico, fácil, tem mercado.
- **Contras:** é exatamente o exemplo padrão da Agora, e a banca vai ver vários. Só vale com um nicho bem definido, o que na prática vira as ideias 10, 11 ou 7.

**6. Assistente para casa ou ambientes mapeados (shows, estádios, shoppings)**

- **Prós:** "concierge de voz" para eventos e estádios é interessante.
- **Contras:** "Alexa para casa" compete com Alexa+ e Google; mapear o ambiente é trabalho pesado.
- **Observação:** a melhor versão é juntar com a ideia 4 (concierge acessível de um local).

**3. Aprendizagem (línguas e música)**

- **Línguas:** fácil e encaixa bem (tutor com avatar), mas é o mercado mais lotado (Duolingo, Speak, Praktika). Só com um nicho, ex.: simulador de entrevista em inglês.
- **Música:** reconhecimento de fala entende palavras, não notas. Alto risco de a demo falhar.

**9. Agente multitarefa (compras, documentos, e-mails)**

- **Contras:** escopo enorme (cada integração é um projeto) e briga direto com ChatGPT, Gemini e Alexa+. Difícil de diferenciar e de entregar bem em 24h.

**2. Dublagem com IA**

- **Contras:** dublagem é pós-produção, não conversa ao vivo, e a Agora não agrega nada aqui; ElevenLabs e HeyGen já dominam. Pivô possível: **tradução simultânea em chamadas**, que usa a Agora mas é concorrida.

# Combinações que valem discutir

- **"Restaurante por voz" (10 + 7 + 8):** o cliente pede no totem com avatar, e o pedido cai na cozinha, onde o agente de voz coordena os cozinheiros. Conta uma história completa, mas é escopo grande: na demo, priorizar uma ponta.
- **"Concierge acessível" (4 + 6):** agente de voz de um local (shopping, estádio, terminal) que conhece o mapa e os horários, pensado primeiro para cegos e útil para todos.
- **Padrão que diferencia:** quase todo time vai fazer "pessoa conversa com robô". O agente que **trabalha no meio de humanos** (cozinha com vários cozinheiros, negociação de cobrança) é menos óbvio e mostra bem a tecnologia da Agora.

**Leitura do top 3 pelo regulamento:**

- **Totem drive-in:** o mais forte na metade da nota que pesa mais (conversa natural + avatar + ruído = Agora brilhando). O ponto fraco é inovação.
- **Cozinha:** o mais inovador e com B2B claro. O risco é técnico (várias vozes em ambiente barulhento).
- **Cobrança:** o melhor negócio e conversa direto com o prêmio (jantar com executivos do setor financeiro). O ponto fraco é o avatar quase não entrar.
- **Totem + cozinha juntos ("restaurante por voz")** cobrem as fraquezas um do outro: o totem traz a demo e a conversa natural, a cozinha traz a inovação. Ainda junta as ideias de mais de uma pessoa do grupo.

# Sugestão de próximo passo

1. Cada um vota em **2 ideias** (ou combinações) entre as cinco primeiras.
2. Escolher **1 principal + 1 reserva** até amanhã (20/11).
3. Para a escolhida, testar antes do evento: agente falando **português** no quickstart da Agora e o ponto de maior risco da ideia (latência na 1; várias vozes na 7; ruído na 10).
