// stage_algorithm_4.js — นักแก้บั๊กเส้นทาง (3 ด่านย่อย) — v2 fixed layout
(function(){
document.addEventListener('DOMContentLoaded',function(){
const W=950,H=620,CELL=80;
const DIRS=['right','down','left','up'];
const BTN_Y=580; // ปุ่มอยู่ตำแหน่งคงที่ไม่หลุดเฟรม
const config={type:Phaser.AUTO,scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH,width:W,height:H},parent:"game-container",scene:{preload:preload,create:create}};

const subs=[
{// 4.1 แก้ทิศทาง (3×3 grid)
 title:"แก้ทิศทางที่ผิด",mode:"replace",
 grid:{r:3,c:3},robot:{r:0,c:0,dir:'right'},star:{r:2,c:2},
 cmds:[
  {t:"forward",l:"เดินหน้า"},{t:"forward",l:"เดินหน้า"},
  {t:"left",l:"เลี้ยวซ้าย",bug:true},
  {t:"forward",l:"เดินหน้า"},{t:"forward",l:"เดินหน้า"},
  {t:"collect",l:"เก็บดาว"}
 ],
 options:["forward","left","right","collect"],
 hint:"ลองดูจังหวะที่หุ่นยนต์เปลี่ยนทิศทาง ควรเลี้ยวไปทางไหน?"
},
{// 4.2 แทรกคำสั่ง (1×5 grid, ขาด 2 ก้าว)
 title:"แก้จำนวนก้าวที่ผิด",mode:"insert",
 grid:{r:1,c:5},robot:{r:0,c:0,dir:'right'},star:{r:0,c:4},
 cmds:[
  {t:"forward",l:"เดินหน้า"},{t:"forward",l:"เดินหน้า"},
  {t:"collect",l:"เก็บดาว"}
 ],
 insertOptions:["forward","collect"],
 hint:"หุ่นยนต์ต้องเดิน 4 ช่อง แต่มีคำสั่งเดินแค่ 2 ครั้ง\nลองเพิ่มคำสั่งที่ขาดหายไป"
},
{// 4.3 ย้ายตำแหน่ง (1×4 grid, เก็บของผิดที่)
 title:"แก้ตำแหน่งคำสั่งเก็บของ",mode:"move",
 grid:{r:1,c:4},robot:{r:0,c:0,dir:'right'},item:{r:0,c:3,icon:"📘"},
 cmds:[
  {t:"forward",l:"เดินหน้า"},{t:"collect",l:"เก็บของ"},
  {t:"forward",l:"เดินหน้า"},{t:"forward",l:"เดินหน้า"}
 ],
 correctOrder:["forward","forward","forward","collect"],
 hint:"หุ่นยนต์ต้องเดินถึงของก่อนจึงเก็บได้\nลองเลื่อนคำสั่ง 'เก็บของ' ไปไว้ท้ายสุด"
}
];

const OL={forward:{e:"⬆️",l:"เดินหน้า",c:0x3b82f6},left:{e:"⬅️",l:"เลี้ยวซ้าย",c:0xa855f7},right:{e:"➡️",l:"เลี้ยวขวา",c:0xf97316},collect:{e:"⭐",l:"เก็บดาว/ของ",c:0x22c55e}};
let startTime,totalAttempts=0,curSub=0,isExec=false,pg;
let mapRobotRef=null; // เก็บ ref หุ่นยนต์บนแผนที่

function preload(){this.load.audio("correct","../assets/sound/correct.mp3");this.load.audio("wrong","../assets/sound/wrong.mp3");}
function create(){startTime=Date.now();totalAttempts=0;curSub=0;
this.add.graphics().fillGradientStyle(0xfef2f2,0xfef2f2,0xede9fe,0xede9fe,1).fillRect(0,0,W,H).setDepth(-2);
renderSub(this);}

function renderSub(sc){
if(pg)pg.clear(true,true);pg=sc.add.group();isExec=false;
if(sc._dynGrp){sc._dynGrp.clear(true,true);sc._dynGrp=null;}
const sub=subs[curSub];
txt(sc,W/2,18,`ภารกิจที่ ${curSub+1} จาก ${subs.length}: ${sub.title}`,22,'#991b1b',true);
drawGrid(sc,sub);
if(sub.mode==='replace')renderReplace(sc,sub);
else if(sub.mode==='insert')renderInsert(sc,sub);
else if(sub.mode==='move')renderMove(sc,sub);
// ปุ่มตำแหน่งคงที่
addButtons(sc,sub);
}

function gridBottom(sub){return 50+sub.grid.r*CELL+12;}

function drawGrid(sc,sub){
const g=sub.grid,cols=g.c,rows=g.r;
const ox=(W-cols*CELL)/2+CELL/2,oy=50+CELL/2;
pg.add(sc.add.graphics().fillStyle(0xffffff,0.9).fillRoundedRect((W-cols*CELL)/2-10,50-10,cols*CELL+20,rows*CELL+20,14));
for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
 const cx=ox+c*CELL,cy=oy+r*CELL;
 pg.add(sc.add.graphics().fillStyle(0xf1f5f9,1).fillRoundedRect(cx-35,cy-35,70,70,10).lineStyle(2,0x94a3b8).strokeRoundedRect(cx-35,cy-35,70,70,10));
}
const dirAngle={right:90,down:180,left:270,up:0};
mapRobotRef=sc.add.text(ox+sub.robot.c*CELL,oy+sub.robot.r*CELL,"🤖",{fontSize:'40px'}).setOrigin(0.5).setAngle(dirAngle[sub.robot.dir]||90);
pg.add(mapRobotRef);
if(sub.star)pg.add(sc.add.text(ox+sub.star.c*CELL,oy+sub.star.r*CELL,"🌟",{fontSize:'36px'}).setOrigin(0.5));
if(sub.item)pg.add(sc.add.text(ox+sub.item.c*CELL,oy+sub.item.r*CELL,sub.item.icon,{fontSize:'36px'}).setOrigin(0.5));
}

function addButtons(sc,sub){
btn(sc,W/2-180,BTN_Y,160,44,0xef4444,"🗑️ ล้างการแก้ไข",()=>{if(isExec)return;renderSub(sc);});
btn(sc,W/2,BTN_Y,130,44,0x8b5cf6,"💡 คำใบ้",()=>{if(isExec)return;feedback(sc,"💡 คำใบ้",sub.hint);});
btn(sc,W/2+180,BTN_Y,180,44,0x22c55e,"▶ ทดสอบคำสั่ง",()=>{
 if(isExec)return;
 const cmds=sc._activeCmds||[];
 simulate(sc,sub,cmds,(ok,fail)=>{
  if(ok){feedback(sc,"🎉 แก้บั๊กสำเร็จ!",sub.mode==='replace'?"หุ่นยนต์ทำภารกิจได้แล้ว!":sub.mode==='insert'?"เพิ่มคำสั่งที่ขาดได้ถูกต้อง!":"ย้ายคำสั่งไปตำแหน่งที่ถูกต้องแล้ว!",true);
   sc.time.delayedCall(2200,()=>{hideFB();advance(sc);});}
  else{totalAttempts++;feedback(sc,"ยังไม่ถูก!",fail||"ลองตรวจคำสั่งอีกครั้งนะ");}
 });
});
}

// ===== Simulate =====
function simulate(sc,sub,cmds,cb){
isExec=true;
const g=sub.grid,ox=(W-g.c*CELL)/2+CELL/2,oy=50+CELL/2;
let pos={r:sub.robot.r,c:sub.robot.c,d:sub.robot.dir};
// ซ่อนหุ่นยนต์ตัวเดิม
if(mapRobotRef&&mapRobotRef.active)mapRobotRef.setAlpha(0);
const initAngle={right:90,down:180,left:270,up:0};
const bot=sc.add.text(ox+pos.c*CELL,oy+pos.r*CELL,"🤖",{fontSize:'40px'}).setOrigin(0.5).setAngle(initAngle[pos.d]||90).setDepth(5);
pg.add(bot);
let step=0,ok=false,fail=null;
function nxt(){
 if(step>=cmds.length||fail){done();return;}
 const cmd=cmds[step];
 if(cmd.t==='forward'){
  const nd=mv(pos);
  if(nd.r<0||nd.r>=g.r||nd.c<0||nd.c>=g.c){fail="หุ่นยนต์เดินออกนอกเส้นทาง!";step++;nxt();return;}
  pos=nd;
  sc.tweens.add({targets:bot,x:ox+pos.c*CELL,y:oy+pos.r*CELL,duration:300,ease:'Power1',onComplete:()=>{step++;sc.time.delayedCall(100,nxt);}});
 }else if(cmd.t==='left'){
  pos.d=DIRS[(DIRS.indexOf(pos.d)+3)%4];
  sc.tweens.add({targets:bot,angle:bot.angle-90,duration:250,onComplete:()=>{step++;sc.time.delayedCall(100,nxt);}});
 }else if(cmd.t==='right'){
  pos.d=DIRS[(DIRS.indexOf(pos.d)+1)%4];
  sc.tweens.add({targets:bot,angle:bot.angle+90,duration:250,onComplete:()=>{step++;sc.time.delayedCall(100,nxt);}});
 }else if(cmd.t==='collect'){
  const tgt=sub.star||sub.item;
  if(pos.r===tgt.r&&pos.c===tgt.c){ok=true;sc.tweens.add({targets:bot,scaleX:1.3,scaleY:1.3,duration:200,yoyo:true,onComplete:()=>{step++;sc.time.delayedCall(100,nxt);}});}
  else{fail="ยังไม่ถึงตำแหน่งเป้าหมาย แต่สั่งเก็บแล้ว!";step++;nxt();}
 }
}
function done(){sc.time.delayedCall(400,()=>{bot.destroy();if(mapRobotRef&&mapRobotRef.active)mapRobotRef.setAlpha(1);isExec=false;cb(ok,fail);});}
nxt();
}
function mv(p){const d={right:{r:0,c:1},down:{r:1,c:0},left:{r:0,c:-1},up:{r:-1,c:0}};return{r:p.r+d[p.d].r,c:p.c+d[p.d].c,d:p.d};}

// ===== Replace (4.1) =====
function renderReplace(sc,sub){
const cmds=sub.cmds.map(c=>({...c}));
sc._activeCmds=cmds;
let selIdx=-1;
const gb=gridBottom(sub);
txt(sc,W/2,gb+8,"ชุดคำสั่ง (คลิกคำสั่งที่ผิดเพื่อแก้ไข)",16,'#92400e');
const bY=gb+55,gap=105;
const sx=(W-(cmds.length-1)*gap)/2;
const blocks=[];
cmds.forEach((c,i)=>{
 const b=cBlock(sc,sx+i*gap,bY,c,pg);
 b.bg.on('pointerdown',()=>{
  if(isExec)return;
  selIdx=i;blocks.forEach((bb,j)=>{bb.bg.clear();fB(bb,j===i?0xfde047:gC(cmds[j].t));});
  optVis(true);
 });
 blocks.push(b);
});
const optY=gb+130;
txt(sc,W/2,optY-12,"ตัวเลือกสำหรับแก้ไข:",14,'#64748b');
const optSx=(W-(sub.options.length-1)*105)/2;
const optEls=[];
function optVis(v){optEls.forEach(o=>{o.bg.setVisible(v);o.lt.setVisible(v);o.et.setVisible(v);});}
sub.options.forEach((k,i)=>{
 const o=cBlock(sc,optSx+i*105,optY+30,{t:k,l:OL[k].l},pg);
 o.bg.on('pointerdown',()=>{
  if(isExec||selIdx<0)return;
  cmds[selIdx]={t:k,l:OL[k].l};
  blocks[selIdx].lt.setText(OL[k].l);blocks[selIdx].et.setText(OL[k].e);
  fB(blocks[selIdx],gC(k));
  selIdx=-1;blocks.forEach((bb,j)=>{fB(bb,gC(cmds[j].t));});
  optVis(false);sc._activeCmds=cmds;
 });
 optEls.push(o);
});
optVis(false);
}

// ===== Insert (4.2) =====
function renderInsert(sc,sub){
let cmds=sub.cmds.map(c=>({...c}));
sc._activeCmds=cmds;
const gb=gridBottom(sub);
txt(sc,W/2,gb+8,"ชุดคำสั่ง (กดปุ่ม + เพื่อแทรกคำสั่งที่ขาด)",16,'#92400e');
const bY=gb+55;

function draw(){
 if(sc._dynGrp)sc._dynGrp.clear(true,true);
 sc._dynGrp=sc.add.group();
 if(sc._optGrp)sc._optGrp.clear(true,true);
 const blockW=88, plusW=40, gapB=10, gapP=10;
 const nBlocks=cmds.length;
 const nPlus=Math.max(0,nBlocks-1);
 const totalW=nBlocks*blockW+nPlus*plusW+(nBlocks-1)*gapB+nPlus*gapP;
 let cx=(W-totalW)/2+blockW/2;
 for(let i=0;i<nBlocks;i++){
  cBlock(sc,cx,bY,cmds[i],sc._dynGrp);
  cx+=blockW/2;
  if(i<nBlocks-1){
   cx+=gapB+plusW/2;
   const px=cx;
   const insertIdx=i+1;
   const plus=sc.add.text(px,bY,"+",{fontSize:'30px',color:'#22c55e',fontFamily:'Kanit',fontStyle:'bold',backgroundColor:'#dcfce7',padding:{x:10,y:2}}).setOrigin(0.5).setInteractive({useHandCursor:true});
   plus.on('pointerdown',()=>{
    if(isExec)return;
    showInsertOptions(sc,sub,cmds,insertIdx,gb,draw);
   });
   sc._dynGrp.add(plus);
   cx+=plusW/2+gapP+blockW/2;
  }
 }
 sc._activeCmds=cmds;
}
draw();
// Store draw function for re-use
sc._insDrawFn=draw;
sc._insCmds=cmds;
}

function showInsertOptions(sc,sub,cmds,insertIdx,gb,drawFn){
 if(sc._optGrp)sc._optGrp.clear(true,true);
 sc._optGrp=sc.add.group();
 const optY=gb+130;
 const keys=sub.insertOptions;
 const osx=(W-(keys.length-1)*120)/2;
 const label=sc.add.text(W/2,optY-15,"เลือกคำสั่งที่จะแทรก:",{fontSize:'16px',color:'#64748b',fontFamily:'Kanit'}).setOrigin(0.5);
 sc._optGrp.add(label);
 keys.forEach((k,i)=>{
  const o=cBlock(sc,osx+i*120,optY+30,{t:k,l:OL[k].l},sc._optGrp);
  o.bg.on('pointerdown',()=>{
   if(isExec)return;
   cmds.splice(insertIdx,0,{t:k,l:OL[k].l});
   sc._activeCmds=cmds;
   if(sc._optGrp)sc._optGrp.clear(true,true);
   drawFn();
  });
 });
}

// ===== Move (4.3) =====
function renderMove(sc,sub){
let cmds=sub.cmds.map(c=>({...c}));
sc._activeCmds=cmds;
let selIdx=-1;
const gb=gridBottom(sub);
txt(sc,W/2,gb+8,"ชุดคำสั่ง (เลือกคำสั่งแล้วกดลูกศรเพื่อย้าย)",16,'#92400e');
const bY=gb+60;

function draw(){
 if(sc._dynGrp)sc._dynGrp.clear(true,true);
 sc._dynGrp=sc.add.group();
 const gap=110,sx=(W-(cmds.length-1)*gap)/2;
 cmds.forEach((c,i)=>{
  const bx=sx+i*gap;
  const b=cBlock(sc,bx,bY,c,sc._dynGrp);
  const hi=i===selIdx?0xfde047:gC(c.t);
  b.bg.clear();fBAt(b.bg,bx,bY,88,62,hi);
  b.bg.on('pointerdown',()=>{if(isExec)return;selIdx=i;draw();});
 });
 // ปุ่มลูกศร — ใต้ชุดคำสั่ง
 if(selIdx>=0){
  const arY=bY+55;
  if(selIdx>0){
   const lb=sc.add.text(W/2-60,arY,"⬅️ เลื่อนซ้าย",{fontSize:'18px',color:'#3b82f6',fontFamily:'Kanit',fontStyle:'bold',backgroundColor:'#dbeafe',padding:{x:10,y:4}}).setOrigin(0.5).setInteractive({useHandCursor:true});
   lb.on('pointerdown',()=>{if(isExec)return;[cmds[selIdx-1],cmds[selIdx]]=[cmds[selIdx],cmds[selIdx-1]];selIdx--;sc._activeCmds=cmds;draw();});
   sc._dynGrp.add(lb);
  }
  if(selIdx<cmds.length-1){
   const rb=sc.add.text(W/2+60,arY,"เลื่อนขวา ➡️",{fontSize:'18px',color:'#f97316',fontFamily:'Kanit',fontStyle:'bold',backgroundColor:'#ffedd5',padding:{x:10,y:4}}).setOrigin(0.5).setInteractive({useHandCursor:true});
   rb.on('pointerdown',()=>{if(isExec)return;[cmds[selIdx+1],cmds[selIdx]]=[cmds[selIdx],cmds[selIdx+1]];selIdx++;sc._activeCmds=cmds;draw();});
   sc._dynGrp.add(rb);
  }
 }
}
draw();
}

function advance(sc){curSub++;if(curSub<subs.length)renderSub(sc);else onComplete(sc);}

// ===== Helpers =====
function gC(t){return(OL[t]||{c:0x64748b}).c;}
function cBlock(sc,x,y,c,grp){
 const w=88,h=62,col=gC(c.t);
 const bg=sc.add.graphics();fBAt(bg,x,y,w,h,col);
 bg.setInteractive(new Phaser.Geom.Rectangle(x-w/2,y-h/2,w,h),Phaser.Geom.Rectangle.Contains);
 bg.on('pointerover',()=>bg.setAlpha(0.85));bg.on('pointerout',()=>bg.setAlpha(1));
 const et=sc.add.text(x,y-16,(OL[c.t]||{e:'❓'}).e,{fontSize:'22px'}).setOrigin(0.5);
 const lt=sc.add.text(x,y+16,c.l,{fontSize:'13px',color:'#fff',fontFamily:'Kanit',fontStyle:'bold'}).setOrigin(0.5);
 grp.add(bg);grp.add(et);grp.add(lt);
 return{bg,lt,et,x,y,w,h};
}
function fBAt(bg,x,y,w,h,col){bg.fillStyle(col,1).fillRoundedRect(x-w/2,y-h/2,w,h,12).lineStyle(2,0xffffff,0.4).strokeRoundedRect(x-w/2,y-h/2,w,h,12);}
function fB(b,col){b.bg.clear();fBAt(b.bg,b.x,b.y,b.w,b.h,col);}
function txt(sc,x,y,t,sz,col,bold){const o=sc.add.text(x,y,t,{fontSize:sz+'px',color:col||'#333',fontFamily:'Kanit',fontStyle:bold?'bold':'normal'}).setOrigin(0.5);pg.add(o);return o;}
function btn(sc,x,y,w,h,col,label,cb){
 const g=sc.add.graphics().fillStyle(col,1).fillRoundedRect(x-w/2,y-h/2,w,h,12);
 g.setInteractive(new Phaser.Geom.Rectangle(x-w/2,y-h/2,w,h),Phaser.Geom.Rectangle.Contains);
 g.on('pointerdown',cb).on('pointerover',()=>g.setAlpha(0.85)).on('pointerout',()=>g.setAlpha(1));
 pg.add(g);pg.add(sc.add.text(x,y,label,{fontSize:'18px',color:'#fff',fontFamily:'Kanit',fontStyle:'bold'}).setOrigin(0.5));
}
function feedback(sc,title,msg,ok){
 const el=document.getElementById('feedback-popup');if(!el)return;
 el.innerHTML=`<h3 style="color:${ok?'#15803d':'#b45309'};font-weight:bold;margin:0 0 8px">${title}</h3><p style="font-size:1.1rem;color:#333;white-space:pre-line;margin:0 0 12px">${msg}</p><button class="btn ${ok?'btn-success':'btn-warning'}" onclick="document.getElementById('feedback-popup').style.display='none'">${ok?'👍 ไปต่อ':'🔄 ลองใหม่'}</button>`;
 el.style.display='block';
 if(!ok){sc.sound.play('wrong');sc.cameras.main.shake(120,0.004);}else sc.sound.play('correct');
}
function hideFB(){const el=document.getElementById('feedback-popup');if(el)el.style.display='none';}

function onComplete(sc){
 const dur=Math.floor((Date.now()-startTime)/1000);
 let stars=1;if(totalAttempts<=1)stars=3;else if(totalAttempts<=3)stars=2;
 if(pg)pg.clear(true,true);
 if(sc._dynGrp)sc._dynGrp.clear(true,true);
 const c=sc.add.container(W/2,H/2).setDepth(10).setAlpha(0).setScale(0.7);
 c.add(sc.add.rectangle(0,0,W,H,0x000000,0.7).setInteractive());
 c.add(sc.add.text(0,-70,"🎉 ภารกิจสำเร็จ! 🎉",{fontSize:'44px',color:'#fde047',fontFamily:'Kanit'}).setOrigin(0.5));
 c.add(sc.add.text(0,-15,"แก้บั๊กได้ครบทุกภารกิจแล้ว!",{fontSize:'22px',color:'#a7f3d0',fontFamily:'Kanit'}).setOrigin(0.5));
 c.add(sc.add.text(0,30,`ได้รับ ${"⭐".repeat(stars)} (${stars} ดาว)`,{fontSize:'32px',color:'#fff',fontFamily:'Kanit'}).setOrigin(0.5));
 c.add(sc.add.text(0,70,`เวลา ${dur} วินาที | ผิด ${totalAttempts} ครั้ง`,{fontSize:'20px',color:'#e2e8f0',fontFamily:'Kanit'}).setOrigin(0.5));
 sc.tweens.add({targets:c,alpha:1,scale:1,duration:500,ease:'Power2.easeOut',onComplete:()=>{
  if(window.sendResult)window.sendResult(STAGE_ID,stars,dur,totalAttempts);
  setTimeout(()=>{if(window.triggerAutoNextStage)window.triggerAutoNextStage();},3000);
 }});
}

new Phaser.Game(config);
});
})();
