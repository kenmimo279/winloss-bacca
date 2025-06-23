// ตัวแปรหลัก
let baseBet      = 10;
let currentBet   = baseBet;
let capital      = 1000;
let round        = 1;
let totalSpent   = 0;
let totalProfit  = 0;

// เก็บ DNA สำหรับ UI และ bets จริง
let dnaUIList    = [];   // ['follow','oppose','skip',...]
let betList      = [];   // ['follow','oppose',...] ไม่เก็บ skip
let resultList   = [];   // [true,false,...]

// โหมดเดินเงิน
let mode         = 'martingale';
let paroliStreak = 0;
let fiboSeq      = [1,1];
let fiboIndex    = 0;
let seq1326      = [1,3,2,6];
let idx1326      = 0;

// ตั้งทุนเริ่มต้น
function setCapital() {
  capital = parseInt(document.getElementById("startCapital").value) || 0;
  document.getElementById("capitalLeft").textContent = capital;
  resetBetLogic();
}

// ตั้งเดิมพันเริ่มต้น
function setBaseBet() {
  baseBet    = parseInt(document.getElementById("baseBet").value) || 0;
  currentBet = baseBet;
}

// เปลี่ยนโหมดเดินเงิน
function changeMode() {
  mode = document.getElementById("modeSelect").value;
  resetBetLogic();
  alert("เปลี่ยนโหมดเป็น: " + mode);
}

// รีเซ็ต logic สูตรเดินเงิน (ไม่ล้างประวัติ)
function resetBetLogic() {
  currentBet   = baseBet;
  paroliStreak = 0;
  fiboSeq      = [1,1];
  fiboIndex    = 0;
  idx1326      = 0;
}

// จด DNA (ตาม/สวน)
function markDNA(side) {
  dnaUIList.push(side);
  betList.push(side);
  appendDNASpan(side);
  checkLineBreak();
}

// จด skip DNA (ข้าม)
function markSkip() {
  dnaUIList.push('skip');
  appendDNASpan('skip');
  checkLineBreak();
}

// สร้าง span และใส่ใน UI
function appendDNASpan(side) {
  const span = document.createElement("span");
  if (side === 'follow') {
    span.textContent = '✔️'; span.className = 'green';
  } else if (side === 'oppose') {
    span.textContent = '❌'; span.className = 'red';
  } else {
    span.textContent = '✕'; span.className = 'gray';
  }
  document.getElementById("dnaBox").appendChild(span);
}

// ขึ้นบรรทัดใหม่ทุก 12 ตัว
function checkLineBreak() {
  if (dnaUIList.length % 12 === 0) {
    document.getElementById("dnaBox").appendChild(document.createElement("br"));
  }
}

// ย้อนกลับ DNA ตัวสุดท้าย (ถ้ายังไม่บันทึกผลของ bet นั้น)
function undoDNA() {
  if (dnaUIList.length === 0) return alert("ยังไม่มี DNA ให้ย้อนกลับ");
  const box = document.getElementById("dnaBox");
  // เอา span หรือ br ตัวสุดท้ายออกก่อน
  let last = box.lastChild;
  if (last && last.nodeName === 'BR') {
    box.removeChild(last);
    last = box.lastChild;
  }
  // เอา span ตัวสุดท้ายออก
  if (last && last.nodeName === 'SPAN') {
    box.removeChild(last);
  }
  // อัปเดตรายการในอาเรย์
  const side = dnaUIList.pop();
  // ถ้าไม่ใช่ skip และยังไม่มีผลบันทึก ให้เอา betList ออกด้วย
  if (side !== 'skip' && betList.length > resultList.length) {
    betList.pop();
  }
}

// กดยืนยันผลจริง (ชนะ/แพ้)
function confirmResult(win) {
  const nextBetIndex = resultList.length;
  if (nextBetIndex >= betList.length) {
    return alert("ไม่มีการเดิมพันค้างบันทึกผล (จด 'ตาม' หรือ 'สวน' ก่อนแล้วค่อยบันทึกผล)");
  }
  if (capital < currentBet) {
    return alert("ทุนไม่พอสำหรับเดิมพันรอบนี้!");
  }

  // บันทึกผล
  resultList.push(win);
  capital    -= currentBet;
  totalSpent += currentBet;
  const profit = win ? currentBet : -currentBet;
  totalProfit+= profit;
  if (win) capital += currentBet * 2;

  // แสดงประวัติ
  const side = betList[nextBetIndex];
  const li = document.createElement("li");
  li.textContent = 
    `รอบ ${round}: แทง ${side==='follow'?'ตาม':'สวน'} → ${win?'ชนะ':'แพ้'} | ` +
    `เดิมพัน: ${currentBet} บาท | ผลต่าง: ${profit>0?'+':''}${profit} บาท`;
  document.getElementById("moneyLog").appendChild(li);

  // อัปเดตตัวเลข
  document.getElementById("totalSpent").textContent  = totalSpent;
  document.getElementById("totalProfit").textContent = totalProfit;
  document.getElementById("capitalLeft").textContent = capital;

  // คำนวณไม้ต่อไป
  updateNextBet(win);
  round++;
}

// คำนวณไม้ต่อไปตามโหมด
function updateNextBet(win) {
  switch (mode) {
    case 'martingale':
      currentBet = win ? baseBet : currentBet * 2;
      break;
    case 'paroli':
      if (win) {
        paroliStreak++;
        currentBet = baseBet * Math.pow(2, paroliStreak);
        if (paroliStreak >= 2) paroliStreak = 0;
      } else {
        paroliStreak = 0;
        currentBet = baseBet;
      }
      break;
    case 'fibonacci':
      if (win) {
        fiboIndex = Math.max(fiboIndex - 2, 0);
      } else {
        fiboIndex++;
        if (fiboIndex >= fiboSeq.length) {
          fiboSeq.push(fiboSeq[fiboSeq.length-1] + fiboSeq[fiboSeq.length-2]);
        }
      }
      currentBet = baseBet * fiboSeq[fiboIndex];
      break;
    case '1326':
      if (win) {
        idx1326++;
        if (idx1326 >= seq1326.length) idx1326 = 0;
      } else {
        idx1326 = 0;
      }
      currentBet = baseBet * seq1326[idx1326];
      break;
    case 'flat':
      currentBet = baseBet;
      break;
    case 'manual':
      break;
  }
}

// รีเซ็ตทั้งหมด
function resetAll() {
  if (!confirm("ต้องการล้างข้อมูลทั้งหมดหรือไม่?")) return;
  setCapital();
  setBaseBet();
  round       = 1;
  totalSpent  = 0;
  totalProfit = 0;
  dnaUIList   = [];
  betList     = [];
  resultList  = [];
  resetBetLogic();
  document.getElementById("dnaBox").innerHTML   = "";
  document.getElementById("moneyLog").innerHTML = "";
  document.getElementById("totalSpent").textContent  = "0";
  document.getElementById("totalProfit").textContent = "0";
}
