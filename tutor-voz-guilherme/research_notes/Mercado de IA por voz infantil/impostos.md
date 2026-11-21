# Tributação e estrutura de custos fiscais: app de IA por voz/avatar para crianças (inglês, aprendizagem lúdica). Brasil e exterior, situação em nov/2026

> Não é consultoria tributária. Pesquisa feita em 20/11/2026, com base sobretudo em fontes secundárias (escritórios, contabilidades e portais) e em poucas fontes primárias. Onde as fontes divergem, isso está indicado. Os números servem para o business case de hackathon. Antes de constituir a empresa, valide tudo com um contador.

---

## 1. Brasil, sistema atual: ISS, PIS/COFINS, IRPJ/CSLL, Simples Nacional (Anexo III/V, Fator R), Inova Simples, e "software" vs "educação"

### Takeaway
No sistema atual (vigente em 2026), a assinatura do app é tributada como software ou SaaS. Incide ISS (LC 116, item 1.05 ou 1.03, alíquota municipal de 2% a 5%; em São Paulo, 2,9% para o item 1) e não ICMS. Uma startup pequena tende a ficar no Simples Nacional. Com Fator R ≥ 28%, cai no Anexo III, com alíquota efetiva de cerca de 6% a 10% no início. Sem folha relevante, cai no Anexo V, com cerca de 15,5% a 17% ou mais. Enquadrar como "educação" não ajuda no regime atual. Na reforma, ajuda pouco ou nada, porque curso de idiomas e app ficam de fora da redução, como mostra a seção 2.

### Cited Findings
- **ISS sobre software/SaaS:** o subitem 1.05 da LC 116/2003 abrange licenciamento ou cessão de direito de uso de software. Segundo análise de escritório, o STF reconheceu em repercussão geral o SaaS como serviço enquadrado no subitem 1.05. O subitem 1.03 cobre processamento e hospedagem, e há debate sobre usar o 1.03 para qualquer operação que envolva processamento de dados — [TaxUp, ISS SaaS](https://taxup.com.br/iss-software-saas-municipio-codigo-retencao/); [Migalhas, ISS e IA](https://www.migalhas.com.br/depeso/458546/iss-e-ia-limites-da-lista-de-servicos-com-novas-utilidades-digitais)
- **Software no ISS, não no ICMS:** entendimento consolidado no STF, válido para qualquer forma de fornecimento (download, SaaS, nuvem). Referências: ADIs 1.945 e 5.659, e também a ADI 5576 — [Agilize, Simples para software](https://agilize.com.br/artigos/simples-nacional-para-software); [ABES, ICMS ou ISS](https://abes.org.br/imposto-sobre-o-software-afinal-icms-ou-iss/); [ADI 5576 (PDF)](https://ufrr.br/direito/wp-content/uploads/sites/15/2026/02/3.-ACAO-DIRETA-DE-INCONSTITUCIONALIDADE-5576.pdf)
- **Alíquota de ISS:** em São Paulo, o art. 16, III, da Lei municipal 13.701/2003 fixa 2,9% para os serviços do item 1, exceto o subitem 1.09. Isso não vale para o país inteiro: cada município define a sua alíquota, sempre entre o mínimo de 2% e o máximo de 5% da LC 116 (arts. 8 e 8-A) — [TaxUp, ISS SaaS](https://taxup.com.br/iss-software-saas-municipio-codigo-retencao/); [Contabilidade.com, tabela ISS SP](https://contabilidade.com/tabela-codigos-iss-aliquota-sao-paulo/)
- **Fator R:** se Fator R ≥ 28% (folha de 12 meses ÷ receita bruta de 12 meses), a empresa vai para o Anexo III. Se ficar abaixo de 28%, vai para o Anexo V. O cálculo é mensal, com base nos 12 meses anteriores — [Contabilidade.com, Fator R 2026](https://contabilidade.com/blog/fator-r-no-simples-nacional-2026-como-calcular-exemplos-praticos-e-quando-servicos-migram-do-anexo-v-para-o-iii/); [Agilize](https://agilize.com.br/artigos/simples-nacional-para-software)
- **Enquadramento de SaaS no Simples:** uma fonte coloca o licenciamento de software customizável (SaaS) no Anexo V. Outra diz que SaaS cabe no III ou no V e que o Fator R decide — [Agilize, Simples para software](https://agilize.com.br/artigos/simples-nacional-para-software); [Agilize, guia TI 2026](https://agilize.com.br/artigos/?p=4155)
- **Tabela de 2026:**
  - Anexo III: 1ª faixa (até R$ 180 mil), 6%; 2ª faixa, 11,20% com dedução de R$ 9.360; 3ª faixa (R$ 360 a 720 mil), 13,5% com dedução de R$ 17.640.
  - Anexo V: 1ª faixa, 15,50% nominal — [Agilize, tabela Simples 2026](https://artigos.agilize.com.br/tabela-simples-nacional-anexos-aliquotas/); [Contabilidade.com](https://contabilidade.com/blog/fator-r-no-simples-nacional-2026-como-calcular-exemplos-praticos-e-quando-servicos-migram-do-anexo-v-para-o-iii/)
- **Exemplo de alíquota efetiva com RBT12 de R$ 300 mil:** 8,08% no Anexo III e cerca de 16,50% no Anexo V. Uma segunda fonte traz 10,4% e 17,2% para o mesmo caso, sem explicar a diferença. Pela fórmula (RBT12 × alíquota − dedução) ÷ RBT12, os valores corretos são 8,08% e 16,5% — [Contabilidade.com](https://contabilidade.com/blog/fator-r-no-simples-nacional-2026-como-calcular-exemplos-praticos-e-quando-servicos-migram-do-anexo-v-para-o-iii/); a divergência aparece em [Agilize](https://agilize.com.br/artigos/?p=470)
- **PIS/COFINS no Lucro Real:** aplicar 9,25% não cumulativo a toda a receita de software é um erro comum. Existe uma exceção que mantém certas receitas de software no regime cumulativo — [TaxUp, reforma e SaaS](https://taxup.com.br/reforma-tributaria-tecnologia-saas/)
- **Inova Simples:** é um mecanismo de formalização rápida e digital de startups, previsto na LC 167/2019. A fonte não trata de benefício tributário próprio — [Razonet, incentivos para startups](https://razonet.com.br/contabilidade-digital/incetivos-fiscais-para-startups)

### Inferences
- **Lucro Presumido, para comparar** (regra geral, não verificada em fonte nesta pesquisa): presunção de 32% para serviços.
  - IRPJ de 15% (mais adicional de 10%) e CSLL de 9% sobre a base presumida: cerca de 7,68% da receita.
  - PIS e COFINS cumulativos: 3,65%.
  - ISS: de 2% a 5%.
  - Total: cerca de 13,3% a 16,3% da receita.
  - Conclusão: o Anexo V do Simples (cerca de 15,5% a 19,5%) pode empatar com o Presumido ou sair mais caro.
- **Recomendação prática para o business case:** usar pró-labore e folha para buscar Fator R ≥ 28% e ficar no Anexo III. A alíquota efetiva fica em torno de 6% a 10% até R$ 720 mil de RBT12 e sobe para cerca de 11% a 13% perto de R$ 1,8 milhão. Exemplo com R$ 500 mil de RBT12 no Anexo III: (500.000 × 13,5% − 17.640) ÷ 500.000 = 9,97%.
- **"Educação" vs "software" no sistema atual:** escolas regulares têm o item 8 da LC 116 (8.01 para ensino regular, 8.02 para cursos livres), com ISS de 2% a 5%. Um app B2C que vende assinatura de acesso a um tutor de IA tende a ser classificado como software (item 1.05) ou como processamento/SaaS (item 1.03). No Simples, essa diferença pesa pouco: atividades de ensino ficam no Anexo III, e SaaS cai no III ou no V conforme o Fator R. Esse ponto é interpretação e o enquadramento é discutível.
- **Venda B2B2C para escolas:** a nota fiscal sai como software ou SaaS para a escola. Escolas e prefeituras podem reter ISS, conforme a legislação de cada município.

### Gaps
- Não confirmei na fonte oficial (anexos da LC 123/2006) a tabela completa do Simples. Também ficou sem checar o limite de R$ 4,8 milhões para 2026.
- Não verifiquei se a LC 224/2025 (corte linear de benefícios, com aumento de 10% nas presunções do Lucro Presumido para receita acima de R$ 5 milhões a partir de 2026) está vigente. Isso precisa ser checado.
- Não verifiquei benefícios específicos do Inova Simples (LC 167/2019, art. 65-A da LC 123) além da formalização. Sem fonte.

---

## 2. Reforma tributária (EC 132/2023 e LC 214/2025, alterada pela LC 227/2026): IBS/CBS, transição de 2026 a 2033, redução para educação, serviços digitais, importação de serviços, Imposto Seletivo e Simples

### Takeaway
- **2026:** é um ano de teste. A CBS é de 0,9% e o IBS de 0,1%, ambos compensáveis com PIS/COFINS, então quem cumpre as obrigações acessórias não tem desembolso extra.
- **2027:** a CBS entra cheia (estimativa de cerca de 8,7% a 8,8%) e PIS/COFINS deixam de existir.
- **2029 a 2032:** o IBS sobe enquanto ISS e ICMS caem.
- **2033:** o modelo fica pleno, com alíquota de referência total estimada em cerca de 26,5% a 28% (ainda não fixada).
- **Redução de 60% para educação (art. 129, Anexo II):** vale só para os serviços de ensino listados por código NBS (infantil, fundamental, médio, técnico, superior, EJA etc.). Curso de idiomas e cursos livres estão fora. Um app de IA que ensina inglês muito provavelmente paga a alíquota cheia. É possível discutir isso, mas é improvável que dê certo.
- **Imposto Seletivo:** não se aplica a software, educação nem brinquedos.

### Cited Findings
- **Cronograma:**
  - 2026: CBS de 0,9% e IBS de 0,1% destacados nas notas e compensados com PIS/COFINS. Quem destaca corretamente não desembolsa.
  - 2027: extinção de PIS/COFINS; CBS cheia estimada em cerca de 8,8% (outra estimativa diz 8,7%); IBS de 0,05% estadual mais 0,05% municipal.
  - 2029 a 2032: substituição gradual de ICMS e ISS.
  - 2033: extinção de ICMS e ISS.
  - Fontes: [Jornal Contábil, cronograma 2026](https://jornalcontabil.com.br/noticia/reforma-tributaria-cronograma-e-acoes-a-se-tomar-ainda-em-2026/); [Congresso em Foco](https://www.congressoemfoco.com.br/noticia/115548/confira-o-cronograma-de-implementacao-da-reforma-tributaria); [Taxcel, tabela 2026-2033](https://taxcel.com.br/cronograma-reforma-tributaria-2026-2033-tabela)
- **Divergência sobre a CBS:** outra fonte estima a CBS entre 8,8% e 10,85%. O Tributo Devido marca as alíquotas definitivas como "[VERIFICAR]" — [Tributo Devido, transição](https://tributodevido.com.br/portal/periodo-transicao-reforma-tributaria/)
- **Alíquota de referência:** a estimativa total de IBS e CBS é de cerca de 26,5%, segundo nota técnica da Fazenda de 2024. Ela não está fixada em lei, e algumas projeções passam de 27% — [TaxUp, educação](https://taxup.com.br/reforma-tributaria-educacao/)
- **Redução de 60% para educação:** os arts. 128, I, e 129 da LC 214/2025 reduzem em 60% as alíquotas de IBS e CBS sobre os serviços de educação do Anexo II, classificados por NBS — [Simtax, art. 129](https://simtax.com.br/reducao-60-ibs-cbs-educacao/); [Migalhas, educação na LC 214](https://www.migalhas.com.br/depeso/442311/reforma-tributaria-53-a-educacao-na-lc-214-25)
- **O que está no Anexo II:**
  - Educação infantil (creche e pré-escola), fundamental, médio, técnico de nível médio, EJA, superior (graduação, pós e extensão), Libras e educação especial.
  - EAD também se qualifica quando corresponde ao mesmo código NBS do curso presencial.
  - Escolas de idiomas e cursos livres ficam fora, com alíquota cheia de cerca de 26,5%.
  - O critério é o serviço prestado, não o fato de a instituição ter ou não fins lucrativos. Material didático e atividades acessórias seguem a regra geral.
  - Fonte: [TaxUp, educação](https://taxup.com.br/reforma-tributaria-educacao/)
- **EdTech:** classificar por NBS gera disputas previsíveis. Um exemplo é decidir como enquadrar plataformas que combinam software, conteúdo e tutoria. Atividades que não são "serviço educacional" na NBS pagam alíquota cheia — [TaxUp, regime de educação](https://taxup.com.br/solucoes/reforma-tributaria/regime-especifico-educacao/); [Simtax](https://simtax.com.br/reducao-60-ibs-cbs-educacao/)
- **Exemplo de alíquota:** um serviço de educação do Anexo II, com fim lucrativo, pagaria 40% de 26,5%, ou cerca de 10,6%. Um curso de idiomas ou curso livre pagaria a alíquota cheia de cerca de 26,5% — [TaxUp, educação](https://taxup.com.br/reforma-tributaria-educacao/)
- **Importação de serviços:**
  - IBS e CBS incidem sobre a importação de bens materiais e imateriais (inclusive direitos) e de serviços, com efeitos a partir de 01/01/2027 — [LegJur, LC 214/2025](https://www.legjur.com/legislacao/art/lec_00002142025-517)
  - O art. 64 trata da importação de serviços e bens imateriais. O art. 22 trata da responsabilidade de plataformas. O fornecedor digital estrangeiro precisa avaliar se tem obrigação de inscrição. A LC 214 está consolidada com a LC 227/2026, e o Ato Conjunto RFB/CGIBS 4/2026 trata da emissão de documentos para serviços de software e plataformas — [TaxUp, SaaS](https://taxup.com.br/reforma-tributaria-tecnologia-saas/)
  - Importação de cloud e SaaS passa a pagar IBS e CBS, com direito a crédito no regime regular — [TaxUp, via busca](https://taxup.com.br/reforma-tributaria-tecnologia-saas/)
- **Simples Nacional e regime híbrido:**
  - Pelo regime híbrido, a empresa do Simples pode recolher IBS e CBS por fora do DAS e gerar crédito para os clientes. Isso não traz vantagem quando o cliente é consumidor final (B2C) — [AmdJus, Simples híbrido](https://amdjus.com.br/simples-nacional-hibrido-novas-regras-impactam-empreendedores-em-2027/); [Rotina Fiscal](https://www.rotinafiscal.com.br/outros/reforma-tributaria)
  - Há divergência sobre a janela de opção. Uma fonte fala em setembro, com efeito em janeiro de 2027. Outra fala em setembro e abril, com efeito em janeiro e julho de cada ano — [AmdJus](https://amdjus.com.br/simples-nacional-hibrido-novas-regras-impactam-empreendedores-em-2027/); [Rotina Fiscal](https://www.rotinafiscal.com.br/outros/reforma-tributaria)
  - Também é citada a Resolução CGSN 190/2026 — [TaxUp, SaaS](https://taxup.com.br/reforma-tributaria-tecnologia-saas/)
  - Segundo uma fonte, a empresa no Simples "puro" não se apropria de créditos de IBS e CBS — [Rotina Fiscal](https://www.rotinafiscal.com.br/outros/reforma-tributaria)
- **Imposto Seletivo:** brinquedos (NCM 9503.00.21) não aparecem nas listas de alíquota zero, de redução de 60% nem do Imposto Seletivo da LC 214/2025 — [Buscador NCM 95030021](https://buscadorncm.com.br/ncm/95030021)

### Inferences
- **App de inglês B2C para pais:** não é educação infantil regular. Está mais perto de um curso de idiomas ou curso livre e, tecnicamente, de licenciamento de software. A previsão é alíquota cheia de IBS e CBS (cerca de 26,5% a 28% em 2033). Na transição de 2027 a 2032, a carga cresce aos poucos.
- **Peso da reforma no B2C dentro do Simples:** enquanto a empresa ficar no Simples "puro", a reforma pesa pouco no B2C. O IBS e a CBS ficam embutidos no DAS, e o LC 214 manteve o Simples. O impacto grande aparece ao sair do Simples, quando a empresa passa a pagar até cerca de 26,5% ou mais sobre o preço líquido, contra cerca de 14% a 16% hoje no Presumido.
- **B2B2C (escola como cliente):**
  - Mesmo que a mensalidade da escola tenha a redução de 60%, o software comprado pela escola paga alíquota cheia.
  - Uma escola no regime regular pode tomar crédito do IBS e da CBS destacados. Isso torna atraente para a startup optar pelo regime híbrido nas vendas B2B.
  - Escolas no Simples ou imunes (sem fins lucrativos) não aproveitam crédito.
- **Caminho possível, mas arriscado:** posicionar o produto como "serviço educacional" vendido junto com uma escola parceira (o licenciado presta o ensino regular) poderia, em tese, deixar parte da receita no Anexo II. É uma estrutura agressiva e depende de NBS e de regulamentação. Não deve ser premissa do business case.
- **Descanso no curto prazo:** em 2026 não há custo extra efetivo, porque o ano é de teste.

### Gaps
- Não verifiquei o texto atual do art. 129 e do Anexo II com as alterações da LC 227/2026, nem os códigos NBS exatos.
- Não encontrei posição do CGIBS ou da RFB sobre EdTech ou apps educacionais.
- Não há alíquotas definitivas de IBS e CBS para 2027 e 2033. Elas dependem de resolução do Senado e do cálculo do TCU.
- Não confirmei a regra exata para empresa do Simples que importa serviços sob o IBS e a CBS: se paga à parte e se tem crédito no regime híbrido.

---

## 3. Pagar fornecedores estrangeiros (Agora, LLM, TTS, avatar): IRRF, CIDE, PIS/COFINS-Importação, ISS-Importação, IOF, mudanças com IBS/CBS e carga total

### Takeaway
- **Situação em 2026:** pagar uma API americana tem uma carga de "custo Brasil" alta, de cerca de 35% a 45% sobre o valor da fatura, conforme a caracterização. As peças são:
  - IRRF de 15%, com gross-up quando o contrato fixa o preço líquido;
  - PIS/COFINS-Importação de 9,25%;
  - ISS-Importação de 2% a 5%;
  - IOF-câmbio, que provavelmente é de 3,5% desde 2025;
  - CIDE de 10%, só se a operação for vista como serviço técnico ou transferência de tecnologia.
- **A partir de 2027:** a CBS-Importação substitui o PIS/COFINS-Importação. De 2029 a 2032, o IBS substitui o ISS-Importação. O IRRF, a CIDE e o IOF continuam, porque a reforma é só do consumo.
- **Crédito:** no regime regular, o IBS e a CBS na importação geram crédito. No Simples "puro", provavelmente não.

### Cited Findings
- **SC Cosit 107/2023:**
  - Licença de uso de software é royalty para fins de IRRF: 15%, ou 25% para paraíso fiscal.
  - É serviço para fins de PIS/COFINS-Importação, e por isso essas contribuições incidem.
  - A CIDE, em regra, não incide sobre licença, salvo se houver transferência de tecnologia.
  - Serviços técnicos ou de manutenção que não geram nova licença pagam CIDE de 10%.
  - Fontes: [Machado Meyer](https://www.machadomeyer.com.br/pt/boletim/legislacao-federal-receita-federal-entende-pela-incidencia-de-irrf-e-pis-cofins-importacao-sobre-licenciamento-de-software); [Demarest](https://www.demarest.com.br/receita-federal-conclui-pela-incidencia-de-pis-cofins-importacao-sobre-remessas-efetuadas-como-remuneracao-por-licencas-de-uso-de-software/); [Chambers](https://chambers.com/articles/federal-taxation-of-software-increase-in-the-tax-burden-and-new-disputes-with-the-tax-authorities); [NetCPA](https://netcpa.com.br/noticias/irrf-cide-pispasep-importacao-e-cofins-importacao-solucao-de-consulta-software/16044)
- **Instabilidade:** a SC 303/2017 tinha entendimento contrário sobre PIS/COFINS. A SC 177/2024 afastou o PIS/COFINS-Importação sobre direito de comercialização, por não ser serviço. Ou seja, o tratamento depende de o contrato ser de licença de uso (SaaS), de distribuição ou de serviço técnico — [Tributo Devido](https://tributodevido.com.br/portal/tributacao-de-remessas-ao-exterior-por-licenciamento-de-software/); [EY Tax Alert nov/2024](https://assets.ey.com/content/dam/ey-sites/ey-com/pt_br/topics/tax-alert/ey-brasil-receita-federal-07-11-2024.pdf)
- **Carga combinada citada:** IRRF de 15%, CIDE de 10% (quando aplicável) e PIS/COFINS-Importação de 9,25%. A carga efetiva "pode ultrapassar 30%" do valor remetido. A fonte é um glossário e deve ser lida com cautela — [TaxUp, CIDE-royalties](https://taxup.com.br/glossario/cide-royalties/)
- **ISS-Importação:** é devido ao município do tomador (LC 116, art. 3º, I). Em geral, quem compra no Brasil é responsável pela retenção. A alíquota fica entre 2% e 5% — [TaxUp, ISS SaaS](https://taxup.com.br/iss-software-saas-municipio-codigo-retencao/)
- **IOF-câmbio para pagamento de serviços e royalties por pessoa jurídica ("operações sem regra específica"):**
  - Antes de maio de 2025: 0,38%.
  - Pelo Decreto 12.466/2025 (de 23/05 a 11/06/2025): 3,5%.
  - Pelo Decreto 12.499/2025 (desde 12/06/2025): 3,5%, mantido.
  - Fonte: [Lefosse](https://lefosse.com/?p=24157)
- **IOF, idas e vindas de 2025:** o Congresso sustou o decreto pelo Decreto Legislativo 176/2025 (DOU de 27/06/2025). Depois, uma decisão de ministro do STF, em julho de 2025, restabeleceu o decreto — [Opovo, derrubada](https://www.opovo.com.br/noticias/economia/2025/06/28/entenda-como-fica-o-iof-apos-derrubada-de-decreto.html); [Mercado & Consumo, decisão do STF, 18/07/2025](https://mercadoeconsumo.com.br/18/07/2025/noticias/entenda-como-fica-o-iof-apos-decisao-de-ministro-do-stf/)
- **Com IBS/CBS:** a importação de serviços e de bens imateriais passa a ser tributada a partir de 2027 (art. 64), com crédito no regime regular. A fonte não fala de IRRF, CIDE nem IOF — [TaxUp, SaaS](https://taxup.com.br/reforma-tributaria-tecnologia-saas/); [LegJur](https://www.legjur.com/legislacao/art/lec_00002142025-517)

### Inferences
- **Exemplo em 2026:** fatura de US$ 10.000 da Agora ou de um provedor de LLM, contrato com preço líquido (o fornecedor não aceita retenção), SaaS sem transferência de tecnologia, empresa em São Paulo.

| Componente | Valor (US$) | Observação |
|---|---|---|
| Base bruta para IRRF | 10.000 ÷ 0,85 = 11.765 | Gross-up |
| IRRF 15% | 1.765 | Equivale a 17,6% sobre a fatura. Não compensável no Simples nem no Presumido |
| PIS/COFINS-Importação 9,25% | ≈ 1.088 | Simplificado. A base legal inclui ISS e as próprias contribuições, então o efetivo é maior. É custo puro fora do Lucro Real não cumulativo |
| ISS-Importação 2,9% (São Paulo) | ≈ 341 | |
| IOF 3,5% sobre o valor convertido | ≈ 350 | |
| **Total** | **≈ 3.544** | **Cerca de 35% sobre a fatura** |
| CIDE de 10%, se for serviço técnico | ≈ 1.176 a mais | Total sobe para cerca de 47% |

- **Atenuantes possíveis:**
  - Não há tratado Brasil-EUA para evitar dupla tributação. Por isso, o fornecedor americano em geral não credita o IRRF e exige gross-up.
  - Contratar via revenda ou reseller brasileiro (marketplaces de cloud, como AWS Brasil ou Azure Brasil, que emitem nota local) troca a importação pela compra local de serviço. Nesse caso incidem só PIS/COFINS e ISS do revendedor, e o custo para a startup pode cair bastante.
  - Esse ponto pesa muito na escolha de fornecedor no business case.
- **Pagamento com cartão internacional:** é comum startups pagarem APIs com cartão corporativo. Nesse caso incide o IOF de cartão. Legalmente, IRRF, PIS/COFINS-Importação e ISS continuam devidos (é importação de serviço), mas muitas empresas pequenas deixam de recolher, o que gera passivo. Esta é uma inferência e não foi verificada em fonte.
- **Empresa no Simples:** PIS/COFINS-Importação e IRRF não estão dentro do DAS e são pagos à parte (LC 123, art. 13, §1º; não verificado nesta pesquisa). Além disso, a empresa do Simples não toma crédito, então a carga de cerca de 35% sobre o custo de API é custo cheio.
- **Depois da reforma (2027 em diante):**
  - A CBS-Importação (cerca de 8,8%) substitui os 9,25%.
  - A partir de 2029, o IBS substitui gradualmente o ISS-Importação.
  - Em 2033, o IBS e a CBS na importação ficam em cerca de 26,5% a 28%.
  - Se a empresa estiver no regime regular ou no híbrido, esse valor vira crédito (custo zero, salvo o efeito de fluxo de caixa). No Simples "puro", provavelmente vira custo cheio. Isso é um argumento forte para sair do Simples ou optar pelo híbrido quando o gasto com APIs estrangeiras for grande.
  - IRRF, IOF e eventual CIDE continuam como custo.

### Gaps
- Não confirmei a vigência atual da alíquota de 3,5% do IOF para serviços em nov/2026. Ela é provável, dado o Decreto 12.499 e a decisão do STF de julho de 2025, mas não verifiquei mudanças posteriores.
- Não confirmei se a SC 107/2023 foi revista ou superada. A EY a descreve no passado em nov/2024.
- Não confirmei a fórmula exata da base do PIS/COFINS-Importação sobre serviços (inclusão "por dentro").
- Não tenho regra verificada sobre a responsabilidade do fornecedor estrangeiro de se inscrever no IBS/CBS em vendas B2B.

---

## 4. App stores: comissões da Apple e do Google como custo, e mudanças no Brasil (CADE, pagamentos alternativos)

### Takeaway
Pelo TCC homologado pelo CADE em 23/12/2025, a Apple no Brasil passou a ter:
- comissão máxima de 21% (antes 30%), e 10% para pequenos desenvolvedores e algumas categorias;
- 15% sobre compras feitas via link externo;
- 5% para apps distribuídos fora da App Store;
- mais 5% de processamento quando se usa o IAP da Apple.

As regras estão em vigor desde meados de 2026, com o iOS 26.2. O Google mudou a estrutura globalmente: taxa de serviço de 10% para assinaturas, mais 5% se usar o billing do Google. Não confirmei a aplicação específica ao Brasil. No business case, usar cerca de 15% (ou 10% + 5%) como custo de loja é razoável para uma startup pequena.

### Cited Findings
- **Apple e CADE:** o Tribunal do CADE homologou o Termo de Compromisso de Cessação (TCC) em 23/12/2025. O processo teve origem em denúncia do Mercado Livre. Os desenvolvedores podem distribuir por lojas alternativas, que dependem de autorização da Apple, e processar pagamentos de bens digitais fora do IAP. O acordo vale por 3 anos a partir da obrigatoriedade — [Jornal de Brasília](https://jornaldebrasilia.com.br/noticias/economia/cade-firma-acordo-para-apple-oferecer-outras-formas-de-pagamento-e-lojas-alternativas-de-apps/); [Times Brasil/CNBC](https://timesbrasil.com.br/empresas-e-negocios/tecnologia-e-inovacao/cade-firma-acordo-para-apple-oferecer-outras-formas-de-pagamento-e-lojas-alternativas-de-apps/)
- **Taxas da Apple no Brasil:**
  - Comissão máxima de 21% (antes 30%).
  - 10% para pequenos desenvolvedores e certas categorias.
  - 15% para pagamento em site externo.
  - 5% sobre vendas digitais de apps distribuídos fora da App Store.
  - Mais 5% de processamento quando se usa o sistema de pagamento da Apple.
  - Fontes: [TecMundo](https://www.tecmundo.com.br/mercado/413975-apple-oficializa-lojas-externas-no-brasil-e-outros-meios-de-pagamento-na-app-store.htm); [Baguete](https://www.baguete.com.br/noticias/apple-libera-lojas-alem-da-app-store-para-desenvolvedores); [NeonPay](https://www.neonpay.com/blog/apples-brazil-antitrust-settlement-whats-going-to-change-for-mobile-game-developers)
- **Datas:** há conflito entre as fontes. O TNH1 cita 18 de junho de 2026 e também "18 de outubro". O Baguete diz que as regras estão em vigor com o iOS 26.2. O acordo não inclui Pix no Apple Pay — [TNH1](https://www.tnh1.com.br/noticia/nid/apple-libera-sistema-de-pagamentos-em-aplicativos-no-brasil-apos-acordo-com-o-cade/); [Baguete](https://www.baguete.com.br/noticias/apple-libera-lojas-alem-da-app-store-para-desenvolvedores); [Jornal de Brasília](https://jornaldebrasilia.com.br/noticias/economia/apple-libera-sistema-de-pagamentos-em-aplicativos-no-brasil-apos-acordo-com-o-cade/)
- **Google Play, nova estrutura:**
  - A taxa de serviço foi separada da taxa de billing: mais 5% se usar o faturamento do Google.
  - Assinaturas pagam 10% de serviço, ou 15% no total com o billing do Google.
  - A taxa base cai de 15% para 10% para desenvolvedores com receita abaixo de US$ 1 milhão por ano.
  - O pagamento externo fica entre 10% e 20%.
  - A implantação no EEE, no Reino Unido e nos EUA vai até 30/06/2026. Não confirmei que isso vale para o Brasil.
  - Fontes: [Android Developers Blog](https://developer.android.com/blog/posts/a-new-era-for-choice-and-openness?hl=pt-br); [FoxData](https://foxdata.com/en/blogs/google-play-store-opens-external-billing-fees-drop-to-10-starting-june-30-2026/); [Tecnoblog](https://tecnoblog.net/noticias/em-vitoria-da-epic-games-google-reduz-taxas-da-play-store-veja-como-ficou/)

### Inferences
- **Custo de loja na modelagem B2C:**
  - Apple: cerca de 15% (10% de pequeno desenvolvedor + 5% de IAP) com IAP, ou cerca de 15% via link externo com checkout próprio, que tem custo de gateway de cerca de 3% a 5%, mais Pix ou cartão.
  - Google: cerca de 15%, ou cerca de 10% mais o custo do gateway próprio.
- **B2B2C para escolas:** é faturado direto (nota fiscal e boleto ou Pix), sem comissão de loja. Esse é mais um argumento a favor do canal escola.
- **Base de cálculo:** em geral, a comissão da loja é custo e não reduz a base de ISS ou Simples da startup, que tributa o preço cheio pago pelo usuário se for considerada a vendedora. Isso depende de a loja atuar como revendedora ("merchant of record") ou como agente. Não verificado.

### Gaps
- Não consultei a página oficial da Apple Developer com a tabela brasileira, nem a página do Google Play com regras específicas para o Brasil.
- Não verifiquei o tratamento fiscal brasileiro da receita via App Store ou Google Play: se a Apple é a vendedora, como fica a nota fiscal, se o repasse do exterior é exportação de serviço ou se incide IRRF.

---

## 5. Hardware (brinquedo conectado) no Brasil: II, IPI, ICMS, Inmetro, Anatel, Remessa Conforme e efeito da reforma

### Takeaway
- **Imposto de Importação sobre brinquedos (NCM 9503):** hoje é de 20% (já foi 35%, reduzido em etapas pela Res. Gecex 121/2020). Há pedido de ex-tarifário para zerar alguns itens, em análise no MDIC em 2026.
- **Somando ICMS (17% a 20%+) e PIS/COFINS-Importação**, a carga na importação formal passa facilmente de 50% a 60% sobre o valor aduaneiro.
- **Certificações:** brinquedo com Wi-Fi ou Bluetooth precisa da certificação compulsória do Inmetro (segurança de brinquedo) e da homologação da Anatel, com ensaios no Brasil, taxa de cerca de R$ 500 e prazo de 15 a 50 dias de análise mais os testes.
- **Reforma:** no modelo pleno, IBS e CBS (cerca de 26,5% a 28%) substituem IPI parcial, PIS/COFINS e ICMS. O brinquedo não está no Imposto Seletivo nem tem redução.

### Cited Findings
- **Imposto de Importação de 20%** para os NCMs 9503.00.10, .39, .50, .21 e .99, segundo as Res. Gecex 272/2021 e 391/2022 (consulta de out/2025) — [Buscador NCM 95030099](https://buscadorncm.com.br/ncm/95030099); [95030021](https://buscadorncm.com.br/ncm/95030021)
- **Histórico:** a alíquota já foi de 35% e caiu para 20% em etapas, pela Res. Gecex 121/2020 — [FazComex](https://www.fazcomex.com.br/blog/brinquedos-governo-reduz-o-imposto-de-importacao); [LegisWeb](https://www.legisweb.com.br/noticia/?id=24818)
- **Ex-tarifário em 2026:** nota técnica do MDIC (240ª reunião do Gecex, ago/2026) sobre pedidos da Abrinq para reduzir de 20% para 0% itens da 9503 (inclusive 9503.00.10 e 9503.00.21). O resultado não foi localizado. O mesmo documento menciona alíquota aplicada de 18% (Anexo II da Res. 272/2021), sem deixar claro para qual NCM — [MDIC, Nota Técnica 1283/2026](https://www.gov.br/mdic/pt-br/assuntos/camex/outros-documentos/notas/deferimentos/240a-reuniao-ordinaria-do-comite-executivo-de-gestao-gecex/extrato-publico-da-nota-tecnica-sei-no-1283_2026-mdic.pdf)
- **Imposto Seletivo e reduções:** o brinquedo não está nas listas de alíquota zero, de redução de 60% nem do Imposto Seletivo da LC 214 — [Buscador NCM](https://buscadorncm.com.br/ncm/95030021)
- **Anatel e Inmetro:**
  - Brinquedos com emissor de radiofrequência precisam de homologação da Anatel (Portaria Inmetro de 2010) — [LegisWeb, Portaria Inmetro 152/2010](https://www.legisweb.com.br/legislacao/?id=335080)
  - A certificação do Inmetro é obrigatória para qualquer brinquedo. A Anatel exige homologação para radiofrequência (Wi-Fi e Bluetooth, exceto infravermelho), por meio de um OCD.
  - Os ensaios precisam ser feitos em laboratório no Brasil. É possível homologar famílias de produtos. É preciso aplicar o selo da Anatel. A renovação costuma ser a cada 2 anos.
  - Produto sem homologação pode ser apreendido.
  - A fonte é de 2017 — [Tech in Brazil, brinquedos eletrônicos](https://techinbrazil.com/anatel-homologation-of-electronic-toys)
- **Custo e prazo da Anatel:** Wi-Fi e Bluetooth (categoria II) podem usar declaração de conformidade. A taxa para fins comerciais é de cerca de R$ 500 (Fistel). A análise da Anatel leva de 15 a 50 dias e pode ficar mais longa na transição para a plataforma Certifica. O teste completo de Wi-Fi leva cerca de 1 mês — [Tech in Brazil, smart home](https://techinbrazil.com/smart-homes-equipment-approval-by-anatel-in-brazil); [Tech in Brazil, como homologar](https://techinbrazil.com/how-to-obtain-an-anatel-product-homologation)
- **Remessa Conforme, em 2026, para pessoa física:**
  - Até US$ 50: Imposto de Importação zerado (MP 1.357/2026, a partir de 12 ou 13/05/2026, com datas divergentes), com ICMS de 17% a 20% conforme o estado.
  - Acima de US$ 50: 30% para plataformas do programa e 60% fora dele (cita-se o PLV 13/2026, sancionado em 10/09/2026).
  - Fontes: [InfoMoney](https://www.infomoney.com.br/minhas-financas/fim-da-taxa-das-blusinhas-veja-o-que-muda-nas-compras-internacionais/); [NetCPA](https://netcpa.com.br/colunas/fim-da-taxa-das-blusinhas-veja-o-que-muda-nas-compras-internacionais/27755); [Forbes Brasil, set/2026](https://forbes.com.br/geral/2026/09/taxa-das-blusinhas-veja-como-ficam-as-compras-internacionais/)

### Inferences
- **Importação formal de um lote de brinquedos com valor aduaneiro de R$ 100** (estimativa didática, alíquotas não verificadas exceto o II):
  - II de 20%: R$ 20.
  - IPI: incerto, ver Gaps.
  - PIS/COFINS-Importação de bens: cerca de 11,75%, ou R$ 11,75.
  - ICMS de cerca de 18% a 20% "por dentro": cerca de R$ 30 a 35.
  - Total: cerca de R$ 160 a 170 de custo tributário mais o valor aduaneiro, antes de frete, despachante e margem. Sobre isso ainda incidem os tributos de venda interna (Simples ou regime normal).
- **Remessa Conforme:** serve para venda B2C cross-border (o fornecedor no exterior vende direto ao consumidor brasileiro), não para a startup brasileira importar estoque. Um brinquedo conectado de US$ 50 a US$ 100 vendido assim pagaria cerca de 30% mais ICMS. Como produto de radiofrequência, ainda precisaria da Anatel, e a remessa sem homologação pode ser retida.
- **Prazo e custo totais de certificação (Inmetro + Anatel):** sem número verificado. Ordem de grandeza plausível: alguns meses e algumas dezenas de milhares de reais, mais o custo de amostras. Planejar 3 a 6 meses antes do lançamento. É estimativa, não fato.
- **Reforma:** a partir de 2027, a CBS substitui o PIS/COFINS-Importação. De 2029 a 2032, o IBS substitui gradualmente o ICMS. O II continua (é regulatório e de comércio exterior). Para quem estiver no regime regular, o IBS e a CBS na importação geram crédito na revenda.
- **Lei de Informática (Lei 8.248/1991, reformulada em 2019):** pode interessar se o hardware for fabricado ou montado no Brasil com PPB. Não pesquisado.

### Gaps
- Não verifiquei a alíquota de IPI da TIPI para o NCM 9503.
- Não encontrei custo nem prazo oficiais da certificação Inmetro de brinquedos (portaria vigente, OCP, ensaios).
- Não sei se o ex-tarifário da Abrinq foi aprovado.
- Não verifiquei se a taxa da Anatel continua em R$ 500 em 2026, nem os requisitos específicos para brinquedo com microfone e conectividade (por exemplo, SAR ou segurança cibernética).
- A NCM de um brinquedo conectado pode ser discutível (9503 vs 8517/8543, como dispositivo eletrônico), o que muda II, IPI e certificações.

---

## 6. Exterior (resumo) e incentivos: sales tax de SaaS nos EUA, IVA na UE (OSS), IVA no Reino Unido, DSTs, Lei do Bem e Lei de Informática

### Takeaway
- **Venda para consumidores no exterior:**
  - UE: limite zero para vendedor de fora da UE. É preciso registrar-se no Non-Union OSS de um Estado-membro e cobrar o IVA do país do consumidor (cerca de 17% a 27%).
  - Reino Unido: limite zero para não residentes (o IVA padrão é de 20%; ver Gaps).
  - EUA: cerca de 24 estados mais DC tributam SaaS (por exemplo, NY 4% estadual, TX 6,25% sobre 80%, PA 6%), com nexo econômico em geral a partir de US$ 100 mil (US$ 500 mil em NY e TX).
- **Na prática:** vender pela App Store ou pelo Google Play terceiriza boa parte disso, porque as lojas recolhem o IVA e o sales tax como "marketplace facilitator". Isso é uma inferência.
- **Lei do Bem:** só vale para empresas no Lucro Real com lucro, então não se aplica a startup no Simples.

### Cited Findings
- **UE:** o limite de €10 mil vale só para vendedores estabelecidos na UE. Para quem é de fora da UE, o limite é €0 em serviços digitais B2C. O Non-Union OSS dispensa estabelecimento na UE: escolhe-se um "Member State of Identification" — [Good-VAT, Non-Union OSS 2026](https://good-vat.pages.dev/guides/selling-to-eu/non-union-oss-digital-services); [Taxually](https://www.taxually.com/blog/eu-vat-oss-ioss-distance-selling-2026); [Gerald Edelman](https://www.geraldedelman.com/insights/eu-one-stop-shop-simplifying-vat-for-cross-border-digital-services/)
- **Reino Unido:** limite de £85 mil para residentes e zero para não residentes que vendem serviços digitais. Fonte secundária única — [Lookuptax](https://lookuptax.com/docs/explainers/vat-on-digital-services-non-resident-suppliers)
- **EUA:**
  - 24 estados mais DC tributam SaaS de alguma forma (out/2026) — [TaxCloud](https://taxcloud.com/blog/saas-sales-tax-by-state/)
  - Nova York: tributável, 4% estadual (mais local), com nexo acima de US$ 500 mil e 100 transações.
  - Texas: "data processing", 6,25%, com 80% do valor tributável.
  - Pensilvânia: 6%, como "canned software".
  - Washington: as fontes conflitam (tributável a 6,5% vs "maior parte isenta"), além do B&O tax.
  - Fontes: [Stripe](https://stripe.com/resources/more/software-sales-tax-for-saas-companies); [Kruze](https://kruzeconsulting.com/blog/which-states-tax-saas/); [Numeral](https://numeral.com/blog/sales-tax-on-saas)
  - Uma fonte menciona uma reforma na Califórnia com sales tax de 7,5% sobre SaaS a partir de 01/01/2027. Não confirmei se foi aprovada ou se é só proposta — [VATCalc](https://www.vatcalc.com/united-states/california-7-5-sales-tax-on-saas-software-january-2027/)
- **Lei do Bem (Lei 11.196/2005):** restrita ao Lucro Real com lucro fiscal no exercício, o que exclui Simples e Presumido. Prevê exclusão adicional de 60% a 80% dos gastos com P&D na base do IRPJ e da CSLL (art. 19). O PLP 134/2020, que estenderia o benefício ao Simples, tinha situação não informada. Uma via indireta é a parceria com empresa elegível — [Planning](https://planning.com.br/lei-do-bem-inovacao-tecnologica/); [Razonet](https://razonet.com.br/contabilidade-digital/incetivos-fiscais-para-startups); [Omie, PLP 134/2020](https://www.omie.com.br/blog/lei-do-bem-simples-nacional-plp-134-2020/)
- **Lei do Bem e IA:** existe uma SC Cosit 193 sobre Lei do Bem e inteligência artificial (conteúdo não lido) — [TaxUp](https://taxup.com.br/lei-do-bem-inteligencia-artificial-sc-cosit-193/)

### Inferences
- **Exportação de serviço:** a receita de venda para o exterior com ingresso de divisas tende a ser exportação de serviço. Há isenção de ISS (LC 116, art. 2º) e de PIS/COFINS, e imunidade de IBS/CBS na reforma (art. 80 da LC 214). No Simples, a receita de exportação é segregada e não paga a parcela de ISS e PIS/COFINS. Regra geral, não verificada nesta pesquisa.
- **Isenção educacional na UE:** a isenção de IVA para educação, em geral, não cobre e-learning automatizado, que é tratado como "serviço eletrônico". Um app de IA tende a pagar IVA cheio. Inferência, não verificada.
- **Estratégia para a fase inicial:** vender no exterior via lojas de apps e deixar a Apple ou o Google como "merchant of record". Isso evita registros de OSS, VAT no Reino Unido e sales tax nos EUA.

### Gaps
- Não pesquisei impostos sobre serviços digitais (DSTs) da França, Reino Unido e outros. Em geral, eles valem só para grupos com receita global acima de €750 milhões, então não seriam relevantes para a startup. Isso não foi verificado.
- Não confirmei na HMRC a regra de VAT do Reino Unido para serviços digitais de não residentes.
- Não verifiquei a Lei de Informática nem o Padis para hardware, nem incentivos específicos para IA ou edtech (por exemplo, Finep, Embrapii, BNDES Garagem), que não são incentivos fiscais.
- Não confirmei a situação do PLP 134/2020.
