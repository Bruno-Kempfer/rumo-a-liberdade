export class Camera {
  constructor(){this.x=0;}
  update(player,width,dt=1){const target=Math.max(0,Math.min(width-320,player.x-115));this.x+= (target-this.x)*Math.min(1,dt*9);}
  snap(player,width){this.x=Math.max(0,Math.min(width-320,player.x-115));}
}
