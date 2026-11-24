function makeDisplay(THREE) {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 420;
  const ctx = canvas.getContext('2d');

  function rect(x, y, width, height, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    ctx.fill();
  }

  function label(text, x, y, size, color, weight = 550) {
    ctx.fillStyle = color;
    ctx.font = weight + ' ' + size + 'px system-ui, sans-serif';
    ctx.fillText(text, x, y);
  }

  ctx.fillStyle = '#e4e7e5';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  rect(0, 0, 768, 60, 0, '#eff1ef');
  rect(25, 16, 27, 27, 6, '#26302e');
  rect(31, 22, 7, 15, 2, '#f7f8f6');
  rect(41, 22, 5, 8, 2, '#f7f8f6');
  label('AnyWatch', 63, 39, 24, '#202927', 650);

  // A document and its destination table share the same selected amount.
  rect(29, 97, 225, 263, 13, '#2b3332');
  label('CSV', 50, 143, 27, '#ffffff', 680);
  rect(50, 162, 183, 2, 1, '#61706c');
  rect(50, 186, 100, 9, 4, '#c5cdca');
  rect(50, 213, 136, 8, 4, '#85938e');
  rect(43, 256, 195, 51, 6, '#454f4c');
  label('04', 55, 289, 23, '#d0d7d3', 500);
  label('1 280', 124, 290, 26, '#ffffff', 680);
  rect(50, 326, 110, 7, 3, '#81908b');

  rect(307, 97, 433, 263, 12, '#ccd2cd');
  rect(309, 99, 429, 259, 10, '#fcfdfb');
  rect(310, 149, 427, 2, 0, '#cbd2cd');
  rect(329, 116, 23, 18, 2, '#43504b');
  rect(332, 121, 17, 2, 0, '#edf1ed');
  rect(338, 118, 2, 14, 0, '#edf1ed');
  rect(364, 119, 76, 10, 4, '#77847e');

  const rowY = [181, 229, 277, 325];
  for (const [i, y] of rowY.entries()) {
    if (i === 2) rect(547, y - 24, 176, 40, 5, '#dcba77');
    label(['02','03','04','05'][i], 332, y + 3, 18, '#65736d', 520);
    rect(394, y - 6, [88, 112, 69, 96][i], 7, 3, '#a0aba4');
    label(['850','960','1 280','740'][i], 566, y + 5, 23, '#3d463f', 610);
    if (i < rowY.length - 1) rect(325, y + 22, 397, 1, 0, '#d6dcd5');
  }

  ctx.strokeStyle = '#53665d';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(253, 281);
  ctx.lineTo(293, 281);
  ctx.moveTo(285, 273);
  ctx.lineTo(293, 281);
  ctx.lineTo(285, 289);
  ctx.stroke();

  // White keyline keeps the pointer clear on either side of the active cell.
  ctx.beginPath();
  ctx.moveTo(648, 267);
  ctx.lineTo(648, 316);
  ctx.lineTo(660, 305);
  ctx.lineTo(670, 324);
  ctx.lineTo(679, 320);
  ctx.lineTo(669, 301);
  ctx.lineTo(687, 301);
  ctx.closePath();
  ctx.strokeStyle = '#f6f8f3';
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = '#1f2724';
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return new THREE.MeshBasicMaterial({map: texture, toneMapped: false});
}

export function addDesktop(THREE, group, kit) {
  const {mat} = kit;
  function part(parent, width, height, depth, radius, material, x, y, z) {
    const mesh = kit.box(width, height, depth, radius, material);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  }

  const monitor = new THREE.Group();
  monitor.position.set(-0.07, 0, -0.25);
  monitor.rotation.y = 0.20;
  group.add(monitor);

  part(monitor, 0.65, 0.044, 0.40, 0.019, mat.silver, 0, 0.023, 0.03);
  const neck = part(monitor, 0.18, 0.50, 0.070, 0.025, mat.silver, 0, 0.27, -0.045);
  neck.rotation.x = -0.16;
  part(monitor, 0.064, 0.12, 0.008, 0.004, mat.graphite, 0, 0.27, -0.005);

  const panel = new THREE.Group();
  panel.position.set(0, 0.963, -0.023);
  panel.rotation.x = -0.055;
  monitor.add(panel);
  part(panel, 2.025, 1.150, 0.083, 0.038, mat.silver, 0, 0, -0.010);
  part(panel, 2.014, 1.137, 0.034, 0.016, mat.dark, 0, 0.003, 0.032);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.946, 1.064), makeDisplay(THREE));
  screen.position.set(0, 0.009, 0.051);
  panel.add(screen);

  const keyboard = new THREE.Group();
  keyboard.position.set(-0.035, 0.012, 0.34);
  keyboard.rotation.y = 0.12;
  group.add(keyboard);
  part(keyboard, 1.01, 0.047, 0.311, 0.021, mat.silver, 0, 0.013, 0);
  // All keycaps share one draw call, including the wider modifiers and space.
  const rows = [
    Array(13).fill(1),
    [1.3, ...Array(10).fill(1), 1.7],
    [1.7, ...Array(9).fill(1), 2.3],
    [1.3, 1.2, 1.2, 5.4, 1.3, 1.3, 1.3],
  ];
  const unit = 0.0718;
  const cap = kit.box(0.062, 0.022, 0.052, 0.006, mat.chalk);
  const keys = new THREE.InstancedMesh(cap.geometry, mat.chalk, rows.flat().length);
  const placement = new THREE.Object3D();
  let index = 0;
  for (const [rowIndex, widths] of rows.entries()) {
    let x = -13 * unit / 2;
    for (const width of widths) {
      placement.position.set(x + width * unit / 2, 0.046, -0.101 + rowIndex * 0.066);
      placement.scale.set((width * unit - 0.0098) / 0.062, 1, 1);
      placement.updateMatrix();
      keys.setMatrixAt(index++, placement.matrix);
      x += width * unit;
    }
  }
  keys.castShadow = true;
  keyboard.add(keys);

  const mouse = new THREE.Group();
  mouse.position.set(0.71, 0.005, 0.29);
  mouse.rotation.y = 0.19;
  group.add(mouse);
  const sole = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 12), mat.graphite);
  sole.scale.set(0.087, 0.022, 0.140);
  sole.position.y = 0.022;
  sole.castShadow = true;
  mouse.add(sole);
  const shell = new THREE.Mesh(
    new THREE.SphereGeometry(1, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2),
    mat.chalk,
  );
  shell.scale.set(0.091, 0.074, 0.144);
  shell.position.y = 0.029;
  shell.castShadow = true;
  mouse.add(shell);
  const wheel = part(mouse, 0.016, 0.015, 0.056, 0.006, mat.graphite, 0, 0.095, -0.037);
  wheel.rotation.x = -0.19;
}
