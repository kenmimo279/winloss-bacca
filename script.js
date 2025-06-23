let currentBet = 100;
let round = 1;
let totalSpent = 0;
let totalProfit = 0;
let pending = null;
let mode = 'martingale'; // default

let paroliStreak = 0;
let fiboSeq = [1, 1];
let fiboIndex = 0;
let sequence1326 = [1, 3, 2, 6];
let index1326 = 0;

function changeMode() {
  mode = document.getElementById("modeSelect").value;
  resetBettingLogic();
  alert("เปลี่ยนโหมดเป็น: " + mode);
}

function resetBettingLogic() {
  currentBet = 100;
  paroliStreak = 0;
  fiboSeq = [1, 1];
  fiboIndex = 0;
  index1326 = 0;
}

function markDNA(side) {
  if (pending) {
    alert("เลือกฝั่งแล้ว กด 'ชนะ' หรือ 'แพ้' ก่อนเริ่มรอบใหม่");
    return;
  }
  pending = side;

  const span = document.createElement("span");
  span.textContent = side === 'follow' ? "✔️" : "❌";
  span.className = side === 'follow' ? "green" : "red";
  document.getElementById("dnaBox").appendChild(span);

  if (mode === 'manual') {
    const userInput = prompt("ใส่จำนวนเงินที่เดิมพัน (บาท):", currentBet);
    const bet = parseInt(userInput);
    if (!bet || bet <= 0) {
      alert("กรุณาใส่จำนวนเงินที่ถูกต้อง");
      pending = null;
      span.remove();
      return;
    }
    currentBet = bet;
  }
}

function confirmResult(win) {
  if (!pending) {
    alert("กรุณาเลือกฝั่งก่อน (ตาม/สวน)");
    return;
  }

  totalSpent += currentBet;
  const profit = win ? currentBet : -currentBet;
  totalProfit += profit;

  const log = document.createElement("li");
  log.textContent = `รอบ ${round}: แทง ${pending === 'follow' ? 'ตาม' : 'สวน'} → ${win ? 'ชนะ' : 'แพ้'} | เดิมพัน: ${currentBet} บาท | ผลต่าง: ${profit > 0 ? '+' : ''}${profit} บาท`;
  document.getElementById("moneyLog").appendChild(log);

  document.getElementById("totalSpent").textContent = totalSpent;
  document.getElementById("totalProfit").textContent = totalProfit;

  updateNextBet(win);
  round++;
  pending = null;
}

function updateNextBet(win) {
  switch (mode) {
    case 'martingale':
      currentBet = win ? 100 : currentBet * 2;
      break;
    case 'paroli':
      if (win) {
        paroliStreak++;
        currentBet = 100 * Math.pow(2, paroliStreak);
        if (paroliStreak >= 2) paroliStreak = 0;
      } else {
        paroliStreak = 0;
        currentBet = 100;
      }
      break;
    case 'fibonacci':
      if (win) {
        fiboIndex = Math.max(fiboIndex - 2, 0);
      } else {
        fiboIndex++;
        if (fiboIndex >= fiboSeq.length) {
          const next = fiboSeq[fiboSeq.length - 1] + fiboSeq[fiboSeq.length - 2];
          fiboSeq.push(next);
        }
      }
      currentBet = 100 * fiboSeq[fiboIndex];
      break;
    case '1326':
      if (win) {
        index1326++;
        if (index1326 >= sequence1326.length) index1326 = 0;
      } else {
        index1326 = 0;
      }
      currentBet = 100 * sequence1326[index1326];
      break;
    case 'flat':
      currentBet = 100;
      break;
  }
}

function resetAll() {
  if (confirm("ต้องการล้างข้อมูลทั้งหมดหรือไม่?")) {
    currentBet = 100;
    round = 1;
    totalSpent = 0;
    totalProfit = 0;
    pending = null;

    document.getElementById("dnaBox").innerHTML = "";
    document.getElementById("moneyLog").innerHTML = "";
    document.getElementById("totalSpent").textContent = "0";
    document.getElementById("totalProfit").textContent = "0";
    resetBettingLogic();
  }
}
