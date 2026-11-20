import {moveBody} from './physics.js';

export class Companion {
  constructor(data) {Object.assign(this,{w:10,h:19,vx:0,vy:0,grounded:false,support:null,clock:0,stuck:0,facing:1},data);}
  update(dt,player,index,solids,width,sheltered) {
    this.clock+=dt;
    const target=Math.max(10,player.x-player.facing*(22+index*15));
    const delta=target-this.x;
    this.vx=Math.abs(delta)>7?Math.sign(delta)*Math.min(80,Math.abs(delta)*3):0;
    if(this.vx) this.facing=Math.sign(this.vx);
    if(sheltered) {this.vx=0;return;}
    const oldX=this.x;
    moveBody(this,dt,solids,width);
    if(Math.abs(delta)>18 && Math.abs(this.x-oldX)<.1) this.stuck+=dt;
    else this.stuck=0;
    if(this.grounded && (this.stuck>.15 || player.y<this.y-12)) {this.vy=-260;this.stuck=0;}
    // Reagrupar evita que um companheiro preso bloqueie a progressão.
    if(Math.abs(delta)>190 || this.y>190) {this.x=Math.max(0,Math.min(width-this.w,target));this.y=player.y;this.vy=0;this.support=null;}
  }
  serialize() {const {support,...data}=this;return data;}
}
