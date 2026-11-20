import {moveBody} from './physics.js';

export class Player {
  constructor(x=32,y=124) {
    Object.assign(this,{x,y,w:10,h:20,vx:0,vy:0,facing:1,grounded:false,support:null,maxHealth:5,health:5,invulnerable:0,attackTime:0,attackCooldown:0,clock:0,coyote:0,jumpBuffer:0});
  }
  update(dt,input,solids,width) {
    this.clock+=dt;
    this.invulnerable=Math.max(0,this.invulnerable-dt);
    this.attackCooldown=Math.max(0,this.attackCooldown-dt);
    this.attackTime=Math.max(0,this.attackTime-dt);
    this.coyote=this.grounded ? .1 : Math.max(0,this.coyote-dt);
    this.jumpBuffer=Math.max(0,this.jumpBuffer-dt);
    if (input.pressed('jump')) this.jumpBuffer=.13;
    const axis=Number(input.down('right'))-Number(input.down('left'));
    this.vx=axis*88;
    if (axis) this.facing=axis;
    if (this.jumpBuffer>0 && this.coyote>0) {this.vy=-260;this.grounded=false;this.support=null;this.coyote=0;this.jumpBuffer=0;}
    moveBody(this,dt,solids,width);
  }
  beginAttack() {
    if (this.attackCooldown>0) return false;
    this.attackTime=.16;this.attackCooldown=.34;
    return true;
  }
  get attackBox() {return {x:this.facing>0?this.x+this.w:this.x-23,y:this.y-1,w:23,h:22};}
  hurt(amount=1) {
    if(this.invulnerable>0 || this.health<=0) return false;
    this.health=Math.max(0,this.health-amount);this.invulnerable=1.5;return true;
  }
  serialize() {const {support,...data}=this;return data;}
}
