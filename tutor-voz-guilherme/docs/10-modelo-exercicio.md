# Modelo de exercício

Um exercício é **uma pergunta, uma imagem e a resposta certa**. O modelo pronto está em [`testes/lab/exemplos/exercicio-modelo.json`](../testes/lab/exemplos/exercicio-modelo.json).

```json
{
  "perguntas": [
    "Que objeto é esse?",
    "Qual é esse objeto?",
    "O que é isso?",
    "Como se chama esse objeto?"
  ],
  "resposta": "gato",
  "aceita": ["gatinho", "gata"],
  "alias": ["gatu"],
  "imagem": "🐱",
  "lang": "pt-BR",
  "avatar_img": ""
}
```

## Os campos

| Campo | Obrigatório | O que é | Exemplo |
| --- | --- | --- | --- |
| `resposta` | **Sim** | A palavra (ou frase curta) certa | `"gato"` |
| `imagem` | **Sim, na prática** | O que aparece na tela. Pode ser **um emoji** ou **uma URL** de imagem (`https://...`) | `"🐱"` ou `"https://site.com/gato.png"` |
| `perguntas` | Não | Variações da pergunta. O agente sorteia uma e muda ao repetir. Se não vier, usa as 8 padrão | `["O que é isso?", "Que bicho é esse?"]` |
| `pergunta` | Não | Uma pergunta só (use no lugar de `perguntas`) | `"O que é isso?"` |
| `aceita` | Não | Outras respostas que também estão **certas**: plural, diminutivo, sinônimo | `["gatinho", "gata"]` |
| `alias` | Não | Como o **reconhecimento de voz costuma escrever errado** a resposta. Vai sendo preenchido com os testes | `["gatu"]` |
| `lang` | Não | Idioma da fala: `pt-BR`, `en-US` ou `multi` (os dois). O padrão é `pt-BR` | `"pt-BR"` |
| `avatar_img` | Não | URL da imagem do personagem (só para o avatar de fornecedor) | `""` |

## Cuidado: campo que você não manda volta ao padrão

Quando o exercício é enviado, **o que faltar volta ao valor padrão**, não fica vazio. Dois casos que pegam:
- Sem `imagem`, aparece o ⚽. Para **não mostrar imagem**, mande `"imagem": ""`.
- Sem `perguntas`, valem as 8 perguntas padrão.

Por isso o modelo sempre traz `imagem` e `resposta`.

## Como enviar o exercício

**1. Pela URL** (o jeito mais rápido para testar, sem mexer em arquivo):

```
http://localhost:3000/?resposta=gato&imagem=🐱&aceita=gatinho,gata&alias=gatu&perguntas=O que é isso?|Que bicho é esse?
```

Várias respostas aceitas se separam por **vírgula**. Várias perguntas se separam por **barra vertical `|`**.

**2. Pelo servidor** (é assim que outro sistema, como o app, entrega o exercício). No PowerShell, na pasta do projeto:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/atividade -ContentType "application/json; charset=utf-8" -InFile testes\lab\exemplos\exercicio-modelo.json
```

Depois, abra `http://localhost:3000`. A página lê o exercício guardado no servidor ao abrir.

**3. Pela própria tela:** em "Atividade (normalmente vem de fora)", no rodapé da página, há campos para cada item e uma lista com 8 exercícios prontos.

## Boas práticas

- **Resposta curta**, de uma ou duas palavras. Frases longas aumentam a chance de o reconhecimento errar.
- **Uma imagem clara e sem texto**, para a criança não ler a resposta na própria figura.
- **Preencha `aceita`** com o plural e o diminutivo: criança diz "gatinho" quase tanto quanto "gato".
- **Preencha `alias`** só depois de testar: ouça o que o reconhecimento escreveu (aparece na tela, em "Ele entendeu") e copie o que ele errou.
- Palavras que se parecem muito (gato e pato, casa e asa) confundem o reconhecimento. Se for testar duas assim, faça uma de cada vez.
