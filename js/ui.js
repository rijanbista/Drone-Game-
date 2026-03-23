export function updateUI(state, enemyCount = 0, allyTime = 0) {
  document.getElementById("health").textContent = state.health;
  document.getElementById("money").textContent = state.money;
  document.getElementById("score").textContent = state.score;
  document.getElementById("wave").textContent = state.wave;
  document.getElementById("enemyCount").textContent = enemyCount;
  document.getElementById("objective").textContent = state.objectiveText || "";
  
  const statusEl = document.getElementById("statusText");
  if (state.weaponSystem.isReloading) {
    statusEl.textContent = `RELOADING (${state.weaponSystem.reloadTimer.toFixed(1)}s)`;
    statusEl.style.color = "#ffaa00";
  } else if (state.money < 8 && enemyCount > 0) {
    statusEl.textContent = "OUT OF FUNDS";
    statusEl.style.color = "#ff4444";
  } else {
    statusEl.textContent = state.statusText || "Normal";
    statusEl.style.color = state.statusText === "JAMMER ACTIVE" ? "#ff0000" : "#00ffcc";
  }

  const allyEl = document.getElementById("allyStatus");
  if (allyEl) {
    allyEl.textContent = allyTime > 0 ? `${allyTime.toFixed(1)}s active` : "Ready";
  }
}