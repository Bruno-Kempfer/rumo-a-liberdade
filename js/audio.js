export class AudioController {
  constructor(){this.enabled=false;this.context=null;}
  toggle(){
    this.enabled=!this.enabled;
    if(this.enabled) this.unlock();
    return this.enabled;
  }
  unlock(){
    try {
      const Context=globalThis.AudioContext||globalThis.webkitAudioContext;
      if(!Context){this.enabled=false;return;}
      this.context??=new Context();
      this.context.resume().catch(()=>{this.enabled=false;});
    }catch{this.enabled=false;}
  }
  play(kind){
    if(!this.enabled || !this.context || this.context.state!=='running')return;
    const tones={attack:[220,110,.07],rescue:[440,880,.25],hurt:[100,60,.18],interact:[330,494,.14],win:[523,1046,.6]};
    const [start,end,length]=tones[kind]||tones.interact;
    try {
      const oscillator=this.context.createOscillator();const gain=this.context.createGain();const now=this.context.currentTime;
      oscillator.type='triangle';oscillator.frequency.setValueAtTime(start,now);oscillator.frequency.exponentialRampToValueAtTime(end,now+length);
      gain.gain.setValueAtTime(.06,now);gain.gain.exponentialRampToValueAtTime(.001,now+length);
      oscillator.connect(gain);gain.connect(this.context.destination);oscillator.start();oscillator.stop(now+length);
    }catch{this.enabled=false;}
  }
}
