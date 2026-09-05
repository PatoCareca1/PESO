# PESO — Documentação do Produto

**Plano de Execução e Séries de treinO**

App de registro de treino. Ultra minimalista, visual premium soft. Funciona como um bloco de notas de treino: você cria templates, executa a sessão, registra carga e reps, e o histórico fica salvo.

---

## 1. Princípios de produto

- **Zero fricção**: nenhum cadastro, nenhum login, nenhum onboarding. Abre e usa.
- **Sem gamificação**: nada de streaks, XP, badges, feed social ou notificação motivacional.
- **Offline-first**: tudo em `localStorage`. Nenhuma chamada de rede.
- **Template ≠ sessão**: o treino salvo é um molde. O que acontece na sessão (exercício avulso, série extra, exercício pulado) não altera o molde.
- **Escopo fechado**: treino apenas. Sem dieta, sem macros, sem medidas corporais.

---

## 2. Sistema de design

### Temas

Dois temas, alternáveis no Perfil. A escolha persiste.

**Dark (padrão)**

| Token | Valor | Uso |
|---|---|---|
| `bg` | `#0B0B0B` | fundo da tela |
| `surface` | `#171717` | cards, inputs |
| `surface-alt` | `#1F1F1F` | card em hover / estado ativo |
| `text` | `#F5F5F3` | títulos e texto principal |
| `text-muted` | `#8A8A85` | labels, metadados, links secundários |
| `accent` | `#B4CDA0` | botão primário (sage/verde suave) |
| `accent-text` | `#1A1A1A` | texto sobre o accent |
| `border` | `rgba(255,255,255,0.08)` | bordas de botões outline |

**Pastel**

| Token | Valor | Uso |
|---|---|---|
| `bg` | `#F4F1EB` | fundo da tela |
| `surface` | `#FFFFFF` | cards, modais |
| `surface-alt` | `#FAF8F4` | inputs |
| `text` | `#1C1A17` | títulos e texto principal |
| `text-muted` | `#8F8A82` | labels, metadados |
| `accent` | `#C07A57` | botão primário (terracota) |
| `accent-text` | `#FFFFFF` | texto sobre o accent |
| `border` | `rgba(0,0,0,0.08)` | bordas de botões outline |

### Tipografia

Sans-serif geométrica com terminações arredondadas (Poppins, Outfit ou General Sans).

| Estilo | Tamanho | Peso | Tracking | Uso |
|---|---|---|---|---|
| Display | 44–48px | 700 | -0.02em | "Treinos", "Perfil", "Novo treino" |
| Título de tela | 32–36px | 700 | -0.02em | "Full Body A" |
| Título de modal | 22px | 600 | -0.01em | "Exercício avulso" |
| Corpo | 16px | 500 | 0 | nome de exercício, botões |
| Label | 11px | 600 | **0.12em**, UPPERCASE | "NOME", "SÉRIES", "HISTÓRICO", "4 EXERCÍCIOS" |
| Metadado | 13–14px | 400 | 0 | "Escolha um e comece.", "04 de set. · 0 séries" |
| Timer | 64px | 700 | tabular-nums | cronômetro "00:00" |

### Formas e espaçamento

- **Container**: largura máx. ~540px, centralizado, respiro lateral de 24px.
- **Raio dos cards**: 20px. **Inputs e botões**: 14px (inputs) / pill total (botões primários).
- **Botão primário**: altura 52px, largura total, raio pill (`border-radius: 999px`), fundo `accent`.
- **Botão outline**: mesma altura, fundo transparente, borda 1px `border`.
- **Link secundário destrutivo**: texto puro, 13px, `text-muted`, centralizado, sem borda ("excluir treino", "sair sem salvar", "tirar da sessão").
- **Espaçamento vertical**: 12px entre cards da mesma lista, 32–40px entre blocos/seções.
- **Sem sombras pesadas.** No Pastel, sombra difusa mínima nos cards (`0 1px 3px rgba(0,0,0,0.04)`).
- **Modais**: fundo da tela recebe blur + escurecimento; o card do modal é centralizado, ~420px, raio 24px.
- **Barras fixas**: as ações de cada tela (botão primário, outline e link destrutivo) ficam num rodapé preso ao fim da viewport; o `← VOLTAR` e os botões circulares da Home ficam numa barra presa ao topo. Só a lista do meio rola. As duas barras têm um degradê de `bg` para transparente, para o conteúdo deslizar por baixo em vez de ser cortado.

---

## 3. Telas

### 3.1 Home — Treinos

Topo: dois botões circulares (44px) nas extremidades — à esquerda ícone de pessoa (→ Perfil), à direita ícone `+` (→ Novo treino).

Abaixo, título display **"Treinos"** e subtítulo em `text-muted`: *"Escolha um e comece."*

Lista de cards de treino. Cada card:
- Label uppercase com a contagem: `4 EXERCÍCIOS`
- Nome do treino em 28px/700: **Full Body A**
- À direita, verticalmente centralizado, um botão circular com chevron `›`
- Card inteiro é clicável → Detalhe do treino

Estado vazio: mensagem curta em `text-muted` no lugar da lista ("Nenhum treino ainda.") e o `+` do topo como única ação.

Sessão em andamento: um card em `accent` no topo da lista — label `EM ANDAMENTO · 00:12` e o nome do treino — leva de volta à sessão. Ela nunca fica invisível, por qualquer caminho que o usuário tenha voltado à Home.

### 3.2 Detalhe do treino

Topo: link `← VOLTAR` (label uppercase, `text-muted`).

Título de tela com o nome do treino: **Full Body A**.

Lista de exercícios. Cada linha é um card baixo (altura ~60px) com:
- Nome do exercício à esquerda, 16px/500
- Alvo à direita em `text-muted`: `4 × 8` (séries × reps), com o `×` menor e mais claro

Botão primário largura total: **"Começar"** → inicia sessão. Se já existe uma sessão em andamento, pede confirmação: *Descartar e começar* / *Retomar o que está aberto* / *cancelar*.

Abaixo, dois links centralizados: *editar treino* (→ 3.6 em modo edição) e *excluir treino* (pede confirmação).

### 3.3 Sessão ativa

Topo centralizado: nome do treino em label uppercase pequeno (`FULL BODY A`).

Cronômetro gigante `00:00` (tabular-nums, 64px). Abaixo, botão pill outline: **"Iniciar cronômetro"** → alterna para "Pausar"; pausado com tempo acumulado, mostra "Retomar". O tempo continua correndo mesmo navegando entre modais.

Linha divisória horizontal fina.

Lista de exercícios da sessão. Cada card mostra:
- Nome à esquerda
- Progresso à direita em `text-muted`: `0/4` (séries concluídas / séries alvo)
- Clique abre o modal de registro (3.5)
- Exercício concluído fica com o nome em opacidade reduzida ou marcado; exercício marcado como "não fiz" fica riscado/apagado

Botão outline largura total: **"+ exercício nesta sessão"** → abre modal de exercício avulso (3.4).

Botão primário: **"Finalizar treino"** → salva no histórico e volta para a Home.

Link destrutivo centralizado: *sair sem salvar* (pede confirmação).

### 3.4 Modal — Exercício avulso

Título: **"Exercício avulso"**
Subtítulo em `text-muted`: *"Só nesta sessão — o template do treino não muda."*

Campos empilhados:
- Label `NOME` + input de texto (placeholder: "Cadeira extensora")
- Label `SÉRIES` + input numérico (placeholder/default: "3")

Botão primário: **"Adicionar"**.

O exercício entra no fim da lista da sessão corrente e **não** é gravado no template.

### 3.5 Modal — Registro de exercício

Título com o nome do exercício: **Agachamento livre**. No canto superior direito, link *fechar*.

Subtítulo em `text-muted`: `alvo: 4 × 8`.

Grade de séries — uma linha por série:
- Badge quadrada arredondada com o número da série (1, 2, 3, 4). **É um toggle**: tocar marca a série como concluída (fundo `accent`); tocar de novo desmarca.
- Input `kg` (numérico, placeholder "kg")
- Input `reps` (numérico, placeholder "reps")

kg e reps são detalhe opcional — o app funciona como um contador de séries. Digitar qualquer valor em kg ou reps marca a série como concluída automaticamente; apagar o valor **não** desmarca (o badge continua sendo a verdade, e o usuário desmarca tocando nele).

Abaixo da grade, dois links inline: *+ série* (esquerda) e *– série* (direita) — ajustam a quantidade de linhas **apenas nesta sessão**. A grade rola quando não cabe; título e botões ficam fixos.

Botão primário: **"Concluir exercício"** → marca como feito e fecha.

Botão outline: **"Não fiz esse"** → marca como pulado, mantém na lista.

Link destrutivo: *tirar da sessão* → remove o exercício da sessão corrente.

> Comportamento útil: pré-preencher `kg` e `reps` com os valores da última sessão registrada do mesmo exercício, em cinza claro, como sugestão editável.

### 3.6 Novo treino

Topo: `← VOLTAR`. Título display: **"Novo treino"**.

- Label `NOME` + input (placeholder: "Full Body C")
- Para cada exercício, um card com:
  - Label `EXERCÍCIO 1` (numeração automática)
  - Label `NOME` + input (placeholder: "Agachamento")
  - Dois inputs lado a lado: `SÉRIES` (default 3) e `REPS` (default 10)
- Botão outline: **"+ exercício"** → adiciona novo card
- Botão primário: **"Salvar treino"**

Validação mínima: nome do treino obrigatório e ao menos um exercício com nome.

### 3.7 Perfil

Topo: `← VOLTAR`. Título display: **"Perfil"**.

**TEMA** — toggle segmentado de duas opções (`Dark` | `Pastel`) dentro de uma pílula. A opção ativa recebe fundo `accent` e texto `accent-text`.

**HISTÓRICO** — label à esquerda, link *limpar* à direita (pede confirmação, apaga todas as sessões).

Lista de sessões, mais recente primeiro. Cada card:
- Nome do treino em 18px/600
- Metadado em `text-muted`: `04 de set. · 12 séries` (singular: `1 série`)
- Duração à direita em tabular-nums: `00:44`

Estado vazio: *"Nenhum treino registrado."*

---

## 4. Modelo de dados

Tudo em `localStorage`, serializado em JSON.

### Chaves

```
peso:workouts        → Workout[]
peso:sessions        → Session[]
peso:settings        → Settings
peso:activeSession   → { session: ActiveSession; timer: TimerState }
peso:schema          → number   (versão do formato; hoje 2)
```

### Tipos

```ts
type Workout = {
  id: string;              // uuid
  name: string;            // "Full Body A"
  exercises: {
    id: string;
    name: string;          // "Agachamento livre"
    sets: number;          // 4
    reps: number;          // 8
  }[];
  createdAt: string;       // ISO
};

type Session = {
  id: string;
  workoutId: string | null;   // null se o treino foi excluído depois
  workoutName: string;        // snapshot — sobrevive à exclusão do template
  startedAt: string;          // ISO
  durationSeconds: number;
  exercises: {
    name: string;
    targetSets: number;
    targetReps: number;
    adhoc: boolean;           // true = adicionado só nesta sessão
    status: 'pending' | 'done' | 'skipped';
    sets: {
      done: boolean;            // marcada pelo badge ou por ter digitado algo
      kg: number | null;
      reps: number | null;
    }[];
  }[];
};

type Settings = {
  theme: 'dark' | 'pastel';
};
```

### Regras

- `Session` guarda **snapshot** do nome do treino e dos exercícios. Editar ou excluir um template nunca altera o histórico; excluir só zera o `workoutId` das sessões daquele template.
- Uma série conta como feita quando `done` é `true`. `kg`/`reps` são opcionais e podem ficar nulos numa série feita.
- "Séries" no card do histórico = total de séries com `done: true` na sessão, somando todos os exercícios.
- Exercício avulso (`adhoc: true`) existe só na sessão; nunca é escrito em `peso:workouts`.
- Ao editar um template, os exercícios existentes mantêm o `id`.

### Versionamento

Os dados sobrevivem a qualquer deploy — um PWA instalado pode carregar registros gravados por versões anteriores. Por isso tudo o que sai do `localStorage` passa por `src/lib/migrate.ts` antes de chegar ao React: entradas malformadas são descartadas, campos ausentes recebem default, e um registro válido nunca derruba o app. Ao mudar o formato, incremente `SCHEMA_VERSION` e acrescente a regra de default correspondente.

| Versão | Mudança |
|---|---|
| 1 | formato original |
| 2 | `done` nas séries (derivado de `kg`/`reps` quando ausente) |

Se mesmo assim algo quebrar na renderização, um error boundary oferece *Recarregar* e, atrás de uma segunda confirmação, *Apagar dados e recomeçar*.

---

## 5. Fluxos

**Registrar um treino**
Home → toca no card → Detalhe → *Começar* → Sessão → *Iniciar cronômetro* → toca no exercício → preenche kg/reps → *Concluir exercício* → repete → *Finalizar treino* → volta pra Home, sessão gravada.

**Criar treino**
Home → `+` → preenche nome e exercícios → *Salvar treino* → volta pra Home com o novo card na lista.

**Adicionar exercício no meio do treino**
Sessão → *+ exercício nesta sessão* → nome + séries → *Adicionar* → aparece no fim da lista, só nesta sessão.

**Ver histórico / trocar tema**
Home → ícone de perfil → Perfil.

---

## 6. Detalhes de comportamento

- O cronômetro roda com `setInterval` sobre um timestamp de início — não sobre incremento — para não perder tempo se a aba ficar em background.
- Sessão em andamento deve ser persistida em `peso:activeSession` a cada mudança, para sobreviver a um refresh acidental. Ao abrir o app com sessão ativa, retomar direto nela.
- *Sair sem salvar* e *excluir treino* e *limpar histórico* sempre pedem confirmação.
- Inputs numéricos usam `inputMode="decimal"` (kg) e `inputMode="numeric"` (reps/séries) para abrir o teclado certo no mobile.
- Nenhuma animação longa. Transições de 150–200ms, ease-out. Modais entram com fade + leve subida (8px).
- O campo `kg` aceita um único separador decimal (vírgula vira ponto); qualquer coisa que o campo aceite é garantidamente gravável.
- Modais prendem o foco (Tab circula dentro do card), fecham com Esc e devolvem o foco ao elemento que os abriu. O efeito de montagem nunca re-executa durante a digitação — re-executar roubava o foco do input e fechava o teclado no celular.
- Atualização: o service worker é `autoUpdate` — ao abrir o app depois de um deploy, a página se recarrega sozinha. Estado persistido sobrevive; estado de formulário ainda não salvo (ex.: "Novo treino" pela metade) não.

---

## 7. Fora de escopo (v1)

Dieta e macros · gráficos de evolução · timer de descanso · biblioteca de exercícios com GIF/vídeo · login e sync entre dispositivos · export de dados · compartilhamento · mesociclos e periodização · medidas corporais.

**Candidatos para v2**: export/import JSON (hoje não há como recuperar os dados se o `localStorage` for limpo — é o maior risco do produto), timer de descanso automático entre séries, gráfico simples de carga por exercício.

PWA instalável já está implementado (`vite-plugin-pwa`, deploy na Vercel).

---

## 8. Desenvolvimento

```
make dev       # servidor local
make mobile    # exposto na rede local, para abrir no celular
make check     # type-check + testes
make test      # só os testes (Vitest; lógica pura em src/lib, sem DOM)
make build     # produção em dist/
make preview   # serve o build — único jeito de testar o PWA
```

Estrutura de `src/`:

```
lib/format.ts    máscaras, formatação, uid
lib/session.ts   lógica pura de sessão: criar, cronômetro, concluir, sugestão
lib/migrate.ts   normalização/migração do que vem do localStorage
lib/storage.ts   leitura/escrita das chaves
store/store.tsx  Context + persistência; delega a lógica para lib/
components/      Screen (barras fixas), Modal, ConfirmDialog, ErrorBoundary, ui
screens/         Home, WorkoutDetail, WorkoutEditor, Session, Profile
modals/          LogModal, AdhocModal
```