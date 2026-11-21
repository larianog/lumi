# O hackathon: UNMUTE by Agora

## O evento

- **Nome:** UNMUTE by Agora
- **Tema:** agentes de voz e avatares com inteligência artificial
- **Data e local:** 21 e 22 de novembro de 2026, na AI House Brasil
- **Vagas:** 60, inscrição gratuita e sujeita à aprovação
- **Ferramenta obrigatória:** Agora ([agora.io](https://www.agora.io/en/)), na prática o **Conversational AI Engine** (agentes de voz), opcionalmente com **avatar**
- **Equipe:** newDirections

- **Página e regulamento:** [newhack.vc/hackathon/agora](https://newhack.vc/hackathon/agora) · [regulamento](https://newhack.vc/hackathon/agora/regulamento) (versão de 17/11/2026)
- **Equipes:** 3 a 5 pessoas, presença nos dois dias
- **Pitch:** 3 min de apresentação + 2 min de demo + até 3 min de perguntas
- **Critérios da banca e pesos:** ver [06-avaliacao-ideias.md](06-avaliacao-ideias.md). Voz/interação 25%, técnica + Agora 25%, problema/impacto 20%, inovação 15%, validação 10%, clareza 5%
- **Prêmios:** US$ 2.000, 1.000 e 500, mais créditos da Agora; top 3 apresentam num jantar da Agora com executivos do setor financeiro
- **Regras-chave:** uso funcional da Agora obrigatório e demonstrado; código pré-existente permitido se identificado; simulações permitidas se sinalizadas

## Entregáveis (prazo: 22/11/2026 às 12h, horário de Brasília)

1. **Descrição do projeto**
2. **Apresentação** com até 10 slides
3. **Demo narrada** com até 2 minutos
4. **Repositório público** (este projeto vai virar esse repo)

Pitches às **13h** do dia 22.

## Cronograma de trabalho

| Quando | O quê |
| --- | --- |
| Até 20/11 (pré-evento) | Estudar a Agora (feito, ver docs 01 a 03), definir a ideia, validar riscos técnicos (idioma pt-BR, avatar, latência), criar conta e projeto na Agora, rodar o quickstart |
| 21/11 | Encontro da equipe. Construção do MVP |
| 22/11 até 12h | Polimento, gravação da demo (≤ 2 min), slides (≤ 10), descrição, repositório público |
| 22/11 13h | Pitch |

## Checklist pré-evento

- [ ] Cada membro com conta no [Agora Console](https://console.agora.io/)
- [ ] Projeto criado e App ID + App Certificate em mãos (via `agora project env`)
- [ ] Quickstart rodando localmente (`agora init ... --template nextjs` ou `python`)
- [ ] Testar o agente falando e entendendo **português do Brasil** (ver doc 03)
- [x] Ideia escolhida: avatar para crianças (ver [08](08-ideia-escolhida-avatar-infantil.md))
- [ ] Criar conta no fornecedor de avatar (LemonSlice, que anima a partir de uma imagem; plano B: Anam ou Akool)
- [ ] Testar reconhecimento de **voz infantil** e mistura português + inglês
- [ ] Roteiro da demo de 2 min (rascunho em [08](08-ideia-escolhida-avatar-infantil.md))
- [ ] Repositório público criado (GitHub)
