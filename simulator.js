// simulator.js — акуратний рух зубів без дикого обертання
(function(){
  // DOM refs
  const forceN = document.getElementById('forceN');
  const forceNval = document.getElementById('forceNval');
  const angleDeg = document.getElementById('angleDeg');
  const angleVal = document.getElementById('angleVal');
  const kVal = document.getElementById('kVal');
  const kShown = document.getElementById('kShown');
  const damping = document.getElementById('damping');
  const dShown = document.getElementById('dShown');
  const teethCount = document.getElementById('teethCount');
  const jawArea = document.getElementById('jawArea');
  const calcInfo = document.getElementById('calcInfo');

  if(!forceN || !jawArea) return;

  // parameters
  let params = {
    F: parseFloat(forceN.value),
    theta: parseFloat(angleDeg.value) * Math.PI/180,
    k: parseFloat(kVal.value),
    damping: parseFloat(damping.value),
    teeth: parseInt(teethCount.value,10)
  };

  let teeth = [];
  const PIXEL_SCALE = 1200;
  const TIME_STEP = 1/60;

  function createToothSVG(id){
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns,'svg');
    svg.setAttribute('viewBox','0 0 64 80');
    svg.classList.add('tooth-svg');

    const path = document.createElementNS(ns,'path');
    path.setAttribute('d','M16 10 C20 2,44 2,48 10 C56 18,56 30,48 36 C44 39,44 68,32 74 C20 68,20 39,16 36 C8 30,8 18,16 10 Z');
    path.setAttribute('fill','white');
    path.setAttribute('stroke','#d0d0d0');
    path.setAttribute('stroke-width','2');
    svg.appendChild(path);

    svg.setAttribute('id','tooth-'+id);
    return svg;
  }

  function initTeeth(n){
    teeth = [];
    jawArea.innerHTML = '';

    const width = jawArea.clientWidth;
    const spacing = 100;
    const totalWidth = spacing * (n - 1);
    const startX = (width - totalWidth) / 2;

    for(let i=0;i<n;i++){
      const el = createToothSVG(i);
      el.style.position = 'absolute';

      jawArea.appendChild(el);

      const obj = {
        el,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        mass: 0.01
      };
      teeth.push(obj);
    }

    teeth.forEach((t, i) => {
      const baseX = startX + i * spacing;
      const baseY = (jawArea.clientHeight / 2) - 40;

      t.baseX = baseX;
      t.baseY = baseY;

      t.el.style.transform = `translate(${baseX}px, ${baseY}px)`;
    });
  }

  function updateParamsFromUI(){
    params.F = parseFloat(forceN.value);
    params.theta = parseFloat(angleDeg.value) * Math.PI/180;
    params.k = parseFloat(kVal.value);
    params.damping = parseFloat(damping.value);
    params.teeth = parseInt(teethCount.value,10);
    forceNval.textContent = params.F.toFixed(1);
    angleVal.textContent = Math.round(params.theta*180/Math.PI);
    kShown.textContent = params.k;
    dShown.textContent = params.damping.toFixed(2);
  }

  function stepPhysics(dt){
    const Fx = params.F * Math.cos(params.theta);
    const Fy = params.F * Math.sin(params.theta);

    teeth.forEach((t, idx) => {
      const center = (teeth.length - 1)/2;
      const distFactor = 1 - Math.abs(idx - center) / teeth.length;

      const appliedFx = Fx * (0.6 + 0.4 * distFactor);
      const appliedFy = Fy * (0.6 + 0.4 * distFactor);

      const ax = appliedFx / t.mass;
      const ay = appliedFy / t.mass;

      t.vx += ax * dt;
      t.vy += ay * dt;

      const damp = Math.max(0, 1 - params.damping * dt * 6);
      t.vx *= damp;
      t.vy *= damp;

      t.x += t.vx * dt;
      t.y += t.vy * dt;

      t.x = Math.max(-0.02, Math.min(0.02, t.x));
      t.y = Math.max(-0.02, Math.min(0.02, t.y));
    });
  }

  function render(){
    teeth.forEach(t => {
      const pxX = Math.round(params.k * t.x * PIXEL_SCALE);
      const pxY = Math.round(params.k * t.y * PIXEL_SCALE / 2);

      t.el.style.transform =
        `translate(${t.baseX + pxX}px, ${t.baseY + pxY}px)`;
        // ❗ rotate прибрала!
    });
  }

  let last = performance.now();
  function tick(now){
    const dt = Math.min(0.035, (now-last)/1000);
    last = now;

    stepPhysics(dt);
    render();

    const Fx = params.F * Math.cos(params.theta);
    const Fy = params.F * Math.sin(params.theta);

    calcInfo.innerHTML =
      `<div class="small-muted">Fx=${Fx.toFixed(3)} N, Fy=${Fy.toFixed(3)} N, зубів: ${teeth.length}</div>`;

    requestAnimationFrame(tick);
  }

  forceN.addEventListener('input', updateParamsFromUI);
  angleDeg.addEventListener('input', updateParamsFromUI);
  kVal.addEventListener('input', updateParamsFromUI);
  damping.addEventListener('input', updateParamsFromUI);
  teethCount.addEventListener('change', ()=> initTeeth(params.teeth));

  updateParamsFromUI();
  initTeeth(params.teeth);

  setTimeout(()=>{
    last = performance.now();
    requestAnimationFrame(tick);
  }, 200);

})();
