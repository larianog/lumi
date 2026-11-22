# Lummi — Fundamentos científicos e diretrizes de aprendizagem

**Versão:** 1.0  
**Data:** 22 de novembro de 2026  
**Público-alvo:** crianças de 6 a 10 anos  
**Escopo:** tutoria por IA para resolução guiada de lições de casa

> **Compromisso do Lummi:** aprendizado guiado, autonomia conquistada.  
> **Princípio orientador:** entender hoje, lembrar amanhã, resolver sozinho.

## 1. Resumo executivo

O Lummi é um tutor infantil com IA que transforma lições de casa em experiências de aprendizagem guiada. A criança apresenta uma atividade (por exemplo, por foto), e um avatar conversacional acompanha sua resolução com perguntas, pistas, demonstrações e explicações adaptadas à dificuldade. O objetivo não é concluir a tarefa pela criança, mas ajudá-la a compreender a estratégia utilizada, aplicá-la com apoio progressivamente menor e, quando houver oportunidades, recuperar o conhecimento em sessões futuras.

O produto **não é uma plataforma de exercícios extras nem um programa independente de revisões espaçadas**. A lição de casa é o ponto de entrada e a prioridade. Estratégias de consolidação e retenção devem ser integradas à resolução e, quando pertinente, a novas lições — sem impor rotinas paralelas.

A literatura dá suporte a componentes da abordagem, como **recuperação ativa**, **prática distribuída**, **feedback formativo**, **metacognição**, **exemplos resolvidos** e **tutoria individualizada**. Entretanto, resultados dessas estratégias, muitas vezes estudadas em contextos escolares ou com tutores humanos, **não comprovam automaticamente a eficácia do Lummi ou de um avatar generativo**. Esta é uma hipótese a ser testada.

## 2. O problema pedagógico que queremos resolver

Concluir a lição de casa não significa necessariamente aprender. Uma criança pode acertar com ajuda intensa sem conseguir repetir o raciocínio depois; pode também permanecer bloqueada porque não domina um pré-requisito.

Assim, o Lummi busca equilibrar três resultados:

1. **Compreensão imediata:** a criança entende o enunciado e a estratégia necessária.
2. **Autonomia:** consegue avançar com menos pistas e resolver questões semelhantes.
3. **Retenção e transferência:** recorda o que aprendeu e aplica a estratégia em outras situações.

**Métrica inadequada como indicador isolado:** número de lições concluídas, tempo de conversa, elogios emitidos ou engajamento. Esses dados podem ajudar a avaliar usabilidade, mas não substituem indicadores de aprendizagem.

## 3. Bases científicas e implicações para o produto

### 3.1. Prática de recuperação (*retrieval practice*)

**O que é:** tentar lembrar e produzir uma resposta ou estratégia a partir da memória, em vez de apenas revisar informação apresentada novamente.

**Evidências:** a revisão de Dunlosky et al. (2013) avaliou dez técnicas de aprendizagem e atribuiu alta utilidade à prática de testes e à prática distribuída. Karpicke, Blunt e Smith (2016) investigaram diretamente crianças no ensino fundamental e encontraram benefícios da recuperação em relação ao reestudo em condições experimentais.

**Aplicação no Lummi:** após ajudar a criança a concluir uma atividade, pedir que recorde a regra utilizada ou resolva uma variação curta sem olhar a explicação, desde que isso não crie carga excessiva. Se ela não se lembrar, oferecer feedback e uma nova oportunidade.

**Exemplo:** após ordenar palavras alfabeticamente, perguntar: “Como você descobre qual palavra vem primeiro?”; em seguida, se apropriado, apresentar duas palavras diferentes.

**Limite:** repetir a mesma explicação não é o mesmo que recuperação ativa; acertar com pistas também não demonstra recordação independente.

### 3.2. Prática espaçada (*spaced practice*)

**O que é:** retomar conhecimento em momentos diferentes, em vez de concentrar toda a prática numa única ocasião.

**Evidências:** Dunlosky et al. (2013) identificaram alta utilidade da prática distribuída em diferentes situações de aprendizagem.

**Aplicação no Lummi:** quando uma lição futura abordar competência relacionada, fazer uma recuperação breve e contextual antes de oferecer ajuda. A retomada deve servir à atividade atual.

**Exemplo:** uma semana depois, em outra tarefa que envolva ordem alfabética: “Você lembra o que costumamos comparar primeiro?”

**Limite central:** **uma pergunta no fim da mesma sessão não constitui espaçamento entre sessões**. Caso não haja retorno ao tema, o Lummi não poderá assegurar revisão espaçada. Revisões agendadas e notificações são possibilidades futuras, não condição para o MVP.

### 3.3. Feedback formativo

**O que é:** informar à criança o que já conseguiu fazer, onde está a dificuldade e qual próximo passo pode tentar, permitindo que use a informação para melhorar.

**Evidências:** a Education Endowment Foundation (EEF) sintetiza extensa pesquisa indicando benefícios médios do feedback quando bem implementado. Impactos médios em “meses de progresso” são equivalentes estatísticos, **não garantias de aceleração individual**.

**Aplicação no Lummi:** evitar só “certo/errado”; dar uma pista ligada ao erro específico e solicitar nova tentativa. Valorizar o raciocínio sem elogiar indiscriminadamente qualquer resposta.

**Exemplo:** “Você comparou as últimas letras. Neste exercício, qual parte das palavras precisamos observar primeiro?”

**Limite:** feedback incorreto, prolixo ou prematuro pode prejudicar a aprendizagem. O tutor deve reconhecer incerteza e pedir ajuda do responsável quando necessário.

### 3.4. Metacognição e autorregulação

**O que é:** planejar, monitorar e avaliar o próprio processo de aprendizagem.

**Evidências:** a EEF classifica metacognição e autorregulação como abordagens de alto impacto médio e ressalta que são mais úteis quando ensinadas no contexto de conteúdos curriculares concretos.

**Aplicação no Lummi:** incorporar questões de planejamento e verificação durante a lição: “O que a questão pede?”, “Qual é o primeiro passo?”, “Como podemos conferir?”, “O que você faria numa questão parecida?”.

**Limite:** perguntas metacognitivas não devem virar um interrogatório mecânico. Crianças mais novas podem precisar de demonstração e linguagem simples.

### 3.5. Exemplos resolvidos, instrução explícita e retirada gradual do apoio

**O que é:** apresentar uma estratégia de resolução claramente, inicialmente com apoio maior, e transferir progressivamente o trabalho à criança.

**Evidências:** Barbieri et al. (2023) sintetizaram 43 artigos, 55 estudos e 181 estimativas de efeito sobre exemplos resolvidos em matemática, abrangendo vários níveis de escolaridade. Os resultados, em média, favorecem exemplos resolvidos em determinadas condições.

**Aplicação no Lummi:** não impor a regra absoluta de “nunca mostrar como fazer”. Se a criança não tiver conhecimento prévio, demonstrar a estratégia **em um exemplo diferente do item da lição**, guiar uma tentativa e depois deixá-la executar a própria atividade. Reduzir pistas conforme demonstrar compreensão.

**Sequência ilustrativa:**

- **Iniciante:** “Vou te mostrar com duas outras palavras.”
- **Em desenvolvimento:** “Qual seria o próximo passo?”
- **Mais independente:** “Tenta resolver e depois me explica como pensou.”

**Limite:** a sequência é uma proposta de design pedagógico do Lummi, não um protocolo específico cuja eficácia já tenha sido demonstrada.

### 3.6. Linguagem oral e diálogo estruturado

**O que é:** usar interação verbal intencional para apoiar vocabulário, explicação de ideias e compreensão.

**Evidências:** a EEF reúne evidências sobre intervenções de linguagem oral, com benefícios médios em desfechos educacionais, particularmente relevantes nos primeiros anos escolares.

**Aplicação no Lummi:** voz como interface acessível; convidar a criança a nomear pistas, explicar raciocínios e expressar dúvidas. Apoiar com recursos visuais quando necessário.

**Limite:** uma conversa livre com IA **não é equivalente** a uma intervenção oral pedagogicamente estruturada. Qualidade da mediação importa mais do que quantidade de falas.

### 3.7. Tutoria individualizada

**O que é:** orientação responsiva às necessidades e dificuldades do aluno.

**Evidências:** a metanálise de Nickow, Oreopoulos e Quan (2024) encontrou resultados positivos em experimentos de tutoria no ensino básico, mas grande parte da literatura refere-se a tutoria humana.

**Aplicação no Lummi:** adaptar pistas e explicações ao desempenho observado na sessão, não apenas à idade declarada.

**Limite:** não extrapolar efeitos de tutores humanos para um agente generativo.

### 3.8. Gamificação e avatar

**O que sabemos:** elementos lúdicos podem favorecer motivação e adesão, mas sua relação com aprendizagem é mais heterogênea. Avatar, expressões e voz não devem ser tratados como evidência automática de ganho cognitivo.

**Aplicação no Lummi:** o avatar deve melhorar acolhimento, clareza e disposição para tentar novamente, sem estimular uso prolongado como objetivo em si.

**Limite:** medir separadamente engajamento e aprendizagem. A evolução para avatar em vídeo é questão de experiência e tecnologia, não o núcleo do compromisso pedagógico.

### 3.9. Sistemas inteligentes de tutoria e IA generativa

**Evidências:** revisão sistemática de 2025 publicada em *npj Science of Learning* encontrou resultados geralmente positivos de sistemas inteligentes de tutoria na educação K–12, com resultados menos consistentes em comparação com outros sistemas de tutoria. A base específica para crianças mais novas é restrita; ITS tradicionais também não devem ser equiparados diretamente a chatbots de IA generativa.

**Implicação:** testar se o Lummi executa corretamente intervenções pedagógicas, e não apenas se conversa com naturalidade.

## 4. Nosso compromisso pedagógico

> **Aprendizado guiado, autonomia conquistada.**

O Lummi assume cinco compromissos:

1. **Aprendizagem acima da conclusão da tarefa:** ajudar a compreender, não só terminar.
2. **Autonomia acima da dependência:** dar apoio suficiente e retirá-lo gradualmente.
3. **Métodos informados por evidências:** aplicar princípios estudados e reconhecer limites de generalização.
4. **Retenção sem sobrecarregar:** aproveitar a lição atual e oportunidades futuras de retomada, sem impor mais deveres.
5. **Respeito e segurança:** linguagem adequada à idade, erros tratados como oportunidades de aprender, privacidade infantil e papel complementar ao de professores e responsáveis.

**Importante:** “não dar respostas prontas” é uma preferência de interação, não uma proibição pedagógica absoluta. Em certas situações, demonstrar um exemplo análogo e explicar explicitamente é o melhor suporte. A criança deve realizar o item da própria lição sempre que possível.

## 5. Jornada do produto e metodologia integrada

### Fluxo de quatro etapas

**1. O responsável envia a lição**  
Foto ou arquivo da atividade escolar.

**2. O Lummi entende a atividade**  
Reconhece enunciado, conteúdo, objetivo e possíveis pré-requisitos; confirma trechos ambíguos antes de orientar.

**3. A criança aprende resolvendo**  
Por voz e recursos visuais, o tutor pergunta, escuta, oferece pistas, explica e demonstra com exemplos alternativos quando necessário. A criança resolve um exercício de cada vez.

**4. A compreensão é verificada e o aprendizado pode ser retomado**  
Ao concluir, o Lummi faz uma checagem curta de compreensão ou autonomia. Se uma próxima lição abordar habilidade relacionada, recupera brevemente o que foi aprendido antes de avançar.

### Formulação concisa para apresentação

> **4. A criança consolida o que aprendeu**  
> Ao finalizar a lição, o Lummi verifica a compreensão e incentiva a autonomia. Em atividades futuras, retoma conhecimentos anteriores quando forem relevantes.

### Regras de experiência

- Priorizar a tarefa enviada; não exigir exercícios extras.
- Trabalhar **um exercício por vez**, respeitando o momento da criança.
- Começar investigando o que ela já sabe, sem presumir domínio.
- Se houver bloqueio persistente, **mudar o tipo de ajuda**: pista → decomposição → exemplo análogo explicado → tentativa guiada.
- Evitar sequência infinita de perguntas; usar explicações claras quando necessário.
- Não revelar diretamente a solução da lição por conveniência, mas jamais esconder informação relevante de forma contraproducente.
- Antes de avançar para outro item, verificar se a criança conseguiu concluir o anterior.
- No encerramento, usar **uma checagem breve e proporcional**, não uma segunda lição.

## 6. Retenção dentro de sessões de lição de casa

### Mecanismo A — Checagem de compreensão na própria sessão

**Gatilho:** conclusão do item ou da tarefa.  
**Comportamento:** convidar a criança a explicar a estratégia ou resolver uma variação muito curta, quando apropriado.  
**Objetivo:** distinguir acerto acompanhado de compreensão independente.  
**Base:** recuperação ativa, metacognição e feedback formativo.  
**Restrição:** não chamar esse passo de prática espaçada.

### Mecanismo B — Recuperação contextual em outra lição

**Gatilho:** nova tarefa que mobiliza competência previamente trabalhada.  
**Comportamento:** fazer uma pergunta de recordação antes de apresentar a pista.  
**Objetivo:** recuperar o conhecimento depois de um intervalo real e aplicá-lo ao problema atual.  
**Base:** prática de recuperação e espaçamento.  
**Restrição:** não revisar automaticamente temas não relacionados.

### Mecanismo C — Menos ajuda quando houver evidência de domínio

**Gatilho:** criança resolve adequadamente itens ou habilidades semelhantes.  
**Comportamento:** começar com menor nível de intervenção; aumentar apoio se a criança demonstrar necessidade.  
**Objetivo:** desenvolver autonomia e evitar dependência.  
**Base:** tutoria adaptativa, instrução guiada e retirada gradual do apoio.  
**Restrição:** não interpretar uma única resposta correta como domínio estável.

### Exemplo de aplicação: ordem alfabética

**Sessão 1:** a criança envia uma atividade de ordenar palavras. O Lummi observa que ela compara letras inadequadamente. Apresenta a regra usando palavras diferentes, acompanha a tentativa e pede uma explicação curta ao final.

**Sessão 2, dias depois:** a criança envia outra lição com ordem alfabética. Antes de orientar, o Lummi pergunta qual estratégia ela utilizaria. Se conseguir, reduz as pistas; se não, oferece apoio e feedback.

**Observação:** o produto não precisa criar uma sessão exclusiva para “revisar ordem alfabética”. O próprio contexto escolar pode oferecer a oportunidade de retomada — mas a ocorrência e a periodicidade dessas oportunidades não são garantidas.

## 7. Requisitos de produto e prioridades

| Recurso | Comportamento esperado | Prioridade sugerida |
|---|---|---|
| Interpretação da atividade | Ler foto/arquivo e verificar ambiguidades | P0 |
| Diagnóstico durante a conversa | Identificar conhecimento prévio e ponto de dificuldade | P0 |
| Guia progressivo | Alternar pistas, explicações e exemplos análogos | P0 |
| Feedback formativo | Responder a tentativas com orientação acionável | P0 |
| Checagem final | Observar compreensão ou aplicação independente | P0 |
| Registro resumido de competências | Guardar conteúdo, dificuldades, nível de ajuda e evidências de domínio com privacidade | P1 |
| Retomada contextual | Relembrar habilidade relevante numa nova lição | P1 |
| Revisão agendada/notificações | Sessões específicas de revisão optativas | Roadmap, não essencial |
| Gamificação | Elementos lúdicos subordinados à aprendizagem | P2 |

**Regra de escopo:** caso o histórico de competências ainda não esteja disponível, o MVP pode trabalhar apenas com verificação na sessão e autonomia local. Não comunicar retomada entre sessões como funcionalidade entregue antes de implementá-la.

### Registro de aprendizagem (proposta mínima)

```yaml
competencia: "ordem_alfabetica"
contexto: "atividade escolar enviada pelo responsavel"
data_da_sessao: "YYYY-MM-DD"
observacao: "comparou letras iniciais apos uma pista"
nivel_de_ajuda: "pista"
checagem_independente: "nao_demonstrada"
retomada_futura: "quando_relevante"
```

Esses dados são **ilustrativos**. Guardar apenas o estritamente necessário; prever consentimento dos responsáveis, controles de exclusão e políticas adequadas à proteção de dados infantis.

## 8. Como medir sucesso de aprendizagem

### Métricas por sessão

- **Conclusão com compreensão:** resolveu e conseguiu justificar a estratégia em linguagem adequada à idade.
- **Nível de ajuda:** quantas e quais intervenções foram necessárias (pistas, demonstrações, instrução explícita).
- **Aplicação independente:** resolveu um item equivalente ou uma variação curta sem auxílio inicial.
- **Qualidade do tutor:** adequação ao enunciado, precisão das explicações, feedback útil, ausência de respostas antecipadas.

### Métricas entre sessões

- **Retenção tardia:** após 7 ou 14 dias, recorda/aplica a competência sem auxílio.
- **Transferência:** consegue aplicar a estratégia a novos problemas, diferentes da lição original.
- **Evolução de autonomia:** precisa de menos ajuda em tarefas comparáveis, controlando dificuldade.

### Indicadores complementares

- Satisfação dos responsáveis e da criança.
- Proporção de sessões concluídas sem frustração excessiva.
- Tempo de tarefa, interpretado com cautela: menor duração nem sempre significa maior aprendizagem.

### Princípio de mensuração

**Não confundir conclusão de exercício, resposta correta, engajamento e aprendizagem retida.** São construtos relacionados, mas distintos.

## 9. Proposta de validação metodológica

### Questão de pesquisa

> Crianças que utilizam o Lummi com tutoria guiada apresentam maior compreensão, autonomia e retenção do que crianças que recebem ajuda convencional ou utilizam um chatbot sem protocolo pedagógico?

### Desenho inicial sugerido

Experimento controlado, idealmente com randomização, em condições comparáveis:

- **Grupo A:** apoio habitual para lição de casa.
- **Grupo B:** chatbot conversacional de apoio sem protocolo pedagógico estruturado.
- **Grupo C:** Lummi com protocolo pedagógico (diagnóstico, ajuda progressiva, feedback e verificação).

**Atenção ética:** a comparação com um chatbot genérico exige medidas de segurança equivalentes. Uma fase inicial de viabilidade com especialistas e famílias deve preceder estudo com crianças em escala maior.

### Desfechos e metodologia

1. Pré-teste de conhecimentos e habilidades.
2. Sessão com tarefas equivalentes entre grupos, registrando duração e tipo de ajuda.
3. Pós-teste imediato **sem ajuda**.
4. Teste tardio após 7 ou 14 dias **sem ajuda**, com itens novos.
5. Avaliação de transferência para problemas não idênticos.
6. Análise da independência do aluno e dos erros do tutor.

**Desfecho primário recomendado:** desempenho no teste tardio sem auxílio.  
**Desfechos secundários:** pós-teste imediato, transferência, nível de ajuda, satisfação, segurança.

### Cuidados de rigor

- Definir hipóteses e desfecho primário previamente (pré-registro quando adequado).
- Fazer cálculo de tamanho de amostra/poder estatístico; não atribuir tamanho arbitrário.
- Usar instrumentos apropriados à faixa etária e ao conteúdo.
- Considerar idade, alfabetização, nível prévio e dificuldade do exercício.
- Usar avaliação cega quando possível; relatar perdas, adesão e limitações.
- Buscar revisão ética apropriada, consentimento dos responsáveis e assentimento da criança quando aplicável.
- Tratar segurança, acurácia e proteção de dados como condições indispensáveis.

## 10. O que podemos afirmar — e o que não podemos

### Afirmações adequadas

- “O Lummi foi desenhado com base em princípios da ciência da aprendizagem.”
- “A proposta prioriza resolução guiada, compreensão e autonomia.”
- “A retenção será favorecida por checagens de recuperação e retomadas contextuais, quando disponíveis.”
- “A eficácia educacional do produto ainda será avaliada.”

### Evitar antes da validação

- “Comprovadamente aumenta o aprendizado em X%.”
- “Garante que a criança memorizará o conteúdo.”
- “Substitui professor, responsável ou reforço escolar especializado.”
- “Oferece revisão espaçada a todas as crianças” sem histórico ou agendamento efetivos.
- “A IA segue sempre a melhor metodologia” sem avaliação e monitoramento.

## 11. Descrição curta do produto

> **Lummi — aprendizado guiado que começa na lição de casa**  
> O Lummi é um tutor infantil com IA que transforma lições de casa em experiências de aprendizagem guiada. Por voz e recursos visuais, acompanha crianças de 6 a 10 anos com perguntas, pistas e explicações adaptadas às suas dificuldades. Fundamentado em princípios da ciência da aprendizagem, busca desenvolver compreensão, autonomia e retenção do conhecimento. O projeto está em desenvolvimento e sua eficácia educacional ainda será avaliada.

## 12. Referências científicas e fontes

Abaixo estão referências diretamente úteis para orientar o produto. Metanálises e revisões sintetizam múltiplos estudos, mas têm limitações de generalização; as diretrizes da EEF resumem resultados de intervenções variadas, não de LLMs infantis especificamente.

1. **Dunlosky, J., et al. (2013).** *Improving Students' Learning With Effective Learning Techniques: Promising Directions From Cognitive and Educational Psychology*. Psychological Science in the Public Interest, 14(1), 4–58. Revisão de técnicas de aprendizagem; destaque para prática de testes e prática distribuída. https://doi.org/10.1177/1529100612453266
2. **Karpicke, J. D., Blunt, J. R., & Smith, M. A. (2016).** *Retrieval-Based Learning: Positive Effects of Retrieval Practice in Elementary School Children*. Frontiers in Psychology, 7, 350. Evidência experimental em crianças do ensino fundamental. https://doi.org/10.3389/fpsyg.2016.00350 — texto completo: https://pmc.ncbi.nlm.nih.gov/articles/PMC4786565/
3. **Barbieri, C. A., et al. (2023).** *A Meta-analysis of the Worked Examples Effect on Mathematics Performance*. Educational Psychology Review, 35, artigo 11. Metanálise de exemplos resolvidos. https://doi.org/10.1007/s10648-023-09745-1
4. **Nickow, A., Oreopoulos, P., & Quan, V. (2024).** *The Promise of Tutoring for PreK–12 Learning: A Systematic Review and Meta-Analysis of the Experimental Evidence*. American Educational Research Journal. Metanálise de experimentos com tutoria, majoritariamente humana. https://doi.org/10.3102/00028312231208687
5. **Education Endowment Foundation (EEF).** *Metacognition and Self-regulation — Teaching and Learning Toolkit*. Síntese aplicada de evidências para educação. https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/metacognition-and-self-regulation
6. **Education Endowment Foundation (EEF).** *Feedback — Teaching and Learning Toolkit*. Síntese sobre feedback formativo. https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/feedback
7. **Education Endowment Foundation (EEF).** *Oral Language Interventions — Teaching and Learning Toolkit*. Síntese sobre aprendizagem mediada pela linguagem oral. https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/oral-language-interventions
8. **Education Endowment Foundation (EEF).** *Metacognition and Self-Regulated Learning — Guidance Report*. Recomendações pedagógicas para ensinar monitoramento e planejamento. https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/metacognition
9. **A systematic review of AI-driven intelligent tutoring systems (ITS) in K-12 education (2025).** *npj Science of Learning*, 10, artigo 29. Revisão sobre resultados e limites de sistemas inteligentes de tutoria. https://doi.org/10.1038/s41539-025-00320-7
10. **National Reading Panel (2000).** *Teaching Children to Read*. Fonte de base para alfabetização, com cautela na transferência de resultados obtidos em inglês para português brasileiro. https://www.nichd.nih.gov/publications/pubs/nrp/findings

### Leituras prioritárias para o time

- **Produto e pedagogia:** Dunlosky (2013); EEF Metacognição; EEF Feedback.
- **Comportamento do tutor:** Barbieri et al. (2023); Karpicke et al. (2016).
- **Validação e limitações de extrapolação:** Nickow et al. (2024); revisão ITS de 2025.

---

## 13. Decisões consolidadas nesta discussão

- O nome do produto é **Lummi**.
- O Lummi é um **tutor de resolução guiada de lição de casa**, não um gerador de respostas nem uma plataforma independente de revisão.
- O responsável envia a atividade; a criança conduz a resolução com acompanhamento por voz e recursos visuais.
- **Autonomia e retenção** são objetivos pedagógicos; não basta contar exercícios concluídos.
- O tutor deve fazer perguntas, mas **não apenas perguntas**: pode explicar e demonstrar com exemplos análogos quando necessário.
- O apoio deve diminuir quando houver evidências de compreensão.
- O encerramento pode incluir checagem breve, sem transformar a sessão em mais dever de casa.
- A retomada de conhecimento em dias posteriores acontece **quando houver contexto e funcionalidade para isso**; não precisa ser obrigatória.
- O avatar é parte da experiência; a metodologia pedagógica é o diferencial central.
- A proposta será apresentada como **fundamentada em evidências**, não como eficácia já comprovada do produto.
