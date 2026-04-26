// stage_text_2.js — บทที่ 3 ด่านที่ 2: ขั้นตอนไหนหายไป
(function(){
'use strict';

const subStages = [
{
  id:1, title:"การต้มบะหมี่",
  mission:"เติมขั้นตอนที่หายไปให้ถูกต้อง",
  steps:[
    {text:"ต้มน้ำให้เดือด"},
    {blankId:"blank1"},
    {text:"ใส่เครื่องปรุง"},
    {text:"ตักใส่ชาม"}
  ],
  choices:[
    {id:"add_noodle", text:"ใส่บะหมี่ลงในน้ำเดือด"},
    {id:"eat_now", text:"กินบะหมี่ทันที", distractor:true},
    {id:"wash_bag", text:"ล้างกระเป๋า", distractor:true},
    {id:"turn_light", text:"เปิดไฟในห้อง", distractor:true}
  ],
  answers:{blank1:"add_noodle"},
  hintWrong:"ขั้นตอนนี้ยังไม่ต่อเนื่อง ลองคิดดูว่าก่อนใส่เครื่องปรุงควรทำอะไรกับบะหมี่ก่อน",
  hintOk:"ถูกต้อง! ก่อนใส่เครื่องปรุงควรใส่บะหมี่ลงในน้ำเดือดก่อน"
},
{
  id:2, title:"การปลูกต้นไม้",
  mission:"เติมขั้นตอนแรกที่หายไปให้ถูกต้อง",
  steps:[
    {blankId:"blank1"},
    {text:"ใส่เมล็ดลงในหลุม"},
    {text:"กลบดินให้เรียบร้อย"},
    {text:"รดน้ำต้นไม้"}
  ],
  choices:[
    {id:"dig", text:"ขุดหลุมในดิน"},
    {id:"pick_fruit", text:"เก็บผลไม้", distractor:true},
    {id:"cut_tree", text:"ตัดต้นไม้ทิ้ง", distractor:true},
    {id:"sell_tree", text:"นำต้นไม้ไปขาย", distractor:true}
  ],
  answers:{blank1:"dig"},
  hintWrong:"ขั้นตอนแรกควรเป็นสิ่งที่ทำให้เราพร้อมใส่เมล็ด ลองคิดว่าต้องเตรียมดินอย่างไรก่อน",
  hintOk:"ดีมาก! ก่อนใส่เมล็ดควรขุดหลุมก่อน"
},
{
  id:3, title:"การล้างจาน",
  mission:"เติมขั้นตอนสุดท้ายที่หายไปให้ถูกต้อง",
  steps:[
    {text:"กวาดเศษอาหารออกจากจาน"},
    {text:"ล้างด้วยน้ำยาล้างจาน"},
    {text:"ล้างด้วยน้ำสะอาด"},
    {blankId:"blank1"}
  ],
  choices:[
    {id:"dry_plate", text:"ผึ่งหรือเช็ดจานให้แห้ง"},
    {id:"use_dirty", text:"นำจานสกปรกไปใช้ต่อ", distractor:true},
    {id:"soap_glass", text:"เทน้ำยาล้างจานใส่แก้ว", distractor:true},
    {id:"eat_again", text:"เริ่มกินข้าวใหม่", distractor:true}
  ],
  answers:{blank1:"dry_plate"},
  hintWrong:"ขั้นตอนสุดท้ายควรทำให้จานสะอาดและพร้อมเก็บ ลองเลือกขั้นตอนที่ทำให้จานแห้ง",
  hintOk:"ถูกต้อง! หลังล้างจานด้วยน้ำสะอาด ควรผึ่งหรือเช็ดจานให้แห้ง"
},
{
  id:4, title:"ค้นหาดินสอที่หายไป",
  mission:"เติม 2 ขั้นตอนให้การแก้ปัญหาสมบูรณ์",
  steps:[
    {text:"คิดว่าครั้งสุดท้ายใช้ดินสอที่ไหน"},
    {blankId:"blank1"},
    {text:"ถามเพื่อนใกล้ตัวว่าเห็นดินสอหรือไม่"},
    {blankId:"blank2"}
  ],
  choices:[
    {id:"check_area", text:"ตรวจใต้โต๊ะและในกระเป๋า"},
    {id:"tell_teacher", text:"ถ้ายังไม่พบ ให้แจ้งครู"},
    {id:"cry", text:"ร้องไห้ทันที", distractor:true},
    {id:"buy_now", text:"ซื้อดินสอใหม่โดยไม่ค้นหา", distractor:true},
    {id:"leave_room", text:"เดินออกจากห้องเรียน", distractor:true}
  ],
  answers:{blank1:"check_area", blank2:"tell_teacher"},
  hintWrong:"การแก้ปัญหานี้ยังไม่เป็นระบบ ลองเรียงลำดับการหาใหม่ หรือคิดว่าหลังถามเพื่อนควรทำอะไร",
  hintOk:"ยอดเยี่ยม! นักเรียนเติมขั้นตอนการแก้ปัญหาได้ครบและเป็นลำดับ"
}
];

let curSub = 0;
let totalAttempts = 0;
let startTime = Date.now();
let slotData = {}; // Maps blankId to card id

document.addEventListener('DOMContentLoaded', () => {
  startTime = Date.now();
  renderSubStage();
});

function renderSubStage() {
  const sub = subStages[curSub];
  const area = document.getElementById('game-area');
  
  // Reset slot data
  slotData = {};
  sub.steps.forEach(step => {
    if(step.blankId) slotData[step.blankId] = null;
  });

  // Shuffle choices
  const shuffledChoices = [...sub.choices].sort(() => Math.random() - 0.5);

  let html = '';

  // Header
  html += '<div class="sub-header">';
  html += `<h5>📋 ด่านย่อย ${curSub+1}/${subStages.length}: ${sub.title}</h5>`;
  html += `<p>${sub.mission}</p>`;
  html += '<div class="progress-dots">';
  for(let i = 0; i < subStages.length; i++){
    const cls = i < curSub ? 'dot done' : (i === curSub ? 'dot current' : 'dot');
    html += `<div class="${cls}"></div>`;
  }
  html += '</div></div>';

  // Cards Pool
  html += '<div class="cards-pool" id="cards-pool">';
  shuffledChoices.forEach(card => {
    html += `<div class="card-item" draggable="true" data-id="${card.id}" id="card-${card.id}">${card.text}</div>`;
  });
  html += '</div>';

  // Steps layout
  html += '<div class="steps-container" id="steps-container">';
  let stepNumber = 1;
  sub.steps.forEach(step => {
    html += `<div class="step-row">`;
    html += `<div class="step-num">${stepNumber}</div>`;
    if(step.text) {
      html += `<div class="step-text">${step.text}</div>`;
    } else if(step.blankId) {
      html += `<div class="blank-slot" id="slot-${step.blankId}" data-slot="${step.blankId}">ลากการ์ดมาวางที่นี่</div>`;
    }
    html += `</div>`;
    stepNumber++;
  });
  html += '</div>';

  // Buttons
  html += '<div class="btn-area">';
  html += '<button class="btn-game btn-clear" id="btn-clear">🗑️ ล้างคำตอบ</button>';
  html += '<button class="btn-game btn-hint" id="btn-hint">💡 คำใบ้</button>';
  html += '<button class="btn-game btn-check-answer" id="btn-check">✅ ตรวจคำตอบ</button>';
  html += '</div>';

  area.innerHTML = html;

  setupDragDrop(sub);

  document.getElementById('btn-clear').addEventListener('click', () => {
    Object.keys(slotData).forEach(k => slotData[k] = null);
    refreshUI(sub);
  });

  document.getElementById('btn-hint').addEventListener('click', () => {
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
  document.querySelectorAll('.blank-slot').forEach(slot => {
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
      const slotId = slot.dataset.slot;

      // Remove card from previous slot if it was placed somewhere
      for (const key of Object.keys(slotData)) {
        if(slotData[key] === cardId) slotData[key] = null;
      }

      slotData[slotId] = cardId;
      refreshUI(sub);
    });

    // Click to return
    slot.addEventListener('click', () => {
      const slotId = slot.dataset.slot;
      if(slotData[slotId] !== null) {
        slotData[slotId] = null;
        refreshUI(sub);
      }
    });
  });
}

function refreshUI(sub) {
  const pool = document.getElementById('cards-pool');

  // Show all cards in pool initially
  sub.choices.forEach(card => {
    const el = document.getElementById('card-' + card.id);
    if(!el) return;
    
    // Check if card is in any slot
    const isPlaced = Object.values(slotData).includes(card.id);
    if(isPlaced) {
      el.style.display = 'none';
    } else {
      el.style.display = '';
      if(!pool.contains(el)) pool.appendChild(el);
    }
  });

  // Update slots
  Object.keys(slotData).forEach(slotId => {
    const slotEl = document.getElementById('slot-' + slotId);
    if(!slotEl) return;

    if(slotData[slotId]) {
      const card = sub.choices.find(c => c.id === slotData[slotId]);
      slotEl.textContent = card ? card.text : '';
      slotEl.classList.add('filled');
      slotEl.classList.remove('correct','wrong');
    } else {
      slotEl.textContent = 'ลากการ์ดมาวางที่นี่';
      slotEl.classList.remove('filled','correct','wrong');
    }
  });
}

function checkAnswer(sub) {
  // Check if all slots filled
  const blanks = Object.keys(sub.answers);
  const isAllFilled = blanks.every(b => slotData[b] !== null);
  
  if(!isAllFilled) {
    showFeedback("⚠️ ยังเติมไม่ครบ", "ยังมีช่องว่างที่ต้องเติมให้ครบ", false);
    return;
  }

  // Check for distractor or general correctness
  let allCorrect = true;
  blanks.forEach(b => {
    const slotEl = document.getElementById('slot-' + b);
    if(slotData[b] === sub.answers[b]) {
      slotEl.classList.add('correct');
      slotEl.classList.remove('wrong');
    } else {
      slotEl.classList.add('wrong');
      slotEl.classList.remove('correct');
      allCorrect = false;
    }
  });

  if(!allCorrect) {
    totalAttempts++;
    
    // Distractor check for specific feedback
    const usedIds = Object.values(slotData);
    const hasDistractor = sub.choices.some(c => c.distractor && usedIds.includes(c.id));
    
    if(hasDistractor) {
      showFeedback("❌ มีข้อความที่ไม่เกี่ยว", "ข้อความนี้ไม่เกี่ยวกับภารกิจ ลองอ่านขั้นตอนก่อนและหลังช่องว่างอีกครั้ง", false);
    } else {
      showFeedback("ยังไม่ถูกต้อง", sub.hintWrong, false);
    }
    return;
  }

  showFeedback("🎉 ถูกต้อง!", sub.hintOk, true);

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
        <p style="font-size:1.4rem;color:#a7f3d0;margin:10px 0;">นักเรียนวิเคราะห์และเติมขั้นตอนที่หายไปได้ยอดเยี่ยม!</p>
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
