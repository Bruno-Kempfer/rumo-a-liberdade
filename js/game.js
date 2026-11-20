import {Player} from './player.js';
import {Enemy} from './enemy.js';
import {Companion} from './companion.js';
import {Camera} from './camera.js';
import {createLevel,objectiveFor,HISTORY,STORIES} from './levels.js';
import {solidsFor,overlap,centerDistance,covered} from './physics.js';

export class Game {
  constructor({input,audio,ui=null,renderer=null}) {
    Object.assign(this,{input,audio,ui,renderer,state:'menu',level:createLevel(0),player:new Player(),party:[],camera:new Camera(),particles:[],checkpoint:null,notice:'',noticeTime:0,animationTime:0,nearest:null,storyIndex:0});
  }
  start(){this.party=[];this.loadLevel(0);this.showStory(0);}
  loadLevel(index){
    this.level=createLevel(index);
    this.level.enemies=this.level.enemies.map(data=>new Enemy(data));
    this.player=new Player(this.level.spawn.x,this.level.spawn.y);
    this.party=this.party.map((p,i)=>new Companion({...p.serialize(),x:12+i*12,y:124,vx:0,vy:0,support:null}));
    this.camera.snap(this.player,this.level.width);this.particles=[];this.nearest=null;
    this.saveCheckpoint(false);this.input.clear();
  }
  showStory(index){this.storyIndex=index;this.state='story';this.ui?.show('story',STORIES[index]);}
  play(){this.state='playing';this.input.clear();this.ui?.show('playing');this.notify(this.level.index===0?'Malik · Encontre a chave. E interage com símbolos dourados.':'Um novo capítulo. O grupo segue unido.',4);}
  pause(){if(this.state==='playing'){this.state='paused';this.input.clear();this.ui?.show('paused');}}
  resume(){if(this.state==='paused'){this.state='playing';this.input.clear();this.ui?.show('playing');}}
  showInfo(info){this.state='info';this.input.clear();this.ui?.show('info',info);}
  closeInfo(){if(this.state==='info'){this.state='playing';this.input.clear();this.ui?.show('playing');}}
  menu(){this.state='menu';this.input.clear();this.ui?.show('menu');}
  notify(text,duration=3){this.notice=text;this.noticeTime=duration;}
  emit(x,y,color,count=8){for(let i=0;i<count;i++)this.particles.push({x,y,vx:(Math.random()-.5)*65,vy:-20-Math.random()*40,life:.6+Math.random()*.4,color});}
  frame(rawDt){
    const dt=Math.max(0,Math.min(rawDt,.05));
    if(this.input.pressed('pause')){if(this.state==='playing')this.pause();else if(this.state==='paused')this.resume();else if(this.state==='info')this.closeInfo();}
    if(this.state==='defeat' && this.input.pressed('restart'))this.restoreCheckpoint();
    if(this.state==='playing'){
      let left=dt;
      while(left>1e-7 && this.state==='playing'){const step=Math.min(left,1/120);this.update(step);left-=step;}
    }
    if(!['paused','info'].includes(this.state))this.animationTime+=dt;
    this.input.endFrame();this.renderer?.render(this);this.ui?.update(this);
  }
  update(dt){
    const {level,player}=this;
    level.time+=dt;
    this.noticeTime=Math.max(0,this.noticeTime-dt);
    for(const platform of level.platforms){
      const old=platform.x;
      if(platform.moving)platform.x=platform.baseX+Math.sin(level.time*platform.speed)*platform.range;
      platform.dx=platform.x-old;platform.dy=0;
    }
    const solids=solidsFor(level);
    const oldGrounded=player.grounded;
    player.update(dt,this.input,solids,level.width);
    if(oldGrounded && !player.grounded && player.vy<0)this.audio.play('interact');
    if(this.input.down('attack') && player.beginAttack()){
      this.audio.play('attack');this.emit(player.x+player.facing*13,player.y+10,'#f9df9b',4);
      for(const enemy of level.enemies){
        if(overlap(player.attackBox,enemy) && !enemy.defeated){
          if(enemy.hit(level.flags.rally)){
            this.emit(enemy.x+5,enemy.y+8,'#e8c082');
            if(enemy.defeated){
              this.notify(enemy.type==='captain'?'O capitão recuou. O grupo abriu o caminho até o comando.':'O guarda recuou. Sigam juntos.');
              if(enemy.type==='captain')this.saveCheckpoint();
            }
          } else if(enemy.type==='captain')this.notify(level.flags.rally?'Espere a abertura: o capitão fica cansado após avançar.':'Primeiro, coordene a distração junto ao sino.');
        }
      }
    }
    for(const enemy of level.enemies){
      enemy.update(dt,player,level,solids,level.flags.rally);
      if(!enemy.defeated && enemy.stun<=0 && overlap(player,enemy))this.damage();
    }
    for(const hazard of level.hazards){
      hazard.x=hazard.baseX+Math.sin(level.time*1.7)*hazard.range;
      if(overlap(player,hazard))this.damage();
    }
    this.party.forEach((person,i)=>person.update(dt,player,i,solids,level.width,level.flags.shelter));
    for(const particle of this.particles){particle.life-=dt;particle.x+=particle.vx*dt;particle.y+=particle.vy*dt;particle.vy+=80*dt;}
    this.particles=this.particles.filter(p=>p.life>0);
    if(player.y>190)this.damage(5);
    this.nearest=level.objects.filter(object=>(!object.done || ['info','sign'].includes(object.kind)) && centerDistance(player,object)<33).sort((a,b)=>centerDistance(player,a)-centerDistance(player,b))[0]||null;
    if(this.input.pressed('interact') && this.nearest)this.interact(this.nearest);
    this.camera.update(player,level.width,dt);
  }
  damage(amount=1){
    if(this.player.hurt(amount)){
      this.audio.play('hurt');this.emit(this.player.x+5,this.player.y+8,'#a7c7cf',5);
      if(this.player.health<=0){this.state='defeat';this.input.clear();this.ui?.show('defeat');}
    }
  }
  get interactionText(){
    const object=this.nearest;
    if(!object || this.state!=='playing')return '';
    if(object.kind==='info')return 'E · Ler memória histórica';
    if(object.kind==='sign')return 'E · Ler orientação';
    return `E · ${object.label||'Interagir'}`;
  }
  get objective(){return objectiveFor(this);}
  get hidden(){return covered(this.player,this.level) && this.player.attackTime<=0;}
  interact(object){
    if(object.done && !['info','sign'].includes(object.kind))return;
    const {level}=this;const flags=level.flags;
    const require=(condition,message)=>{if(!condition)this.notify(message,4);return condition;};
    if(object.kind==='info'){this.showInfo(HISTORY[object.history]);return;}
    if(object.kind==='sign'){this.showInfo({title:'Orientação de bordo',text:object.text});return;}
    if(object.kind==='key'){flags.key=true;this.notify('Chave encontrada. Procure Amina e João.');}
    else if(object.kind==='person'){
      if(!require(level.index!==0 || flags.key,'Encontre a chave nas plataformas para abrir as correntes.'))return;
      this.party.push(new Companion({id:object.id,name:object.name,x:object.x,y:object.y,skin:object.skin,shirt:object.shirt,hair:object.hair}));
      this.notify(`${object.name} está livre. Nossa força cresce quando caminhamos juntos.`,4);this.audio.play('rescue');
    }else if(object.kind==='gate'){
      if(object.needs==='winch'){this.notify('O guincho ao lado move este bloqueio.');return;}
      if(!require(flags.key && this.party.length>=2,'Precisamos da chave e dos dois companheiros para abrir a passagem.'))return;
      flags.door=true;this.notify('Juntos, vocês abriram a passagem para o convés.');
    }else if(object.kind==='winch'){
      if(!require(this.party.length>=3,'Liberte Bia: precisamos de três companheiros para mover o guincho.'))return;
      flags.winch=true;level.objects.find(o=>o.id==='deck-gate').done=true;
      this.gather(object.x);this.notify('O grupo moveu o guincho. O caminho está aberto!');
    }else if(object.kind==='rally'){
      if(!require(this.party.length>=4 && flags.winch,'Liberte Tomás e reúna quatro companheiros para coordenar a ação.'))return;
      flags.rally=true;this.gather(object.x);
      this.notify('O sino distrai o capitão. Espere o avanço; use J quando ele se cansar.',6);
    }else if(object.kind==='tools'){flags.tools=true;this.notify('Ferramentas recolhidas. O grupo pode começar os reparos.');}
    else if(object.kind==='repair'){
      if(!require(flags.tools,'Recolha as ferramentas na primeira plataforma.'))return;
      if(object.id==='repair-b' && !require(flags.shelter,'Antes de reforçar o leme, leve o grupo ao abrigo.'))return;
      flags[object.id]=true;this.notify(object.id==='repair-a'?'Casco reparado. A solidariedade mantém o navio em movimento.':'Leme reforçado. Estamos prontos para continuar.');
    }else if(object.kind==='sail'){
      if(!require(flags['repair-a'] && this.party.length>=4,'Repare o casco primeiro. O grupo inteiro ajuda a ajustar as velas.'))return;
      flags.sail=true;this.gather(object.x);this.notify('Velas ajustadas em conjunto. Agora, proteja o grupo no abrigo.');
    }else if(object.kind==='shelter'){
      if(!require(flags.sail,'Ajuste as velas antes de organizar o abrigo.'))return;
      flags.shelter=true;this.gather(object.x+20);this.notify('Companheiros protegidos. Malik seguirá para reforçar o leme.');
    }else if(object.kind==='exit'){
      if(level.index===0){if(!require(flags.door && this.party.length>=2,'Abra a passagem e liberte os dois companheiros antes de subir.'))return;this.loadLevel(1);this.showStory(1);return;}
      if(level.index===1){
        if(!require(flags.rally && level.enemies.find(e=>e.type==='captain').defeated,'Coordene a distração e supere o capitão antes de assumir o comando.'))return;
        this.state='union';this.input.clear();this.ui?.show('union');this.audio.play('win');return;
      }
      if(!require(flags.tools && flags['repair-a'] && flags.sail && flags.shelter && flags['repair-b'],'O navio precisa dos reparos, das velas e de todo o grupo em segurança.'))return;
      this.state='ending';this.animationTime=0;this.input.clear();this.ui?.show('ending');this.audio.play('win');return;
    }else return;
    object.done=true;this.emit(object.x+8,object.y,'#ffd78a',12);this.audio.play('interact');this.saveCheckpoint();
  }
  gather(x){this.party.forEach((person,i)=>{person.x=x-18-i*12;person.y=124;person.vx=0;person.vy=0;person.support=null;});}
  continueVoyage(){this.loadLevel(2);this.showStory(2);}
  saveCheckpoint(announce=true){
    this.checkpoint=structuredClone({level:this.level,player:this.player.serialize(),party:this.party.map(p=>p.serialize())});
    this.checkpoint.player.health=this.player.maxHealth;
    if(announce)this.notice+=' · Checkpoint salvo.';
  }
  restoreCheckpoint(){
    if(!this.checkpoint)return;
    const data=structuredClone(this.checkpoint);
    this.level=data.level;this.level.enemies=data.level.enemies.map(e=>new Enemy(e));
    this.player=Object.assign(new Player(),data.player,{support:null,invulnerable:1.5,attackTime:0,jumpBuffer:0});
    this.party=data.party.map(p=>new Companion(p));this.camera.snap(this.player,this.level.width);
    this.particles=[];this.nearest=null;this.state='playing';this.input.clear();this.ui?.show('playing');this.notify('Retome o caminho. O grupo continua com você.');
  }
}
