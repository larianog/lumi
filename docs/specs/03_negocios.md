# Sofia — Documento de Negócios

**Equipe:** newDirections | **Versão:** 1.1 | **Data:** 21/11/2026

Status: hipóteses de negócio, não estudo de mercado validado. Base: refinamento do produto e feedback dos mentores. Não há números de demanda, entrevistas, disposição de pagar ou receita comprovados nesta conversa.

## 1. Dor / problema

[CONTEXTO — dado público, não validação da Sofia] Em 2025, 66% dos estudantes da rede pública ao final do 2º ano atingiram o padrão nacional de alfabetização; portanto, 34% ficaram abaixo desse padrão. O indicador é agregado e considera leitura e escrita; isso não significa que todo estudante abaixo do corte “não sabe ler”. A proporção abaixo do padrão caiu de 44% em 2023 para 41% em 2024 e 34% em 2025, então o pitch deve mostrar tanto o avanço quanto a lacuna que permanece. Fonte: [Inep, resultados do Indicador Criança Alfabetizada](https://www.gov.br/inep/pt-br/acesso-a-informacao/perguntas-frequentes/avaliacao-da-alfabetizacao).

[CONTEXTO — etapa seguinte] No Saeb 2025, entre estudantes do 5º ano de todas as redes, 64,3% demonstraram aprendizagem adequada em Língua Portuguesa e 54,4% em Matemática; em outras palavras, 35,7% e 45,6%, respectivamente, não alcançaram o nível adequado usado pelo Anuário. Esses dados descrevem grupos/etapas diferentes, não acompanham longitudinalmente as mesmas crianças do 2º ao 5º ano. Fonte: [Anuário Brasileiro da Educação Básica 2026 — anos iniciais](https://anuario.todospelaeducacao.org.br/2026/capitulo-2-ef-anos-iniciais.html).

[HIPÓTESE] Muitas famílias precisam conciliar a rotina com o acompanhamento das tarefas escolares. Crianças podem ter dificuldades específicas que não são resolvidas pela leitura do enunciado e podem depender de ajuda disponível naquele momento. Responsáveis podem não conhecer a abordagem pedagógica adequada ou não conseguir oferecer atenção individualizada sempre que necessário. Os dados educacionais acima dimensionam contexto e necessidade potencial; não demonstram que falta de reforço familiar causou esses resultados, nem que Sofia os resolverá.

Um chatbot que entrega respostas pode ajudar a terminar a tarefa sem necessariamente desenvolver compreensão. O problema a investigar é a lacuna entre concluir uma lição e entender como resolver problemas semelhantes.

**Jobs to be done:** criança — entender a tarefa e conseguir avançar com autonomia; responsável — oferecer apoio acessível e compreender o progresso sem acompanhar cada minuto da lição.

## 2. Solução

Sofia transforma uma foto ou PDF da atividade escolar em sessão de reforço guiada por voz. Um avatar lê a questão, investiga a tentativa, oferece pistas progressivas, apresenta cálculos e explicações na lousa e verifica compreensão. Quando pertinente, propõe uma questão semelhante, mas nova, com menos ajuda.

Diferenciais propostos: contextualização no material enviado, interação oral em pt-BR, explicações visuais em tempo real, orientação em vez de simples resposta e evidências de transferência. Português por si só não é vantagem defensável. A hipótese de diferenciação está na qualidade pedagógica, adequação à rotina familiar, segurança e confiança.

## 3. Público-alvo

| Papel | Perfil proposto | Necessidade |
|---|---|---|
| Usuário | Crianças do 3º ao 5º ano do Fundamental | Apoio na compreensão das lições |
| Comprador B2C | Pais ou responsáveis | Apoio complementar e visibilidade de progresso |
| Influenciador | Educadores e familiares | Confiança no conteúdo e limites |
| Comprador futuro B2B | Escolas e redes | Reforço complementar, governança e alinhamento pedagógico |

Recorte de entrada: famílias brasileiras com acesso a navegador, internet e microfone, que realizam atividades de Português e Matemática. Não confundir usuário com decisor/pagador. Não há persona validada nem evidência de que renda, tipo de escola ou localização específicos sejam o melhor segmento.

## 4. Mercado

### 4.1 Categoria e auditoria competitiva inicial

Sofia se posiciona na interseção de EdTech, reforço escolar, tutoria por IA e ferramentas de apoio à lição. Substitutos incluem professor particular, reforço presencial, apoio familiar, vídeos educativos, plataformas de exercícios e chatbots generalistas.

Auditoria documental inicial feita em 21/11/2026 a partir de páginas públicas oficiais dos fornecedores. Descreve posicionamento e recursos anunciados pelos próprios produtos; não é teste independente, comparação de qualidade, pesquisa de preço no Brasil nem evidência de eficácia.

| Referência | O que comunica/oferece segundo sua página oficial | Implicação a investigar para Sofia | Limite da comparação |
|---|---|---|---|
| [Khanmigo para famílias](https://www.khanmigo.ai/parents) | Tutor com orientação em vez de resposta direta, integração ao conteúdo Khan Academy, ferramentas para responsáveis e acesso à conversa/alertas; a página também anuncia voz por fala e leitura. | “Tutor que faz perguntas” e supervisão familiar não são, por si, diferenciais exclusivos. Explorar o fluxo ancorado na folha enviada, questão atual, lousa e transferência observável. | Ecossistema de conteúdo próprio, cobertura ampla e ferramentas parentais diferem do recorte de lição enviada. Recursos, elegibilidade, preço e países atendidos podem mudar; conferir antes de decisões. |
| [Synthesis Tutor](https://www.synthesis.com/tutor) | Tutor adaptativo de matemática K–5, com orientação individual por problema, atividades multissensoriais/manipulativos e verificações de compreensão, segundo o fornecedor. | Diferenciação possível a investigar: começar no material real da criança e usar voz para ouvir a estratégia e responder a ela. | Currículo estruturado de matemática não equivale a extração de atividades escolares de múltiplas fontes; alegações de eficácia são do fornecedor. |
| [Photomath](https://photomath.com/) | Digitalização de problemas matemáticos e apresentação de soluções passo a passo, cobrindo níveis de matemática amplos, segundo o fornecedor. | Tornar explícita a diferença entre explicar passos e investigar primeiro o raciocínio da criança; não revelar resposta antes da tentativa. | Foco em matemática e resolução escaneada; a página pública não demonstra o mesmo fluxo de tutor por voz contextualizado à folha. Recursos variam por plano. |
| Chatbots generalistas | Assistência flexível por texto/voz e possibilidade de receber perguntas abertas. | A orientação pedagógica, a precisão no material-fonte e limites infantis devem ser demonstrados em cenários, não presumidos pelo uso de um modelo. | Categoria heterogênea; modelo, produto, plano e políticas variam. Não comparar sem selecionar versões específicas. |
| Reforço humano | Diagnóstico contextual, relação e adaptação conduzidos por pessoa. | Usar tutoria humana como referência para desenhar perguntas úteis e supervisão, não como promessa de equivalência. | Custos, disponibilidade e qualidade variam; Sofia é proposta complementar, não substituto comprovado. |

**Leitura estratégica provisória:** perguntas guiadas, tutoria adaptativa, leitura em voz alta e supervisão familiar já aparecem em ofertas existentes. A oportunidade mais específica a testar é combinar (1) a atividade que a família já tem, (2) conversa oral sobre o raciocínio, (3) apoio visual vinculado à questão e (4) evidência limitada de tentativa independente/assistida. Isso é hipótese de diferenciação, não vantagem defensável nem validação de demanda.

**Próxima pesquisa competitiva:** comparar versões acessíveis no Brasil usando tarefas sintéticas equivalentes; observar entrada de material, fidelidade, forma de orientar sem revelar resposta, voz/idioma, acessibilidade, controles parentais, retenção e preço total vigente. Registrar país, data, plano e fonte primária para cada observação. Não inserir dados reais de crianças em contas concorrentes.

### 4.2 Tamanho do problema e universo potencial

O Censo Escolar 2025 registra **14.514.244 matrículas nos anos iniciais (1º–5º ano)**: 11.693.406 na rede pública e 2.820.838 na privada. É um denominador demográfico útil para contextualizar escala, não o número de clientes da Sofia. O recorte de produto proposto é 3º–5º ano; portanto, será necessário obter a contagem específica dessas séries antes de chamar um número de TAM. Fonte: [Inep, Censo Escolar da Educação Básica 2025, tabelas M4/M5](https://download.inep.gov.br/publicacoes/institucionais/estatisticas_e_indicadores/notas_estatisticas_censo_escolar_da_educacao_basica_2025.pdf).

Na distribuição digital, **86% dos domicílios brasileiros tinham acesso à internet em 2025**, segundo a TIC Domicílios. Isso indica alcance potencial, não conexão estável para voz nem acesso uniforme: a pesquisa também registrou limitações de pacote de dados, especialmente relevantes ao desenhar uma experiência de baixo consumo. Fonte: [Cetic.br, TIC Domicílios 2025 — resumo executivo](https://cetic.br/media/docs/publicacoes/2/pt-br/20260511173151/tic_domicilios_2025_resumoexecutivo%20pt.pdf).

### 4.3 TAM/SAM/SOM — método e cenário ilustrativo

Usar abordagem bottom-up e separar contagem de estudantes, famílias compradoras e receita. Matrículas não equivalem a pessoas únicas, necessidade, acesso compatível, disposição de pagar ou assinaturas. A amostra pública de 1º–5º ano excede o recorte de 3º–5º da Sofia; não apresentá-la como SAM ou previsão de vendas.

| Medida | Definição para Sofia | O que falta para estimar |
|---|---|---|
| TAM | Famílias/estudantes do recorte 3º–5º com necessidade compatível, sob uma hipótese de preço declarada | Matrículas por série, definição do comprador (família vs. aluno), frequência de necessidade e evidência de pagamento |
| SAM | Parcela do TAM que pode ser atendida pelos idiomas, dispositivos, conectividade, matérias e canais realmente disponíveis | Pesquisa de acesso/compatibilidade, limitações de áudio/dados, disponibilidade do serviço e canal de aquisição |
| SOM | Parcela que a equipe consegue adquirir e atender num horizonte definido | Conversão, retenção, CAC, custo por sessão, capacidade operacional e concorrência |

**Cenário didático, não estimativa:** aplicando R$ 29,90/mês a todas as 14.514.244 matrículas de 1º–5º ano, a multiplicação resulta em cerca de R$ 5,21 bilhões de receita bruta anual teórica. Isso supõe, irrealisticamente, que cada matrícula seja uma assinatura pagante durante 12 meses; não é tamanho observado do mercado nem deve ser chamado de receita endereçável comprovada.

Também pode-se modelar a hipótese do material de mentoria (SAM = 20% do universo; SOM = 0,1% desse SAM), mas deixar ambos os percentuais explicitamente como premissas sem validação. Com a mesma mensalidade hipotética e a base ampla de 1º–5º, isso daria aproximadamente 2.903 assinaturas, R$ 86,8 mil de receita bruta mensal e R$ 1,04 milhão anualizado. Antes de usar no pitch, substituir a base por séries 3º–5º e testar os percentuais com pesquisa de necessidade, acesso e disposição de pagar. Receita bruta não é lucro e não desconta cancelamento, inadimplência, impostos, custos de voz/modelos, suporte ou aquisição.

### 4.4 Consequências e tese de oportunidade

A diferença entre alcançar e não alcançar habilidades fundamentais justifica atenção educacional e acompanhamento das aprendizagens. O UNICEF já documentou que ciclos de alfabetização incompletos podem prejudicar a trajetória escolar, incluindo reprovação e abandono; a fonte disponível nesse recorte é de 2023 e usa resultados do Saeb 2021, portanto não deve ser apresentada como estimativa atual desses desfechos. Fonte: [UNICEF Brasil — desafios da alfabetização](https://www.unicef.org/brazil/comunicados-de-imprensa/volta-as-aulas-56-das-criancas-do-2o-ano-do-ensino-fundamental-nao).

A oportunidade de Sofia é uma hipótese de acesso a apoio individualizado, usando a lição que a família já possui como ponto de entrada. Os indicadores educacionais não provam demanda comercial, causalidade, eficácia ou que a Sofia atenda crianças ainda não alfabetizadas. O produto deve permanecer dentro do recorte pedagógico declarado e encaminhar conteúdo ilegível ou além da capacidade para adulto/professor, sem alegar substituição de intervenção especializada.

## 5. Modelo de negócio

[PROPOSTA] B2C como hipótese inicial: assinatura mensal familiar com franquia de minutos/sessões, controle de consumo e experiência experimental limitada. Não implementar cobrança no hackathon.

| Modelo | Benefício | Risco |
|---|---|---|
| Assinatura com franquia | Previsibilidade e limite de custo | Uso irregular e cancelamento |
| Pacotes de sessões | Adequação a demanda pontual | Menor previsibilidade de receita |
| B2B escolar futuro | Distribuição institucional | Ciclo comercial, integração e responsabilidades adicionais |

Preço experimental para entrevistas: R$ 29, R$ 49 ou R$ 79/mês, com franquias a definir após medir custos. Valores são estímulos hipotéticos, não preços recomendados nem pesquisa realizada. Evitar plano ilimitado até conhecer distribuição de uso.

### 5.1 Unit economics

Custo mensal por família = sessões/mês × (minutos/sessão × custo efetivo de voz/minuto + custo LLM tutor por sessão + custo de extração/plano por sessão) + armazenamento + parcela de suporte e segurança. Evitar duplicar ASR/TTS/LLM se já incluídos na tarifa Agora. Incluir câmbio, impostos, gateway, reprocessamento e custos de aquisição em análise posterior.

Cenário exclusivamente ilustrativo: 12 sessões de 15 min, custo de voz hipotético R$ 0,10/min, custo adicional de documento/LLM R$ 0,50/sessão, demais custos variáveis R$ 3/mês. Total R$ 27. A R$ 49, contribuição antes de outros custos = R$ 22 (44,9%). Se voz custar R$ 0,20/min, custo sobe a R$ 45 e contribuição cai a R$ 4 (8,2%). Substituir hipóteses por medições e tarifas vigentes.

CAC = gasto de aquisição / novos pagantes. LTV simplificado somente com churn estável = contribuição mensal / churn mensal; não usar antes de evidência. Medir custo por sessão bem-sucedida, não só por minuto.

### 5.2 Aquisição e retenção

Hipóteses: demonstrações para responsáveis, comunidades de educação e indicação; parcerias escolares apenas após validação. Evitar publicidade comportamental infantil e mecanismos que incentivem dependência. Retenção deve refletir utilidade e confiança, não maximização de tempo de tela.

## 6. Validação

O feedback de mentoria de 21/11/2026 funciona como provocação qualitativa, não como entrevista com usuários nem evidência de mercado. Ele sugere testar quando uma pergunta orientadora ajuda mais que uma explicação pronta, se o valor percebido muda entre criança e responsável, e que evidência diferencia compreensão de interação longa ou acerto casual.

| Hipótese | Experimento | Evidência desejada |
|---|---|---|
| Pergunta orientadora ajuda mais que explicação pronta em momentos específicos | Comparar roteiros em cenários roteirizados com adultos; depois desenhar pesquisa apropriada e autorizada | Qualidade da intervenção no ensaio; não inferir aprendizagem infantil |
| Explicar o raciocínio e resolver uma questão nova sinalizam compreensão melhor que duração ou acerto isolado | Avaliar resposta inicial, estratégia verbal e transferência com números/contexto diferentes | Evidência observável daquela sessão; não prova domínio duradouro |
| Voz é adequada | Ensaiar hesitação, interrupção, autocorreção | Menos falhas e repetições inadequadas |
| Criança e responsável percebem valor de formas diferentes | Entrevistar adultos responsáveis e, somente após revisão ética/legal, conduzir pesquisa adequada com usuários menores | Necessidades e linguagem por papel; não equiparar intenção declarada a uso ou compra |
| Existe disposição de pagar | Entrevistar decisores e testar ofertas transparentes | Evidência de compra, não apenas elogio |
| Economia é viável | Medir minutos, chamadas, custos e retries | Margem por faixa de uso |

## 7. Riscos e governança

Extração incorreta, respostas erradas, pouca autonomia, custo elevado de voz, abandono, acesso desigual, exposição de dados e direitos autorais. Mitigar via recorte, validação de respostas, testes, limites de sessão, materiais autorizados e privacidade por desenho. Antes de operação com menores, análise especializada de LGPD, art. 14, Enunciado ANPD 1/2023, Lei 15.211/2025 (ECA Digital), fornecedores e transferências internacionais. Autorização genérica não resolve todo tratamento.

## 8. Pitch

### Sequência sugerida

1. **Problema educacional:** apresentar que, em 2025, 34% dos estudantes da rede pública ao fim do 2º ano ficaram abaixo do padrão nacional de alfabetização. Usar a definição do Inep e dizer “abaixo do padrão esperado”, sem afirmar que não sabem ler. Acrescentar os resultados do 5º ano em Português e Matemática para aproximar a narrativa do recorte da Sofia.
2. **Problema familiar e oportunidade:** mostrar a necessidade hipotética de apoio individualizado e o universo de matrículas dos anos iniciais como contexto demográfico. Explicitar que isso não é o mercado pagante validado; o acesso à internet tampouco garante conectividade adequada ou disposição a pagar.
3. **Solução:** demonstrar o produto real — envio de uma folha, leitura de uma questão, conversa por voz sobre a estratégia, pista visual, nova tentativa e questão de transferência. Distinguir capacidades implementadas das propostas ainda não construídas.

### Rascunho de narrativa

“No Brasil, em 2025, 34% dos estudantes da rede pública ao final do 2º ano não atingiram o padrão nacional de alfabetização definido pelo Inep. Nos resultados do Saeb 2025 para o 5º ano, 45,6% ficaram abaixo do nível de aprendizagem adequada em Matemática. Esses indicadores mostram uma necessidade educacional ampla; não provam uma causa única nem que uma ferramenta resolva o problema. Ao mesmo tempo, acompanhar cada tarefa de perto pode ser difícil para algumas famílias — uma hipótese que ainda precisamos validar. A Sofia parte de uma atividade que a criança já tem: ela lê uma questão, conversa sobre como a criança pensou, oferece uma pista visual e verifica uma nova tentativa. A proposta é apoiar o raciocínio e a autonomia, não entregar respostas nem substituir professor.”

Usar no slide de escala as **14,5 milhões de matrículas do 1º ao 5º ano** como universo educacional contextual, identificando série, ano e fonte. O produto proposto atende 3º–5º ano, então calcular essa base específica antes de apresentar TAM. Se mencionar preço ou penetração hipotéticos, rotular como cenário matemático, não projeção ou tração. Demonstrar comportamento observado em ensaio adulto com material fictício; não chamar isso de evidência de eficácia infantil.

## 9. Fontes educacionais e de conectividade

| Fonte primária/pública | Uso no pitch | Limite de interpretação |
|---|---|---|
| [Inep — Indicador Criança Alfabetizada / perguntas frequentes](https://www.gov.br/inep/pt-br/acesso-a-informacao/perguntas-frequentes/avaliacao-da-alfabetizacao) | Percentual de estudantes da rede pública ao final do 2º ano no padrão nacional: 56% (2023), 59% (2024), 66% (2025). | Indicador agregado de alfabetização; 34% abaixo do padrão em 2025 não quer dizer “não sabem ler”. Não é a mesma coorte entre anos. |
| [Anuário Brasileiro da Educação Básica 2026 — 5º ano](https://anuario.todospelaeducacao.org.br/2026/capitulo-2-ef-anos-iniciais.html) | Aprendizagem adequada no total das redes em 2025: Português 64,3%, Matemática 54,4%. | “Abaixo do nível adequado” é complemento percentual; não equivale a ausência total de aprendizagem. |
| [Inep — Censo Escolar 2025, tabelas M4/M5](https://download.inep.gov.br/publicacoes/institucionais/estatisticas_e_indicadores/notas_estatisticas_censo_escolar_da_educacao_basica_2025.pdf) | 14.514.244 matrículas nos anos iniciais: 11.693.406 públicas e 2.820.838 privadas. | Base de 1º–5º ano, mais ampla que o recorte 3º–5º da Sofia; matrícula não é cliente ou pagador. |
| [Cetic.br — TIC Domicílios 2025, resumo executivo](https://cetic.br/media/docs/publicacoes/2/pt-br/20260511173151/tic_domicilios_2025_resumoexecutivo%20pt.pdf) | 86% dos domicílios com acesso à internet em 2025. | Acesso domiciliar não garante estabilidade, pacote de dados, microfone/dispositivo adequado nem acesso individual da criança. |
| [UNICEF Brasil — contexto de trajetória escolar](https://www.unicef.org/brazil/comunicados-de-imprensa/volta-as-aulas-56-das-criancas-do-2o-ano-do-ensino-fundamental-nao) | Contexto qualitativo de que ciclos incompletos de alfabetização podem afetar trajetória escolar. | Publicação de 2023 baseada no Saeb 2021; não usar como estimativa atual de reprovação/abandono nem como causalidade atribuída à Sofia. |
