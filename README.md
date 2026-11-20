# Rumo à Liberdade

Jogo de plataforma 2D em pixel art, feito com HTML, CSS e JavaScript puro. Malik e seus companheiros constroem um caminho de resistência e liberdade em três capítulos completos.

**Malik, os personagens, a tomada do navio e a viagem de retorno são ficcionais.** A história é inspirada na resistência de pessoas africanas escravizadas, sem retratar um episódio histórico específico. A narrativa não apresenta violência gráfica nem caricaturas culturais. Os pontos opcionais “Memória” distinguem contexto histórico da ficção.

## Executar

Abra um terminal na pasta do projeto:

```sh
cd /home/bruno/Documentos/rumo-a-liberdade
python3 -m http.server 8000
```

Acesse **http://localhost:8000** em um navegador moderno. Não é necessário instalar pacotes ou executar build. Os módulos ES6 precisam de servidor HTTP; abrir `index.html` diretamente em `file://` pode ser bloqueado pelo navegador.

Todos os recursos da partida são locais: o jogo funciona sem internet enquanto o servidor estático estiver disponível. Os links de fontes educativas no menu são opcionais e exigem internet. O projeto não depende deles para jogar.

## Controles

| Tecla | Ação |
| --- | --- |
| A / ← | Esquerda |
| D / → | Direita |
| W / Espaço / ↑ | Pular |
| J | Afastar guardas, sem violência gráfica; pode manter pressionado |
| E | Interagir, libertar, reparar ou cooperar |
| Esc | Pausar/retomar; fechar uma leitura |
| R | Retomar o checkpoint após derrota |

Use o botão superior para ligar/desligar os efeitos sonoros. O som começa desligado. Perder o foco ou trocar de aba pausa a partida automaticamente.

## Como avançar

Siga o objetivo no HUD. Pontos dourados indicam interações: aproxime-se e pressione **E** uma vez. O grupo participa das ações coletivas; apenas superar guardas não libera a saída.

1. **O Despertar:** pule pelas caixas e plataformas até a chave. Liberte Amina e João, abra a passagem de correntes e siga até a escada para o convés.
2. **A Resistência:** liberte Bia, mova o guincho com o grupo e encontre Tomás na plataforma elevada. Coordene a distração junto ao sino. O capitão prepara um avanço, avança e fica cansado: espere a indicação **AGORA!** para se aproximar e usar J. Depois, alcance a cabine.
3. **O Caminho de Volta:** recolha ferramentas na plataforma, repare o casco, suba pelas caixas até as velas e ajuste-as com o grupo. Organize o abrigo, reforce o leme e siga ao comando para concluir a travessia. Evite as cargas suspensas em movimento.

Os barris oferecem cobertura contra a percepção de guardas à distância. Atacar ou se aproximar demais revela Malik. É possível saltar para evitar confrontos comuns; o capitão exige a estratégia coletiva.

Conquistas importantes salvam automaticamente um **checkpoint da sessão**. Após derrota, R ou “Tentar Novamente” restaura o mundo do último checkpoint com a vida completa. Recarregar a página perde a sessão. “Jogar Novamente” inicia uma campanha limpa.

## Estrutura completa

```text
rumo-a-liberdade/
├── index.html
├── style.css
├── package.json                   # Somente metadados e comando de teste; sem dependências
├── README.md
├── docs/
│   └── analises/
│       └── rumo-a-liberdade.md    # Requisitos aprovados
├── js/
│   ├── main.js
│   ├── game.js
│   ├── player.js
│   ├── enemy.js
│   ├── companion.js
│   ├── physics.js
│   ├── input.js
│   ├── camera.js
│   ├── renderer.js
│   ├── levels.js
│   ├── ui.js
│   └── audio.js
├── assets/
│   ├── sprites/.gitkeep
│   ├── backgrounds/.gitkeep
│   └── sounds/.gitkeep
└── tests/
    ├── game.test.js
    └── presentation.test.js
```

As pastas de assets reservam espaço para expansão. A versão atual desenha toda a arte no Canvas e sintetiza áudio: nenhum sprite, imagem, fonte ou som externo é necessário.

## Arquitetura

- `main.js` conecta serviços, foco da página e `requestAnimationFrame`.
- `game.js` controla estados, campanha, interações, objetivos, combate, partículas e snapshots dos checkpoints. Limita o delta a 50 ms e subdivide a física em passos de até 1/120 s.
- `player.js` implementa movimento, tolerância curta de pulo, animação, ataque e invulnerabilidade. `physics.js` resolve sólidos por eixo e calcula cobertura/linha de visão.
- `enemy.js` implementa patrulha, perseguição e retorno, além do ciclo de preparação, avanço e recuperação do capitão.
- `companion.js` controla acompanhamento, pulo de obstáculos e reagrupamento seguro, evitando bloqueio permanente de objetivos. As ações de cooperação reúnem visualmente o grupo.
- `levels.js` cria mapas de tiles e dados de plataformas, perigos, objetos, objetivos, narrativas e notas históricas.
- `camera.js` acompanha Malik com limites do mapa. `renderer.js` desenha cenários em camadas, sprites animados, água, cargas móveis, iluminação e chegada.
- `input.js` unifica aliases do teclado e separa tecla mantida de acionamento único. `ui.js` apresenta telas e HUD em HTML, mantendo texto legível fora da resolução interna do Canvas.
- `audio.js` sintetiza efeitos curtos pela Web Audio API; indisponibilidade de áudio não interrompe o jogo.

O estado de checkpoint inclui mapa, objetos, flags, inimigos, plataformas, jogador e companheiros. A restauração reconstrói as classes a partir de cópias profundas, sem referências residuais a um mundo antigo.

## Funcionalidades implementadas

- Três fases concluíveis, tutorial contextual, objetivo atualizado, chave, portas, quatro libertações e acompanhamento do grupo.
- Física de plataformas, colisões com caixas/paredes/teto, câmera lateral, plataformas fixas e móveis e cargas suspensas que causam dano.
- Combate simples não gráfico, vida, invulnerabilidade, patrulhas, guarda avançado, furtividade por cobertura e capitão com abertura estratégica.
- Guincho e distração cooperativos; ferramentas, reparos, velas e abrigo do grupo na tempestade.
- Menu, instruções, informações do projeto, pausa, derrota, checkpoints, cena de união, narrativa entre capítulos, chegada animada e replay.
- Pixel art procedural diversa, animações de movimento/pulo/ataque, água, camadas, iluminação, partículas, efeitos sonoros opcionais e HUD em português brasileiro.
- Conteúdo educativo opcional, explicitamente separado da história fictícia.

## Validação

Com Node.js 24 ou superior disponível:

```sh
npm test
```

Não é necessário `npm install`. Os testes usam apenas módulos nativos de Node. A execução com isolamento desativado permite resultados individuais explícitos também em ambientes com restrições de processos.

Os testes cobrem colisões, teto, pulo, invulnerabilidade, restauração coerente, pausa, IA/cobertura, vulnerabilidade do capitão, idempotência das interações, teclado e existência dos recursos/imports. A campanha automatizada percorre os três mapas com movimento, pulo, ataque e interação normais, sem alterar posição, vida ou flags para avançar. Há também smoke tests de chamadas Canvas, telas/HUD com DOM simulado e fallback de áudio.

**Limites da validação deste ambiente:** o Firefox disponível encerrou com código 139 ao iniciar em modo headless, e abrir um socket para servidor HTTP retornou `PermissionError: Operation not permitted`. Portanto, não foi possível confirmar visualmente o resultado em navegador nem testar uma requisição HTTP real. Os testes de renderização/DOM são simulados e não substituem essa inspeção. Recomenda-se abrir o jogo localmente para conferir apresentação e áudio no navegador de destino.

## Limitações e expansão

Não há funcionalidades principais da campanha deixadas vazias. A arte e as mecânicas são compactas e procedurais; não há backend, multiplayer, controles por toque, editor de fases ou salvamento persistente. Esses recursos não fazem parte desta entrega. O conteúdo educativo é introdutório e não substitui estudo histórico ou revisão especializada.

## Fontes educativas

- [Fundação Cultural Palmares — Dia da Consciência Negra](https://www.gov.br/palmares/pt-br/assuntos/noticias/dia-da-consciencia-negra)
- [ONU — Memória das vítimas da escravidão e do tráfico transatlântico](https://www.un.org/en/observances/transatlantic-slave-trade)
