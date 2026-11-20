import {Input} from './input.js';
import {AudioController} from './audio.js';
import {Renderer} from './renderer.js';
import {UI} from './ui.js';
import {Game} from './game.js';

const canvas=document.querySelector('#game');
const input=new Input();
const ui=new UI();
const game=new Game({input,audio:new AudioController(),renderer:new Renderer(canvas),ui});
ui.game=game;ui.show('menu');
let previous=performance.now();
function frame(now){const dt=(now-previous)/1000;previous=now;game.frame(dt);requestAnimationFrame(frame);}
requestAnimationFrame(frame);
window.addEventListener('blur',()=>game.pause());
document.addEventListener('visibilitychange',()=>{if(document.hidden){input.clear();game.pause();}previous=performance.now();});
