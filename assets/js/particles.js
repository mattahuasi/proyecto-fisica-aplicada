(function crearParticulasAmbientales() {
  const layer = document.getElementById("ambient-particles");
  if (!layer) return;

  const total = window.innerWidth < 768 ? 5 : 12;
  const particles = [];

  for (let i = 0; i < total; i++) {
    const particle = document.createElement("span");
    particle.className = "ambient-particle";
    const size = 3 + Math.random() * 5;
    const depth = Math.random();

    particle.style.width = size + "px";
    particle.style.height = size + "px";
    particle.style.left = Math.random() * 100 + "vw";
    particle.style.top = Math.random() * 100 + "vh";
    particle.style.opacity = String(0.08 + depth * 0.18);

    const state = {
      el: particle,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (-0.04 + Math.random() * 0.08) * (0.25 + depth),
      vy: (-0.06 + Math.random() * 0.12) * (0.25 + depth),
      wobble: Math.random() * Math.PI * 2,
      depth,
    };

    particles.push(state);
    layer.appendChild(particle);
  }

  function tick() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    for (const particle of particles) {
      particle.wobble += 0.007 + particle.depth * 0.01;
      particle.x += particle.vx + Math.sin(particle.wobble) * 0.12;
      particle.y += particle.vy + Math.cos(particle.wobble * 0.8) * 0.08;

      if (particle.x > width + 20) particle.x = -20;
      if (particle.x < -20) particle.x = width + 20;
      if (particle.y > height + 20) particle.y = -20;
      if (particle.y < -20) particle.y = height + 20;

      particle.el.style.transform = `translate3d(${particle.x}px, ${particle.y}px, 0)`;
    }

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();
