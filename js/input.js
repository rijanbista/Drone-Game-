export function setupInput(state) {
  state.lastActionTime = performance.now();
  
  window.addEventListener("keydown", (e) => {
    state.lastActionTime = performance.now();
    state.keys[e.key.toLowerCase()] = true;
  });

  window.addEventListener("keyup", (e) => {
    state.lastActionTime = performance.now();
    state.keys[e.key.toLowerCase()] = false;
  });

  window.addEventListener("mousemove", (e) => {
    state.lastActionTime = performance.now();
    state.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    state.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  window.addEventListener("mousedown", () => {
    state.lastActionTime = performance.now();
  });

  const joystickZone = document.getElementById("joystick-zone");
  const joystickThumb = document.getElementById("joystick-thumb");
  if (joystickZone && joystickThumb) {
    let joystickActive = false;
    let originX = 0;
    let originY = 0;
    const maxDist = 40;

    function updateJoystick(touch) {
      let dx = touch.clientX - originX;
      let dy = touch.clientY - originY;
      const dist = Math.hypot(dx, dy);
      
      if (dist > maxDist) {
        dx = (dx / dist) * maxDist;
        dy = (dy / dist) * maxDist;
      }
      
      joystickThumb.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
      state.joystick.x = dx / maxDist;
      state.joystick.y = dy / maxDist;
    }

    joystickZone.addEventListener("touchstart", (e) => {
      e.preventDefault();
      state.lastActionTime = performance.now();
      joystickActive = true;
      state.joystick.active = true;
      const rect = joystickZone.getBoundingClientRect();
      originX = rect.left + rect.width / 2;
      originY = rect.top + rect.height / 2;
      updateJoystick(e.touches[0]);
    }, {passive: false});

    joystickZone.addEventListener("touchmove", (e) => {
      e.preventDefault();
      state.lastActionTime = performance.now();
      if (joystickActive) {
        updateJoystick(e.touches[0]);
      }
    }, {passive: false});

    const endJoystick = (e) => {
      e.preventDefault();
      state.lastActionTime = performance.now();
      joystickActive = false;
      state.joystick.active = false;
      state.joystick.x = 0;
      state.joystick.y = 0;
      joystickThumb.style.transform = `translate(-50%, -50%)`;
    };

    joystickZone.addEventListener("touchend", endJoystick, {passive: false});
    joystickZone.addEventListener("touchcancel", endJoystick, {passive: false});
  }
}
