# Análise aprovada — Rumo à Liberdade

Data: 20/11/2026. Aprovação explícita do usuário: “aprovo e autorizo”.
Projeto novo em `/home/bruno/Documentos/rumo-a-liberdade`. Entrega local, sem backend, publicação, commits ou dependências de produção.

## Objetivo

Jogo de plataforma completo com três fases compactas e concluíveis. Construir primeiro a base jogável e o porão; concluir convés, travessia e polimento na mesma entrega. Não reduzir a campanha a uma fase.

## Requisitos numerados

1. HTML5, CSS3, JavaScript puro ES6+, Canvas API; Web Audio opcional. Nenhuma engine, biblioteca obrigatória ou recurso remoto necessário.
2. Canvas interno 320×180 com pixels nítidos, escala proporcional; sprites procedurais de personagens diversos, animações de parado, caminhada, pulo e ataque, camadas, iluminação, água animada, partículas e transições.
3. A/seta esquerda e D/seta direita movem; W/Espaço/seta acima pulam; J ataca; E interage; Esc pausa; R reinicia após derrota.
4. Malik possui gravidade, movimento lateral, colisões com pisos, paredes e plataformas, ataque não gráfico, vida e invulnerabilidade temporária.
5. Mapas de tiles, câmera lateral limitada ao cenário, plataformas elevadas, obstáculos fixos e móveis.
6. Interações por proximidade: chave, portas/correntes, libertação, pontos educativos, mecanismos cooperativos, equipamentos, reparos e velas. Indicar condições ausentes.
7. Companheiros libertados acompanham Malik, contribuem em obstáculos e eventos; manter progresso coletivo entre fases e contar libertações únicas.
8. Fase 1 — O Despertar: tutorial no porão, exploração, chave, primeiras libertações, caixas, barris, plataformas e guardas; saída condicionada ao objetivo coletivo.
9. Fase 2 — A Resistência: convés, novas libertações, guardas comuns e avançados, plataformas elevadas, obstáculos móveis, cobertura por barris, mecanismos cooperativos e cabine de comando.
10. Capitão com padrão de movimento e vulnerabilidade: superação exige preparação cooperativa indicada ao jogador e estratégia, sem violência gráfica. Concluir com cena de união.
11. Fase 3 — O Caminho de Volta: equipamentos, reparos, ajuste de velas, tempestade, proteção dos companheiros e chegada animada ao litoral africano.
12. Inimigos com máquina de estados de patrulha, perseguição e retorno. Guarda avançado tem maior percepção e resistência; cobertura interfere efetivamente na detecção.
13. Estados de menu, execução, pausa, narrativa/transição, derrota e conclusão. Menu com Jogar, Como Jogar e Sobre o Projeto; derrota com nova tentativa; final com replay.
14. HUD em português brasileiro: vida, fase, objetivo, companheiros e interação. Controle de som e funcionamento mesmo sem áudio.
15. Conteúdo educativo opcional sobre tráfico transatlântico, resistência, culturas africanas e afro-brasileiras e Consciência Negra; mensagens entre fases. Identificar explicitamente Malik e sua viagem como ficção e distinguir fatos históricos.
16. Checkpoints coerentes, gerenciamento de inimigos e interações. requestAnimationFrame, delta time limitado e subpassos ou equivalente para colisões estáveis.
17. Entregar arquivos completos integrados, README com execução, controles, arquitetura, funcionalidades e limitações reais.

## Regras de negócio aprovadas

- Progressão exige os objetivos coletivos: chegar à saída ou superar guardas não basta.
- Cada pessoa é libertada uma única vez. Não há morte permanente de companheiros nem bloqueio irreversível causado por eles.
- E dispara uma interação por acionamento; manter pressionado não duplica efeitos. Equipamentos necessários permanecem acessíveis até o uso.
- Ataques e dano usam intervalos; o capitão exige preparação cooperativa.
- Checkpoints são da sessão atual, sem obrigação de persistir após recarregar. R e Tentar Novamente restauram o último checkpoint com vida e mundo coerentes. Jogar Novamente limpa a campanha inteira.
- O checkpoint guarda posição, objetivos, objetos, companheiros e inimigos compatíveis; sem duplicações ou perda de itens imprescindíveis.
- Proteção na tempestade usa abrigo, reparos e colaboração, sem sofrimento gráfico.
- Pausa, transições e perda de foco suspendem perigos; retomar não acumula tempo. Limpar entradas ao desfocar.
- Sem caricaturas, estereótipos, sangue ou sofrimento gráfico; sem atribuições culturais específicas sem fundamento.
- Execução por servidor estático local, inclusive sem internet enquanto o servidor estiver disponível. Não é exigida abertura em file:// nem reload offline sem servidor.
- Sem multiplayer, editor, controles por toque obrigatórios ou salvamento permanente entre sessões.

## Arquitetura

`index.html`, `style.css`; módulos em `js/`: `main.js` (inicialização), `game.js` (loop, estados, campanha, interações e checkpoints), `player.js`, `enemy.js`, `companion.js` (entidades), `physics.js`, `input.js`, `camera.js`, `renderer.js` (arte e efeitos), `levels.js` (tiles, entidades, objetivos e narrativa), `ui.js`, `audio.js`.

Pastas `assets/sprites/`, `assets/backgrounds/`, `assets/sounds/` disponíveis para expansão. Documentação em README e este documento; verificações locais apropriadas. Sem impacto em banco, APIs ou projetos existentes.

## Critérios de aceitação e testes

1. Servidor `python3 -m http.server 8000` na pasta abre menu em localhost:8000 sem recursos externos. Verificar sintaxe, imports e arquivos HTTP.
2. Caminhar/pular junto a paredes, pisos e cantos de plataforma, inclusive com atraso de quadro, sem atravessar sólidos ou ficar preso.
3. Completar chave, libertações e saída do porão; HUD deve acompanhar progressão.
4. Guardas patrulham, perseguem, retornam e respeitam cobertura; avançado difere do comum.
5. Mecanismos mostram requisitos e funcionam uma única vez quando cumpridos. Capitão exige cooperação e leva à cena de união.
6. Equipamentos, reparos, velas e tempestade permitem chegar ao final. Percorrer três fases usando controles documentados, sem depuração.
7. Dano respeita invulnerabilidade; vida zero abre derrota. Checkpoint restaura mundo coerente sem duplicação ou bloqueio.
8. Pausa/perda de foco suspendem riscos; retomada estável. Replay limpa progresso.
9. Validar escala, HUD, animações, áudio desativado e ausência de erros de navegador quando houver ferramenta disponível; reportar limitações de validação.
10. Revisar narrativa e distinção entre ficção e fatos. Revisão independente após desenvolvimento e correção de achados altos/bloqueantes.

## Referências educativas

- Fundação Cultural Palmares: https://www.gov.br/palmares/pt-br/assuntos/noticias/dia-da-consciencia-negra
- ONU: https://www.un.org/en/observances/transatlantic-slave-trade

## Registro no vault

Registrar requisitos, arquitetura e alterações em notas atômicas em `/home/bruno/Documentos/Anotacoes/00-Inbox/`, vinculadas pelo índice `rumo-a-liberdade.md` e `inbox.md`. Usar template `99-Templates/_nota.md`, frontmatter completo, `area: inbox`, `status: inbox`, datas America/Sao_Paulo, arquivos kebab-case; preservar notas e índices existentes. Registrar validações efetivamente executadas e pendências, sem segredos.
