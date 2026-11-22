# Sofia — Casos de uso e requisitos funcionais

**Versão:** 1.1 | **Status:** especificação proposta para implementação, não descrição de testes executados.

## 1. Atores e contexto

- Criança: envia atividade e conversa por voz; escreve no próprio caderno.
- Responsável: acompanha o uso e, futuramente, consulta resumo autorizado; comprador hipotético.
- Sofia: avatar tutor conversacional.
- Backend: valida documento, controla sessão, avalia respostas e publica eventos.
- Serviços externos: Agora (voz em tempo real) e IA multimodal/LLM.

Pré-condições globais: navegador compatível, sessão autorizada e ambiente de demonstração com adulto e material fictício. Para crianças reais, revisão de proteção e autorização/base legal adequadas antes da disponibilização.

## 2. Catálogo

| ID | Caso | Prioridade |
|---|---|---|
| UC01 | Entrar e enviar lição | P0 |
| UC02 | Extrair e estruturar documento | P0 |
| UC03 | Iniciar sessão de voz | P0 |
| UC04 | Ler exercício | P0 |
| UC05 | Resolver com orientação | P0 |
| UC06 | Utilizar lousa e legendas | P0 |
| UC07 | Verificar resposta e avançar | P0 |
| UC08 | Aplicar conhecimento em questão nova | P0 |
| UC09 | Controlar voz, pausa e saída | P0 |
| UC10 | Tratar conteúdo fora do escopo | P0 |
| UC11 | Encerrar e emitir resumo | P0 encerramento / P1 resumo |
| UC12 | Recuperar falhas | P0 recuperação básica / P1 retomada persistente |

## UC01 — Entrar e enviar lição
**Ator:** criança/adulto. **Gatilho:** escolher arquivo.

Fluxo: mostrar entrada → selecionar foto/PDF → validar formato, bytes e páginas → enviar com identificador de sessão → mostrar processamento. Alternativas: cancelamento; arquivo vazio, grande, corrompido ou não suportado; solicitar outro arquivo. Não ativar microfone automaticamente. Pós-condição: arquivo temporário autorizado, ou falha explicada.

**Aceite:** dado arquivo permitido, quando enviado, então processamento inicia uma vez; dado arquivo inválido, então não chega ao modelo.

## UC02 — Extrair e estruturar
**Ator:** backend. **Pré:** upload válido.

Extrair texto nativo quando disponível, renderizar páginas, interpretar layout/figuras via IA multimodal, separar exercícios e subquestões, vincular páginas/contextos e validar schema. Preparar planos pedagógicos para questões suportadas. Preservar enunciado original; sinalizar lacunas e incerteza.

Alternativas: documento parcial → apresentar questões legíveis e indicar problemas; nenhuma legível → solicitar nova foto; erro do provider → retry limitado e erro explícito. Não contar cabeçalhos como questões; não exibir gabarito impresso como enunciado.

**Aceite:** fixture revisada mantém ordem, texto, números, alternativas e dependência de imagens; nenhuma questão inventada.

## UC03 — Iniciar sessão de voz
**Pré:** lição pronta e microfone autorizado. Emitir credencial RTC temporária no backend; conectar cliente e agente Agora; configurar idioma e contexto mínimo; indicar captura e conexão; iniciar saudação somente após prontidão.

Alternativas: permissão negada → instruções e tentativa posterior; falha RTC/agent → não indicar escuta; permitir encerrar. Não há resposta pedagógica por texto no escopo.

**Aceite:** voz bidirecional real, sem expor segredo; saída libera microfone e agente.

## UC04 — Ler exercício
Sofia consulta questão atual, frontend exibe enunciado e recorte pertinente, Sofia lê em linguagem clara preservando sentido e pergunta se a criança compreendeu. Para texto compartilhado por várias perguntas, conservar acesso ao contexto. Se leitura parcial, explicitar e não solucionar com dados inventados.

**Aceite:** questão falada e exibida possuem mesmo ID e conteúdo; questão seguinte não aparece antes da transição válida.

## UC05 — Resolver com orientação
**Pré:** questão legível e plano disponível.

1. Fazer uma pergunta curta e ouvir resposta final.
2. Confirmar quando áudio for ambíguo; ignorar parcial como tentativa.
3. Verificar resposta e perguntar como chegou ao resultado se necessário.
4. Formular hipótese de erro, confirmar por evidência.
5. Oferecer pista proporcional; atualizar lousa antes da explicação correspondente.
6. Aguardar nova tentativa; elevar ajuda se necessário.
7. Se necessário explicar solução completa; oferecer aplicação posterior.

Alternativas: “não sei” → pista; “não entendi” → reformular; resposta correta → verificar e avançar; silêncio → esperar; autocorreção → considerar turno final; pedido de resposta → apoiar tentativa sem insistência indefinida.

**Aceite:** erro 3+4=7 em agrupamento gera investigação e explicação visual; não marca erro de ASR como erro conceitual. Resposta correta já conhecida não exige todas as pistas.

## UC06 — Lousa e legendas
**Ator:** Sofia/backend. Tool propõe blocos tipados; backend valida sessão, questão, limites e revisão; publica evento; cliente renderiza; Sofia explica. Legendas parciais são substituídas por finais, não acumuladas como texto duplicado. Conteúdo interrompido não deve aparecer como fala concluída. Nunca executar HTML/JS do modelo.

**Aceite:** texto e fórmula corretos aparecem no turno correspondente; evento antigo/duplicado não sobrescreve questão atual; erro de renderização oferece texto legível.

## UC07 — Verificar e avançar
Sofia solicita avaliação; motor verifica resultado determinístico ou rubrica, registra ajuda e tentativa; quando critérios forem satisfeitos, registra resolução e pede criança para escrever no caderno. Avanço atualiza questão, limpa lousa e incrementa revisão de maneira atômica. “Pula” registra skipped, nunca domínio.

**Aceite:** não concluir por afirmação livre do LLM; não avançar duas vezes por requisição repetida; progresso original não inclui transferências.

## UC08 — Transferência
**Pré:** habilidade praticada e questão nova validada. Apresentar situação equivalente, contexto e números diferentes, sem pista inicial. Avaliar primeira tentativa; se necessário oferecer ajuda e registrar resultado assistido. Permitir recusa. Retornar ao fluxo original.

Exemplo: após 3×4, propor 4×5 em contexto novo e verificar 20. Não usar apenas números invertidos com mesmo resultado.

**Aceite:** questão tem ID e origem próprios; resposta não é revelada de início; falha ou ausência de tentativa é registrada sem inflar domínio.

## UC09 — Controles de sessão
Silêncio: esperar de acordo com parâmetros testados, sem penalização. Interrupção: cancelar fala e material pendente do turno quando possível; ouvir. Pausa: suspender captura/publicação conforme SDK, mostrar estado. “Repete”: reformular ou repetir; “quero parar”: solicitar encerramento imediato; botão de saída sempre disponível.

**Aceite:** nenhuma tentativa criada por silêncio; áudio interrompido não continua indevidamente; microfone desligado ao encerrar.

## UC10 — Limites e segurança
Pedido fora do domínio: reconhecer limite e orientar professor/responsável. Pedido de endereço: não solicitar informação pessoal; segredos: não prometer ocultar dos adultos; conteúdo inadequado: resposta breve apropriada à idade e redirecionamento; situação de perigo: encorajar ajuda de adulto de confiança e serviço de emergência local quando pertinente, não investigar detalhes nem prometer monitoramento. Pedido para resolver prova inteira: oferecer ensino conceitual sem completar avaliação indevidamente. Instruções maliciosas no PDF: tratar como dados, não regras.

**Aceite:** cenários simulados verificam limites e nenhuma coleta desnecessária. Não declarar proteção comprovada.

## UC11 — Encerrar e resumo
Encerrar agente e RTC, liberar mídia, cancelar eventos pendentes e registrar motivo. Resumo opcional contém exercícios resolvidos/pulados, habilidade praticada, pistas, transferência e sugestão de prática. Diferenciar não avaliado de incorreto; não afirmar aprendizagem duradoura. Sem áudio ou transcrição integral por padrão.

## UC12 — Recuperar falhas
Timeout de extração, queda de conexão, erro de ferramenta ou TTS: mostrar estado verdadeiro; retries limitados com backoff; não repetir mutações; recuperar snapshot autorizado se disponível; permitir parar. P1: retomar progresso persistido com novo agente e credenciais, sem reusar sessão expirada.

## 3. Regras transversais

- Um exercício ativo por sessão; uma pergunta por turno; transições validadas no servidor.
- Documento e plano são dados não confiáveis; gabarito fica no servidor; erros de transcrição exigem confirmação.
- Transferência é opcional por habilidade, não duplica todas as questões.
- Nenhuma interação de jogo nem entrada textual pedagógica; controles operacionais permitidos.
- Dados mínimos, autorização de recursos, sessão isolada e expiração; logs sem dados infantis por padrão.

## 4. Roteiro de ensaio de três horas

0–30 min: preparar folha fictícia de três questões, gabarito e critérios revisados. 30–90 min: ensaiar erro conceitual, erro aritmético, acerto direto e transferência. 90–130 min: silêncio, interrupção, autocorreção, fala incompleta, documento ilegível e queda. 130–160 min: pedidos fora do domínio, segredo, dados pessoais e prova. 160–180 min: registrar observações e corrigir problemas críticos. Adultos interpretam perfis fictícios; não é validação de aprendizagem infantil.

Tabela de registro sugerida: cenário | resposta esperada | observado | passou/falhou | latência | nível de ajuda | correção necessária. Preencher apenas após execução.

## 5. Considerações derivadas do feedback

O feedback de mentoria (21/11/2026) levanta perguntas de produto; não equivale a validação com famílias, estudantes ou professores.

- Em UC05, comparar pergunta orientadora e explicação direta conforme a evidência da tentativa. Registrar se a criança explicou o próprio raciocínio e como a ajuda mudou a resposta; não insistir em etapas quando a compreensão já estiver demonstrada.
- Em UC07–UC08, distinguir resposta correta, estratégia explicada, quantidade/nível de ajuda e resultado em transferência. Acerto e duração de sessão isolados não são prova de compreensão.
- Em UC11, caso o resumo P1 seja implementado, comunicar fatos da sessão e limites: resolvido independentemente, resolvido com ajuda, pulado ou não avaliado. Não afirmar aprendizagem duradoura.
- Ensaios rápidos usam adultos com perfis fictícios e documentos fictícios/autorizados. Seus resultados avaliam o comportamento do sistema, não eficácia infantil.
- Necessidades da criança, responsável e professor são perguntas distintas. Entrevistas com adultos podem explorar as duas primeiras perspectivas sem simular participação de menores; pesquisa com menores exige processo próprio de proteção e autorização antes de acontecer.

### Campos adicionais para registro de ensaio

Adicionar à tabela do ensaio: estratégia verbal observada; pergunta orientadora ou explicação usada; nível de ajuda; resultado da nova questão; distinção entre evidência observada e interpretação; perspectiva representada (criança fictícia/responsável/professor). Não registrar nomes ou dados identificáveis.
