// stage_text_1.js — บทที่ 3 ด่านที่ 1: เรียงขั้นตอนให้ถูก
// ใช้ HTML Drag & Drop แทน Phaser (เหมาะกับเกมจัดเรียงข้อความ)
(function(){
'use strict';

const subStages = [
{
  id:1, title:"การล้างมือ",
  mission:"เรียงขั้นตอน \"การล้างมือ\" ให้ถูกต้อง",
  slots:3,
  cards:[
    {id:"wash",text:"ล้างมือด้วยน้ำสะอาด"},
    {id:"soap",text:"ถูมือด้วยสบู่"},
    {id:"dry",text:"เช็ดมือให้แห้ง"}
  ],
  correctOrder:["wash","soap","dry"],
  distractors:[],
  hintWrong:"ลองคิดดูนะ ก่อนถูสบู่ มือควรเปียกน้ำก่อนไหม?",
  hintDistractor:"",
  hintOk:"ดีมาก! นักเรียนเรียงขั้นตอนง่ายๆ ได้ถูกต้องแล้ว"
},
{
  id:2, title:"การแปรงฟัน",
  mission:"เรียงขั้นตอน \"การแปรงฟัน\" ให้ถูกต้อง",
  slots:4,
  cards:[
    {id:"brush",text:"แปรงฟันให้ทั่ว"},
    {id:"pick",text:"หยิบแปรงสีฟัน"},
    {id:"rinse",text:"บ้วนปากด้วยน้ำสะอาด"},
    {id:"paste",text:"บีบยาสีฟันลงบนแปรง"}
  ],
  correctOrder:["pick","paste","brush","rinse"],
  distractors:[],
  hintWrong:"บ้วนปากควรอยู่หลังจากแปรงฟันแล้ว ลองเรียงใหม่อีกครั้ง",
  hintDistractor:"",
  hintOk:"เก่งมาก! เรียงขั้นตอนแปรงฟันได้ถูกลำดับ"
},
{
  id:3, title:"เตรียมกระเป๋าไปโรงเรียน",
  mission:"เลือกและเรียงขั้นตอนการเตรียมกระเป๋าให้ถูกต้อง (ไม่เลือกขั้นตอนที่ไม่เกี่ยว)",
  slots:5,
  cards:[
    {id:"check",text:"ตรวจตารางเรียน"},
    {id:"books",text:"หยิบหนังสือตามตารางเรียน"},
    {id:"put",text:"ใส่สมุดและหนังสือลงกระเป๋า"},
    {id:"close",text:"ปิดกระเป๋าให้เรียบร้อย"},
    {id:"game",text:"เล่นเกมในโทรศัพท์",distractor:true},
    {id:"carry",text:"สะพายกระเป๋าไปโรงเรียน"}
  ],
  correctOrder:["check","books","put","close","carry"],
  distractors:["game"],
  hintWrong:"ลองดูขั้นตอนแรกก่อนนะ เราควรตรวจตารางเรียนก่อนหยิบหนังสือหรือไม่?",
  hintDistractor:"ขั้นตอนนี้ไม่ช่วยให้เตรียมกระเป๋าเสร็จ ลองเลือกเฉพาะขั้นตอนที่เกี่ยวกับภารกิจ",
  hintOk:"ยอดเยี่ยม! เลือกและเรียงขั้นตอนได้ถูกต้องครบถ้วน"
},
{
  id:4, title:"ค้นหาดินสอที่หายไป",
  mission:"เรียงขั้นตอนการค้นหาดินสออย่างเป็นระบบ",
  slots:4,
  cards:[
    {id:"ask_friend",text:"ถามเพื่อนใกล้ตัวว่าเห็นดินสอหรือไม่"},
    {id:"think",text:"คิดว่าครั้งสุดท้ายใช้ดินสอที่ไหน"},
    {id:"check_area",text:"ตรวจใต้โต๊ะและในกระเป๋า"},
    {id:"tell_teacher",text:"ถ้ายังไม่พบ ให้แจ้งครู"},
    {id:"buy_now",text:"ซื้อดินสอใหม่ทันที",distractor:true}
  ],
  correctOrder:["think","check_area","ask_friend","tell_teacher"],
  distractors:["buy_now"],
  hintWrong:"ลองคิดดูนะ ก่อนถามเพื่อน ควรนึกย้อนกลับไปก่อนว่าใช้ที่ไหนล่าสุด",
  hintDistractor:"การซื้อใหม่อาจยังไม่ใช่ขั้นตอนแรก ลองค้นหาอย่างเป็นระบบก่อนนะ",
  hintOk:"เยี่ยมมาก! นักเรียนเรียงขั้นตอนการแก้ปัญหาได้เป็นระบบแล้ว"
}
];

let curSub = 0;
let totalAttempts = 0;
let startTime = Date.now();
let slotData = []; // array of card ids placed in slots

document.addEventListener('DOMContentLoaded', () => {
  startTime = Date.now();
  renderSubStage();
});

function renderSubStage() {
  const sub = subStages[curSub];
  const area = document.getElementById('game-area');
  slotData = new Array(sub.slots).fill(null);

  // Shuffle cards
  const shuffled = [...sub.cards].sort(() => Math.random() - 0.5);

  let html = '';

  // Header + progress
  html += '<div class="sub-header">';
  html += `<h5>📋 ด่านย่อย ${curSub+1}/${subStages.length}: ${sub.title}</h5>`;
  html += `<p>${sub.mission}</p>`;
  html += '<div class="progress-dots">';
  for(let i = 0; i < subStages.length; i++){
    const cls = i < curSub ? 'dot done' : (i === curSub ? 'dot current' : 'dot');
    html += `<div class="${cls}"></div>`;
  }
  html += '</div></div>';

  // Cards pool
  html += '<div class="cards-pool" id="cards-pool">';
  shuffled.forEach(card => {
    html += `<div class="card-item" draggable="true" data-id="${card.id}" id="card-${card.id}">${card.text}</div>`;
  });
  html += '</div>';

  // Slots
  html += '<div class="slots-area" id="slots-area">';
  for(let i = 0; i < sub.slots; i++){
    html += `<div class="slot-row">`;
    html += `<div class="slot-num">${i+1}</div>`;
    html += `<div class="slot-box" id="slot-${i}" data-slot="${i}">ลากการ์ดมาวางที่นี่</div>`;
    html += `</div>`;
  }
  html += '</div>';

  // Buttons
  html += '<div class="btn-area">';
  html += '<button class="btn-game btn-clear" id="btn-clear">🗑️ ล้างคำตอบ</button>';
  html += '<button class="btn-game btn-hint" id="btn-hint">💡 คำใบ้</button>';
  html += '<button class="btn-game btn-check-answer" id="btn-check">✅ ตรวจคำตอบ</button>';
  html += '</div>';

  area.innerHTML = html;

  // Setup drag & drop
  setupDragDrop(sub);

  // Button handlers
  document.getElementById('btn-clear').addEventListener('click', () => {
    slotData = new Array(sub.slots).fill(null);
    refreshUI(sub);
  });

  document.getElementById('btn-hint').addEventListener('click', () => {
    const sub = subStages[curSub];
    showFeedback("💡 คำใบ้", sub.hintWrong, false);
  });

  document.getElementById('btn-check').addEventListener('click', () => {
    checkAnswer(sub);
  });
}

function setupDragDrop(sub) {
  // Card drag
  document.querySelectorAll('.card-item').forEach(card => {
    card.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', card.dataset.id);
      card.classList.add('dragging');
    });
    card.addEventListener('dragend', e => {
      card.classList.remove('dragging');
    });
  });

  // Slot drop
  document.querySelectorAll('.slot-box').forEach(slot => {
    slot.addEventListener('dragover', e => {
      e.preventDefault();
      slot.classList.add('drag-over');
    });
    slot.addEventListener('dragleave', () => {
      slot.classList.remove('drag-over');
    });
    slot.addEventListener('drop', e => {
      e.preventDefault();
      slot.classList.remove('drag-over');
      const cardId = e.dataTransfer.getData('text/plain');
      const slotIdx = parseInt(slot.dataset.slot);

      // Remove card from previous slot if it was placed somewhere
      const prevIdx = slotData.indexOf(cardId);
      if(prevIdx !== -1) slotData[prevIdx] = null;

      // If slot already has a card, return it to pool
      if(slotData[slotIdx] !== null) {
        // old card goes back to pool (handled by refreshUI)
      }

      slotData[slotIdx] = cardId;
      refreshUI(sub);
    });

    // Click to return card to pool
    slot.addEventListener('click', () => {
      const slotIdx = parseInt(slot.dataset.slot);
      if(slotData[slotIdx] !== null) {
        slotData[slotIdx] = null;
        refreshUI(sub);
      }
    });
  });
}

function refreshUI(sub) {
  // Return all cards to pool visually, then hide placed ones
  const pool = document.getElementById('cards-pool');

  sub.cards.forEach(card => {
    const el = document.getElementById('card-' + card.id);
    if(!el) return;
    // Check if this card is placed in a slot
    const placedIdx = slotData.indexOf(card.id);
    if(placedIdx !== -1) {
      el.style.display = 'none';
    } else {
      el.style.display = '';
      // Make sure it's in the pool
      if(!pool.contains(el)) pool.appendChild(el);
    }
  });

  // Update slots display
  for(let i = 0; i < sub.slots; i++) {
    const slotEl = document.getElementById('slot-' + i);
    if(!slotEl) continue;
    if(slotData[i]) {
      const card = sub.cards.find(c => c.id === slotData[i]);
      slotEl.textContent = card ? card.text : '';
      slotEl.classList.add('filled');
      slotEl.classList.remove('correct','wrong');
    } else {
      slotEl.textContent = 'ลากการ์ดมาวางที่นี่';
      slotEl.classList.remove('filled','correct','wrong');
    }
  }
}

function checkAnswer(sub) {
  // Check if slots are filled
  const filledCount = slotData.filter(s => s !== null).length;
  if(filledCount < sub.slots) {
    showFeedback("⚠️ ยังวางไม่ครบ", "ยังมีช่องว่างอยู่ ลองเติมขั้นตอนให้ครบก่อนตรวจคำตอบ", false);
    return;
  }

  // Check for distractors
  const hasDistractor = slotData.some(id => sub.distractors.includes(id));
  if(hasDistractor) {
    totalAttempts++;
    showFeedback("❌ มีขั้นตอนที่ไม่เกี่ยว", sub.hintDistractor || "มีขั้นตอนที่ไม่เกี่ยวกับภารกิจ ลองตัดออกก่อน", false);
    // Highlight distractor slots
    for(let i = 0; i < sub.slots; i++) {
      if(sub.distractors.includes(slotData[i])) {
        document.getElementById('slot-' + i).classList.add('wrong');
      }
    }
    return;
  }

  // Check order
  const isCorrect = slotData.every((id, idx) => id === sub.correctOrder[idx]);

  if(!isCorrect) {
    totalAttempts++;
    // Mark correct/wrong per slot
    for(let i = 0; i < sub.slots; i++) {
      const slotEl = document.getElementById('slot-' + i);
      if(slotData[i] === sub.correctOrder[i]) {
        slotEl.classList.add('correct');
        slotEl.classList.remove('wrong');
      } else {
        slotEl.classList.add('wrong');
        slotEl.classList.remove('correct');
      }
    }
    showFeedback("ยังไม่ถูกต้อง", sub.hintWrong || "ลำดับขั้นตอนยังไม่ถูก ลองคิดว่าสิ่งใดควรเกิดก่อน", false);
    return;
  }

  // All correct!
  for(let i = 0; i < sub.slots; i++) {
    const slotEl = document.getElementById('slot-' + i);
    slotEl.classList.add('correct');
    slotEl.classList.remove('wrong');
  }
  showFeedback("🎉 ถูกต้อง!", sub.hintOk, true);

  // Advance after delay
  setTimeout(() => {
    hideFeedback();
    curSub++;
    if(curSub < subStages.length) {
      renderSubStage();
    } else {
      showComplete();
    }
  }, 2200);
}

function showComplete() {
  const dur = Math.floor((Date.now() - startTime) / 1000);
  let stars = 1;
  if(totalAttempts <= 1) stars = 3;
  else if(totalAttempts <= 3) stars = 2;

  const area = document.getElementById('game-area');
  area.innerHTML = `
    <div style="position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:50;">
      <div style="text-align:center;">
        <h2 style="color:#fde047;font-size:2.8rem;margin:0 0 20px 0;font-weight:bold;">🎉 เก่งมาก! ผ่านด่านแล้ว 🎉</h2>
        <p style="font-size:1.4rem;color:#a7f3d0;margin:10px 0;">นักเรียนเรียงขั้นตอนอัลกอริทึมด้วยข้อความได้ถูกต้อง!</p>
        <p style="font-size:2rem;color:#ffffff;margin:15px 0;">ได้รับ ${stars} ดาว!</p>
        <p style="font-size:1.1rem;color:#e2e8f0;margin-top:20px;">เวลา ${dur} วินาที | ลองผิด ${totalAttempts} ครั้ง</p>
      </div>
    </div>
  `;

  area.firstElementChild.animate([
    { transform: 'scale(0.7)', opacity: 0 },
    { transform: 'scale(1)', opacity: 1 }
  ], { duration: 500, easing: 'ease-out' });


  if(window.sendResult) window.sendResult(STAGE_ID, stars, dur, totalAttempts);
  setTimeout(() => {
    if(window.triggerAutoNextStage) window.triggerAutoNextStage();
  }, 3000);
}

function showFeedback(title, msg, ok) {
  const el = document.getElementById('feedback-popup');
  if(!el) return;
  el.innerHTML = `
    <h3 style="color:${ok ? '#15803d' : '#b45309'};font-weight:bold;margin:0 0 8px">${title}</h3>
    <p style="font-size:1.05rem;color:#333;white-space:pre-line;margin:0 0 12px">${msg}</p>
    <button class="btn ${ok ? 'btn-success' : 'btn-warning'}" onclick="document.getElementById('feedback-popup').style.display='none'">${ok ? '👍 เยี่ยม!' : '🔄 ลองใหม่'}</button>
  `;
  el.style.display = 'block';
}

function hideFeedback() {
  const el = document.getElementById('feedback-popup');
  if(el) el.style.display = 'none';
}

})();
