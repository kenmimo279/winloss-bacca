// script.js
let baseBet = 10;
let currentBet = baseBet;
let round = 1;
let totalSpent = 0;
let totalProfit = 0;
let pending = null;
let mode = 'martingale';
let capital = 1000;

let paroliStreak = 0;
let fiboSeq = [1,1];
let fiboIndex = 0;
let seq1326 = [1,3,2,6];
let idx1326 = 0;

function setCapital() {
  capital = parseInt(document.getElementById("startCapital").value) || 0;
  document.getElementById("capitalLeft").textContent = capital;
  resetBettingLogic();
}

function setBaseBet() {
  baseBet = parseInt(document.getElementById("baseBet").value) || 0;
  currentBet = baseBet;
}

function changeMode() {
  mode = document.getElementById("modeSelect").value;
  resetBettingLogic();
  alert("เปลี่ยนโหมดเป็น: " + mode);
}

function resetBettingLogic() {
  currentBet = baseBet;
  paroliStreak = 0;
  fiboSeq = [1,1];
  fiboIndex = 0;
  idx1326 = 0;
}

function markDNA(side) {
  if (pending) {
    alert("เลือกฝั่งแล้ว กด 'ชนะ' หรือ 'แพ้' ก่อนรอบใหม่");
    return;
  }
  pending = side;
  const span = document.createElement("span");
  span.textContent = side==='follow'? '✔️':'❌';
  span.className = side==='follow'? 'green':'red';
  document.getElementById("dnaBox").appendChild(span);

  if (mode==='manual' || mode==='flat') {
    const u = prompt("ใส่จำนวนเงินที่เดิมพัน (บาท):", currentBet);
    const b = parseInt(u);
    if (!b||b<=0) {
      alert("กรุณาใส่จำนวนเงินที่ถูกต้อง");
      pending = null;
      span.remove();
      return;
    }
    currentBet = b;
  }
}

function confirmResult(win) {
  if (!pending) {
    alert("กรุณาเลือกฝั่งก่อน (ตาม/สวน)");
    return;
  }
  if (capital < currentBet) {
    alert("ทุนไม่พอสำหรับเดิมพันรอบนี้!");
    return;
  }

  capital   -= currentBet;
  totalSpent+= currentBet;
  const profit = win ? currentBet : -currentBet;
  totalProfit+= profit;
  if (win) capital += currentBet * 2;

  const li = document.createElement("li");
  li.textContent = `รอบ ${round}: แทง ${pending==='follow'?'ตาม':'สวน'} → ${win?'ชนะ':'แพ้'} | เดิมพัน: ${currentBet} บาท | ผลต่าง: ${profit>0?'+':''}${profit} บาท`;
  document.getElementById("moneyLog").appendChild(li);

  document.getElementById("totalSpent").textContent = totalSpent;
  document.getElementById("totalProfit").textContent = totalProfit;
  document.getElementById("capitalLeft").textContent = capital;

  updateNextBet(win);
  round++;
  pending = null;
}

function updateNextBet(win) {
  switch(mode) {
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

function resetAll() {
  if (!confirm("ต้องการล้างข้อมูลทั้งหมดหรือไม่?")) return;
  setCapital();
  setBaseBet();
  round = 1;
  totalSpent = 0;
  totalProfit = 0;
  pending = null;
  resetBettingLogic();
  document.getElementById("dnaBox").innerHTML = "";
  document.getElementById("moneyLog").innerHTML = "";
  document.getElementById("totalSpent").textContent = "0";
  document.getElementById("totalProfit").textContent = "0";
}
