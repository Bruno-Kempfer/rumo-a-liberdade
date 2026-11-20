export const TILE = 16;
export const GRAVITY = 650;
export const overlap = (a,b) => a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
export const centerDistance = (a,b) => Math.hypot(a.x+a.w/2-b.x-b.w/2,a.y+a.h/2-b.y-b.h/2);

export function solidsFor(level) {
  const solids = [];
  level.tiles.forEach((row,y) => row.forEach((tile,x) => {
    if (tile) solids.push({x:x*TILE,y:y*TILE,w:TILE,h:TILE,kind:tile===2?'crate':'wood'});
  }));
  for (const object of level.objects) {
    if (object.kind === 'gate' && !object.done) solids.push({...object,kind:'gate'});
  }
  for (const platform of level.platforms) solids.push(platform);
  return solids;
}

// A chamada usa passos <= 1/120 s: resolve cada eixo separadamente.
export function moveBody(body,dt,solids,worldWidth) {
  if (body.grounded && body.support) {
    body.x += body.support.dx || 0;
    body.y += body.support.dy || 0;
  }
  body.x += body.vx*dt;
  for (const solid of solids) {
    if (!overlap(body,solid)) continue;
    if (body.vx>0) body.x=solid.x-body.w;
    else if (body.vx<0) body.x=solid.x+solid.w;
    body.vx=0;
  }
  body.x=Math.max(0,Math.min(worldWidth-body.w,body.x));
  body.vy=Math.min(body.vy+GRAVITY*dt,300);
  body.y+=body.vy*dt;
  body.grounded=false;
  body.support=null;
  for (const solid of solids) {
    if (!overlap(body,solid)) continue;
    if (body.vy>=0) {body.y=solid.y-body.h;body.grounded=true;body.support=solid;}
    else body.y=solid.y+solid.h;
    body.vy=0;
  }
}

export function covered(player,level) {
  return level.covers.some(cover => Math.abs(player.x+player.w/2-cover.x-cover.w/2)<cover.w/2+7 && Math.abs(player.y+player.h-cover.y-cover.h)<8);
}

export function lineBlocked(a,b,solids) {
  const left=Math.min(a.x+a.w/2,b.x+b.w/2);
  const right=Math.max(a.x+a.w/2,b.x+b.w/2);
  const y=a.y+a.h/2;
  return solids.some(s => s.x>left && s.x+s.w<right && s.y<y && s.y+s.h>y);
}
