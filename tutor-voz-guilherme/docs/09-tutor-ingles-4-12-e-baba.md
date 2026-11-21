# Tutor de inglês de 4 a 12 anos, e existe mercado de babá?

> Estudo de 20/11/2026. Continua o [doc 08](08-ideia-escolhida-avatar-infantil.md) e o [estudo de mercado](../reports/Mercado%20de%20IA%20por%20voz%20infantil.md). Itens marcados com ⚠️ não foram verificados na fonte oficial.

## Resumo do estudo de mercado (5 pontos)

1. **Escola:** uma resolução do CNE (11/11/2026) restringe IA para alunos pequenos na escola. **O modelo vira família, com uso em casa.** Escolas e franquias só indicam.
2. **Custo:** avatar em vídeo no servidor não cabe numa assinatura brasileira. **Vídeo só na demo. Em produção, personagem animado no próprio aparelho**, com sessões curtas e preço testado entre R$ 79 e R$ 99.
3. **Impostos:** cada R$ 1 pago a fornecedor estrangeiro custa cerca de **R$ 1,35**.
4. **Posicionamento:** o mundo está apertando a IA "amiga da criança". **Somos tutor de inglês para brincar junto, não amigo.**
5. **Espaço:** não há startup brasileira forte no tema. O concorrente mais perto é o **Buddy.ai** (estrangeiro, com app em português).

## Parte 1: ampliar para 10–12 anos?

**Sim, e é provavelmente a melhor decisão do produto.** Propomos de **4 a 12 anos em duas trilhas**:

| | **Trilha "Brincar" (4–7)** | **Trilha "Missões" (8–12)** |
| --- | --- | --- |
| Criança | Ainda não lê bem; voz é a única interface | Lê, tem celular, quer autonomia |
| Atividade | "Mostra pra mim": objeto → palavra em inglês → repetir | Missões de conversa com objetivo: pedir comida num restaurante em Londres, entrevistar um jogador de futebol, descrever o próprio jogo favorito |
| Idioma | Muito português e palavras soltas em inglês | Mais inglês; o português só para destravar |
| Personagem | Mascote fofo | Algo menos infantil, ou a criança escolhe entre alguns personagens. Criança de 11 anos acha mascote fofo "coisa de bebê" |
| Progresso | Palavras aprendidas | Nível de fala com metas claras. Pode seguir os exames Cambridge para crianças (Starters, Movers e Flyers, níveis pré-A1 a A2, feitos para 7–12 anos) |
| Adulto | Por perto, sempre | Painel dos pais; a criança pode usar sozinha |

### Por que 8–12 anos fortalece o produto

1. **O reconhecimento de voz funciona melhor.** O erro de 44% vem de crianças de 4 a 7 anos (⚠️ fonte secundária). Aos 10–12 a fala é mais clara e mais próxima da adulta. **É o nosso maior risco técnico diminuindo.** E, no evento, um adulto imitando uma criança de 11 anos convence muito mais do que imitando uma de 5.
2. **A dor é mais clara: "meu filho estuda inglês há anos e não fala".** A escola ensina leitura e gramática. Falar exige alguém do outro lado, e esse alguém é caro (professor) ou não existe em casa. O agente de voz resolve exatamente isso.
3. **Há um buraco entre os apps infantis e os de adultos:**
   - O Buddy.ai e o Lingokids são para os pequenos.
   - O Praktika (US\$ 35,5 mi em 2024, com avatares) e o Speak são para adultos.
   - A Novakid lançou em abril de 2026 o **NovaPals**, um app de conversa com IA, mas **a partir dos 13 anos**: para quem "já saiu dos apps infantis".
   - **De 9 a 12 anos ninguém ocupa bem.**
4. **A escola volta a ser possível a partir do 6º ano.** Pelas notícias da resolução do CNE:
   - **Educação Infantil:** proibido, mesmo com professor.
   - **1º ao 5º ano (até ~10 anos):** proibido usar sozinho. Há divergência sobre o uso mediado: a notícia de setembro permite atividade conduzida pelo professor, e a de novembro proíbe até isso.
   - **6º ao 9º ano (11–14 anos):** **permitido em atividades mediadas por professor**, só o uso autônomo é vedado.

   Isso abre um canal B2B2C para 11–12 anos, na escola e com professor. ⚠️ Falta o texto oficial do DOU.
5. **A resolução vale para escolas, não para a família.** As notícias falam em "sistemas de ensino e instituições educacionais". Nenhuma cita uso doméstico, cursos livres de idiomas ou app vendido aos pais. ⚠️ Ainda é a nossa leitura das notícias, não um parecer jurídico.
6. **O preço fica mais aceitável.** Pais de 9–12 anos já pagam franquia de inglês (R$ 250–360/mês). Um app de fala que complementa o curso é uma venda mais fácil do que um app para uma criança de 4 anos.

### O que muda de risco com 10–12 anos

- **Mais autonomia significa mais risco de virar "amigo".** A criança fica sozinha e conversa sobre tudo. A Character.AI tirou de menores de 18 anos o chat livre com personagens (anunciado em 10/2025), e há projeto no Senado dos EUA para proibir companheiros de IA para menores (GUARD Act). **Resposta:** conversa sempre com missão e objetivo, sem chat aberto. Fim de missão, fim de sessão.
- **Tentativas de "quebrar" o personagem.** Criança de 11 anos testa limites, com palavrão, temas adultos e "finge que você é...". Precisamos de regras fortes no prompt e de alertas no painel dos pais.
- **A lei continua valendo inteira.** O ECA Digital cobre todos os menores de 18 anos, a LGPD exige consentimento dos pais e, nos EUA, o COPPA protege menores de 13. Nada fica mais leve.
- **Concorrência maior.** O Duolingo e o próprio ChatGPT estão ao alcance de um pré-adolescente. O nosso diferencial é a conversa por voz, guiada, segura e com painel dos pais.

### Recomendação para o hackathon

- **No pitch:** "tutor de conversação em inglês para crianças de 4 a 12 anos, em duas trilhas".
- **Na demo: liderar com a trilha 8–12.** O reconhecimento de voz é mais confiável, um adulto consegue fazer o papel, a dor ("não fala inglês") é óbvia para a banca e o canal escola (6º ano) volta a existir.
- **O "mostra pra mim" continua.** Na trilha 8–12, vira desafio: "descreva isso em inglês". *"It's a red car... it's fast."* → *"Great! Can you tell me where you play with it?"*
- **A trilha 4–7 aparece em 10 segundos ou num slide**, como expansão. Não testamos o suficiente para mostrar ao vivo.

## Parte 2: existe mercado de babá?

### Resposta curta

- **Babá humana:** sim, e grande.
- **"Babá de IA":** não, e quem tenta se queima.
- **Por baixo da palavra "babá" existe uma demanda real e enorme:** ocupar a criança por 15 a 30 minutos enquanto o adulto faz outra coisa. Hoje quem faz isso é a tela.

### Os dados

**Babá humana no Brasil**
- O preço por hora fica entre R$ 18 e R$ 30, com média de cerca de R$ 25. São estimativas atribuídas à Sitly e à Babysits, ⚠️ citadas por sites secundários.
- Também existe o mercado CLT de babá fixa.
- É um mercado de **confiança e presença física**. Nada que uma IA substitua.

**"Babá de IA" e companheiros de IA para crianças**
- **Tamanho:** o mercado de "dispositivos companheiros de IA para crianças" é pequeno, cerca de US\$ 300 mi em 2026 segundo uma única consultoria (⚠️).
- **Players:**
  - O Miko segue vendendo.
  - O Moxie fechou.
  - Na China surgiu o AiMe (TCL), para crianças de 3 a 8 anos.
- **Recuos e críticas:**
  - A Mattel com a OpenAI **adiou** o primeiro produto e diz estar indo com cautela.
  - A Common Sense classificou brinquedos de IA como "inaceitáveis".
- **Regulação:** a Califórnia aprovou moratória para brinquedos com chatbot (2027–2030), e a Character.AI saiu do público menor de idade.

**O que os pais fazem hoje**
- **94% das crianças de 4 a 6 anos usam telas todos os dias, por 2 a 3 horas** (Datafolha/Fundação Maria Cecilia Souto Vidigal, 2025).
- 70% dos cuidadores querem reduzir esse tempo, mas não conseguem por sobrecarga e falta de alternativa (⚠️ pesquisa citada pelo Correio Braziliense).
- **81% dos pais já usaram IA para alguma tarefa de cuidar dos filhos** (Lurie Children's Hospital, EUA).

### Por que não vender "babá de IA"

1. **Promessa impossível.** A IA não vê se a criança se machucou, não abre a porta e não liga para ninguém. Prometer cuidado é prometer o que o produto não entrega, e isso gera responsabilidade jurídica se algo acontecer.
2. **Contra a lei e a tendência.** O ECA Digital, a resolução do CNE, a Califórnia, a Character.AI e a Common Sense apontam na mesma direção: IA não pode ser vínculo nem cuidador de criança.
3. **A banca e os pais rejeitam.** "IA que cuida do seu filho" assusta. "IA que ensina inglês enquanto você faz o jantar" vende.

### Como usar a demanda "babá" sem ser babá: tela ativa

O argumento honesto:

> *"Seu filho já passa 2 horas por dia na tela. Troque 20 minutos de vídeo passivo por 20 minutos falando inglês com um personagem. Você continua por perto, e no final vê no celular o que ele aprendeu."*

- **Não promete supervisão.** Promete uma **tela melhor**.
- O painel dos pais transforma a culpa ("deixei no celular") em orgulho ("aprendeu 5 palavras").
- Encaixa nas duas trilhas, e principalmente na 4–7, que é onde a "babá" mais aparece.

## Decisões para o grupo

1. Ampliar para **4–12 em duas trilhas**? (Recomendação: sim.)
2. Liderar a demo com a **trilha 8–12**? (Recomendação: sim, com o "mostra pra mim" como desafio de descrição.)
3. Trocar "babá/companhia" por **"tela ativa"** no pitch? (Recomendação: sim.)
4. Usar os níveis Cambridge (Starters, Movers e Flyers) como **régua de progresso** no roadmap?

## Fontes

- Resolução do CNE:
  - [Atlas Público (12/11/2026)](https://atlaspublico.com.br/noticias/cne-institui-diretrizes-para-uso-de-ia-na-educacao-com-101648)
  - [Jornal do Comércio (09/2026)](https://www.jornaldocomercio.com/geral/2026/09/1261901-conselho-nacional-de-educacao-proibe-uso-autonomo-de-ia-por-alunos-ate-o-5-ano.html)
  - [Revista Viva](https://viva.com.br/carreira-e-educacao/cne-aprova-regras-para-ia-na-educacao-e-define-niveis-de-risco.html)
  - Texto no DOU, ainda não lido: [in.gov.br](https://www.in.gov.br/web/dou/-/resolucao-cne/cp-n-1-de-11-de-novembro-de-2026-744136563)
- Concorrentes de inglês com IA:
  - [Novakid NovaPals, 13+ (PR Newswire, 04/2026)](https://www.prnewswire.com/il/news-releases/novakid-launches-novapals-an-ai-native-conversational-app-designed-for-independent-english-speaking-practice-302747116.html)
  - [Buddy.ai (TechCrunch, 10/2024)](https://techcrunch.com/2024/10/31/buddy-ai-is-using-ai-and-gaming-to-help-children-learn-english-as-a-second-language)
  - [Praktika (TechCrunch, 05/2024)](https://techcrunch.com/2024/05/22/praktika-raises-35-5m-to-use-ai-avatars-to-make-learning-languages-feel-more-natural)
  - [Open English (IstoÉ Dinheiro, 02/2026)](https://istoedinheiro.com.br/open-english-ceo-ia-governos-13226)
  - [Cultura Inglesa com OpenAI (Baguete)](https://www.baguete.com.br/public/noticias/cultura-inglesa-cria-assistente-com-openai)
- [Exames Cambridge para crianças](https://www.cambridgeenglish.org/exams-and-tests/qualifications/young-learners/)
- Companheiros de IA e "babá de IA":
  - [Character.AI (Fortune, 10/2025)](https://fortune.com/2025/10/29/character-ai-ban-children-teens-chatbots-regulatory-pressure-age-verification-online-harms)
  - [Mattel e OpenAI adiando o produto (Stocktwits)](https://stocktwits.com/news-articles/markets/equity/mattel-openai-product-launch-slips-beyond-holiday-2025-as-toymaker-takes-cautious-approach-to-ai-report/cLe4WCZREou)
  - [Brookings](https://www.brookings.edu/articles/generation-ai-starts-early-a-guide-to-technologies-already-shaping-young-childrens-lives)
  - [Axios (07/2026)](https://axios.com/2026/07/25/ai-family-parenting-productivity)
  - [Mercado de dispositivos companheiros (360iResearch)](https://www.marketresearch.com/360iResearch-v4164/AI-Child-Companion-Device-Type-43498632)
- Babás e telas no Brasil:
  - [Preço de babá (Cidesp)](https://cidesp.com.br/conteudo/tabela-de-precos-de-baba-guia-atualizado-2026)
  - [Telas na primeira infância (Viva/Datafolha)](https://viva.com.br/tecnologia/78-das-criancas-de-ate-3-anos-passam-de-2-a-3-horas-por-dia-em-frente-as-telas.html)
  - [Pais e telas (Correio Braziliense)](https://blogs.correiobraziliense.com.br/primeirainfancia/2025/12/11/46-das-criancas-mostram-ansiedade-ligada-ao-uso-de-telas-aponta-pesquisa/)
