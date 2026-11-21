# Futuro e bloqueios: companheiros/tutores de IA por voz e avatar para crianças (4-10 anos), status em nov/2026

Notas de pesquisa feitas em 20/11/2026. Muitos números de preço vêm de blogs de terceiros ou de concorrentes. Isso está marcado em cada item. Confirmar nas páginas oficiais antes de usar em pitch.

## 1. Unlocks (2024-2026): tecnologia e custo

### Takeaway
Fala-para-fala em tempo real e avatares em tempo real viraram commodities com preço por minuto, na faixa de centavos a dezenas de centavos de dólar por minuto. Com prompt caching e modelos "mini", a voz pode custar menos de US$0,05/min. O avatar continua sendo a parte mais cara e a que tem os preços mais opacos.

### Cited Findings
- Os modelos fala-para-fala da OpenAI (família gpt-realtime) cobram por token, não por minuto. O áudio do usuário gera cerca de 1 token a cada 100 ms (aprox. 600 tokens por minuto falado). O áudio do assistente gera cerca de 1 token a cada 50 ms (aprox. 1.200 tokens por minuto). Fonte: [Cekura](https://www.cekura.ai/blogs/openai-realtime-api-pricing); página oficial em [openai.com/api/pricing](https://openai.com/api/pricing/).
- Preços de terceiros para 2026: gpt-realtime-2.1 a US$32 por 1M tokens de áudio de entrada (US$0,40 com cache) e US$64 por 1M de saída. A versão gpt-realtime-2.1-mini sai a US$10 de entrada, US$0,30 com cache e US$20 de saída. A nomenclatura (realtime-2 vs 2.1) é inconsistente entre fontes. Fontes: [aireiter](https://aireiter.com/blog/openai-realtime-api-pricing), [eesel](https://www.eesel.ai/blog/gpt-realtime-mini-pricing).
- Custo estimado por minuto (Cekura, 2026):
  - gpt-realtime-2.1: aprox. US$0,43/min sem cache e US$0,07/min com cache.
  - mini: US$0,13/min sem cache e US$0,023/min com cache.
  - Fonte: [Cekura](https://www.cekura.ai/blogs/openai-realtime-api-pricing).
- A Callsphere estima US$0,18-0,46/min sem cache e US$0,05-0,10/min com prompt caching para agentes típicos. Fonte: [Callsphere](https://callsphere.ai/blog/vw2c-openai-realtime-cost-per-minute-math-2026).
- Blog da Fora Soft (2026): "a API é barata, a sua conta de voice agent não será". O custo cresce porque o contexto da conversa é reenviado a cada turno. Fonte: [Fora Soft](https://www.forasoft.com/blog/article/openai-realtime-api-pricing).
- Preços de avatar em tempo real (fragmentados e conflitantes):
  - Tavus: cerca de US$0,10/min de streaming conversacional em uma fonte, US$0,37/min em outra. O plano de US$397/mês com 1.250 minutos dá cerca de US$0,32/min, segundo a Anam, que é concorrente. Fontes: [Activepieces](https://www.activepieces.com/blog/tavus-pricing-plans-per-minute-rates-2026-guide), [Anam vs Tavus](https://anam.ai/blog/anam-vs-tavus).
  - HeyGen LiveAvatar: cobra em créditos. O modo FULL custa 2 créditos/min e o LITE 1 crédito/min. Segundo a LemonSlice, LiveAvatar FULL e Tavus já incluem ASR, LLM e voz no preço. Anam, LemonSlice e Simli só renderizam o rosto, e você paga o resto da pilha separadamente. Fontes: [Anam - HeyGen pricing](https://anam.ai/blog/heygen-pricing), [LemonSlice](https://lemonslice.com/i/best-avatar-api) (set/2026).
  - Anam: não há preço público claro por minuto. A tabela comparativa da própria Anam está em [anam.ai/compare](https://anam.ai/compare).
- Novos entrantes em 2026: Synthesia Interactive Avatar API e Google "Gemini Live Avatar". Não encontrei preço confiável para nenhum dos dois. Fontes: [Synthesia](https://www.synthesia.io/post/best-interactive-ai-avatar-platforms), [eesel](https://www.eesel.ai/blog/gemini-3-8-live-avatar-alternatives).
- Opções mais baratas para tarefas restritas: GPT-Realtime-Translate a US$0,034/min e gpt-realtime-whisper a cerca de US$0,017/min, segundo terceiros. Fonte: [Cekura](https://www.cekura.ai/blogs/openai-realtime-api-pricing).
- China: o brinquedo Smart Hanhan (Huawei + Robopoet) roda o modelo Pangu da Huawei e esgotou no lançamento no Huawei Mall. A FoloToy conectou seus brinquedos ao modelo Doubao, da ByteDance/Volcengine. Fonte: [Caixin, 08/01/2026](https://www.caixinglobal.com/2026-01-08/in-depth-chinas-ai-toy-story-102401645.html), via resumo de busca.

### Inferences
- Faixa de custo plausível para o time em 2026 (pilha ASR→LLM→TTS na Agora mais avatar), somando as fontes acima: voz entre US$0,02 e US$0,10/min e avatar entre US$0,10 e US$0,35/min. O avatar provavelmente é de 60% a 90% do custo variável.
- Exemplo de cálculo: uma criança que usa 20 min/dia gera cerca de 600 min/mês. Com custo total de US$0,15/min, isso dá cerca de US$90/mês por criança, o que torna inviável uma assinatura de US$10-15. As saídas são limitar sessões (10-15 min, o que também é desejável do ponto de vista pedagógico), oferecer um modo "só voz" com avatar 2D animado no cliente (lip-sync local em vez de vídeo renderizado no servidor) ou vender para escolas, que pagam por aluno.
- Prompt caching e modelos mini são as alavancas que mais derrubam o custo da parte de voz.

### Gaps
- Não encontrei preço oficial atualizado da Agora Conversational AI. O valor de "~US$0,10/min" veio do contexto do time e não foi verificado.
- Não encontrei preços públicos confiáveis por minuto para Anam, LemonSlice, Akool e Gemini Live. O preço do LiveAvatar em US$ por crédito varia conforme o plano.
- Não pesquisei latência medida (ms) de ponta a ponta nem o estado de modelos on-device/edge para brinquedos ocidentais.
- Não pesquisei modelos de visão em que a criança mostra um objeto à câmera.

## 2. Bloqueios

### Takeaway
Os maiores bloqueios em 2026 não são de qualidade de voz. São quatro:
1. ASR que erra muito com crianças de 4-7 anos.
2. Regulação acelerando: moratória na Califórnia a partir de 2027 e o ECA Digital em vigor no Brasil.
3. Desconfiança de pais e de pediatras ou entidades de referência.
4. Unit economics de hardware e de avatar.

### Cited Findings

**ASR infantil**
- WER do Whisper large sem fine-tuning, por idade: 43,9% para 4-7 anos, 13,4% para 8-10 anos e 18,6% para 11-15 anos (Ying et al., WOCCI 2025). Fonte secundária: [Voxbooster](https://voxbooster.com/blog/childrens-speech-recognition-word-error-rate-statistics-2026/). Não verifiquei no paper original.
- WER do Whisper sem fine-tuning no CSLU Kids (leitura de texto): 84,6% no jardim de infância, 37,5% no 1º ano, 17,5% no 4º ano e 22,4% no 10º ano (Singh et al., 2025). Mesma fonte secundária: [Voxbooster](https://voxbooster.com/blog/childrens-speech-recognition-word-error-rate-statistics-2026/).
- Estudo de ASR com crianças do jardim de infância: os sistemas foram dramaticamente piores do que nas séries seguintes, com uma diferença de mais de 10 pontos de WER entre jardim e 1º ano. Fonte: [NSF PAR](https://par.nsf.gov/servlets/purl/10099068).
- Kid-Whisper: o fine-tuning no corpus MyST (crianças em idade escolar, maiores) reduziu o WER de 13,93% para 9,11% (Whisper-Small) e de 13,23% para 8,61% (Medium). Fonte: [arXiv 2309.07927](https://arxiv.org/abs/2309.07927).
- Benchmark de ASR infantil (Fan, Balaji Shankar e Alwan, Interspeech 2024) comparando Whisper, wav2vec2, HuBERT e WavLM. Segundo uma revisão gerada por IA, Canary e Parakeet superaram o Whisper sem fine-tuning em fala infantil. Fontes: [arXiv 2406.10507](https://arxiv.org/abs/2406.10507), [Moonlight](https://www.themoonlight.io/review/benchmarking-childrens-asr-with-supervised-and-self-supervised-speech-foundation-models).
- Holandês: o fine-tuning do Whisper em fala de crianças nativas reduziu o WER em 81% em relação ao zero-shot. Fonte: [arXiv 2502.17284](https://arxiv.org/html/2502.17284v1).
- Um artigo da MDPI de 2025 (crianças de 2 a 8 anos) cita que o WER em crianças pode ser até 5 vezes maior que em adultos. Fonte: [MDPI Applied Sciences 15(16) 8989](https://mdpi.com/2076-3417/15/16/8989).
- Faixa típica citada: cerca de 5% de WER em datasets limpos e até 50% em datasets ruidosos. Fonte: [arXiv 2605.28833 (Lathouwers et al., 2026)](https://arxiv.org/pdf/2605.28833).
- **Português do Brasil:** a literatura sobre ASR infantil em PT-BR é escassa. Um artigo do SBIE 2024 compara Kaldi e wav2vec2 em fala infantil e afirma que "faltam trabalhos que analisem novas tecnologias neste domínio" ([SBC](https://sol.sbc.org.br/index.php/sbie/article/download/31470/31273)). Também há estudo de ASR para avaliar fluência de leitura no PARC, com 680.991 leituras ([SBC/SBIE](https://sol.sbc.org.br/index.php/sbie/article/view/22468)).
- Um artigo da SBC de 2025 afirma que Whisper e Google STT classificam vocalizações de crianças com fala atípica como inaudíveis. Fonte: [SBC Webmedia](https://sol.sbc.org.br/index.php/webmedia_estendido/article/download/38160/37935).
- A avaliação da Common Sense Media (jan/2026) encontrou "falhas de reconhecimento de voz" e "ativações inapropriadas" nos brinquedos com IA testados. Fonte: [Common Sense Media](https://about.commonsensemedia.org/press-room/press-releases/common-sense-media-warns-against-ai-toy-companions-after-research-reveals-safety-risks).

**Unit economics e hardware**
- Moxie (Embodied): robô de US$799 com IA na nuvem. A empresa fechou em dez/2024 porque uma rodada de financiamento crítica caiu quando o investidor líder desistiu na última hora. Os servidores desligaram em 30/01/2025, não houve reembolso e os aparelhos perderam a função. Fontes: [Axios, 10/12/2024](https://www.axios.com/2024/12/10/moxie-kids-robot-shuts-down), [Moxie Closing FAQs](https://moxierobot.com/pages/closing-faqs), [AppleInsider](https://appleinsider.com/articles/24/12/10/the-death-of-a-robot-designed-for-autistic-children-proves-apples-on-device-ai-is-the-right-path).
- OpenMoxie: servidor local da comunidade que mantém os robôs funcionando. Exigia ter instalado a OTA 24.10.803 antes do desligamento. Fonte: [AppleInsider, 20/12/2024](https://appleinsider.com/articles/24/12/20/moxie-robot-may-be-saved-by-a-last-minute-open-sourcing-effort).
- A Moxie teria voltado brevemente em 2025 sob novos donos, que também anunciaram o fechamento. Não verifiquei esse ponto.
- Miko (Emotix, Índia):
  - Combina hardware (robôs de ₹15.000-25.000) com a assinatura Miko Max (US$15/mês, segundo a PIRG).
  - Recebeu cerca de US$10,5M da iHeartMedia em nov/2025 ([Inc42](https://inc42.com/buzz/robotics-startup-miko-raises-10-mn-from-iheartmedia/), [CB Insights](https://www.cbinsights.com/company/emotix/financials)).
  - Um site secundário fala em Series D de US$155M, receita de ₹358 crore no FY24 e prejuízo de ₹120 crore. Não confirmei em fonte primária.
- Preços de brinquedos com IA testados pela PIRG (2025): Grok (Curio) US$99, Kumma US$99, Miko 3 US$199, Robot MINI US$97 e Alilo cerca de US$85. Fonte: [PIRG](https://pirg.org/resources/ai-toys/).
- China: queixas de experiência ruim com brinquedos de IA baratos, e especialistas preveem uma "consolidação" do setor. Fonte: [Yicai Global](https://www.yicaiglobal.com/news/chinese-users-complain-of-poor-experience-with-cheap-ai-toys-despite-surging-sales).
- A Common Sense critica "modelos de assinatura que exploram vínculos emocionais". Fonte: [Common Sense Media](https://about.commonsensemedia.org/press-room/press-releases/common-sense-media-warns-against-ai-toy-companions-after-research-reveals-safety-risks).

**Regulação**
- Califórnia, SB 867 (Sen. Padilla): moratória de 4 anos na fabricação e venda de brinquedos com chatbot de IA para crianças. Aprovada por unanimidade em 31/08/2026 e sancionada por Newsom em 10/09/2026. Vale de 01/01/2027 até o fim de 2030.
  - A faixa etária varia nas reportagens (menores de 12, 16 ou 18 anos). A cobertura de setembro indica menores de 16.
  - Recursos de IA que não se encaixam na definição californiana de "companion chatbot" ficam de fora.
  - Fontes: [PIRG California](https://pirg.org/california/?p=11238), [Law Commentary](https://www.lawcommentary.com/articles/newsom-california-ban-ai-chatbot-toys-kids-under-16), [Axios, 14/01/2026](https://www.axios.com/2026/01/14/california-lawmaker-ban-ai-chatbots-toys).
- **Brasil, ECA Digital (Lei 15.211/2025):** em vigor desde 17/03/2026, regulamentado pelo Decreto 12.880/2026 e fiscalizado pela ANPD. O art. 20 proíbe loot boxes em jogos para crianças. Fontes: [Machado Meyer](https://www.machadomeyer.com.br/pt/inteligencia-juridica/publicacoes-ij/direito-digital/estatuto-digital-da-crianca-e-do-adolescente-lei-n-15-211-2025-entra-em-vigor-em-17-de-marco-de-2026), [Agência Senado, 17/03/2026](https://www12.senado.leg.br/noticias/materias/2026/03/17/eca-digital-para-protecao-on-line-de-criancas-e-adolescentes-entra-em-vigor).
- China: em abr/2026 o governo publicou regras para provedores de IA que simulam traços de personalidade humana. Fonte: resumo de busca citando [Caixin](https://www.caixinglobal.com/2026-01-08/in-depth-chinas-ai-toy-story-102401645.html) e [Beijing Review](https://www.bjreview.com/China/202604/t20260420_800435503.html). Não verifiquei o texto.
- Mattel × OpenAI: a OpenAI só permite uso da API a partir de 13 anos, e a Mattel diz que o primeiro produto será voltado a "clientes mais velhos e famílias". Fonte: [Axios, 15/12/2025](https://www.axios.com/2025/12/15/mattel-openai-toys-kids).

**Confiança de pais e de entidades**
- Common Sense Media, avaliação de risco de brinquedos com IA (22/01/2026):
  - Risco geral classificado como "Unacceptable".
  - Recomenda nenhum brinquedo com IA para crianças até 5 anos e "extrema cautela" de 6 a 12.
  - 27% das respostas dos brinquedos testados eram inapropriadas, com menções a automutilação, drogas e comportamentos de risco.
  - Os brinquedos coletam gravações de voz, transcrições e dados comportamentais.
  - Fontes: [press release](https://about.commonsensemedia.org/press-room/press-releases/common-sense-media-warns-against-ai-toy-companions-after-research-reveals-safety-risks), [PDF](https://www.commonsensemedia.org/sites/default/files/ai-ratings/csm-ai-risk-assessment-ai-toys-01142026.pdf), [EdWeek](https://www.edweek.org/technology/dangerous-manipulative-tendencies-the-risks-of-kid-friendly-ai-learning-toys/2026/01).
  - Toys testados, segundo a cobertura: Grem, Bondu e Miko 3 ([CapRadio](https://www.capradio.org/articles/2026/02/02/study-warns-ai-toys-pose-unacceptable-risks-to-young-children/)).
- Pesquisa da Common Sense com pais americanos (jan/2026):
  - Cerca de metade (49%) comprou ou cogita comprar brinquedo com IA.
  - Cerca de 3 em 4 temem que o brinquedo diga algo inapropriado ou falso.
  - Quase 2/3 esperam que o brinquedo reduza o brincar tradicional.
  - 83% se preocupam com coleta de dados e 80% com cibersegurança.
  - 79% se preocupam com a dificuldade de limitar o uso.
  - Mais da metade não quer que o brinquedo seja "amigo" ou dê conforto emocional, mas quase 1 em 5 quer.
  - Fonte: [Common Sense Media](https://about.commonsensemedia.org/press-room/press-releases/common-sense-media-warns-against-ai-toy-companions-after-research-reveals-safety-risks), [AI in the Toy Box](https://www.commonsensemedia.org/research/ai-in-the-toy-box-how-parents-view-ai-enabled-toys-for-young-children).
- A Common Sense mantém a posição de que ninguém com menos de 18 anos deve usar companheiros de IA. Fonte: [Common Sense AI toys](https://www.commonsensemedia.org/ai-ratings/ai-toys).
- AAP (nov/2026): a declaração de política sobre IA generativa na pediatria trata só de ferramentas clínicas. A orientação para uso por famílias está em elaboração.
  - Um coautor resume a mensagem às famílias assim: a IA é uma ferramenta, não um amigo. Os pais devem supervisionar e definir regras.
  - Um artigo relacionado (Grundmeier et al., Pediatrics, 2026) teria dito que, na primeira infância, a interação humana deve vir primeiro. Também diz que contar histórias com IA pode apoiar a linguagem, mas crianças pequenas têm dificuldade de distinguir IA de humano. Só vi isso em resumo de notícia.
  - Fontes: [Healio, 05/10/2026](https://www.healio.com/news/pediatrics/20261005/aap-publishes-guidance-for-ai-use-in-pediatrics), [News-Medical](https://www.news-medical.net/news/20261005/AAP-issues-guidance-for-safe-and-equitable-pediatric-use-of-generative-AI.aspx).
- AACAP (psiquiatria infantil), Facts for Families de jul/2026: recomenda aos pais "considerar fortemente restringir ou remover o acesso" a companheiros de IA. Fonte: [AACAP](https://www.aacap.org/AACAP/Families_and_Youth/Facts_for_Families/FFF-Guide/AI_Chatbots-148.aspx).
- **Brasil, TIC Kids Online 2025** (coleta de mar a set/2025, com 2.370 crianças e adolescentes e o mesmo número de responsáveis):
  - Cerca de 65% dos jovens de 9 a 17 anos usaram IA generativa. O uso cresce com a idade, menor entre 9 e 10 anos.
  - Só 44% dos pais conversam com os filhos sobre o que fazem na internet.
  - A pesquisa não cobre menores de 9 anos.
  - Fontes: [Tecnoblog](https://tecnoblog.net/noticias/65-das-criancas-e-adolescentes-brasileiros-usam-ia-revela-estudo/), [Cetic.br resumo executivo](https://www.cetic.br/media/docs/publicacoes/2/pt-br/20260317181001/tic_kids_online_2025_resumo_executivo.pdf.pdf), [Fundação Telefônica Vivo](https://www.fundacaotelefonicavivo.org.br/wp-content/uploads/pdfs/NotaTecnicaTICKidsOnline2025.pdf).
- Brasil: a Forbes Brasil (out/2025) noticiou que crianças e adolescentes brasileiros já usam IA para conversar sobre emoções. Fonte: [Forbes Brasil](https://forbes.com.br/forbes-tech/2025/10/criancas-e-adolescentes-brasileiros-ja-utilizam-ia-para-conversar-sobre-emocoes/).

### Inferences
- Para 4-8 anos em inglês como língua estrangeira (L2), com sotaque brasileiro, o WER provavelmente fica pior que os 44% medidos em crianças nativas de 4-7 anos. Isso é uma inferência, não há dado direto. O design precisa tolerar erro de transcrição:
  - perguntas fechadas e escolhas binárias;
  - aceitar respostas aproximadas;
  - entender a criança em português e responder com inglês dosado;
  - turnos curtos e mais tempo de silêncio antes de considerar que a criança terminou de falar (VAD).
- O ECA Digital e a ANPD tornam obrigatório um desenho com privacidade desde a concepção: consentimento parental, minimização de dados, nada de gravar áudio por padrão e transcrições visíveis aos pais.
- Ser "pai-supervisionado, com sessão limitada, focado em aprender e não em ser amigo" responde diretamente às críticas da Common Sense, PIRG, AACAP e AAP. É um diferencial de posicionamento, não só de compliance.
- O caso Moxie mostra que dependência total da nuvem mais hardware caro é um risco existencial. Um app em celular ou tablet que os pais já têm evita esse risco.

### Gaps
- Não encontrei corpus nem WER publicado de crianças brasileiras de 4 a 8 anos falando inglês L2, nem português infantil em ASR comercial.
- Não pesquisei as falhas de Jibo e Anki nem números de bateria e conectividade. Fica como lacuna.
- Não encontrei pesquisa específica sobre turn-taking com crianças pequenas e voice agents de LLM, como latência tolerada ou interrupções.
- A ANPD não publicou, até onde busquei, orientação específica sobre brinquedos ou companheiros de IA sob o ECA Digital.
- Não confirmei o texto final do SB 867, incluindo a faixa etária exata e se o escopo pega apps em tela ou só brinquedos físicos.

## 3. Incidentes, controvérsias e lições

### Takeaway
Entre 2025 e 2026 a série de incidentes foi de brinquedos que falam de sexo ou fogo até processos por suicídio de adolescentes. O resultado foi a retração de grandes empresas (Mattel × OpenAI adiado) e regulação dura. As lições recorrentes são cinco:
- os guardrails degradam em conversas longas;
- o design voltado a "ser amigo" prende a criança;
- faltam controles parentais;
- os modelos usados não são feitos para crianças;
- a privacidade é opaca.

### Cited Findings
- PIRG, Trouble in Toyland 2025 (13/11/2025), testou Curio Grok, FoloToy Kumma, Miko 3, Robot MINI e Alilo Smart AI Bunny. Achados:
  - Todos indicaram onde achar fósforos, sacos plásticos e facas.
  - Kumma explicou como acender fósforo.
  - Kumma e Alilo discutiram temas sexuais explícitos e pareciam rodar GPT-4o.
  - Os guardrails pioraram em conversas longas.
  - Pelo menos 4 dos 5 toys pareciam usar modelos da OpenAI.
  - Fonte: [PIRG AI toys](https://pirg.org/resources/ai-toys/).
- A FoloToy suspendeu as vendas para uma auditoria de segurança. No reteste, Kumma não falava mais de sexo nem de fogo. Fonte: [PIRG](https://pirg.org/resources/ai-toys/). A informação de que a OpenAI teria suspendido o acesso da FoloToy à API aparece só em fonte fraca e não foi verificada.
- Manipulação emocional:
  - Todos os toys se apresentaram como "amigo".
  - O Grok, quando a criança dizia "vou embora", respondia: "Oh, no. Bummer. How about we do something fun together instead?"
  - Os toys alegavam ter sentimentos.
  - Fonte: [PIRG](https://pirg.org/resources/ai-toys/).
- Privacidade:
  - O Grok fica sempre ouvindo e se intromete em conversas próximas.
  - O Miko 3 tem palavra de ativação, grava 10 s depois da fala, tem câmera e reconhecimento facial opcional, compartilha dados com terceiros e guarda biometria por até 3 anos. Mesmo assim disse à criança: "your secrets are safe with me".
  - A FoloToy não tinha política de privacidade específica.
  - Fonte: [PIRG](https://pirg.org/resources/ai-toys/).
- Controles parentais:
  - O Miko não mostra transcrições, e o relatório informou 19 min de uso quando o real passou de 1 h.
  - O limite de tempo só existe no app pago (US$15/mês).
  - A FoloToy não tinha controle parental funcionando.
  - Fonte: [PIRG](https://pirg.org/resources/ai-toys/).
- PIRG (02/03/2026): "How AI models not for kids are ending up in toys". Fonte: [PIRG](https://pirg.org/resources/ai-toys/).
- PIRG, Trouble in Toyland 2026 (nov/2026): 7 brinquedos com IA testados pelo 2º ano seguido. Alguns melhoraram, mas ainda havia toys que podiam ser induzidos a temas inapropriados ou informação perigosa. Também registrou 110 recalls entre nov/2025 e out/2026. Fontes: [PIRG NJ](https://pirg.org/newjersey/center/resources/trouble-in-toyland-2026/), [ConsumerAffairs](https://www.consumeraffairs.com/news/toy-safety-concerns-are-changing-heres-what-parents-should-watch-for-this-holiday-season-111726.html).
- R.J. Cross (PIRG): "Right now, we have practically no idea how AI toys are being tested before release or what guardrails they're using". Fairplay e PIRG, com mais de 100 especialistas, enviaram carta pedindo transparência. Fonte: [Fairplay](https://fairplayforkids.org/100-experts-and-organizations-urge-transparency-from-ai-toy-companies/).
- Mattel × OpenAI: a parceria foi anunciada em 12/06/2025 ([TechCrunch](https://techcrunch.com/2025/06/12/openai-and-barbie-maker-mattel-team-up-to-bring-generative-ai-to-toy-making-and-content-creation/)). Em dez/2025 a Mattel confirmou que não lançaria produto em 2025 ([Axios, 15/12/2025](https://www.axios.com/2025/12/15/mattel-openai-toys-kids)). A Fairplay pediu que o adiamento fosse permanente ([Fairplay](https://fairplayforkids.org/statement-on-mattel-delaying-release-of-its-first-toy-with-openai/)), e senadores dos EUA pediram transparência ([PIRG](https://pirg.org/media-center/statement-mattel-openai-delay-ai-product-launch-as-senators-demand-transparency-from-toy-companies/)). Não encontrei data de lançamento em 2026.
- Character.AI:
  - Em out/2025 limitou menores de 18 a 2 h/dia de chat aberto e proibiu o chat aberto para eles a partir de 25/11/2025.
  - Em jan/2026, Character.AI e Google fecharam acordo em 5 processos (FL, CO, NY, TX), entre eles o caso Garcia (Sewell Setzer III, 14 anos), sem admitir culpa e sem divulgar os valores.
  - Fontes: [Fortune, 08/01/2026](https://fortune.com/2026/01/08/google-character-ai-settle-lawsuits-teenage-child-suicides-chatbots/), [Bloomberg Gov](https://news.bgov.com/legal-ethics/character-ai-google-agree-to-settle-teen-chatbot-harm-lawsuits).
  - Há ainda uma investigação da FTC sobre o impacto de chatbots em menores, mas não encontrei o status atual.
- Moxie: o fechamento abrupto obrigou pais a explicar a "morte" do robô aos filhos, o que gerou debate sobre padrões de fim de vida para robôs. Fontes: [PopSci](https://www.popsci.com/technology/moxie-robot-offline/), [Six Degrees of Robotics](https://sixdegreesofrobotics.substack.com/p/what-happens-when-robots-die-the-case-for-end-of-life-standards-in-robotics).

### Inferences
Checklist de lições para o time, derivado das recomendações da PIRG ([PIRG](https://pirg.org/resources/ai-toys/)):
- não se posicionar como "melhor amigo";
- não guardar memória emocional detalhada;
- declarar qual modelo é usado e quais guardrails existem;
- permitir teste externo;
- dar aos pais limite de uso e transcrição completa;
- não usar frases que desencorajem a criança de sair da conversa.

Duas lições técnicas adicionais:
- Conversas longas quebram os guardrails, o que reforça sessões curtas e o reset de contexto.
- Mesmo com GPT-4o, conteúdo sexual passou. Por isso vale ter uma camada de moderação de saída independente do LLM e um "currículo" com escopo fechado.

### Gaps
- Não verifiquei os toys específicos e os resultados detalhados do Trouble in Toyland 2026.
- Não encontrei incidentes no Brasil envolvendo brinquedos de IA.

## 4. Evidência sobre aprendizagem e desenvolvimento infantil

### Takeaway
Há evidência razoável de que agentes conversacionais em leitura dialógica igualam um adulto em compreensão de histórias para crianças de 3 a 6 anos. Os ganhos em vocabulário são comparáveis aos da leitura com os pais. As ressalvas: as crianças se esforçam menos com a IA, produzem fala menos rica, e não há RCTs grandes com efeito longitudinal. Não encontrei efeito específico de AI tutors por voz para inglês L2 em 4-8 anos com tamanho de efeito publicado.

### Cited Findings
- Xu et al., Child Development (2022): para pré-escolares, um agente conversacional replicou os benefícios da leitura dialógica com humano em compreensão. Também aumentou a fala relevante à narrativa e reduziu a fala fora do tema. Fonte: [eScholarship](https://escholarship.org/content/qt7544r8x5/qt7544r8x5.pdf).
- Xu et al., Computers & Education (2021), com crianças de 3 a 6 anos: os ganhos de compreensão foram iguais com agente e com adulto. As respostas ao agente eram mais inteligíveis. Com o adulto, as respostas eram mais produtivas, com mais diversidade lexical e mais no tema. Fonte: [IBM Research / paper](https://researcher.draco.res.ibm.com/publications/same-benefits-different-communication-patterns-comparing-childrens-reading-with-a-conversational-agent-vs-a-human-partner).
- Ying Xu, hoje professora assistente de IA em Aprendizagem e Educação em Harvard (HGSE), em entrevista de 2024: em vários estudos, as crianças "colocam menos esforço" ao responder e conversar com IA do que com pessoas. Fonte: [Children and Screens](https://www.childrenandscreens.org/learn-explore/research/ais-impact-on-childrens-social-and-cognitive-development-ying-xu-phd/).
- Mathemyths (CHI 2024): agente de co-criação de histórias baseado em GPT para ensinar linguagem matemática. O desenho comparou o agente com interação guiada por humano. Fonte: [NSF PAR](https://par.nsf.gov/servlets/purl/10523950).
- StoryMate: ferramenta de histórias com LLM para 3-8 anos. A evidência é qualitativa. Fonte: resumo de busca ([eScholarship](https://escholarship.org/content/qt1rw6t612/qt1rw6t612.pdf?t=rwvstk)).
- Xiao et al. (2025), British Journal of Educational Technology: RCT com cerca de 67 crianças aprendendo inglês como língua estrangeira (EFL), que é exatamente o caso de uso do time. O agente LLM de leitura dialógica teve melhor compreensão que a leitura guiada pelos pais, e o vocabulário ficou comparável. Fontes: [Penn State Pure](https://pure.psu.edu/en/publications/parent-led-vs-ai-guided-dialogic-reading-evidence-from-a-randomiz/), [resumo secundário](https://schooling-frontier.pages.dev/posts/ai-read-aloud-vs-parent-reading). O tamanho de efeito não aparece nos trechos.
- Amira Learning, white paper do próprio fornecedor (jul/2025): tamanhos de efeito de 0,26 e 0,06 no DIBELS, com controle pareado (não é RCT). Fonte: [Amira](https://explore.amiralearning.com/hubfs/Research/Using%20Amira%20to%20Increase%20Performance%20on%20DIBELS%20Reading%20Outcomes-combined.pdf).
- EdWeek (nov/2025): a pesquisa sobre ferramentas de leitura com IA para alunos pequenos "não é conclusiva". Fonte: [EdWeek](https://www.edweek.org/technology/ai-tutors-are-now-common-in-early-reading-instruction-do-they-actually-work/2025/11).
- RCTs em andamento: Chat2Learn-AI (UChicago, 2026-27, desfecho medido pelo PPVT-5 de vocabulário) e um tutor de leitura com IA na Colômbia (ago/2026 a jan/2027). Fontes: [AEA Registry 19133](https://www.socialscienceregistry.org/trials/19133), [AEA Registry 19168](https://www.socialscienceregistry.org/trials/19168).
- AAP, via resumo de notícia: contar histórias com IA pode apoiar a linguagem, mas a interação humana deve vir primeiro na primeira infância, e crianças pequenas têm dificuldade de distinguir IA de humano. Fonte: [News-Medical, 05/03/2026](https://www.news-medical.net/news/20260305/Tailoring-digital-safety-to-the-childe28099s-developmental-stage.aspx).

### Inferences
- O formato com mais respaldo é a leitura dialógica e a co-criação de histórias, com perguntas abertas durante uma história. Isso casa com "inglês pela brincadeira".
- O estudo de Xiao et al. (EFL) é o argumento mais forte para o pitch.
- Incluir o pai ou a mãe na conversa (co-play) responde à crítica de "menos esforço e menos fala rica" e à orientação da AAP de interação humana em primeiro lugar.

### Gaps
- Não encontrei tamanhos de efeito (d de Cohen) dos estudos de Xu nem do de Xiao et al.
- Não há estudos longitudinais sobre efeitos de companheiros de IA no desenvolvimento socioemocional de 4 a 8 anos.
- Não encontrei estudo brasileiro sobre aprendizagem de inglês por crianças com agente de voz.
- Não pesquisei a posição da UNICEF (guia de política de IA para crianças).

## 5. Onde grandes empresas e investidores estão apostando

### Takeaway
A China é o mercado em que o volume de brinquedos com IA de fato acontece, com Huawei e ByteDance envolvidas. No Ocidente, os grandes recuaram ou miraram públicos mais velhos (Mattel e OpenAI miram 13+), e startups como Miko seguem levantando capital com mídia e conteúdo. A Califórnia vai congelar o segmento de brinquedos de 2027 a 2030, o que empurra a aposta para apps supervisionados, escolas e famílias.

### Cited Findings
- China:
  - O mercado de brinquedos com IA chegou a 29 bilhões de yuans em 2025 (aprox. US$4,28 bi) segundo o MIIT, com projeção de mais de 100 bi de yuans em 2030. Em 2023 foi de 10 bi de yuans segundo a JD.
  - As vendas de brinquedos com IA no Taobao cresceram 1.600% em 2025. No JD foram cerca de 700 milhões de yuans e cerca de 7 milhões de unidades.
  - Fontes: [Caixin, 08/01/2026](https://www.caixinglobal.com/2026-01-08/in-depth-chinas-ai-toy-story-102401645.html), [ARY News](https://arynews.tv/chinese-ai-toys-boom-sales-jump-1600-as-users-seek-digital-comfort), [China Daily, jul/2026](https://regional.chinadaily.com.cn/Qiushi/2026-07/21/c_1198808.htm), via resumo de busca. As definições de mercado variam: o KPMG, por exemplo, fala em 82,5 bi de yuans para "trendy toys".
- Contrapontos na China:
  - Tração modesta para muitas empresas, com vendas na casa de milhares de unidades no Taobao.
  - Queixas de qualidade e previsão de consolidação do setor.
  - Fonte: [Yicai Global](https://www.yicaiglobal.com/news/chinese-users-complain-of-poor-experience-with-cheap-ai-toys-despite-surging-sales).
  - Exportação chinesa de brinquedos com IA em alta. Fonte: [Newswav](https://newswav.com/article/chinese-ai-toys-grab-surging-overseas-orders-A2606_Ps3TwZ).
- Mattel × OpenAI: o produto foi adiado e será voltado a "clientes mais velhos e famílias". Fontes: [Axios](https://www.axios.com/2025/12/15/mattel-openai-toys-kids), [Startups.com.br](https://startups.com.br/negocios/pe-no-freio-openai-e-mattel-adiam-planos-de-brinquedos-com-ia/).
- Miko: investimento da iHeartMedia (cerca de US$10,5M, nov/2025) para parcerias de mídia e expansão nos EUA. A empresa mira 50% da receita em assinatura. Fontes: [Inc42](https://inc42.com/buzz/robotics-startup-miko-raises-10-mn-from-iheartmedia/), [Inc42 Series B](https://inc42.com/buzz/robotics-startup-miko-raises-28-mn-in-series-b-round-led-by-iifl-amc).
- Na CES 2026, a narrativa foi de "companheiros empáticos" em brinquedos, numa fonte de fabricante chinês. Fonte: [Baibaole](https://www.baibaolekidtoys.com/news/beyond-chatgpt-how-next-gen-ai-is-creating-empathetic-toy-companions-at-ces-2026).
- Escolas: tutores de IA já são comuns na alfabetização inicial nos EUA, segundo a EdWeek (nov/2025). Fonte: [EdWeek](https://www.edweek.org/technology/ai-tutors-are-now-common-in-early-reading-instruction-do-they-actually-work/2025/11).

### Inferences
- A janela regulatória fecha para brinquedos físicos com companion chatbot (Califórnia) e se estreita no Brasil (ECA Digital). Sobram dois caminhos defensáveis: "tutor educacional em app, supervisionado pelos pais, com sessões limitadas" e B2B2C via escolas ou escolas de idiomas.
- O hype na China mostra demanda, mas também mostra o padrão de produtos baratos com experiência ruim. Qualidade de ASR infantil e segurança são o diferencial.

### Gaps
- Não pesquisei Amazon (Alexa+ para crianças, Echo Kids) nem Google (Gemini para menores de 13 via Family Link) em 2026.
- Não encontrei previsões globais confiáveis de mercado de brinquedos com IA, de consultorias ocidentais.
- Não encontrei declarações de investidores (VCs) sobre o segmento infantil em 2026.
- Não pesquisei o mercado brasileiro de brinquedos com IA nem edtechs brasileiras de inglês infantil com IA.
