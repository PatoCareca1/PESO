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

### 3.2 Detalhe do treino

Topo: link `← VOLTAR` (label uppercase, `text-muted`).

Título de tela com o nome do treino: **Full Body A**.

Lista de exercícios. Cada linha é um card baixo (altura ~60px) com:
- Nome do exercício à esquerda, 16px/500
- Alvo à direita em `text-muted`: `4 × 8` (séries × reps), com o `×` menor e mais claro

Botão primário largura total: **"Começar"** → inicia sessão.

Abaixo, link destrutivo centralizado: *excluir treino* (pede confirmação).

### 3.3 Sessão ativa

Topo centralizado: nome do treino em label uppercase pequeno (`FULL BODY A`).

Cronômetro gigante `00:00` (tabular-nums, 64px). Abaixo, botão pill outline: **"Iniciar cronômetro"** → alterna para "Pausar". O tempo continua correndo mesmo navegando entre modais.

Linha divisória horizontal fina.

Lista de exercícios da sessão. Cada card mostra:
- Nome à esquerda
- Progresso à direita em `text-muted`: `0/4` (séries preenchidas / séries alvo)
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
- Badge circular/quadrada arredondada com o número da série (1, 2, 3, 4)
- Input `kg` (numérico, placeholder "kg")
- Input `reps` (numérico, placeholder "reps")

Abaixo da grade, dois links inline: *+ série* (esquerda) e *– série* (direita) — ajustam a quantidade de linhas **apenas nesta sessão**.

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
- Metadado em `text-muted`: `04 de set. · 12 séries`
- Duração à direita em tabular-nums: `00:44`

Estado vazio: *"Nenhum treino registrado."*

---

## 4. Modelo de dados

Tudo em `localStorage`, serializado em JSON.

### Chaves

```
peso:workouts   → Workout[]
peso:sessions   → Session[]
peso:settings   → Settings
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

- `Session` guarda **snapshot** do nome do treino e dos exercícios. Editar ou excluir um template nunca altera o histórico.
- Séries com `kg` e `reps` nulos contam como não preenchidas e não entram na contagem de "séries" do histórico.
- "Séries" no card do histórico = total de séries preenchidas na sessão, somando todos os exercícios.
- Exercício avulso (`adhoc: true`) existe só na sessão; nunca é escrito em `peso:workouts`.

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

---

## 7. Fora de escopo (v1)

Dieta e macros · gráficos de evolução · timer de descanso · biblioteca de exercícios com GIF/vídeo · login e sync entre dispositivos · export de dados · compartilhamento · mesociclos e periodização · medidas corporais.

**Candidatos para v2**: timer de descanso automático entre séries, export/import JSON, gráfico simples de carga por exercício, PWA instalável.