# Produção dos vídeos de estado da Lumi

O playground em `/playground/lumi-animation` abre no modo **Vídeos por estado**, com **Falando** selecionado. Os arquivos em `public/assets/lumi/states/` são `lummi-falando-asas-web-v1.webp` para **Falando** (181 quadros, 6033 ms, 800 × 800 px) e `lummi-transparente-02.webp` para **Escutando** (192 quadros, 7999 ms, 768 × 768 px). A fala usa uma cópia de reprodução de 4.808.826 bytes (89% menor), preservando todos os quadros, tempos, dimensões e transparência. `scripts/optimize-lumi-speaking-wings.mjs` comprime as cores para a web; o original `lummi-falando-asas-preservadas.webp` conserva exatamente os 44.527.006 bytes fornecidos. O enquadramento `contain` mostra a imagem inteira e preserva as asas nos contêineres verticais. O nome novo evita reutilizar o clipe anterior em cache. A versão otimizada anterior e o original Full HD `lummi-animacao-transparente-1.webp` permanecem intactos. A escuta conserva os bytes fornecidos. Ambos têm canal alfa e repetição contínua. Esses mesmos arquivos são usados nos perfis. Os antigos `lummi-transparente.webp` e `speaking.mp4` não são mais o padrão. Os dois estados restantes ainda precisam de clipes; a imagem da Lumi é a referência quando falta um arquivo.

O laboratório também aceita um arquivo local por estado, permite conferir a transparência sobre diferentes fundos e simula uma conversa sem abrir sessões da Agora ou do Lemon Slice. Para substituir um padrão de forma permanente, atualize o asset e o registro `BUNDLED_LUMI_VIDEO_CLIPS` em `lib/lumi-video-states.ts` (incluindo tamanho e nome do arquivo).

O estado **Lendo** usa `lummi-lendo-transparente.webp`, copiado sem alterações: 118 quadros, 3933 ms, 800 × 800 px, alfa e loop contínuo. Durante o envio/análise de uma atividade, ele substitui a escuta com **Carregando…** abaixo da Lumi. A resposta aguarda pelo menos um ciclo completo, contado a partir do carregamento da animação. Se a análise demorar, a leitura repete e termina no próximo fim de ciclo após a resposta. O resultado e a conversa contextualizada só aparecem depois, na mesma página. Erros da API são imediatos; visualização inativa, aba oculta ou falha da animação liberam o resultado sem esperar. O carregamento do WebP tem limite de 15 segundos para não prender uma atividade pronta. O histórico aplica a mesma regra aos materiais ainda em processamento; materiais já prontos abrem normalmente.

## Roteiro inicial

**Comemorando** usa `lummi-comemorando-transparente.webp`, preservado exatamente: 91 quadros, 3033 ms, 800 × 800 px, 2.533.052 bytes e alfa. Na conversa sobre uma lição enviada, a tutora começa a confirmação de uma resposta correta e completa com **Você acertou!**. A aplicação reconhece apenas essa confirmação final da IA após uma resposta do usuário; upload, saudação, incentivo genérico e transcrições repetidas não disparam a comemoração. Depois da fala e do ciclo anterior, o personagem comemora um ciclo completo e retorna ao estado atual. Nova fala da IA tem prioridade imediata; aba oculta, personagem fora da tela, desconexão, falha ou espera acima de 30 segundos descartam o evento pendente. A comemoração de uma questão não grava pontos nem conclui a atividade inteira. Novas sessões de estudo recebem essa instrução; o arquivo também fica disponível no laboratório.

**Repouso** usa `lummi-idle-transparente.webp`: 121 quadros, 4033 ms, 800 × 800 px, 4.146.608 bytes, alfa e loop contínuo, preservado exatamente. É o padrão na abertura, seleção de perfis, atividades, relatório, esperas de conversa e materiais inativos. Nas conversas, ele ocupa os intervalos antes do sono e cede imediatamente à escuta ou fala. As ilustrações fora da conversa carregam apenas esse arquivo. Aba oculta e personagem fora da área visível interrompem a reprodução; a imagem estática permanece como alternativa de carregamento/falha. A simulação do playground termina pausada em **Repouso** quando o clipe está disponível.

| Estado | Duração sugerida | Reprodução | Direção |
| --- | --- | --- | --- |
| `idle` — repouso | 4–6 s | Loop | Respiração visível, olhar acolhedor e piscar ocasional. |
| `sleeping` — dormindo | 4 s | Loop | Olhos fechados e respiração calma; acorda imediatamente com interação. |
| `listening` — escutando | 4–6 s | Loop | Pequenas inclinações de cabeça, boca fechada, postura atenta. |
| `thinking` — pensando | 3–4 s | Loop | Cabeça curiosa e movimento discreto das antenas. |
| `reading` — lendo | 4 s | Loop | Leitura de um livro durante a análise da atividade; completa o ciclo antes do resultado. |
| `speaking` — falando | 4–6 s | Loop | Gestos leves de corpo e braços; boca com movimento genérico. |
| `greeting` — saudação | 2–3 s | Uma vez, volta ao repouso | Aceno amigável, começando e terminando na postura neutra. |
| `celebrating` — comemorando | 2–3 s | Uma vez, volta ao repouso | Pequeno salto alegre; termina com os pés na posição inicial. |

Priorize os loops. As durações são orientações de produção, não limites do player.

## Sono por inatividade

O estado **Dormindo** usa `lummi-dormindo-transparente.webp`, copiado sem alterações: 121 quadros, 4033 ms, 800 × 800 px, 4.057.788 bytes, transparência e repetição contínua. Nas conversas com avatar local, 30 segundos sem fala ou interação na página ativam o sono. Fala do usuário ou da IA, toque, movimento do ponteiro, teclado, entrada de texto ou rolagem acordam a Lumi imediatamente, sem esperar o ciclo de sono terminar. O microfone e a sessão de voz continuam conectados.

Não há sono enquanto a IA prepara uma resposta, a conexão está indisponível ou há bloqueio de microfone/áudio. Ocultar a aba cancela a contagem; ao voltar, começa um novo intervalo. A análise de materiais continua usando **Lendo**. Falha do arquivo mantém a alternativa estática e a opção de recarregar. O playground permite testar **Dormindo** manualmente; sua simulação de conversa permanece independente.

## Consistência visual

- Use a mesma Lumi, câmera fixa, iluminação, escala e enquadramento em todos os vídeos.
- Uma tela de 720 × 960 px a 24 ou 30 fps é um ponto de partida; preserve a mesma resolução entre estados.
- Deixe margem para antenas, mãos e saltos. Mantenha os pés ancorados na mesma posição.
- Comece e termine numa postura neutra compatível. Nos loops, faça o último quadro combinar com o primeiro.
- Exporte sem áudio; a voz será uma camada independente.
- Confira as bordas da pelúcia em fundo claro e escuro. Não use fundo verde para remover por cor sem avaliar o efeito sobre o corpo verde da Lumi.

## Formatos e transparência

O contêiner `.mp4` sozinho não garante transparência; um MP4 H.264 comum não é uma entrega com alfa. Prepare **WebM VP8/VP9 com alfa** para navegadores compatíveis e **HEVC com alfa** para Safari/Apple. Guarde também um arquivo mestre que preserve alfa. Teste as exportações nos dispositivos de destino: reconhecer o codec não garante que o navegador componha a transparência corretamente.

Referências primárias: [WebM com alfa no Chrome](https://developer.chrome.com/blog/alpha-transparency-in-chrome-video/) e [HEVC com alfa na Apple](https://developer.apple.com/videos/play/wwdc2019/506/).

O playground aceita `.webp`, `.webm`, `.mp4` e `.mov`, até 40 MB por clipe. Ele reproduz a versão escolhida no navegador atual, sem converter codecs ou remover fundo. O quadriculado permite conferir visualmente o alfa; o player não declara automaticamente que um arquivo é transparente.

**WebP** pode ser estático ou animado, com transparência, e participa da simulação como os vídeos. A velocidade e a repetição vêm do arquivo; o controle de velocidade dos vídeos fica desativado para WebP. Pausar, ocultar a aba ou respeitar movimento reduzido exibe uma prévia estática do primeiro quadro. Retomar/reiniciar começa do início. Na reprodução manual, WebP não retorna automaticamente ao repouso; alterne o estado ou use a sequência temporizada. A prévia usa o primeiro quadro conforme a [regra de canvas do HTML](https://html.spec.whatwg.org/multipage/canvas.html). Sobre o formato: [documentação WebP do Google](https://developers.google.com/speed/webp/faq).

## Experimentar

1. Escolha um estado e clique em **Adicionar** para selecionar seu vídeo ou WebP. Para substituir um arquivo já selecionado, use **Trocar arquivo**.
2. Alterne entre **Transparência**, **Estúdio** e **Floresta**.
3. Experimente pausa, reinício e, nos vídeos, velocidade. Apenas o arquivo do estado atual anima; os demais ficam pausados.
4. **Simular conversa** segue a ordem saudação → escuta → pensamento → fala → escuta → comemoração, incluindo apenas estados com vídeos ou WebP carregados e sem erro. Com os padrões de escuta, fala e comemoração carregados, segue **Escutando → Falando → Escutando → Comemorando**, sem passar por **Saudação**. A sequência usa tempos de demonstração e termina pausada em **Repouso**, se houver arquivo disponível, ou no último estado exibido. Ações avulsas em vídeo, fora da simulação, retornam ao repouso no fim real do clipe.
5. No guia do clipe, **Baixar roteiro dos 8 estados** exporta nomes, sugestões de caminhos e regras em JSON. O download não inclui os vídeos. **Lendo** pode ser testado manualmente; a simulação de conversa mantém sua sequência original.

As seleções feitas pelo botão **Adicionar/Trocar arquivo** ficam somente na memória da página. Trocar abas do playground preserva a seleção e pausa as animações ocultas; recarregar ou sair libera os arquivos locais e restaura os padrões do projeto. Ao substituir **Falando** ou **Escutando** temporariamente, use **Restaurar vídeo padrão** para voltar ao WebP correspondente. Os clipes padrão permanecem disponíveis após recarregar. Arquivos inválidos ou incompatíveis mostram erro e mantêm a imagem de referência.

A preferência do dispositivo por movimento reduzido inicia os vídeos pausados, mas mantém **Simular conversa** e **Retomar vídeos** disponíveis. Clicar nesses controles permite a reprodução nesta página, sem alterar a configuração do dispositivo. Recarregar ou mudar a preferência do sistema restaura o comportamento automático. **Parar simulação** interrompe a sequência e pausa o vídeo atual.

## Integração com a conversa

O playground continua como simulação local. Os estados de conversa atendem perfis normais e de demonstração, estudo de materiais e o diálogo de voz das atividades. A fala do usuário solicita `lummi-transparente-02.webp`; o áudio da IA solicita `lummi-falando-asas-web-v1.webp`. Os arquivos são carregados antecipadamente e apenas o estado exibido anima. **Falando entra imediatamente**, mesmo que o clipe de escuta ainda esteja rodando. Quando uma ação termina, a Lumi conclui o ciclo atual antes de aplicar o estado mais recente: escuta se o usuário ainda falar, ou o loop de repouso no silêncio. Pausas curtas e retomadas não reiniciam o clipe, e estados antigos não ficam numa fila. O texto de status continua acompanhando o áudio atual.

Nos WebPs, a duração do ciclo é lida dos quadros ANMF do arquivo e contada a partir do carregamento da imagem em reprodução; os bytes originais são preservados. Para vídeos, a troca usa o evento de término. Ocultar a aba, desconectar, silenciar o microfone durante a escuta, bloquear o áudio durante a fala ou falhar o carregamento cancela a espera imediatamente. A alternativa estática continua disponível em caso de falha ou carregamento. A prioridade visual e a conclusão do clipe não atrasam nem alteram o áudio da conversa. Saudação ainda não tem arquivo fornecido; a comemoração usa a confirmação de acerto descrita acima.

Perfis, materiais e diálogos das atividades solicitam `avatar_mode: "local"`, desativando a geração pelo Lemon Slice nessas sessões, mesmo com chave configurada. A voz continua na Agora. Substituições temporárias feitas no playground não são usadas nas conversas; para trocar a fala permanentemente, atualize o asset e seu registro no projeto.

O download dos WebPs incluídos é compartilhado entre a tela de espera e a conversa, sem cancelamento ao trocar esses componentes. Se um arquivo falhar, o perfil mostra **Recarregar**, que tenta baixá-lo novamente. Os avatares e a leitura de materiais animam automaticamente, sem botões de iniciar/pausar e sem consultar escolhas manuais antigas. Por escolha explícita do produto, a Lumi continua animada mesmo com movimento reduzido no sistema; nenhuma configuração do Windows é alterada. Abas ocultas e avatares fora da tela continuam pausando. O playground mantém seus controles independentes e a preferência de movimento reduzido.

Vídeos locais retiram a geração do avatar pelo Lemon Slice desse fluxo. Isso não elimina custos de voz, modelos, infraestrutura Agora ou hospedagem dos arquivos. Um loop de fala não produz sincronização labial por palavra/fonema; ele comunica que a Lumi está falando.

Nenhuma seleção ou exportação no laboratório altera a configuração principal. Perfis, materiais e diálogos de atividades optam explicitamente pelo avatar local; o modo de provedor continua disponível para testes específicos e outros consumidores.

Ao concluir **todas** as questões e etapas da lição, a tutora usa a confirmação específica **Atividade concluída com sucesso!**. Depois que sua fala termina, a conversa é encerrada e a aplicação salva a conclusão pelo mesmo endpoint do botão manual. A Lumi executa uma vez a animação **Comemorando**; o formulário de envio só volta após o ciclo completo e o salvamento bem-sucedido, com o anexo anterior limpo e a mesma URL do perfil. Erro ao salvar mantém a atividade aberta com nova tentativa. Aba oculta, personagem fora da tela, falha do arquivo ou limite de 30 segundos liberam apenas a espera visual. Um único acerto, encerrar a conversa ou repetir a frase como usuário não conclui a folha. O histórico mantém a conquista; abrir um registro já concluído não fecha a tela automaticamente.
