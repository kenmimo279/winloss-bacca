// ตัวแปรหลัก
let baseBet     = 10;
let currentBet  = baseBet;
let capital     = 1000;
let round       = 1;
let totalSpent  = 0;
let totalProfit = 0;

// เก็บ DNA side list
let dnaList    = [];    // ['follow','oppose',...]
let resultList = [];    // [true,false,...] สถานะชนะ/แพ้

// โหมดเดินเงิน
let mode        = 'martingale';
let paroliStreak= 0;
let fiboSeq     = [1,1];
let fiboIndex   = 0;
let seq1326     = [1,3,2,6];
let idx1326     = 0;

// ตั้งทุน
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

// เปลี่ยนโหมด
function changeMode() {
  mode = document.getElementById("modeSelect").value;
  resetBetLogic();
  alert("เปลี่ยนโหมดเป็น: " + mode);
}

// รีเซ็ตสูตรเดินเงิน (ไม่ล้างประวัติ)
function resetBetLogic() {
  currentBet   = baseBet;
  paroliStreak = 0;
  fiboSeq      = [1,1];
  fiboIndex    = 0;
  idx1326      = 0;
}

// จด DNA (side) ต่อเนื่อง
function markDNA(side) {
  dnaList.push(side);
  const span = document.createElement("span");
  span.textContent = side==='follow'? '✔️':'❌';
  span.className = side==='follow'? 'green':'red';
  const box = document.getElementById("dnaBox");
  box.appendChild(span);

  // ขึ้นบรรทัดใหม่ทุก 12 ตัว
  if (dnaList.length % 12 === 0) {
    box.appendChild(document.createElement("br"));
  }

  // โหมด Manual/Flat ให้ถามเงิน
  if (mode==='manual' || mode==='flat') {
    const u = prompt("ใส่จำนวนเงินที่เดิมพัน (บาท):", currentBet);
    const b = parseInt(u);
    if (!b || b<=0) {
      alert("กรุณาใส่จำนวนเงินที่ถูกต้อง");
      dnaList.pop();
      span.remove();
      return;
    }
    currentBet = b;
  }
}

// กดยืนยันผลจริง (ชนะ/แพ้) เมื่อไหร่ก็ได้
function confirmResult(win) {
  const nextIdx = resultList.length;
  if (nextIdx >= dnaList.length) {
    alert("ไม่มี DNA รอผล (จด DNA ก่อนแล้วค่อยกด ชนะ/แพ้)");
    return;
  }
  resultList.push(win);

  // อัปเดตทุนและสถิติ
  if (capital < currentBet) {
    alert("ทุนไม่พอสำหรับเดิมพันรอบนี้!");
    return;
  }
  capital    -= currentBet;
  totalSpent += currentBet;
  const profit = win ? currentBet : -currentBet;
  totalProfit+= profit;
  if (win) capital += currentBet*2;

  // บันทึกในประวัติเดินเงิน
  const li = document.createElement("li");
  li.textContent = `รอบ ${round}: แทง ${dnaList[nextIdx]==='follow'?'ตาม':'สวน'} → ${win?'ชนะ':'แพ้'} | เดิมพัน: ${currentBet} บาท | ผลต่าง: ${profit>0?'+':''}${profit} บาท`;
  document.getElementById("moneyLog").appendChild(li);

  // อัปเดต UI ตัวเลข
  document.getElementById("totalSpent").textContent  = totalSpent;
  document.getElementById("totalProfit").textContent = totalProfit;
  document.getElementById("capitalLeft").textContent = capital;

  // คำนวณเดิมพันรอบถัดไป
  updateNextBet(win);
  round++;
}

// คำนวณไม้ถัดไปตามโหมด
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
      // ไม่เปลี่ยนอัตโนมัติ
      break;
  }
}

// รีเซ็ตทั้งหมด
function resetAll() {
  if (!confirm("ต้องการล้างข้อมูลทั้งหมดหรือไม่?")) return;
  // อ่านค่าจาก input ใหม่
  setCapital(); setBaseBet();
  // เคลียร์สเตตัส
  round       = 1;
  totalSpent  = 0;
  totalProfit = 0;
  dnaList     = [];
  resultList  = [];
  resetBetLogic();
  // เคลียร์ UI
  document.getElementById("dnaBox").innerHTML   = "";
  document.getElementById("moneyLog").innerHTML = "";
  document.getElementById("totalSpent").textContent  = "0";
  document.getElementById("totalProfit").textContent = "0";
}
