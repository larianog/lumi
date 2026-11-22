# Produção dos vídeos de estado da Lumi

O playground em `/playground/lumi-animation` abre no modo **Vídeos por estado**, com **Falando** selecionado. Os arquivos em `public/assets/lumi/states/` são `lummi-transparente.webp` para **Falando** e `lummi-transparente-02.webp` para **Escutando**, copiados exatamente dos WebPs enviados pelo usuário. Cada um tem 192 quadros, cerca de 8 segundos, 768 × 768 px e canal alfa, com repetição contínua. Esses mesmos arquivos são usados nos perfis. O antigo `speaking.mp4` não é mais o padrão. Os quatro estados restantes ainda precisam de clipes; a imagem da Lumi é a referência quando falta um arquivo.

O laboratório também aceita um arquivo local por estado, permite conferir a transparência sobre diferentes fundos e simula uma conversa sem abrir sessões da Agora ou do Lemon Slice. Para substituir um padrão de forma permanente, atualize o asset e o registro `BUNDLED_LUMI_VIDEO_CLIPS` em `lib/lumi-video-states.ts` (incluindo tamanho e nome do arquivo).

## Roteiro inicial

| Estado | Duração sugerida | Reprodução | Direção |
| --- | --- | --- | --- |
| `idle` — repouso | 4–6 s | Loop | Respiração visível, olhar acolhedor e piscar ocasional. |
| `listening` — escutando | 4–6 s | Loop | Pequenas inclinações de cabeça, boca fechada, postura atenta. |
| `thinking` — pensando | 3–4 s | Loop | Cabeça curiosa e movimento discreto das antenas. |
| `speaking` — falando | 4–6 s | Loop | Gestos leves de corpo e braços; boca com movimento genérico. |
| `greeting` — saudação | 2–3 s | Uma vez, volta ao repouso | Aceno amigável, começando e terminando na postura neutra. |
| `celebrating` — comemorando | 2–3 s | Uma vez, volta ao repouso | Pequeno salto alegre; termina com os pés na posição inicial. |

Comece pelos quatro loops. As durações são orientações de produção, não limites do player.

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
4. **Simular conversa** segue a ordem saudação → escuta → pensamento → fala → escuta → comemoração, incluindo apenas estados com vídeos ou WebP carregados e sem erro. Com os dois clipes padrão carregados, segue **Escutando → Falando → Escutando**, sem passar por **Saudação**. A sequência usa tempos de demonstração e termina pausada em **Repouso**, se houver arquivo disponível, ou no último estado exibido. Ações avulsas em vídeo, fora da simulação, retornam ao repouso no fim real do clipe.
5. No guia do clipe, **Baixar roteiro dos 6 estados** exporta nomes, sugestões de caminhos e regras em JSON. O download não inclui os vídeos.

As seleções feitas pelo botão **Adicionar/Trocar arquivo** ficam somente na memória da página. Trocar abas do playground preserva a seleção e pausa as animações ocultas; recarregar ou sair libera os arquivos locais e restaura os padrões do projeto. Ao substituir **Falando** ou **Escutando** temporariamente, use **Restaurar vídeo padrão** para voltar ao WebP correspondente. Os clipes padrão permanecem disponíveis após recarregar. Arquivos inválidos ou incompatíveis mostram erro e mantêm a imagem de referência.

A preferência do dispositivo por movimento reduzido inicia os vídeos pausados, mas mantém **Simular conversa** e **Retomar vídeos** disponíveis. Clicar nesses controles permite a reprodução nesta página, sem alterar a configuração do dispositivo. Recarregar ou mudar a preferência do sistema restaura o comportamento automático. **Parar simulação** interrompe a sequência e pausa o vídeo atual.

## Próxima integração com a conversa

O playground continua como simulação local. Nas páginas de perfil, incluindo `/profile/demo-lia`, silêncio e pensamento exibem a imagem parada; fala do usuário reproduz `lummi-transparente-02.webp`; áudio da IA reproduz `lummi-transparente.webp`. Os dois WebPs são carregados antecipadamente e exibidos com o mesmo reprodutor do playground. Apenas o estado atual anima; os demais ficam parados. A imagem estática é a alternativa para falha no arquivo ou movimento desativado. Os níveis das trilhas RTC existentes, com pequenas tolerâncias entre sílabas, selecionam os estados. **Falando tem prioridade sobre Escutando** enquanto houver áudio da IA, inclusive se o microfone captar esse som. Quando a IA parar, a Lumi volta a escutar se o usuário continuar falando; no silêncio ou na desconexão, fica parada. Essa prioridade visual não altera as interrupções da conversa por voz. Saudação e comemoração não participam dessa integração.

O perfil solicita `avatar_mode: "local"`, desativando a geração pelo Lemon Slice nessa sessão, mesmo com chave configurada. A voz continua na Agora. Substituições temporárias feitas no playground não são usadas no perfil; para trocar a fala permanentemente, atualize o asset e seu registro no projeto.

O download dos WebPs incluídos é compartilhado entre a tela de espera e a conversa, sem cancelamento ao trocar esses componentes. Se um arquivo falhar, o perfil mostra **Recarregar**, que tenta baixá-lo novamente. **Animar Lumi** permite habilitar movimento quando estiver pausado. A escolha manual de reproduzir/pausar fica salva na sessão da aba, inclusive ao recarregar, e é reiniciada se a preferência de movimento do sistema mudar. Os controles independentes do playground mantêm seu comportamento anterior.

Vídeos locais retiram a geração do avatar pelo Lemon Slice desse fluxo. Isso não elimina custos de voz, modelos, infraestrutura Agora ou hospedagem dos arquivos. Um loop de fala não produz sincronização labial por palavra/fonema; ele comunica que a Lumi está falando.

Nenhuma seleção ou exportação no laboratório altera a configuração principal. As outras interfaces mantêm o avatar do provedor por padrão; as páginas de perfil optam explicitamente pelo avatar local.
