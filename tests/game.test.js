import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir,stat} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Player} from '../js/player.js';
import {Enemy} from '../js/enemy.js';
import {Input} from '../js/input.js';
import {Game} from '../js/game.js';
import {overlap,solidsFor,covered} from '../js/physics.js';
import {createLevel} from '../js/levels.js';

class Controls {
  constructor(){this.keys=new Set();this.edges=new Set();}
  down(action){return this.keys.has(action);}
  pressed(action){const found=this.edges.has(action);this.edges.delete(action);return found;}
  endFrame(){this.edges.clear();}
  clear(){this.keys.clear();this.edges.clear();}
  press(action){this.edges.add(action);}
}
const sound={play(){}};
const makeGame=()=>new Game({input:new Controls(),audio:sound});
const tick=(game,frames=1)=>{for(let i=0;i<frames;i++)game.frame(1/60);};

test('colisões: piso, parede, teto e estabilidade com quadro longo',()=>{
  const g=makeGame();g.start();g.play();
  for(let i=0;i<120;i++)g.frame(i===30?3:1/60);
  assert.equal(g.player.y,124);assert.equal(g.player.grounded,true);
  g.player.x=160;g.input.keys.add('right');tick(g,90);
  assert.ok(g.player.x+g.player.w<=176.001,'não atravessa caixa');
  const p=new Player(20,80);p.vy=-260;
  const ceiling={x:0,y:48,w:100,h:16};
  const input=new Controls();
  for(let i=0;i<12;i++)p.update(1/120,input,[ceiling,{x:0,y:144,w:100,h:16}],100);
  assert.ok(p.y>=64,'respeita teto');
  assert.ok(!overlap(p,ceiling));
});

test('pulo permite subir plataformas e não renova impulso no ar',()=>{
  const g=makeGame();g.start();g.play();tick(g,2);
  g.input.press('jump');tick(g,1);const initial=g.player.vy;
  g.input.press('jump');tick(g,8);
  assert.ok(g.player.vy>initial,'gravidade continua sem pulo duplo');
  tick(g,100);assert.equal(g.player.y,124);
});

test('dano respeita invulnerabilidade e derrota restaura checkpoint coerente',()=>{
  const g=makeGame();g.start();g.play();
  g.damage();g.damage();assert.equal(g.player.health,4);
  tick(g,95);g.damage();assert.equal(g.player.health,3);
  g.level.flags.key=true;g.level.objects.find(o=>o.id==='key').done=true;
  g.saveCheckpoint(false);const saved=structuredClone(g.checkpoint);
  g.level.flags.fake=true;g.level.enemies[0].health=0;
  g.player.invulnerable=0;g.damage(5);assert.equal(g.state,'defeat');
  g.input.press('restart');tick(g);assert.equal(g.state,'playing');
  assert.equal(g.player.health,5);assert.deepEqual(g.level.flags,saved.level.flags);
  assert.equal(g.level.enemies[0].health,saved.level.enemies[0].health);
  assert.equal(g.level.objects.find(o=>o.id==='key').done,true);
});

test('pausa e leitura congelam perigos e retomada ignora tempo acumulado',()=>{
  const g=makeGame();g.start();g.play();tick(g,10);
  const before=JSON.stringify(g.level);g.pause();g.frame(900);
  assert.equal(JSON.stringify(g.level),before);
  g.resume();g.frame(900);assert.ok(g.level.time<.3);
  g.showInfo({title:'Memória',text:'Teste'});const readTime=g.level.time;tick(g,300);assert.equal(g.level.time,readTime);
});

test('IA patrulha, persegue, retorna e respeita cobertura; avançado distingue-se',()=>{
  const level=createLevel(1);const enemy=new Enemy({x:200,left:150,right:350,type:'common'});const player=new Player(250,124);
  enemy.update(.1,player,level,[],false);assert.equal(enemy.state,'chase');
  player.x=800;enemy.update(.1,player,level,[],false);assert.equal(enemy.state,'return');
  player.x=392;enemy.x=340;assert.equal(covered(player,level),true);
  enemy.state='patrol';enemy.update(.1,player,level,[],false);assert.equal(enemy.state,'patrol');
  const advanced=new Enemy({type:'advanced',x:200,left:150,right:400});player.x=302;
  advanced.update(.1,player,level,[],false);assert.equal(advanced.state,'chase');assert.equal(advanced.health,3);
});

test('capitão exige coordenação e abertura no padrão de movimento',()=>{
  const e=new Enemy({type:'captain',x:1000,left:970,right:1100});
  e.state='recover';assert.equal(e.hit(false),false);
  e.state='dash';assert.equal(e.hit(true),false);
  e.state='recover';assert.equal(e.hit(true),true);assert.equal(e.health,5);
  assert.equal(e.hit(true),false,'stun impede dano em cada quadro');
});

test('interações bloqueiam progressão indevida e são idempotentes',()=>{
  const g=makeGame();g.start();g.play();
  const person=g.level.objects.find(o=>o.id==='amina');g.interact(person);assert.equal(g.party.length,0);
  g.interact(g.level.objects.find(o=>o.id==='key'));g.interact(person);g.interact(person);
  assert.equal(g.party.length,1);assert.equal(g.party[0].name,'Amina');
  g.interact(g.level.objects.find(o=>o.kind==='exit'));assert.equal(g.level.index,0);
  g.interact(g.level.objects.find(o=>o.id==='joao'));g.interact(g.level.objects.find(o=>o.id==='door'));assert.equal(g.level.flags.door,true);
  g.player.health=1;g.restoreCheckpoint();assert.equal(g.party.length,2);assert.equal(g.player.health,5);
  assert.ok(g.level.objects.find(o=>o.id==='amina').done);
});

test('input por borda, aliases e limpeza ao desfocar',()=>{
  const listeners={};const input=new Input({addEventListener:(type,fn)=>listeners[type]=fn});
  const event=code=>({code,repeat:false,preventDefault(){},target:{closest(){return null;}}});
  listeners.keydown(event('KeyE'));assert.equal(input.pressed('interact'),true);
  listeners.keydown({...event('KeyE'),repeat:true});assert.equal(input.pressed('interact'),false);
  listeners.keydown(event('KeyA'));listeners.keydown(event('ArrowLeft'));listeners.keyup(event('KeyA'));assert.equal(input.down('left'),true);
  listeners.blur();assert.equal(input.down('left'),false);assert.equal(input.pressed('interact'),false);
  listeners.keydown({...event('Escape'),target:{closest(){return {};}}});assert.equal(input.pressed('pause'),true);
});

// Controle de campanha por ações normais; sem alterar posição, vida ou flags.
// A navegação conhece os mapas, como um roteiro manual de verificação.
function walk(g,x,y=124,maxFrames=1200){
  let stuck=0;let last=g.player.x;
  for(let frame=0;frame<maxFrames;frame++){
    assert.equal(g.state,'playing',`partida interrompida em ${g.level.index+1}, x=${g.player.x.toFixed(1)}, vida=${g.player.health}`);
    const dx=x-g.player.x;
    if(Math.abs(dx)<5 && Math.abs(g.player.y-y)<13){g.input.keys.clear();tick(g,1);return;}
    g.input.keys.clear();if(Math.abs(dx)>3)g.input.keys.add(dx>0?'right':'left');g.input.keys.add('attack');
    if(Math.abs(g.player.x-last)<.15)stuck++;else stuck=0;
    const dir=Math.sign(dx);const look={x:dir>0?g.player.x+g.player.w+1:g.player.x-4,y:g.player.y+3,w:3,h:g.player.h-4};
    const blocked=solidsFor(g.level).some(s=>overlap(look,s));
    if(g.player.grounded && (blocked || y<g.player.y-12 || stuck>8))g.input.press('jump');
    last=g.player.x;tick(g);
  }
  assert.fail(`destino inacessível: fase ${g.level.index+1} alvo ${x},${y} atual ${g.player.x.toFixed(1)},${g.player.y.toFixed(1)}`);
}
function use(g,id,x,y=124){
  const object=g.level.objects.find(o=>o.id===id);walk(g,x??object.x-10,y);
  tick(g,1);assert.equal(g.nearest?.id,id,`interação mais próxima de ${id}: ${g.nearest?.id}`);
  g.input.press('interact');tick(g);return object;
}

test('campanha completa via movimentos, pulos, ataque e E, com replay limpo',()=>{
  const g=makeGame();g.start();g.play();
  use(g,'key',294,76);assert.ok(g.level.flags.key);
  use(g,'amina');use(g,'joao');use(g,'door',690);
  use(g,'hold-exit',1128);assert.equal(g.state,'story');assert.equal(g.level.index,1);g.play();
  use(g,'bia');use(g,'winch',688);use(g,'tomas',834,92);use(g,'rally',890);
  const captain=g.level.enemies.find(e=>e.type==='captain');
  for(let frame=0;frame<2400 && !captain.defeated;frame++){
    assert.equal(g.state,'playing',`capitão interrompeu partida; vida ${g.player.health}`);
    g.input.keys.clear();
    const dx=captain.x-g.player.x;
    if(captain.state==='recover'){
      if(Math.abs(dx)>22)g.input.keys.add(dx>0?'right':'left');
      else {g.input.keys.add('attack');if(Math.sign(dx)!==g.player.facing)g.input.keys.add(dx>0?'right':'left');}
    }else{
      if(Math.abs(dx)<85)g.input.keys.add(dx>0?'left':'right');
      if(captain.state==='dash' && g.player.grounded && Math.abs(dx)<45)g.input.press('jump');
    }
    tick(g);
  }
  assert.ok(captain.defeated,'capitão superado por aproximação na abertura');
  use(g,'command',1134);assert.equal(g.state,'union');g.continueVoyage();assert.equal(g.state,'story');g.play();
  use(g,'tools',184,92);use(g,'repair-a',376);use(g,'sail',648,68);use(g,'shelter',782);use(g,'repair-b',940);
  const partyPositions=g.party.map(p=>p.x);tick(g,60);assert.deepEqual(g.party.map(p=>p.x),partyPositions,'abrigo protege e mantém o grupo reunido');
  use(g,'arrival',1126);assert.equal(g.state,'ending');assert.equal(g.party.length,4);
  g.start();assert.equal(g.level.index,0);assert.equal(g.party.length,0);assert.deepEqual(g.level.flags,{});assert.equal(g.player.health,5);
});

test('todos os imports e recursos estáticos locais existem',async()=>{
  const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
  for(const filename of await readdir(resolve(root,'js'))){
    const content=await readFile(resolve(root,'js',filename),'utf8');
    for(const match of content.matchAll(/from\s+['"]([^'"]+)['"]/g))assert.ok((await stat(resolve(root,'js',match[1]))).isFile());
    assert.ok(!/https?:\/\/.*\.(?:png|jpg|js|css)/.test(content),'nenhum asset remoto obrigatório');
  }
  const html=await readFile(resolve(root,'index.html'),'utf8');
  for(const match of html.matchAll(/(?:src|href)="([^"#:]+)"/g))assert.ok((await stat(resolve(root,match[1]))).isFile());
});
