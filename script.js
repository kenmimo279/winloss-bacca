let currentBet = 100;
let round = 1;
let totalSpent = 0;
let pending = null; // 'follow' หรือ 'oppose'

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
}

function confirmResult(win) {
  if (!pending) {
    alert("กรุณาเลือกฝั่งก่อน (ตาม/สวน)");
    return;
  }

  totalSpent += currentBet;

  const log = document.createElement("li");
  log.textContent = `รอบ ${round}: แทง ${pending === 'follow' ? 'ตาม' : 'สวน'} → ${win ? 'ชนะ' : 'แพ้'} | เดิมพัน: ${currentBet} บาท`;
  document.getElementById("moneyLog").appendChild(log);
  document.getElementById("totalSpent").textContent = totalSpent;

  currentBet = win ? 100 : currentBet * 2;
  round++;
  pending = null;
}

function resetAll() {
  if (confirm("ต้องการล้างข้อมูลทั้งหมดหรือไม่?")) {
    currentBet = 100;
    round = 1;
    totalSpent = 0;
    pending = null;

    document.getElementById("dnaBox").innerHTML = "";
    document.getElementById("moneyLog").innerHTML = "";
    document.getElementById("totalSpent").textContent = "0";
  }
}
