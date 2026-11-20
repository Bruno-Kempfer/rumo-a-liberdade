import test from 'node:test';
import assert from 'node:assert/strict';
import {Renderer} from '../js/renderer.js';
import {UI} from '../js/ui.js';
import {Game} from '../js/game.js';
import {AudioController} from '../js/audio.js';
import {Input} from '../js/input.js';

test('smoke de renderização: todas as fases, entidades, menus e final usam Canvas válido',()=>{
  let rectangles=0;
  const context={fillRect(x,y,w,h){assert.ok([x,y,w,h].every(Number.isFinite));assert.ok(w>=0 && h>=0);rectangles++;},setTransform(){},save(){},restore(){},translate(){},fillText(){},beginPath(){},arc(){},stroke(){},moveTo(){},lineTo(){},closePath(){},fill(){}};
  const renderer=new Renderer({getContext(){return context;}});
  const input={clear(){}};const g=new Game({input,audio:{play(){}}});
  for(let i=0;i<3;i++){
    g.loadLevel(i);g.state='playing';renderer.render(g);
    for(const enemy of g.level.enemies){enemy.state='recover';enemy.clock=1;}
    g.level.flags.rally=true;g.player.attackTime=.1;g.player.invulnerable=1;renderer.render(g);
    for(const state of ['menu','story','union','ending','paused','info','defeat']){g.state=state;renderer.render(g);}
  }
  assert.ok(rectangles>5000);
});

test('smoke de interface: menus, ações e HUD sem dependências de navegador',()=>{
  const original=globalThis.document;
  const nodes=new Map();
  const node=()=>({textContent:'',innerHTML:'',hidden:false,dataset:{},addEventListener(){},setAttribute(){},focus(){},querySelector(){return {focus(){}};}});
  globalThis.document={querySelector(selector){if(!nodes.has(selector))nodes.set(selector,node());return nodes.get(selector);}};
  try{
    const ui=new UI();const input={clear(){}};const g=new Game({ui,input,audio:{play(){}}});ui.game=g;
    ui.show('menu');assert.match(nodes.get('#overlay').innerHTML,/Jogar/);
    ui.action('help');assert.equal(g.state,'help');assert.match(nodes.get('#overlay').innerHTML,/checkpoints?/i);
    ui.action('about');assert.match(nodes.get('#overlay').innerHTML,/fictícios/);
    ui.action('start');assert.equal(g.state,'story');ui.action('play');assert.equal(nodes.get('#overlay').hidden,true);
    ui.update(g);assert.match(nodes.get('#phase').textContent,/O Despertar/);assert.match(nodes.get('#objective').textContent,/chave/);
    g.pause();assert.equal(g.state,'paused');ui.action('resume');assert.equal(g.state,'playing');
    g.showInfo({title:'Memória',text:'<script>inseguro</script>',source:'ONU'});assert.match(nodes.get('#overlay').innerHTML,/&lt;script&gt;/);
    ui.action('close');assert.equal(g.state,'playing');g.player.health=0;g.state='defeat';ui.show('defeat');ui.action('retry');assert.equal(g.player.health,5);
    ui.show('union');ui.action('voyage');assert.equal(g.level.index,2);ui.show('ending');assert.match(nodes.get('#overlay').innerHTML,/retorno é ficcional/);
    ui.action('menu');assert.equal(g.state,'menu');
  }finally{globalThis.document=original;}
});

test('áudio indisponível falha de forma segura sem impedir jogo',()=>{
  const audio=new AudioController();audio.play('rescue');
  assert.equal(audio.enabled,false);
  assert.equal(audio.toggle(),false);
  assert.doesNotThrow(()=>audio.play('hurt'));
});

test('botão Som devolve foco ao Canvas somente durante a partida e mantém controles ativos',()=>{
  const original=globalThis.document;
  const nodes=new Map();
  const doc={activeElement:null,querySelector(selector){
    if(!nodes.has(selector)){
      const listeners={};
      const node={textContent:'',innerHTML:'',hidden:false,dataset:{},
        addEventListener(type,handler){listeners[type]=handler;},setAttribute(){},
        focus(){doc.activeElement=this;},
        closest(){return ['#sound','#pause'].includes(selector)?this:null;},
        querySelector(){return {focus(){doc.activeElement=this;}};},
        click(){this.focus();listeners.click?.({target:this});}
      };
      nodes.set(selector,node);
    }
    return nodes.get(selector);
  }};
  globalThis.document=doc;
  try{
    const listeners={};
    const input=new Input({addEventListener(type,handler){listeners[type]=handler;}});
    const ui=new UI();const audio={enabled:false,toggle(){this.enabled=!this.enabled;return this.enabled;},play(){}};
    const game=new Game({ui,input,audio});ui.game=game;game.start();game.play();
    const sound=doc.querySelector('#sound');const canvas=doc.querySelector('#game');
    sound.click();assert.equal(doc.activeElement,canvas,'clicar Som devolve o foco ao jogo em execução');
    const key=code=>({code,repeat:false,target:doc.activeElement,preventDefault(){}});
    const x=game.player.x;
    listeners.keydown(key('KeyD'));assert.equal(input.down('right'),true);game.frame(1/60);
    assert.ok(game.player.x>x,'D continua movendo Malik após clicar Som');listeners.keyup(key('KeyD'));
    for(const [code,action] of [['Space','jump'],['KeyJ','attack'],['KeyE','interact']]){
      listeners.keydown(key(code));assert.equal(input.down(action),true);assert.equal(input.pressed(action),true);listeners.keyup(key(code));
    }
    game.menu();sound.click();assert.equal(doc.activeElement,sound,'menu mantém o foco do botão acionado');assert.equal(game.state,'menu');
    game.start();game.play();game.showInfo({title:'Memória',text:'Leitura histórica'});
    sound.click();assert.equal(doc.activeElement,sound,'leitura mantém o foco do botão acionado');assert.equal(game.state,'info');
    listeners.keydown(key('KeyD'));assert.equal(input.down('right'),false,'teclas de jogo continuam protegidas enquanto um botão tem foco na leitura');
  }finally{globalThis.document=original;}
});
