import {covered,lineBlocked} from './physics.js';

export class Enemy {
  constructor(data) {
    Object.assign(this,{w:11,h:20,y:124,vx:0,vy:0,facing:-1,state:'patrol',stun:0,clock:0,cycle:0,health:data.type==='captain'?6:data.type==='advanced'?3:2,defeated:false},data);
    this.home=this.home??this.x;
  }
  update(dt,player,level,solids,coordinated) {
    this.clock+=dt;
    this.vx=0;
    if(this.defeated) return;
    this.stun=Math.max(0,this.stun-dt);
    if(this.stun>0) return;
    if(this.type==='captain') {
      this.cycle=(this.cycle+dt)%3.6;
      if(!coordinated) {this.state='guard';this.facing=player.x>this.x?1:-1;return;}
      if(this.cycle<1.2) {this.state='windup';this.facing=player.x>this.x?1:-1;}
      else if(this.cycle<2) {this.state='dash';this.vx=this.facing*75;this.x+=this.vx*dt;}
      else this.state='recover';
      this.x=Math.max(this.left,Math.min(this.right,this.x));
      return;
    }
    const range=this.type==='advanced'?126:86;
    const distance=Math.abs(player.x-this.x);
    const visible=distance<range && Math.abs(player.y-this.y)<28 && (!covered(player,level) || player.attackTime>0 || distance<19) && !lineBlocked(this,player,solids);
    if(visible) this.state='chase';
    else if(this.state==='chase') this.state='return';
    let speed=this.type==='advanced'?45:34;
    if(this.state==='chase') this.facing=player.x>this.x?1:-1;
    if(this.state==='return') {
      this.facing=this.home>this.x?1:-1;speed=31;
      if(Math.abs(this.x-this.home)<3) this.state='patrol';
    }
    if(this.state==='patrol') {
      if(this.x<=this.left) this.facing=1;
      if(this.x>=this.right) this.facing=-1;
      speed=22;
    }
    // Patrulhas ficam em sua área do convés e respeitam os sólidos.
    const next={...this,x:this.x+this.facing*speed*dt};
    const wall=solids.some(s => next.x<s.x+s.w && next.x+next.w>s.x && next.y<s.y+s.h && next.y+next.h>s.y);
    if(!wall) {this.vx=this.facing*speed;this.x=next.x;}
    else {this.facing*=-1;if(this.state==='chase')this.state='return';}
    this.x=Math.max(this.left-24,Math.min(this.right+24,this.x));
  }
  hit(coordinated) {
    if(this.defeated || this.stun>0) return false;
    if(this.type==='captain' && (!coordinated || this.state!=='recover')) return false;
    this.health--;this.stun=.38;
    if(this.health<=0) {this.defeated=true;this.state='retreat';}
    return true;
  }
}
