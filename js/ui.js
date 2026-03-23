export function updateUI(state, enemyCount = 0, allyTime = 0) {
  document.getElementById("health").textContent = state.health;
  document.getElementById("money").textContent = state.money;
  document.getElementById("score").textContent = state.score;
  document.getElementById("wave").textContent = state.wave;
  document.getElementById("enemyCount").textContent = enemyCount;
  document.getElementById("objective").textContent = state.objectiveText || "";
  document.getElementById("statusText").textContent = state.statusText || "Normal";

  const allyEl = document.getElementById("allyStatus");
  if (allyEl) {
    allyEl.textContent = allyTime > 0 ? `${allyTime.toFixed(1)}s active` : "Ready";
  }
}