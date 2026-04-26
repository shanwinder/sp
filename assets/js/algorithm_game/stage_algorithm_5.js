// stage_algorithm_5.js — ภารกิจเขาวงกตอัลกอริทึม (4 ด่านย่อย) v3
(function(){
document.addEventListener('DOMContentLoaded',function(){
const W=950,H=620,CELL=80;
const DIRS=['right','down','left','up'];
const DA={right:90,down:180,left:270,up:0};
const config={type:Phaser.AUTO,scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH,width:W,height:H},parent:"game-container",scene:{preload,create}};

const CMD_TYPES=[
 {t:'forward',l:'เดินหน้า',e:'⬆️',c:0x3b82f6},
 {t:'left',l:'เลี้ยวซ้าย',e:'⬅️',c:0xa855f7},
 {t:'right',l:'เลี้ยวขวา',e:'➡️',c:0xf97316},
 {t:'collect',l:'เก็บของ',e:'⭐',c:0x22c55e},
 {t:'stop',l:'หยุด',e:'🛑',c:0xef4444}
];
const CL={};CMD_TYPES.forEach(c=>{CL[c.t]=c;});

const subs=[
{title:"เส้นทางง่าย",mission:"พาหุ่นยนต์ไปถึงธง 🏁",
 rows:2,cols:3,robot:{r:0,c:0,d:'right'},
 goal:{r:1,c:2,icon:'🏁'},obs:[],items:[],maxCmd:6,
 hint:"ลองดูว่าต้องเลี้ยวตรงจุดไหนเพื่อลงไปแถวล่าง"},
{title:"หลบสิ่งกีดขวาง",mission:"ไปถึงธง 🏁 โดยไม่ชนหิน",
 rows:3,cols:4,robot:{r:0,c:0,d:'right'},
 goal:{r:2,c:3,icon:'🏁'},
 obs:[{r:0,c:2},{r:2,c:0},{r:2,c:2}],items:[],maxCmd:10,
 hint:"ลองเดินลงแถวกลางก่อน แล้วค่อยเลี้ยวไปทางขวา"},
{title:"เก็บกุญแจก่อนถึงเป้าหมาย",mission:"เก็บ 🔑 ก่อน แล้วจึงไปถึงธง 🏁",
 rows:3,cols:4,robot:{r:0,c:0,d:'right'},
 goal:{r:2,c:3,icon:'🏁'},
 obs:[{r:1,c:1}],
 items:[{id:'key',r:0,c:2,icon:'🔑',name:'กุญแจ'}],maxCmd:12,
 hint:"เก็บกุญแจก่อน แล้วค่อยหาทางลงไปที่ธง"},
{title:"ภารกิจสุดท้าย จำกัดคำสั่ง",mission:"เก็บ 🌟 แล้วไปถึง 🏁 (ไม่เกิน 10 คำสั่ง)",
 rows:3,cols:4,robot:{r:0,c:0,d:'right'},
 goal:{r:2,c:3,icon:'🏁'},
 obs:[{r:1,c:0},{r:1,c:1}],
 items:[{id:'star',r:0,c:3,icon:'🌟',name:'ดาว'}],maxCmd:10,
 hint:"ไปเก็บดาวมุมขวาบนก่อน แล้วหาทางลงไปที่ธง\nคำสั่งเลี้ยวไม่นับเป็นการเดิน"}
];

let startTime,totalAttempts=0,curSub=0,isExec=false,pg;
let cmdQueue=[],mapRobotRef=null;

function preload(){this.load.audio("correct","../assets/sound/correct.mp3");this.load.audio("wrong","../assets/sound/wrong.mp3");}
function create(){startTime=Date.now();totalAttempts=0;curSub=0;
this.add.graphics().fillGradientStyle(0xecfdf5,0xecfdf5,0xede9fe,0xede9fe,1).fillRect(0,0,W,H).setDepth(-2);
renderSub(this);}

// ===== Layout: คำนวณ Y จากบนลงล่าง ไม่ทับกันเด็ดขาด =====
function calcLayout(sub){
 const L={};
 L.titleY=14;                          // หัวข้อ
 L.missionY=38;                        // ภารกิจ
 L.gridTop=56;                         // ขอบบน grid (ห่างจาก mission)
 L.gridH=sub.rows*CELL;
 L.gridBot=L.gridTop+L.gridH;          // ขอบล่าง grid
 // คำนวณพื้นที่เหลือระหว่าง gridBot กับ btnY
 const btnY=582;
 const avail=btnY-24-L.gridBot;        // พื้นที่ว่าง (ลบ padding ปุ่ม)
 // จัดสัดส่วน: status(20) + palette(70) + queue(70) = 160 → เหลือ gap
 L.statusY=L.gridBot+12;
 L.palLabelY=L.statusY+22;
 L.palBlockY=L.palLabelY+34;
 L.qLabelY=L.palBlockY+38;
 L.qBlockY=L.qLabelY+30;
 L.btnY=btnY;
 return L;
}

function renderSub(sc){
if(pg)pg.clear(true,true);pg=sc.add.group();
if(sc._qGrp)sc._qGrp.clear(true,true);
isExec=false;cmdQueue=[];
const sub=subs[curSub];
const L=calcLayout(sub);
sc._L=L;

// Title + Mission
addT(sc,W/2,L.titleY,`ภารกิจที่ ${curSub+1}/${subs.length}: ${sub.title}`,20,'#15803d',true);
addT(sc,W/2,L.missionY,sub.mission,16,'#92400e');

// Grid
drawGrid(sc,sub,L);

// Status
addT(sc,W/2,L.statusY,`คำสั่งสูงสุด: ${sub.maxCmd} | ใช้: 0/${sub.maxCmd}`,16,'#64748b');
sc._statusY=L.statusY;

// Palette
addT(sc,W/2,L.palLabelY,"คลิกบล็อกเพื่อเพิ่มคำสั่ง:",15,'#475569');
const pGap=150,pSx=(W-(CMD_TYPES.length-1)*pGap)/2;
CMD_TYPES.forEach((ct,i)=>{
 const bx=pSx+i*pGap;
 const bg=sc.add.graphics();
 fBA(bg,bx,L.palBlockY,130,54,ct.c);
 bg.setInteractive(new Phaser.Geom.Rectangle(bx-65,L.palBlockY-27,130,54),Phaser.Geom.Rectangle.Contains);
 bg.on('pointerdown',()=>{
  if(isExec)return;
  if(cmdQueue.length>=sub.maxCmd){fb(sc,"⚠️ คำสั่งเต็ม!","ใช้คำสั่งครบ "+sub.maxCmd+" แล้ว\nลบคำสั่งก่อนเพิ่มใหม่");return;}
  cmdQueue.push({t:ct.t,l:ct.l});drawQueue(sc,sub);
 });
 bg.on('pointerover',()=>bg.setAlpha(0.8));bg.on('pointerout',()=>bg.setAlpha(1));
 pg.add(bg);
 pg.add(sc.add.text(bx,L.palBlockY-11,ct.e,{fontSize:'24px'}).setOrigin(0.5));
 pg.add(sc.add.text(bx,L.palBlockY+15,ct.l,{fontSize:'14px',color:'#fff',fontFamily:'Kanit',fontStyle:'bold'}).setOrigin(0.5));
});

// Queue label
addT(sc,W/2,L.qLabelY,"ชุดคำสั่งของฉัน (คลิกเพื่อลบ):",15,'#475569');
drawQueue(sc,sub);

// Buttons — กระจายห่างกัน
btn(sc,W/2-290,L.btnY,160,46,0xef4444,"🗑️ ล้างทั้งหมด",()=>{if(isExec)return;cmdQueue=[];drawQueue(sc,sub);});
btn(sc,W/2-100,L.btnY,160,46,0xfbbf24,"↩️ ลบคำสั่งท้าย",()=>{if(isExec)return;cmdQueue.pop();drawQueue(sc,sub);});
btn(sc,W/2+90,L.btnY,120,46,0x8b5cf6,"💡 คำใบ้",()=>{if(isExec)return;fb(sc,"💡 คำใบ้",sub.hint);});
btn(sc,W/2+260,L.btnY,185,46,0x22c55e,"▶ ทดสอบคำสั่ง",()=>{
 if(isExec||cmdQueue.length===0)return;runSim(sc,sub);
});
}

// ===== Grid =====
function drawGrid(sc,sub,L){
const CS=CELL-8;
const ox=(W-sub.cols*CELL)/2+CELL/2, oy=L.gridTop+CELL/2;
pg.add(sc.add.graphics().fillStyle(0xffffff,0.92).fillRoundedRect((W-sub.cols*CELL)/2-10,L.gridTop-10,sub.cols*CELL+20,sub.rows*CELL+20,14));
for(let r=0;r<sub.rows;r++)for(let c=0;c<sub.cols;c++){
 const cx=ox+c*CELL,cy=oy+r*CELL;
 const isObs=sub.obs.some(o=>o.r===r&&o.c===c);
 pg.add(sc.add.graphics().fillStyle(isObs?0xfecaca:0xf1f5f9,1).fillRoundedRect(cx-CS/2,cy-CS/2,CS,CS,10).lineStyle(2,isObs?0xfca5a5:0x94a3b8).strokeRoundedRect(cx-CS/2,cy-CS/2,CS,CS,10));
 if(isObs)pg.add(sc.add.text(cx,cy,"🪨",{fontSize:'38px'}).setOrigin(0.5));
}
sub.items.forEach(it=>{pg.add(sc.add.text(ox+it.c*CELL,oy+it.r*CELL,it.icon,{fontSize:'38px'}).setOrigin(0.5));});
pg.add(sc.add.text(ox+sub.goal.c*CELL,oy+sub.goal.r*CELL,sub.goal.icon,{fontSize:'38px'}).setOrigin(0.5));
mapRobotRef=sc.add.text(ox+sub.robot.c*CELL,oy+sub.robot.r*CELL,"🤖",{fontSize:'42px'}).setOrigin(0.5).setAngle(DA[sub.robot.d]||90);
pg.add(mapRobotRef);
}

// ===== Queue =====
function drawQueue(sc,sub){
if(sc._qGrp)sc._qGrp.clear(true,true);
sc._qGrp=sc.add.group();
const L=sc._L;
const qY=L.qBlockY;
const n=cmdQueue.length;
if(n===0){
 sc._qGrp.add(sc.add.text(W/2,qY,"[ ยังไม่มีคำสั่ง — คลิกบล็อกด้านบน ]",{fontSize:'16px',color:'#94a3b8',fontFamily:'Kanit'}).setOrigin(0.5));
}else{
 const maxW=910,bh=48;
 const bw=Math.min(100,Math.floor((maxW-(n-1)*4)/n));
 const gap=4,totalW=n*(bw+gap)-gap;
 const sx=(W-totalW)/2+bw/2;
 for(let i=0;i<n;i++){
  const ct=CL[cmdQueue[i].t];
  const bx=sx+i*(bw+gap);
  const bg=sc.add.graphics();
  fBA(bg,bx,qY,bw,bh,ct?ct.c:0x64748b);
  bg.setInteractive(new Phaser.Geom.Rectangle(bx-bw/2,qY-bh/2,bw,bh),Phaser.Geom.Rectangle.Contains);
  const idx=i;
  bg.on('pointerdown',()=>{if(isExec)return;cmdQueue.splice(idx,1);drawQueue(sc,sub);});
  bg.on('pointerover',()=>bg.setAlpha(0.8));bg.on('pointerout',()=>bg.setAlpha(1));
  sc._qGrp.add(bg);
  sc._qGrp.add(sc.add.text(bx,qY-8,ct?ct.e:'❓',{fontSize:'20px'}).setOrigin(0.5));
  if(bw>=55) sc._qGrp.add(sc.add.text(bx,qY+14,cmdQueue[i].l,{fontSize:'11px',color:'#fff',fontFamily:'Kanit',fontStyle:'bold'}).setOrigin(0.5));
 }
}
if(sc._statusTxt)sc._statusTxt.destroy();
sc._statusTxt=sc.add.text(W/2,sc._statusY,`คำสั่งสูงสุด: ${sub.maxCmd} | ใช้: ${cmdQueue.length}/${sub.maxCmd}`,{fontSize:'16px',color:cmdQueue.length>sub.maxCmd?'#dc2626':'#64748b',fontFamily:'Kanit',fontStyle:'bold'}).setOrigin(0.5);
pg.add(sc._statusTxt);
}

// ===== Simulation =====
function runSim(sc,sub){
isExec=true;
const L=sc._L;
const ox=(W-sub.cols*CELL)/2+CELL/2,oy=L.gridTop+CELL/2;
let pos={r:sub.robot.r,c:sub.robot.c,d:sub.robot.d};
const collected=new Set();
if(mapRobotRef&&mapRobotRef.active)mapRobotRef.setAlpha(0);
const bot=sc.add.text(ox+pos.c*CELL,oy+pos.r*CELL,"🤖",{fontSize:'42px'}).setOrigin(0.5).setAngle(DA[pos.d]||90).setDepth(5);
pg.add(bot);
let step=0,fail=null,goalReached=false;

function nxt(){
 if(step>=cmdQueue.length||fail){done();return;}
 const cmd=cmdQueue[step];
 if(cmd.t==='forward'){
  const nd=mv(pos);
  if(nd.r<0||nd.r>=sub.rows||nd.c<0||nd.c>=sub.cols){fail="หุ่นยนต์เดินออกนอกเส้นทาง!\nลองตรวจจำนวนก้าวหรือจังหวะเลี้ยว";step++;nxt();return;}
  if(sub.obs.some(o=>o.r===nd.r&&o.c===nd.c)){fail="หุ่นยนต์ชนสิ่งกีดขวาง! 🪨\nลองวางเส้นทางอ้อมไปอีกทาง";step++;nxt();return;}
  pos=nd;
  sc.tweens.add({targets:bot,x:ox+pos.c*CELL,y:oy+pos.r*CELL,duration:280,ease:'Power1',onComplete:()=>{step++;sc.time.delayedCall(80,nxt);}});
 }else if(cmd.t==='left'){
  pos.d=DIRS[(DIRS.indexOf(pos.d)+3)%4];
  sc.tweens.add({targets:bot,angle:bot.angle-90,duration:220,onComplete:()=>{step++;sc.time.delayedCall(80,nxt);}});
 }else if(cmd.t==='right'){
  pos.d=DIRS[(DIRS.indexOf(pos.d)+1)%4];
  sc.tweens.add({targets:bot,angle:bot.angle+90,duration:220,onComplete:()=>{step++;sc.time.delayedCall(80,nxt);}});
 }else if(cmd.t==='collect'){
  const it=sub.items.find(x=>x.r===pos.r&&x.c===pos.c&&!collected.has(x.id));
  if(!it){fail="ตรงนี้ไม่มีของให้เก็บ!\nต้องเดินไปให้ถึงของก่อนจึงเก็บได้";step++;nxt();return;}
  collected.add(it.id);
  sc.tweens.add({targets:bot,scaleX:1.3,scaleY:1.3,duration:180,yoyo:true,onComplete:()=>{step++;sc.time.delayedCall(80,nxt);}});
 }else if(cmd.t==='stop'){
  if(pos.r===sub.goal.r&&pos.c===sub.goal.c){goalReached=true;}
  else{fail="ยังไม่ถึงเป้าหมาย แต่สั่งหยุดแล้ว!\nต้องเดินไปถึงธงก่อนจึงหยุดได้";}
  step++;sc.time.delayedCall(200,nxt);
 }
}
function done(){
 sc.time.delayedCall(400,()=>{
  bot.destroy();
  if(mapRobotRef&&mapRobotRef.active)mapRobotRef.setAlpha(1);
  isExec=false;
  if(fail){totalAttempts++;fb(sc,"ยังไม่สำเร็จ!",fail);return;}
  const allCollected=sub.items.every(it=>collected.has(it.id));
  if(!allCollected){
   const missing=sub.items.filter(it=>!collected.has(it.id)).map(it=>it.icon+" "+it.name).join(', ');
   totalAttempts++;fb(sc,"ยังทำภารกิจไม่ครบ!","ยังไม่ได้เก็บ: "+missing+"\nต้องเก็บของให้ครบก่อนไปถึงธง");return;
  }
  if(!goalReached){
   totalAttempts++;fb(sc,"ยังไม่ถึงเป้าหมาย!","ต้องพาหุ่นยนต์ไปถึงธง 🏁\nแล้วใช้คำสั่ง 'หยุด'");return;
  }
  if(cmdQueue.length>sub.maxCmd){
   fb(sc,"ผ่านแล้ว แต่..","ใช้คำสั่ง "+cmdQueue.length+" คำสั่ง (เกิน "+sub.maxCmd+")\nลองตัดคำสั่งที่ไม่จำเป็นออก",true);
   sc.time.delayedCall(2500,()=>{hideFB();advance(sc);});return;
  }
  fb(sc,"🎉 สุดยอด!","วางแผนอัลกอริทึมสำเร็จ!\nใช้ "+cmdQueue.length+"/"+sub.maxCmd+" คำสั่ง",true);
  sc.time.delayedCall(2200,()=>{hideFB();advance(sc);});
 });
}
nxt();
}
function mv(p){const d={right:{r:0,c:1},down:{r:1,c:0},left:{r:0,c:-1},up:{r:-1,c:0}};return{r:p.r+d[p.d].r,c:p.c+d[p.d].c,d:p.d};}

function advance(sc){curSub++;if(curSub<subs.length)renderSub(sc);else onComplete(sc);}

// ===== Helpers =====
function addT(sc,x,y,t,sz,col,bold){const o=sc.add.text(x,y,t,{fontSize:sz+'px',color:col||'#333',fontFamily:'Kanit',fontStyle:bold?'bold':'normal'}).setOrigin(0.5);pg.add(o);return o;}
function fBA(bg,x,y,w,h,col){bg.fillStyle(col,1).fillRoundedRect(x-w/2,y-h/2,w,h,10).lineStyle(2,0xffffff,0.3).strokeRoundedRect(x-w/2,y-h/2,w,h,10);}
function btn(sc,x,y,w,h,col,label,cb){
 const g=sc.add.graphics().fillStyle(col,1).fillRoundedRect(x-w/2,y-h/2,w,h,10);
 g.setInteractive(new Phaser.Geom.Rectangle(x-w/2,y-h/2,w,h),Phaser.Geom.Rectangle.Contains);
 g.on('pointerdown',cb).on('pointerover',()=>g.setAlpha(0.8)).on('pointerout',()=>g.setAlpha(1));
 pg.add(g);pg.add(sc.add.text(x,y,label,{fontSize:'17px',color:'#fff',fontFamily:'Kanit',fontStyle:'bold'}).setOrigin(0.5));
}
function fb(sc,title,msg,ok){
 const el=document.getElementById('feedback-popup');if(!el)return;
 el.innerHTML=`<h3 style="color:${ok?'#15803d':'#b45309'};font-weight:bold;margin:0 0 8px">${title}</h3><p style="font-size:1.05rem;color:#333;white-space:pre-line;margin:0 0 12px">${msg}</p><button class="btn ${ok?'btn-success':'btn-warning'}" onclick="document.getElementById('feedback-popup').style.display='none'">${ok?'👍 ไปต่อ':'🔄 ลองใหม่'}</button>`;
 el.style.display='block';
 if(!ok){try{sc.sound.play('wrong');}catch(e){}sc.cameras.main.shake(120,0.004);}
 else{try{sc.sound.play('correct');}catch(e){}}
}
function hideFB(){const el=document.getElementById('feedback-popup');if(el)el.style.display='none';}

function onComplete(sc){
 const dur=Math.floor((Date.now()-startTime)/1000);
 let stars=1;if(totalAttempts<=2)stars=3;else if(totalAttempts<=5)stars=2;
 if(pg)pg.clear(true,true);
 if(sc._qGrp)sc._qGrp.clear(true,true);
 const c=sc.add.container(W/2,H/2).setDepth(10).setAlpha(0).setScale(0.7);
 c.add(sc.add.rectangle(0,0,W,H,0x000000,0.7).setInteractive());
 c.add(sc.add.text(0,-90,"🎉🏆 ผ่านบทที่ 2 แล้ว! 🏆🎉",{fontSize:'38px',color:'#fde047',fontFamily:'Kanit'}).setOrigin(0.5));
 c.add(sc.add.text(0,-40,"นักเรียนสร้างอัลกอริทึมได้ด้วยตัวเอง!",{fontSize:'20px',color:'#a7f3d0',fontFamily:'Kanit'}).setOrigin(0.5));
 c.add(sc.add.text(0,5,`ได้รับ ${"⭐".repeat(stars)} (${stars} ดาว)`,{fontSize:'30px',color:'#fff',fontFamily:'Kanit'}).setOrigin(0.5));
 c.add(sc.add.text(0,45,`เวลา ${dur} วินาที | ลองผิด ${totalAttempts} ครั้ง`,{fontSize:'18px',color:'#e2e8f0',fontFamily:'Kanit'}).setOrigin(0.5));
 c.add(sc.add.text(0,85,"บทต่อไป: การแสดงอัลกอริทึมด้วยข้อความ",{fontSize:'16px',color:'#93c5fd',fontFamily:'Kanit'}).setOrigin(0.5));
 sc.tweens.add({targets:c,alpha:1,scale:1,duration:500,ease:'Power2.easeOut',onComplete:()=>{
  if(window.sendResult)window.sendResult(STAGE_ID,stars,dur,totalAttempts);
  setTimeout(()=>{if(window.triggerAutoNextStage)window.triggerAutoNextStage();},3000);
 }});
}

new Phaser.Game(config);
});
})();
