export function showHit(text, x, y, color = "white") {
  const el = document.createElement("div");
  el.textContent = text;

  el.style.position = "absolute";
  el.style.left = x + "px";
  el.style.top = y + "px";
  el.style.color = color;
  el.style.fontSize = "14px";
  el.style.fontWeight = "bold";
  el.style.pointerEvents = "none";
  el.style.zIndex = "60";
  el.style.textShadow = "0 0 6px rgba(0,0,0,0.6)";

  document.body.appendChild(el);

  let life = 0.6;

  function update(delta) {
    life -= delta;
    el.style.top = (parseFloat(el.style.top) - 30 * delta) + "px";
    el.style.opacity = life;

    if (life <= 0) {
      el.remove();
      return false;
    }
    return true;
  }

  return { update };
}