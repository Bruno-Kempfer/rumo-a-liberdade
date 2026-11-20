const item=(id,kind,x,y=124,extra={})=>({id,kind,x,y,w:16,h:20,done:false,...extra});
const platform=(x,y,w=48)=>({x,y,w,h:8,kind:'platform',dx:0,dy:0});

export const HISTORY = [
  {title:'Memória · O tráfico transatlântico',text:'Durante séculos, pessoas africanas foram capturadas, escravizadas e levadas à força através do Atlântico. Eram pessoas com histórias, conhecimentos, famílias e culturas diversas. Este contexto é histórico; Malik e sua viagem são ficcionais.',source:'ONU — Memória das vítimas da escravidão e do tráfico transatlântico.'},
  {title:'Memória · Resistência coletiva',text:'A resistência à escravidão assumiu muitas formas: fugas, revoltas, organização coletiva e criação de comunidades como os quilombos. Pessoas escravizadas foram protagonistas da luta por sua liberdade.',source:'Fundação Cultural Palmares — Dia da Consciência Negra; ONU — resistência e memória.'},
  {title:'Memória · Culturas vivas',text:'A África reúne muitos povos, línguas e culturas. Pessoas africanas e seus descendentes preservaram e recriaram saberes nas Américas. As culturas afro-brasileiras fazem parte da formação do Brasil.',source:'Fundação Cultural Palmares — memória, cultura e resistência.'},
  {title:'Memória · 20 de novembro',text:'O Dia da Consciência Negra é celebrado em 20 de novembro, data que recorda Zumbi dos Palmares. É um convite a reconhecer a resistência negra, valorizar suas culturas e enfrentar o racismo no presente.',source:'Fundação Cultural Palmares — Dia da Consciência Negra.'}
];

export const STORIES = [
  {title:'O Despertar',kicker:'CAPÍTULO I · PORÃO',text:'Malik foi capturado e levado à força para este navio. No porão, ele encontra pessoas que também desejam retomar a própria liberdade. Uma chave pode abrir a primeira porta. O caminho será construído em conjunto.',quote:'Mesmo diante da opressão, a esperança de liberdade permaneceu viva.'},
  {title:'A Resistência',kicker:'CAPÍTULO II · CONVÉS',text:'O primeiro grupo alcançou o convés. Há mais pessoas para libertar. Juntos, poderão soltar o bloqueio, preparar uma distração e assumir o comando do navio. Nenhuma conquista será de uma pessoa só.',quote:'A resistência foi construída pela coragem e união de muitas pessoas.'},
  {title:'O Caminho de Volta',kicker:'CAPÍTULO III · TRAVESSIA',text:'O navio agora está sob o controle das pessoas libertadas. Malik e seus companheiros compartilham tarefas: reunir ferramentas, reparar o casco e ajustar as velas. Uma tempestade se aproxima. O cuidado com o grupo é parte da travessia.',quote:'A liberdade é um direito, nunca um privilégio.'}
];

export function createLevel(index){
  const width=1200;
  const tiles=Array.from({length:11},(_,y)=>Array.from({length:width/16},()=>y>=9?1:0));
  const level={index,width,tiles,objects:[],enemies:[],covers:[],platforms:[],hazards:[],flags:{},time:0,spawn:{x:32,y:124},name:STORIES[index].title};
  const crates=(x,rows=1)=>{for(let y=9-rows;y<9;y++)tiles[y][x/16]=2;};
  if(index===0){
    crates(176);crates(256,2);crates(352);crates(848);crates(928,2);
    level.platforms=[platform(216,112,32),platform(280,96,48),platform(896,112,32)];
    level.covers=[{x:528,y:124,w:18,h:20},{x:1040,y:124,w:18,h:20}];
    level.objects=[
      item('tutorial','sign',64,124,{text:'A/D ou setas: mover. Espaço/W/↑: pular. J: afastar guardas. E: interagir. Procure os símbolos dourados.'}),
      item('memory-0','info',128,124,{history:0}),
      item('key','key',296,76,{label:'Pegar a chave'}),
      item('amina','person',448,124,{name:'Amina',skin:'#94502f',shirt:'#d6a44c',hair:1,label:'Libertar Amina'}),
      item('joao','person',624,124,{name:'João',skin:'#59392c',shirt:'#649d9a',hair:0,label:'Libertar João'}),
      item('door','gate',704,80,{w:8,h:64,label:'Abrir passagem',needs:'companions'}),
      item('memory-1','info',784,124,{history:1}),
      item('hold-exit','exit',1136,112,{w:22,h:32,label:'Subir ao convés'})
    ];
    level.enemies=[{id:'guard-1',type:'common',x:560,left:504,right:664},{id:'guard-2',type:'common',x:1000,left:976,right:1096}];
  } else if(index===1){
    crates(192);crates(272,2);crates(576);crates(784);
    level.platforms=[platform(224,112,32),platform(304,88,64),{...platform(600,104,48),baseX:600,range:48,speed:.9,moving:true},platform(824,112,48)];
    level.covers=[{x:120,y:124,w:18,h:20},{x:392,y:124,w:18,h:20},{x:664,y:124,w:18,h:20}];
    level.objects=[
      item('deck-sign','sign',48,124,{text:'Os barris escondem sua presença dos guardas à distância. Aproxime-se com cuidado. J afasta os guardas sem violência gráfica.'}),
      item('memory-2','info',320,68,{history:2}),
      item('bia','person',448,124,{name:'Bia',skin:'#6e4030',shirt:'#b36550',hair:2,label:'Libertar Bia'}),
      item('winch','winch',688,124,{label:'Mover o guincho em conjunto'}),
      item('deck-gate','gate',736,80,{w:8,h:64,needs:'winch',label:'Bloqueio do convés'}),
      item('tomas','person',832,92,{name:'Tomás',skin:'#b87547',shirt:'#8180ac',hair:1,label:'Libertar Tomás'}),
      item('rally','rally',896,124,{label:'Coordenar a distração'}),
      item('command','exit',1144,112,{w:24,h:32,label:'Assumir o comando'})
    ];
    level.enemies=[{id:'guard-3',type:'common',x:336,left:304,right:416},{id:'guard-4',type:'advanced',x:524,left:488,right:680},{id:'captain',type:'captain',x:1040,left:976,right:1104}];
    level.hazards=[{x:584,y:90,w:12,h:16,baseX:584,range:28,kind:'cargo'}];
  } else {
    crates(128);crates(288);crates(512);crates(560,2);crates(608,3);crates(880);
    level.platforms=[platform(160,112,64),platform(640,88,48),{...platform(992,112,48),baseX:992,range:40,speed:.8,moving:true}];
    level.covers=[{x:336,y:124,w:18,h:20},{x:816,y:124,w:18,h:20}];
    level.objects=[
      item('storm-sign','sign',64,124,{text:'Reúna ferramentas e cuide do navio. Pule pelas caixas para alcançar as velas. Ao abrigo, os companheiros ficam protegidos. Evite a carga suspensa.'}),
      item('tools','tools',184,92,{label:'Recolher ferramentas'}),
      item('repair-a','repair',384,124,{label:'Reparar o casco'}),
      item('sail','sail',648,68,{label:'Ajustar as velas em conjunto'}),
      item('shelter','shelter',776,124,{w:28,label:'Proteger os companheiros no abrigo'}),
      item('memory-3','info',848,124,{history:3}),
      item('repair-b','repair',944,124,{label:'Reforçar o leme'}),
      item('arrival','exit',1136,112,{w:24,h:32,label:'Traçar o caminho de volta'})
    ];
    level.hazards=[{x:432,y:116,w:14,h:24,baseX:432,range:38,kind:'cargo'},{x:896,y:113,w:14,h:24,baseX:896,range:32,kind:'cargo'}];
  }
  return level;
}

export function objectiveFor(game){
  const {level,party}=game;
  if(level.index===0){
    if(!level.flags.key)return 'Encontre a chave nas plataformas do porão.';
    if(party.length<2)return `Liberte Amina e João com E (${party.length}/2).`;
    if(!level.flags.door)return 'Abra a porta de correntes com o grupo.';
    return 'Alcance a escada para o convés.';
  }
  if(level.index===1){
    if(party.length<3)return 'Liberte Bia e reúna três companheiros.';
    if(!level.flags.winch)return 'Com o grupo, mova o guincho e abra o bloqueio.';
    if(party.length<4)return 'Liberte Tomás na plataforma elevada.';
    if(!level.flags.rally)return 'Reúna o grupo junto ao sino para a distração.';
    const captain=level.enemies.find(e=>e.type==='captain');
    if(!captain.defeated)return 'Aguarde o capitão se cansar; aproxime-se e use J.';
    return 'O comando está livre. Reúna o grupo na cabine.';
  }
  if(!level.flags.tools)return 'Recolha as ferramentas na plataforma.';
  if(!level.flags['repair-a'])return 'Use as ferramentas para reparar o casco.';
  if(!level.flags.sail)return 'Suba pelas caixas e ajuste as velas com o grupo.';
  if(!level.flags.shelter)return 'Leve os companheiros ao abrigo.';
  if(!level.flags['repair-b'])return 'Reforce o leme à frente; cuidado com a carga.';
  return 'O navio está pronto. Vá ao leme para concluir a travessia.';
}
