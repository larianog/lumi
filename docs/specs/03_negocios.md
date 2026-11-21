# Sofia — Documento de Negócios

**Equipe:** newDirections | **Versão:** 1.0 | **Data:** 21/11/2026

Status: hipóteses de negócio, não estudo de mercado validado. Base: refinamento do produto e feedback dos mentores. Não há números de demanda, entrevistas, disposição de pagar ou receita comprovados nesta conversa.

## 1. Dor / problema

[HIPÓTESE] Muitas famílias precisam conciliar a rotina com o acompanhamento das tarefas escolares. Crianças podem ter dificuldades específicas que não são resolvidas pela leitura do enunciado e podem depender de ajuda disponível naquele momento. Responsáveis podem não conhecer a abordagem pedagógica adequada ou não conseguir oferecer atenção individualizada sempre que necessário.

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

### 4.1 Categoria e concorrência

Sofia se posiciona na interseção de EdTech, reforço escolar, tutoria por IA e ferramentas de apoio à lição. Substitutos incluem professor particular, reforço presencial, apoio familiar, vídeos educativos, plataformas de exercícios e chatbots generalistas.

| Referência | Aprendizado para Sofia | Limite da comparação |
|---|---|---|
| Khanmigo | Perguntas guiadas, supervisão e segurança | Referência mencionada na mentoria; não comprova demanda brasileira |
| Synthesis Tutor | Especialização em matemática infantil | Alegações do fornecedor não validam Sofia |
| Chatbots generalistas | Acesso rápido e flexibilidade | Diferenciação pedagógica precisa ser testada |
| Reforço humano | Acompanhamento individualizado | Sofia é complemento, não substituto equivalente |

Não foi realizada auditoria competitiva atualizada. Preço, disponibilidade local e diferenciais dos concorrentes exigem pesquisa própria.

### 4.2 Dimensionamento TAM/SAM/SOM

Não atribuir números nacionais inventados. Levantar matrículas por série e região no Censo Escolar/INEP, acesso domiciliar à internet em fontes IBGE/Cetic.br e evidências de compra de reforço escolar. Matrículas não equivalem a famílias pagantes; ajustar duplicidade, acesso, necessidade e disposição de pagar.

- TAM teórico anual = famílias elegíveis no universo definido × receita anual potencial por família.
- SAM anual = famílias realmente alcançáveis no segmento atendido × receita anual potencial.
- SOM anual = famílias que podem ser adquiridas e retidas no horizonte definido × receita anual potencial.

Exemplo puramente aritmético: 1.000 famílias pagantes × R$ 39/mês × 12 = R$ 468 mil/ano de receita bruta recorrente anualizada, se todas permanecerem pagantes. Não representa estimativa de mercado, previsão ou preço validado.

Fontes futuras: https://www.gov.br/inep/ ; https://www.ibge.gov.br/ ; https://cetic.br/ .

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

| Hipótese | Experimento | Evidência desejada |
|---|---|---|
| Pistas ajudam mais que respostas | Comparar abordagens e questões novas, com adultos em simulação inicial | Comportamento correto do tutor; aprendizagem infantil exige estudo posterior |
| Voz é adequada | Ensaiar hesitação, interrupção, autocorreção | Menos falhas e repetições inadequadas |
| Responsável percebe valor | Apresentar resumo fictício e entrevistar adultos | Entendimento dos limites e intenção de uso |
| Existe disposição de pagar | Entrevistar decisores e testar ofertas transparentes | Evidência de compra, não apenas elogio |
| Economia é viável | Medir minutos, chamadas, custos e retries | Margem por faixa de uso |

## 7. Riscos e governança

Extração incorreta, respostas erradas, pouca autonomia, custo elevado de voz, abandono, acesso desigual, exposição de dados e direitos autorais. Mitigar via recorte, validação de respostas, testes, limites de sessão, materiais autorizados e privacidade por desenho. Antes de operação com menores, análise especializada de LGPD, art. 14, Enunciado ANPD 1/2023, Lei 15.211/2025 (ECA Digital), fornecedores e transferências internacionais. Autorização genérica não resolve todo tratamento.

## 8. Pitch

Sofia não faz a lição pela criança: ensina a criança a resolvê-la. Demonstrar upload, erro inicial, intervenção visual por voz, nova tentativa, questão de transferência com resultado diferente e um limite bem tratado. Mostrar evidência observada em simulação, não prometer eficácia comprovada.
