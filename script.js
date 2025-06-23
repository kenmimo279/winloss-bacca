// script.js

let baseBet      = 10,
    currentBet   = baseBet,
    capital      = 1000,
    round        = 1,
    totalSpent   = 0,
    totalProfit  = 0;

// เก็บข้อมูลการจด
let dnaUIList    = [],    // ['follow','oppose','skip',...]
    betList      = [],    // ['follow','oppose',...]
    betAmounts   = [],    // [10,20,null,...]
    resultList   = [];    // [true,false,...]

// เดินเงิน
let mode         = 'martingale',
    paroliStreak = 0,
    fiboSeq      = [1,1],
    fiboIndex    = 0,
    seq1326      = [1,3,2,6],
    idx1326      = 0;

// แสดงเดิมพันรอบถัดไปข้างๆช่อง baseBet
function updateCurrentBetDisplay() {
  document.getElementById("currentBetDisplay").textContent = currentBet;
}

// ตั้งทุนเริ่มต้น
function setCapital() {
  capital = +document.getElementById("startCapital").value || 0;
  document.getElementById("capitalLeft").textContent = capital;
  resetBetLogic();
  updateCurrentBetDisplay();
}

// ตั้งเดิมพันเริ่มต้น
function setBaseBet() {
  baseBet = +document.getElementById("baseBet").value || 0;
  currentBet = baseBet;
  updateCurrentBetDisplay();
}

// เปลี่ยนสูตรเดินเงิน
function changeMode() {
  mode = document.getElementById("modeSelect").value;
  resetBetLogic();
  alert("เปลี่ยนโหมดเป็น: " + mode);
}

// รีเซ็ต logic เดินเงิน (ไม่ล้างประวัติ)
function resetBetLogic() {
  currentBet   = baseBet;
  paroliStreak = 0;
  fiboSeq      = [1,1];
  fiboIndex    = 0;
  idx1326      = 0;
  updateCurrentBetDisplay();
}

// สร้างและแสดงช่อง DNA + จำนวนเงิน
function appendDNACell(side, amt) {
  const cell = document.createElement("div");
  cell.className = 'dna-cell';
  const sym = document.createElement("span");
  sym.className = 'symbol ' +
    (side==='follow'? 'green': side==='oppose'? 'red': 'gray');
  sym.textContent = side==='follow'? '✔️'
                   : side==='oppose'? '❌' : '✕';
  cell.appendChild(sym);
  const ba = document.createElement("span");
  ba.className = 'bet-amt';
  ba.textContent = (amt!=null? amt+'฿' : '');
  cell.appendChild(ba);
  document.getElementById("dnaBox").appendChild(cell);
}

// ขึ้นบรรทัดใหม่ทุก 14 ตัว
function checkLineBreak() {
  if (dnaUIList.length % 14 === 0) {
    document.getElementById("dnaBox").appendChild(document.createElement("br"));
  }
}

// จด DNA (ตาม/สวน)
function markDNA(side) {
  dnaUIList.push(side);
  betList.push(side);
  betAmounts.push(currentBet);
  appendDNACell(side, currentBet);
  checkLineBreak();
}

// จด skip DNA (ข้าม)
function markSkip() {
  dnaUIList.push('skip');
  betAmounts.push(null);
  appendDNACell('skip', null);
  checkLineBreak();
}

// ย้อนกลับ DNA ตัวสุดท้าย
function undoDNA() {
  if (!dnaUIList.length) return alert("ยังไม่มี DNA ให้ย้อน");
  const box = document.getElementById("dnaBox");
  let last = box.lastChild;
  if (last && last.nodeName === 'BR') {
    box.removeChild(last);
    last = box.lastChild;
  }
  if (last && last.classList.contains('dna-cell')) {
    box.removeChild(last);
  }
  dnaUIList.pop();
  if (betList.length > resultList.length) betList.pop();
  betAmounts.pop();
}

// ยืนยันผลจริง (ชนะ/แพ้)
function confirmResult(win) {
  const idx = resultList.length;
  if (idx >= betList.length) return alert("ไม่มีการเดิมพันรอผล");
  const amt = betAmounts[idx];
  if (capital < amt) return alert("ทุนไม่พอ");

  resultList.push(win);
  capital   -= amt;
  totalSpent+= amt;
  const pf = win? amt : -amt;
  totalProfit+= pf;
  if (win) capital += amt * 2;

  const li = document.createElement("li");
  const side = betList[idx];
  li.textContent =
    `รอบ ${round}: แทง ${side==='follow'?'ตาม':'สวน'} → ` +
    `${win?'ชนะ':'แพ้'} | เดิมพัน: ${amt}฿ | ผลต่าง: ${pf>0?'+':''}${pf}฿`;
  document.getElementById("moneyLog").appendChild(li);

  document.getElementById("totalSpent").textContent  = totalSpent;
  document.getElementById("totalProfit").textContent = totalProfit;
  document.getElementById("capitalLeft").textContent = capital;

  updateNextBet(win, amt);
  round++;
}

// คำนวณไม้ต่อไปตามโหมด
function updateNextBet(win, lastAmt) {
  switch (mode) {
    case 'martingale':
      currentBet = win? baseBet : lastAmt * 2;
      break;
    case 'paroli':
      if (win) {
        paroliStreak++;
        currentBet = baseBet * 2**paroliStreak;
        if (paroliStreak >= 2) paroliStreak = 0;
      } else {
        paroliStreak = 0;
        currentBet = baseBet;
      }
      break;
    case 'fibonacci':
      if (win) fiboIndex = Math.max(fiboIndex-2,0);
      else {
        fiboIndex++;
        if (fiboIndex >= fiboSeq.length) {
          fiboSeq.push(fiboSeq.at(-1) + fiboSeq.at(-2));
        }
      }
      currentBet = baseBet * fiboSeq[fiboIndex];
      break;
    case '1326':
      if (win) idx1326 = (idx1326+1) % seq1326.length;
      else idx1326 = 0;
      currentBet = baseBet * seq1326[idx1326];
      break;
    case 'flat':
      currentBet = baseBet;
      break;
    case 'manual':
      break;
  }
  updateCurrentBetDisplay();
}

// รีเซ็ตทั้งหมด
function resetAll() {
  if (!confirm("ล้างข้อมูลทั้งหมด?")) return;
  setCapital(); setBaseBet(); round = 1;
  totalSpent = 0; totalProfit = 0;
  dnaUIList = []; betList = []; betAmounts = []; resultList = [];
  resetBetLogic();
  document.getElementById("dnaBox").innerHTML = "";
  document.getElementById("moneyLog").innerHTML = "";
  document.getElementById("totalSpent").textContent = "0";
  document.getElementById("totalProfit").textContent = "0";
}

// เรียกแสดงค่าเริ่มต้น
document.addEventListener("DOMContentLoaded", updateCurrentBetDisplay);
