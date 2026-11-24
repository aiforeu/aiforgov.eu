// A filing cassette feeds a machined switch. Its two outlets mark approval and review.
export function addWorkflows(THREE, group, kit) {
  const { chalk, silver, graphite, dark, accent, ink } = kit.mat;

  function place(parent, mesh, x = 0, y = 0, z = 0) {
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function housing(x, y, z) {
    const node = new THREE.Group();
    node.position.set(x, y, z);
    node.rotation.set(-.54, .32, 0, 'YXZ');
    group.add(node);
    return node;
  }

  // Short rounded corners keep both the outer castings and the milled glyph tactile.
  function roundedOutline(path, vertices, radius) {
    const points = vertices.map(([x, y]) => new THREE.Vector2(x, y));
    points.forEach((point, i) => {
      const previous = points[(i + points.length - 1) % points.length];
      const next = points[(i + 1) % points.length];
      const before = point.clone().lerp(previous, Math.min(.4, radius / point.distanceTo(previous)));
      const after = point.clone().lerp(next, Math.min(.4, radius / point.distanceTo(next)));
      if (i === 0) path.moveTo(before.x, before.y);
      else path.lineTo(before.x, before.y);
      path.quadraticCurveTo(point.x, point.y, after.x, after.y);
    });
    path.closePath();
    return path;
  }

  const switchBody = housing(-.07, -.10, -.01);
  const fork = [[-.35, -.065], [-.09, -.065], [.16, -.24], [.30, -.24],
    [.30, -.135], [.205, -.135], [.035, 0], [.205, .135], [.30, .135],
    [.30, .24], [.16, .24], [-.09, .065], [-.35, .065]];

  function diamond(radius, depth, material, z, perforated = false) {
    const outline = roundedOutline(new THREE.Shape(),
      [[-radius, 0], [0, radius], [radius, 0], [0, -radius]], .18);
    if (perforated) outline.holes.push(roundedOutline(new THREE.Path(), fork, .025));
    const geometry = new THREE.ExtrudeGeometry(outline, {
      depth, bevelEnabled: true, bevelThickness: .016, bevelSize: .014,
      bevelSegments: 2, curveSegments: 5
    });
    place(switchBody, new THREE.Mesh(geometry, material), 0, 0, z);
  }

  diamond(.72, .29, graphite, -.35);
  diamond(.705, .045, silver, -.09);
  diamond(.695, .055, ink, -.045);
  diamond(.69, .07, chalk, .012, true);

  // Three separated leaves sit inside the open front of the input cassette.
  const input = housing(-1.45, -.37, .30);
  place(input, kit.box(.75, .64, .35, .085, graphite));
  place(input, kit.box(.65, .54, .10, .045, dark), 0, .012, .18);
  for (let i = 0; i < 3; i++) {
    const sheet = place(input, kit.box(.53, .36, .042, .025, i === 0 ? silver : chalk),
      .012 * i, .215 - .09 * i, .23 + .052 * i);
    sheet.rotation.z = .025 * (i - 1);
  }
  place(input, kit.box(.26, .027, .014, .006, silver), -.04, .083, .356);
  place(input, kit.box(.17, .027, .014, .006, silver), -.085, .015, .356);
  place(input, kit.box(.72, .17, .19, .04, silver), 0, -.18, .28);

  const approved = housing(1.39, .43, -.54);
  const review = housing(1.45, -.58, .33);
  function terminal(node, width, height, bed, face) {
    place(node, kit.box(width, height, .29, .115, bed));
    place(node, kit.box(width - .046, height - .046, .078, .095, face), 0, 0, .155);
  }
  terminal(approved, .80, .61, silver, chalk);
  terminal(review, .66, .51, graphite, dark);

  // The bent metal marks sit slightly proud of the faceplates for legibility at small sizes.
  approved.add(kit.tube([[-.205, -.006, .203], [-.112, -.107, .203],
    [-.074, -.119, .203], [.15, .124, .203]], .042, graphite));
  review.add(kit.tube([[.14, -.095, .204], [.16, -.01, .204], [.12, .06, .204],
    [.045, .075, .204], [-.116, .075, .204]], .031, silver));
  review.add(kit.rod([-.13, .075, .204], [-.042, .15, .204], .029, silver));
  review.add(kit.rod([-.13, .075, .204], [-.042, -.002, .204], .029, silver));

  const inlet = [[-1.18, -.36, .24], [-1.02, -.35, .22], [-.89, -.22, .12], [-.75, -.17, .08]];
  const upper = [[.30, .024, -.398], [.46, .10, -.47], [.74, .31, -.49], [.91, .42, -.52], [1.09, .43, -.55]];
  const lower = [[.38, -.379, -.168], [.54, -.46, -.15], [.79, -.60, .12], [1.02, -.59, .27], [1.23, -.58, .31]];
  const leads = [inlet, upper, lower].map(points => {
    const wire = kit.tube(points, .054, graphite);
    wire.castShadow = true;
    group.add(wire);
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
    for (const fraction of [.09, .91]) {
      const from = curve.getPointAt(fraction - .055).toArray();
      const to = curve.getPointAt(fraction + .055).toArray();
      group.add(kit.rod(from, to, .073, silver));
    }
    return curve;
  });

  const signal = place(group, new THREE.Mesh(new THREE.SphereGeometry(.086, 20, 14), accent));
  leads[1].getPointAt(.54, signal.position);
  return function advance(timeInSeconds) {
    const cycle = timeInSeconds / 4.8 + .68;
    const fraction = cycle - Math.floor(cycle);
    const branch = Math.floor(cycle) % 3 === 2 ? 2 : 1;
    // Disappear inside the switch, then emerge at the corresponding outlet.
    signal.visible = fraction < .33 || (fraction > .44 && fraction < .88);
    if (fraction < .33) leads[0].getPointAt(fraction / .33, signal.position);
    else if (signal.visible) leads[branch].getPointAt((fraction - .44) / .44, signal.position);
  };
}
