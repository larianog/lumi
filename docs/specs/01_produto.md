# Sofia — Documento de Produto (PRD)

**Equipe:** newDirections | **Versão:** 1.0 — pós-pivot | **Data:** 21/11/2026

> [DECISÃO] Direção definida na conversa. [PROPOSTA] Solução a implementar. [HIPÓTESE] Requer validação. [PENDENTE] Decisão ou evidência ausente. Este documento não certifica funcionalidades já implementadas.

## 1. Visão e posicionamento

Sofia é um copiloto educacional infantil de reforço escolar que transforma a lição de casa em uma sessão de aprendizagem guiada por voz. A criança envia uma foto ou PDF, acompanha a leitura dos exercícios e conversa com um avatar que explica, investiga dificuldades e apresenta apoio visual.

**Proposta de valor:** Sofia não faz a lição pela criança: ensina a criança a resolvê-la com autonomia.

[DECISÃO] O material escolar enviado substitui o catálogo de missões. Não haverá jogos, mundos, arrastar objetos, quizzes clicáveis ou outras mecânicas interativas pedagógicas. A voz é a modalidade de resposta; upload, microfone, pausa e encerramento são controles operacionais. A escrita da resposta ocorre no caderno da criança, fora do aplicativo.

## 2. Problema e público

[HIPÓTESE] Crianças enfrentam dificuldades pontuais na lição; responsáveis podem não ter tempo ou preparo para oferecer explicações individualizadas. Respostas prontas podem ocultar falta de compreensão.

[PROPOSTA] Recorte inicial: 3º ao 5º ano do Ensino Fundamental, Português e Matemática básicos. Demonstração prioritária: multiplicação como agrupamento e situações-problema. Não há validação com crianças, educadores ou famílias documentada nesta conversa.

## 3. Objetivos e não objetivos

- Compreender fielmente documentos escolares suportados.
- Ler uma questão por vez e apoiar compreensão, tentativa, correção e aplicação.
- Tornar o raciocínio visível por meio de lousa e legendas.
- Registrar evidências observáveis, distinguindo resolução assistida e independente.
- Respeitar ritmo, interrupções e limites de segurança infantil.

Não objetivos: substituir professor, diagnosticar transtornos, corrigir provas inteiras, prometer aprendizagem comprovada, cobrir todas as séries ou matérias, oferecer amizade exclusiva, criar currículo completo ou portal escolar no hackathon.

## 4. Jornada

Entrada → upload → validação → transcrição estruturada → apresentação da lição → leitura do exercício atual → tentativa oral → orientação adaptativa → verificação → registro no caderno → próximo exercício → transferência quando pertinente → resumo → encerramento.

Se o documento estiver ilegível, solicitar novo arquivo ou pular a questão. Se não houver conexão, informar e permitir retomar ou encerrar; não simular uma conversa funcionando. A criança pode dizer “repete”, “não entendi”, “pula” ou “quero parar”.

## 5. Interface e requisitos UX

| Componente | Requisito |
|---|---|
| Entrada/upload | Foto JPG/PNG ou PDF; indicação de limites e progresso; aviso de privacidade |
| Processamento | Mostrar estado real; erro recuperável; não inventar questões |
| AvatarPanel | Estados conectando, ouvindo, pensando, falando, pausado, erro |
| ExercisePanel | Enunciado fiel, número e página; contexto e imagem original quando necessários |
| LearningBoard | Texto, fórmula, lista, tabela e recorte; conteúdo apenas expositivo |
| LiveCaptions | Legendas da fala de Sofia, distintas da transcrição da criança; texto legível |
| VoiceControls | Microfone, pausa, encerramento; indicador claro de captura |
| SessionProgress | Questões concluídas, pendentes e puladas; transferência separada |
| Summary | Evidências da sessão e limites, sem transcrição integral |

Layout responsivo, contraste adequado, fonte ampliável, frases curtas e ausência de estímulos desnecessários. O enunciado original não desaparece ao atualizar a lousa. A lousa deve acompanhar turnos, sem prometer sincronização palavra a palavra.

## 6. Protocolo pedagógico

Leitura → compreensão → tentativa inicial → diagnóstico → pista → nova tentativa → verificação → consolidação. Transferência opcional por habilidade ou quando dificuldade conceitual relevante foi observada. Não obrigar todas as etapas quando a criança já demonstra compreensão.

| Nível | Intervenção |
|---|---|
| 0 | Perguntar e ouvir uma tentativa, sem pista |
| 1 | Pista conceitual curta |
| 2 | Representação visual ou decomposição |
| 3 | Estruturar parte do cálculo sem resultado final |
| 4 | Explicar a solução passo a passo quando necessário |

Investigar a causa do erro antes de classificá-lo. Erro de ASR, silêncio e hesitação não são erros pedagógicos. Uma resposta correta copiada não comprova domínio. Quando a explicação completa for necessária, oferecer nova oportunidade de aplicação.

### Exemplo fictício

Original: três caixas com quatro lápis cada. Criança diz sete. Sofia pergunta como chegou a sete. Se a criança relata 3+4, Sofia apresenta três grupos de quatro na lousa, pede a soma repetida, aguarda a tentativa e verifica 12. Transferência: quatro cestos com cinco maçãs cada; esperar resposta 20, sem revelar a operação inicialmente. Registrar se houve ajuda. A questão nova não integra a contagem da lição original.

## 7. Escopo e prioridades

| Prioridade | Entregas |
|---|---|
| P0 | Upload, extração estruturada, voz Agora, avatar, legendas, questão atual, lousa, pistas graduais, verificação, transferência, limites básicos, encerramento seguro |
| P1 | Resumo de sessão, persistência/retomada, representações adicionais e refinamento de ritmo |
| P2 | Portal de responsáveis, histórico longitudinal, integração escolar, BNCC completa, pagamentos, manuscritos complexos, outras séries |

P0 inclui indicadores de microfone, tolerância a silêncio e confirmação de transcrição ambígua; P1 refina parâmetros. Segurança e análise legal para uso real não são opcionais nem adiáveis para depois do lançamento.

## 8. Critérios de aceitação e métricas

- Uma folha fictícia com três questões pode ser enviada e lida na ordem correta.
- Sofia responde por voz em pt-BR e exibe apoio correspondente.
- Um erro conceitual provoca investigação e pista antes da resposta pronta.
- Uma questão nova equivalente, com resultado diferente, é avaliada separadamente.
- Pular ou encerrar não registra aprendizagem inexistente.
- Documento ilegível, silêncio, interrupção, autocorreção e desconexão possuem comportamento explícito.
- Pedido de segredo, dado pessoal ou conteúdo impróprio recebe limite adequado.

Métricas propostas: fidelidade da extração em conjunto revisado; proporção de respostas avaliáveis; erros diagnosticados corretamente em cenários roteirizados; nível máximo de ajuda; acerto independente na transferência; interrupções indevidas; latência e custo por sessão. Duração e simpatia não medem aprendizagem. Simulações adultas avaliam comportamento, não eficácia infantil.

## 9. Segurança, confiança e pesquisa

Demonstração com adultos e material fictício/autorizado; não recrutar menores nem usar gravações identificáveis para acelerar o hackathon. Minimizar dados, não conservar áudio por padrão, proteger sessões e credenciais. Antes de uso real: revisão especializada de melhor interesse, bases legais, LGPD, ECA Digital, fornecedores, retenção, transferência internacional e supervisão adequada. Não prometer conformidade ou compreensão universal de sotaques.

## 10. Pendências

Confirmar idade/série, duração típica, disciplinas suportadas, limites de arquivos, fornecedores e modelo de avatar, formato do resumo, requisitos de acesso do responsável, critérios de qualidade e orçamento. Inspecionar repositório antes de marcar qualquer entrega como concluída.

Referências de contexto: conversa de pivot e mentoria Terron/time newhack (21/11/2026). Caderno Oficina de Reforço Escolar — 3º ano como referência de conteúdo, não como currículo obrigatório nem licença de distribuição.
