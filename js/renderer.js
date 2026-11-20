import {TILE} from './physics.js';

const palette={wood:'#785139',woodLight:'#ae7750',edge:'#372b2c',gold:'#edbd6a',cream:'#f8e7bf'};

export class Renderer {
  constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.ctx.imageSmoothingEnabled=false;}
  rect(x,y,w,h,color){this.ctx.fillStyle=color;this.ctx.fillRect(Math.round(x),Math.round(y),Math.ceil(w),Math.ceil(h));}
  text(text,x,y,color=palette.cream,size=5){this.ctx.fillStyle=color;this.ctx.font=`${size}px monospace`;this.ctx.fillText(text,Math.round(x),Math.round(y));}
  render(game){
    const ctx=this.ctx;ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;
    const sceneStates=['menu','help','about','story','union','ending'];
    if(sceneStates.includes(game.state)){this.scene(game);return;}
    this.background(game.level.index,game.animationTime,game.camera.x);
    ctx.save();ctx.translate(-Math.floor(game.camera.x),0);
    const {level}=game;
    level.tiles.forEach((row,y)=>row.forEach((tile,x)=>{
      if(!tile)return;
      this.tile(x*TILE,y*TILE,tile,x+y);
    }));
    for(const p of level.platforms){this.rect(p.x,p.y,p.w,p.h,'#453530');this.rect(p.x,p.y,p.w,2,'#d29a62');for(let x=4;x<p.w;x+=12)this.rect(p.x+x,p.y+3,1,3,'#926443');}
    for(const cover of level.covers)this.barrel(cover.x,cover.y);
    for(const object of level.objects)this.object(object,game);
    for(const hazard of level.hazards){
      this.rect(hazard.x+6,0,1,hazard.y,'#8d9294');this.rect(hazard.x,hazard.y,hazard.w,hazard.h,'#674936');this.rect(hazard.x+2,hazard.y+2,hazard.w-4,hazard.h-4,'#9c714b');this.rect(hazard.x+5,hazard.y+2,2,hazard.h-4,'#c39a61');this.rect(hazard.x,hazard.y,hazard.w,2,'#e6aa5c');this.rect(hazard.x,hazard.y+hazard.h-4,hazard.w,2,'#423932');
      this.ctx.globalAlpha=.2;this.rect(hazard.baseX-hazard.range,143,hazard.range*2+14,1,'#ffbe7c');this.ctx.globalAlpha=1;
    }
    for(const person of game.party)this.human(person,{skin:person.skin,shirt:person.shirt,hair:person.hair});
    for(const enemy of level.enemies){
      if(enemy.defeated){this.ctx.globalAlpha=.45;this.rect(enemy.x,142,11,2,'#b4bec1');this.ctx.globalAlpha=1;continue;}
      const captain=enemy.type==='captain';
      this.human(enemy,{skin:enemy.type==='common'?'#c79e7a':'#ad826b',shirt:captain?'#552e3c':enemy.type==='advanced'?'#455869':'#6a6b6a',enemy:true,captain});
      if(enemy.state==='chase')this.text('!',enemy.x+4,enemy.y-4,'#f9b964',8);
      if(captain){
        const color=enemy.state==='recover'?'#7bdbc0':'#e8b27b';
        this.rect(enemy.x-5,enemy.y-8,24,2,'#1a2533');this.rect(enemy.x-5,enemy.y-8,24*enemy.health/6,2,color);
        if(game.level.flags.rally)this.text(enemy.state==='recover'?'AGORA!':enemy.state==='windup'?'!':'',enemy.x-4,enemy.y-12,color,5);
      }
    }
    if(!(game.player.invulnerable>0 && Math.floor(game.player.clock*12)%2))this.human(game.player,{skin:'#76442e',shirt:'#d9a659',hair:1,player:true});
    if(game.player.attackTime>0){
      const p=game.player;this.ctx.strokeStyle='#ffe1a2';this.ctx.lineWidth=1;
      this.ctx.beginPath();const sx=p.x+5+p.facing*12;this.ctx.arc(sx,p.y+9,8,p.facing>0?-1.2:1.8,p.facing>0?1.2:4.4);this.ctx.stroke();
    }
    for(const p of game.particles)this.rect(p.x,p.y,1,2,p.color);
    if(game.hidden){this.rect(game.player.x-5,game.player.y-13,20,7,'#172e37');this.text('OCULTO',game.player.x-4,game.player.y-8,'#9bd5b7',4);}
    ctx.restore();
    if(level.index===2){
      ctx.globalAlpha=level.flags.sail ? .18 : .4;
      for(let i=0;i<38;i++){const x=(i*39-game.animationTime*75)%340;const y=(i*29+game.animationTime*110)%180;this.rect(x,y,1,5,'#94b5c2');}
      ctx.globalAlpha=1;
    }
    this.rect(9,174,302,1,'#0c1a26');this.rect(9,174,302*(game.player.x/level.width),1,palette.gold);
    this.rect(9+302*(game.player.x/level.width),172,2,5,palette.cream);
    if(game.state==='paused'||game.state==='info'||game.state==='defeat'){ctx.fillStyle='#08142055';ctx.fillRect(0,0,320,180);}
  }
  background(index,t,camera=0){
    const sky=index===2?['#1b2b43','#314455','#5d6c77','#8c9795']:['#26344f','#5c5268','#b27069','#e6a16f'];
    for(let y=0;y<120;y+=4)this.rect(0,y,320,4,sky[Math.min(3,Math.floor(y/30))]);
    if(index!==2){this.rect(238-camera*.05,38,20,20,'#f3cb91');this.rect(234-camera*.05,44,28,9,'#f3cb91');}
    for(let i=0;i<6;i++){const x=((i*83-camera*.12)%410+410)%410-40;this.rect(x,18+i%3*18,28,2,index===2?'#647687':'#b07b7c');this.rect(x+8,15+i%3*18,22,3,index===2?'#647687':'#b07b7c');}
    this.ocean(106,t);
    if(index===0){
      this.rect(0,0,320,144,'#302b2d');
      for(let x=-Math.floor(camera*.5)%80;x<320;x+=80){
        this.rect(x,0,6,144,'#5a4034');this.rect(x+2,0,1,144,'#7a563c');
        this.rect(x+20,45,32,28,'#171d2b');this.rect(x+23,48,26,22,'#294354');
        for(let i=0;i<3;i++)this.rect(x+23,55+i*6,26,1,i%2?'#34747c':'#274d61');
        this.rect(x+34,46,2,27,'#6a4b39');
        this.rect(x+62,42,3,14,'#614b38');this.rect(x+60,54,7,10,'#c38e48');this.rect(x+62,56,3,6,'#ffe1a4');
        this.ctx.globalAlpha=.05;this.rect(x+42,42,43,68,'#ffd294');this.ctx.globalAlpha=1;
      }
      this.rect(0,0,320,9,'#8a6042');this.rect(0,9,320,3,'#1d2027');
      for(let y=18;y<144;y+=20)this.rect(0,y,320,1,'#48352e');
    }else{
      for(let x=100-Math.floor(camera*.35)%210;x<380;x+=210){
        this.rect(x,0,5,143,'#4d3b34');this.rect(x+1,0,1,142,'#bb8956');
        this.ctx.strokeStyle='#6c6060';this.ctx.beginPath();this.ctx.moveTo(x-70,142);this.ctx.lineTo(x+3,-12);this.ctx.lineTo(x+80,142);this.ctx.stroke();
        for(let y=10;y<120;y+=9)this.rect(x+12,y,10,1,'#897b68');
        this.rect(x+12,0,1,130,'#69594a');this.rect(x+22,0,1,130,'#69594a');
        this.rect(x-24,6,50,44,index===2?'#7b8589':'#d7c9a0');this.rect(x-20,10,1,35,'#b7a880');
      }
      this.rect(0,136,320,3,'#b28259');this.rect(0,139,320,2,'#453832');
      for(let x=-Math.floor(camera)%32;x<320;x+=32)this.rect(x,134,3,10,'#8b5b3b');
    }
  }
  ocean(y,t){
    this.rect(0,y,320,180-y,'#163c53');
    for(let row=0;row<9;row++){
      const yy=y+row*9;this.rect(0,yy,320,4,row%2?'#18465c':'#1f5364');
      for(let i=0;i<10;i++){const x=((i*43+Math.sin(t+row)*5+t*(3+row*.7))%360)-20;this.rect(x,yy+Math.sin(i+t)*2,14+row,1,row%2?'#378183':'#2a6a79');}
    }
  }
  tile(x,y,type,seed){
    if(type===2){
      this.rect(x,y,16,16,'#4c342b');this.rect(x+1,y+1,14,14,'#936342');this.rect(x+3,y+3,10,10,'#6e4b37');this.rect(x+2,y+2,12,2,'#c38c56');
      for(let i=3;i<13;i++)this.rect(x+i,y+i,2,1,'#b17b4d');
    }else{
      this.rect(x,y,16,16,seed%3===0?'#815738':'#714b35');this.rect(x,y,16,1,'#a9784b');this.rect(x,y+14,16,2,'#422f2b');
      this.rect(x+2,y+5,11,1,'#5c402e');this.rect(x+4,y+10,9,1,'#93623e');this.rect(x+1,y+2,1,1,'#d6aa6a');
    }
  }
  barrel(x,y){
    this.rect(x+2,y,14,20,'#59432e');this.rect(x,y+3,18,14,'#9d7045');this.rect(x+3,y+2,2,16,'#bd8a53');this.rect(x+11,y+2,1,16,'#64452e');
    this.rect(x,y+4,18,3,'#52616a');this.rect(x,y+14,18,3,'#52616a');this.rect(x+2,y+1,14,1,'#d0a26d');
  }
  human(body,style={}){
    const {x,y}=body;const t=body.clock||0;const moving=Math.abs(body.vx||0)>3;const step=moving?Math.sin(t*15):0;const direction=body.facing||1;
    this.ctx.globalAlpha=.25;this.rect(x-1,y+19,13,2,'#111923');this.ctx.globalAlpha=1;
    const skin=style.skin||'#815039';const shirt=style.shirt||'#c6a160';const h=body.h||20;
    this.rect(x+2,y+h-7,3,6,'#263a45');this.rect(x+6,y+h-7,3,6,'#263a45');
    this.rect(x+1+step*2,y+h-2,4,2,'#bf976d');this.rect(x+6-step*2,y+h-2,4,2,'#bf976d');
    this.rect(x+1,y+7,9,8,shirt);this.rect(x+1,y+13,9,2,'#6e4f3b');this.rect(x+5,y+8,1,5,'#f3db9b');
    this.rect(x,y+8+step,2,7,skin);this.rect(x+10,y+8-step,2,7,skin);
    this.rect(x+3,y+1,6,6,skin);this.rect(x+2,y+2,7,4,skin);
    this.rect(x+2,y,7,2,'#231e24');
    if(style.hair===1)this.rect(x+2,y-1,6,2,'#231e24');
    if(style.hair===2){this.rect(x+1,y-1,8,3,'#231e24');this.rect(x+1,y+1,2,5,'#231e24');}
    this.rect(x+(direction>0?7:3),y+3,1,1,'#f5e2bd');
    if(style.enemy){this.rect(x+1,y,10,2,'#2b3340');this.rect(x+3,y-2,7,3,style.captain?'#422f3b':'#555b64');}
    if(style.captain){this.rect(x,y-1,12,2,'#a17d4b');this.rect(x+4,y-3,6,2,'#613e48');}
    if(style.player){this.rect(x+1,y+8,2,6,'#f1d185');this.rect(x+9,y+8,1,6,'#a96b3b');}
    if(body.attackTime>0)this.rect(x+(direction>0?11:-5),y+8,6,3,skin);
  }
  object(o,game){
    if(o.done && !['repair','sail','shelter','winch','rally'].includes(o.kind))return;
    const {x,y}=o;const t=game.animationTime;
    if(o.kind==='gate'){
      this.rect(x-2,y,12,o.h,'#342f30');for(let i=0;i<o.h;i+=8){this.rect(x,y+i,3,6,'#a2aab0');this.rect(x+6,y+i+3,3,6,'#78818a');}this.rect(x-2,y+o.h/2,12,5,'#c5a067');return;
    }
    if(o.kind==='person'){
      this.human({...o,w:10,clock:0},{skin:o.skin,shirt:o.shirt,hair:o.hair});this.rect(x-2,y+10,17,1,'#939d9d');this.rect(x-2,y+12,17,1,'#59666e');
    }else if(o.kind==='key'){
      this.rect(x+3,y+7+Math.sin(t*3)*2,8,2,palette.gold);this.rect(x+2,y+4+Math.sin(t*3)*2,4,5,palette.gold);this.rect(x+3,y+5+Math.sin(t*3)*2,2,2,'#48352c');this.rect(x+10,y+7+Math.sin(t*3)*2,2,5,palette.gold);
    }else if(o.kind==='info'||o.kind==='sign'){
      this.rect(x+7,y+6,2,14,'#7f5b3a');this.rect(x,y,17,12,o.kind==='info'?'#d1ab68':'#8b633e');this.rect(x+2,y+2,13,8,'#3d3840');this.text(o.kind==='info'?'i':'?',x+6,y+9,palette.gold,7);
    }else if(o.kind==='exit'){
      this.rect(x,y,o.w,o.h,'#342e31');this.rect(x+3,y+2,o.w-6,o.h-2,'#162a38');this.rect(x,y,o.w,3,palette.gold);
      for(let i=8;i<o.h;i+=6)this.rect(x+6,y+i,o.w-12,2,'#bb8954');
    }else if(o.kind==='winch'){
      this.rect(x,y+11,20,9,'#58463a');this.rect(x+5,y+5,10,11,o.done?'#76b2a0':'#be9b61');this.rect(x+9,y,2,8,'#b8bdab');this.rect(x+3,y,14,2,'#d3aa6a');
    }else if(o.kind==='rally'){
      this.rect(x+7,y-17,3,37,'#705039');this.rect(x+1,y-15,17,2,'#c79557');this.rect(x+4,y-10,10,9,o.done?'#7fbaaa':'#e7bb70');this.rect(x+2,y-2,14,2,'#f3d18b');
    }else if(o.kind==='tools'){
      this.rect(x+1,y+10,17,9,'#b07042');this.rect(x+5,y+7,9,2,'#c6c2a1');this.rect(x+4,y+9,2,5,'#c6c2a1');this.rect(x+11,y+4,2,9,'#b9c5bd');
    }else if(o.kind==='repair'){
      this.rect(x,y+9,18,11,'#2a333a');this.rect(x+2,y+12,14,2,o.done?'#91aa80':'#a66e49');this.rect(x+6,y+8,2,12,o.done?'#c6ae78':'#2b232a');this.rect(x+11,y+10,2,10,o.done?'#c6ae78':'#2b232a');
    }else if(o.kind==='sail'){
      this.rect(x+8,y-30,3,50,'#9e7850');this.rect(x-3,y-26,12,25,o.done?'#e0dbc0':'#929999');this.rect(x-3,y-26,12,2,'#f0d6a5');this.rect(x+5,y+5,2,15,'#d0af6a');
    }else if(o.kind==='shelter'){
      this.rect(x-36,y-18,80,38,'#45444a');this.rect(x-38,y-20,84,4,'#aa7c54');this.rect(x-33,y-14,74,31,'#293842');this.rect(x-32,y-15,72,2,'#7b6b54');
      // Os companheiros são desenhados depois, dentro do abrigo.
    }
    if(!o.done && !['sign','info'].includes(o.kind)){
      const bob=Math.round(Math.sin(t*3+o.x)*1.5);
      this.rect(x+6,y-9+bob,3,3,palette.gold);this.rect(x+7,y-5+bob,1,1,palette.gold);
    }
    if(o.done && o.kind!=='shelter')this.text('✓',x+5,y-5,'#9cd7b2',7);
  }
  scene(game){
    const t=game.animationTime;const ending=game.state==='ending';
    for(let y=0;y<125;y+=3){const colors=ending?['#304963','#64798a','#b8a285','#e7c091']:['#24334f','#544663','#aa6970','#e4a37b'];this.rect(0,y,320,3,colors[Math.min(3,Math.floor(y/32))]);}
    this.rect(247,36,26,24,'#f6d298');this.rect(242,42,36,12,'#f6d298');
    for(let i=0;i<7;i++)this.rect(8+i*51+Math.sin(t*.2+i)*5,23+i%3*12,24+i%3*6,2,'#b08b8a');
    this.ocean(118,t);
    if(ending){
      this.rect(282,100,38,29,'#526f63');this.rect(273,107,47,24,'#627c65');this.rect(268,116,52,16,'#a99a68');this.rect(263,129,57,2,'#f0d9a2');
      for(let i=0;i<6;i++){const x=280+i*9;this.rect(x,91-i%2*8,2,22,'#4e604e');this.rect(x-5,88-i%2*8,12,6,'#496b55');}
    }
    const sx=ending?Math.min(241,190+t*3):244+Math.sin(t*.4)*3;
    const sy=125+Math.sin(t*1.4)*1;
    this.rect(sx-68,sy,116,8,'#af7549');this.rect(sx-60,sy+8,108,9,'#785037');this.rect(sx-51,sy+17,91,7,'#513b32');this.rect(sx-40,sy+24,70,3,'#3d3030');
    this.rect(sx-71,sy-4,122,4,'#d2a36b');this.rect(sx+26,sy-23,21,20,'#84563c');this.rect(sx+22,sy-25,28,4,'#c39160');this.rect(sx+32,sy-18,8,7,'#e2bc78');
    this.rect(sx-14,sy-89,4,85,'#775c46');this.rect(sx-48,sy-74,75,3,'#a58461');
    this.ctx.fillStyle='#e6d9b4';this.ctx.beginPath();this.ctx.moveTo(sx-44,sy-70);this.ctx.lineTo(sx+22,sy-70);this.ctx.lineTo(sx+17,sy-25);this.ctx.lineTo(sx-41,sy-27);this.ctx.closePath();this.ctx.fill();
    this.rect(sx-31,sy-67,1,35,'#c2b28c');this.rect(sx-12,sy-68,1,40,'#c2b28c');this.rect(sx+7,sy-67,1,35,'#c2b28c');
    this.rect(sx-10,sy-94,22,6,'#dfac64');this.rect(sx+7,sy-91,7,3,'#dfac64');
    this.ctx.strokeStyle='#ba9d76';this.ctx.beginPath();this.ctx.moveTo(sx-61,sy-4);this.ctx.lineTo(sx-11,sy-88);this.ctx.lineTo(sx+42,sy-4);this.ctx.stroke();
    for(let i=0;i<5;i++)this.human({x:sx-42+i*12,y:sy-24,w:10,h:20,clock:t,facing:1},{skin:['#76442e','#94502f','#59392c','#6e4030','#b87547'][i],shirt:['#d9a659','#d6a44c','#649d9a','#b36550','#8180ac'][i],hair:i%3});
    for(let i=0;i<3;i++)this.rect(sx-48+i*30,sy+10,6,3,'#322e2e');
    this.rect(sx-63,sy+28,108,1,'#6c9e98');
    if(game.state==='story'||game.state==='union'){
      for(let i=0;i<6;i++)this.rect(197+i*17,164+Math.sin(t+i)*2,1,1,'#ffe2a0');
    }
  }
}
