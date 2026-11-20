const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button=(action,label,primary=false)=>`<button type="button" data-action="${action}"${primary?' class="primary"':''}>${label}</button>`;

export class UI {
  constructor(){
    this.overlay=document.querySelector('#overlay');this.hud=document.querySelector('#hud');
    this.health=document.querySelector('#health');this.phase=document.querySelector('#phase');this.objective=document.querySelector('#objective');
    this.party=document.querySelector('#party');this.toast=document.querySelector('#toast');this.interaction=document.querySelector('#interaction');
    this.canvas=document.querySelector('#game');this.game=null;this.lastHUD='';
    this.overlay.addEventListener('click',event=>{const action=event.target.closest('[data-action]')?.dataset.action;if(action)this.action(action);});
    document.querySelector('#pause').addEventListener('click',()=>this.game.pause());
    document.querySelector('#sound').addEventListener('click',()=>{
      const enabled=this.game.audio.toggle();const btn=document.querySelector('#sound');btn.textContent=`Som: ${enabled?'ligado':'desligado'}`;btn.setAttribute('aria-pressed',String(enabled));this.game.audio.play('interact');
      if(this.game.state==='playing')this.canvas.focus({preventScroll:true});
    });
  }
  action(action){
    const g=this.game;
    if(action==='start')g.start();else if(action==='play')g.play();else if(action==='resume')g.resume();else if(action==='retry')g.restoreCheckpoint();
    else if(action==='menu')g.menu();else if(action==='close')g.closeInfo();else if(action==='voyage')g.continueVoyage();
    else if(action==='help'||action==='about'){g.state=action;this.show(action);}
  }
  show(state,data={}){
    const playing=state==='playing';this.overlay.hidden=playing;
    this.overlay.className=`overlay${state==='ending'?' arrival':''}`;
    this.hud.hidden=['menu','help','about','story','union','ending'].includes(state);
    this.toast.textContent='';this.interaction.textContent='';
    if(playing){this.overlay.innerHTML='';this.canvas.focus({preventScroll:true});return;}
    let content='';let menu=false;
    if(state==='menu'){
      menu=true;content=`<p class="eyebrow">Uma jornada construída em conjunto</p><h1>Rumo à<br>Liberdade</h1><p>Uma aventura de coragem, cuidado<br>e resistência coletiva.</p><div class="actions">${button('start','Jogar',true)}${button('help','Como Jogar')}${button('about','Sobre o Projeto')}</div><p class="subtle">Uma história fictícia. Uma liberdade que é direito de todos.</p>`;
    }else if(state==='help'){
      content=`<p class="eyebrow">Como Jogar</p><h2>Ninguém caminha sozinho.</h2><p>Explore o navio, liberte companheiros e siga o objetivo no topo da tela. Símbolos dourados indicam interações. Aproxime-se e pressione E.</p><dl class="key-list"><dt>A / ← · D / →</dt><dd>Mover</dd><dt>W / ↑ / Espaço</dt><dd>Pular</dd><dt>J</dt><dd>Afastar guardas (pode segurar)</dd><dt>E</dt><dd>Interagir, libertar e cooperar</dd><dt>Esc</dt><dd>Pausar ou retomar</dd><dt>R</dt><dd>Retomar checkpoint após derrota</dd></dl><p>Barris escondem você à distância. O capitão abre a guarda depois de avançar. Cada conquista importante salva um checkpoint da sessão.</p><div class="actions">${button('menu','Voltar ao menu',true)}</div>`;
    }else if(state==='about'){
      content=`<p class="eyebrow">Sobre o projeto · Consciência Negra</p><h2>Memória, dignidade e resistência.</h2><p>Malik e seus companheiros são personagens fictícios. A tomada deste navio e a viagem de retorno são uma narrativa inventada, inspirada na resistência de pessoas africanas escravizadas. Não retratam um acontecimento histórico específico.</p><p>A história valoriza solidariedade e diversidade, sem violência gráfica. As notas “Memória” distinguem informações históricas da ficção. O 20 de novembro convida à valorização das culturas negras e à luta contra o racismo.</p><div class="sources">Fontes educativas (consulta opcional, exige internet):<br><a href="https://www.gov.br/palmares/pt-br/assuntos/noticias/dia-da-consciencia-negra" target="_blank" rel="noopener noreferrer">Fundação Cultural Palmares · Consciência Negra</a><br><a href="https://www.un.org/en/observances/transatlantic-slave-trade" target="_blank" rel="noopener noreferrer">ONU · Memória do tráfico transatlântico</a></div><div class="actions">${button('menu','Voltar ao menu',true)}</div>`;
    }else if(state==='story'){
      content=`<p class="eyebrow">${escapeHTML(data.kicker)}</p><h2>${escapeHTML(data.title)}</h2><p>${escapeHTML(data.text)}</p><p style="color:var(--gold)">${escapeHTML(data.quote)}</p><p class="subtle">Malik e sua viagem são ficcionais.</p><div class="actions">${button('play','Continuar',true)}</div>`;
    }else if(state==='paused'){
      content=`<p class="eyebrow">Pausa</p><h2>Um momento para respirar.</h2><p>O grupo espera por você. A partida está pausada.</p><div class="actions">${button('resume','Continuar',true)}${button('menu','Voltar ao menu')}</div><p class="subtle">Esc também retoma a partida. Checkpoints permanecem apenas durante esta sessão.</p>`;
    }else if(state==='defeat'){
      content=`<p class="eyebrow">O caminho continua</p><h2>A esperança permanece.</h2><p>A resistência também é recomeçar. Retome o último checkpoint com a vida restaurada e o grupo ao seu lado.</p><div class="actions">${button('retry','Tentar Novamente',true)}${button('menu','Voltar ao menu')}</div><p class="subtle">Você também pode pressionar R.</p>`;
    }else if(state==='info'){
      content=`<p class="eyebrow">${data.source?'Conteúdo histórico · leitura opcional':'Tutorial'}</p><h2>${escapeHTML(data.title)}</h2><p>${escapeHTML(data.text)}</p>${data.source?`<p class="subtle">Fonte: ${escapeHTML(data.source)}</p>`:''}<div class="actions">${button('close','Voltar ao jogo',true)}</div><p class="subtle">A partida está pausada durante a leitura. Esc fecha esta mensagem.</p>`;
    }else if(state==='union'){
      content=`<p class="eyebrow">O navio é do grupo</p><h2>Uma conquista compartilhada.</h2><p>Amina, João, Bia, Tomás e Malik se reúnem no convés. O controle da embarcação foi conquistado pela união. Agora, decidem juntos como enfrentar a travessia.</p><p style="color:var(--gold)">“Somos muitas histórias. Seguiremos lado a lado.”</p><div class="actions">${button('voyage','Organizar a viagem',true)}</div>`;
    }else if(state==='ending'){
      content=`<p class="eyebrow">Chegada · horizonte de liberdade</p><h2>A liberdade pertence a todos.</h2><p>O navio alcança o litoral africano. O grupo celebra a vida, os vínculos e a possibilidade de construir novos caminhos.</p><p><strong>Este retorno é ficcional.</strong> Malik e sua viagem não retratam um episódio histórico comprovado.</p><p>Celebrar a Consciência Negra é reconhecer o protagonismo da resistência negra, valorizar culturas africanas e afro-brasileiras e enfrentar o racismo todos os dias.</p><div class="actions">${button('start','Jogar Novamente',true)}${button('menu','Menu principal')}</div>`;
    }
    this.overlay.innerHTML=`<section class="panel${menu?' menu':''}" aria-label="${state==='menu'?'Menu principal':'Mensagem do jogo'}">${content}</section>`;
    this.overlay.querySelector('button')?.focus({preventScroll:true});
  }
  update(game){
    if(!this.game)this.game=game;
    const hudKey=[game.level.index,game.player.health,game.party.length,game.objective].join('|');
    if(hudKey!==this.lastHUD){
      this.lastHUD=hudKey;this.health.textContent='♥'.repeat(game.player.health)+'♡'.repeat(game.player.maxHealth-game.player.health);
      this.health.setAttribute('aria-label',`${game.player.health} de ${game.player.maxHealth} pontos de vida`);
      this.phase.textContent=`${game.level.index+1} / 3 · ${game.level.name}`;this.objective.textContent=game.objective;
      this.party.textContent=`${game.party.length} companheiro${game.party.length===1?'':'s'} livre${game.party.length===1?'':'s'}`;
    }
    const notice=game.state==='playing' && game.noticeTime>0?game.notice:'';
    if(this.toast.textContent!==notice)this.toast.textContent=notice;
    const interaction=game.interactionText;
    if(this.interaction.textContent!==interaction)this.interaction.textContent=interaction;
  }
}
