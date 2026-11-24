// A counterbalanced broadcast microphone and a conventional office telephone.
export function addVoice(THREE, group, kit) {
  const { box, rod, tube, mat } = kit;
  const add = (parent, part, x = 0, y = 0, z = 0) => {
    part.position.set(x, y, z);
    parent.add(part);
    return part;
  };
  const arm = add(group, new THREE.Group());
  arm.name = 'Mikrofonarm';

  const anchor = [-1.26, .22, -.46];
  const elbow = [-.98, 1.27, -.43];
  const wrist = [.03, 1.41, -.08];
  add(arm, box(.34, .075, .32, .035, mat.graphite), anchor[0], .038, anchor[2]);
  arm.add(rod([anchor[0], .065, anchor[2]], anchor, .083, mat.silver));

  // Both links have two separated members, as on a spring-balanced studio boom.
  const lower = (point, offset) => [point[0] + offset, point[1], point[2]];
  const upper = (point, offset) => [point[0], point[1] + offset, point[2]];
  for (const offset of [-.051, .051]) {
    arm.add(rod(lower(anchor, offset), lower(elbow, offset), .032, mat.graphite));
    arm.add(rod(upper(elbow, offset), upper(wrist, offset), .029, mat.graphite));
  }
  for (const [x, y, z] of [anchor, elbow, wrist]) {
    arm.add(rod([x, y, z - .066], [x, y, z + .063], .088, mat.graphite));
    arm.add(rod([x, y, z + .064], [x, y, z + .078], .055, mat.silver));
  }
  arm.add(rod(wrist, [.056, 1.182, -.103], .039, mat.silver));
  arm.add(tube([[-1.20, .08, -.48], [-1.16, .42, -.47], [-1.04, .95, -.47],
    [-.97, 1.24, -.48], [-.53, 1.27, -.33], [-.08, 1.32, -.2],
    [.110, 1.24, -.335], [.228, 1.055, -.441], [.192, .989, -.355]], .014, mat.ink));

  // An end-address microphone, with a rounded metal grille and a pivoting U-yoke.
  const mic = add(group, new THREE.Group(), .03, .933, -.054);
  mic.name = 'Studiomikrofon';
  mic.rotation.order = 'YXZ';
  mic.rotation.set(.16, -.49, 0, 'YXZ');
  const shell = (profile, material) => {
    const shape = profile.map(([z, radius]) => new THREE.Vector2(radius, z));
    const mesh = new THREE.Mesh(new THREE.LatheGeometry(shape, 40), material);
    mesh.rotation.x = Math.PI / 2;
    mic.add(mesh);
  };
  shell([[-.34, 0], [-.34, .103], [-.326, .127], [-.293, .149], [-.223, .158],
    [.047, .158], [.071, .154], [.073, 0]], mat.graphite);

  // A small tile of staggered stamped holes. Mipmapping keeps the grille quiet on phones.
  const size = 32;
  const pixels = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = ((x + (y < 16 ? 0 : 8)) % 16) - 7.5;
      const dy = y % 16 - 7.5;
      const rim = Math.min(1, Math.max(0, (Math.hypot(dx, dy) - 4.35) / 1.85));
      const shade = Math.round(74 + 165 * rim);
      pixels.set([shade, shade, shade, 255], (y * size + x) * 4);
    }
  }
  const perforations = new THREE.DataTexture(pixels, size, size, THREE.RGBAFormat);
  perforations.wrapS = perforations.wrapT = THREE.RepeatWrapping;
  perforations.repeat.set(27, 10);
  perforations.generateMipmaps = true;
  perforations.magFilter = THREE.LinearFilter;
  perforations.minFilter = THREE.LinearMipmapLinearFilter;
  perforations.needsUpdate = true;
  const grille = mat.silver.clone();
  grille.map = perforations;
  grille.roughness = .53;
  shell([[.065, 0], [.065, .148], [.08, .171], [.108, .18], [.239, .18],
    [.274, .174], [.301, .158], [.325, .135], [.348, .103], [.366, .063], [.375, .029], [.376, 0]], grille);
  shell([[.067, .154], [.073, .163], [.086, .165], [.094, .16]], mat.silver);
  shell([[-.35, 0], [-.35, .092], [-.343, .113], [-.332, .116]], mat.dark);

  mic.add(tube([[-.192, 0, -.095], [-.206, .107, -.095], [-.202, .201, -.095],
    [-.158, .238, -.095], [.158, .238, -.095], [.202, .201, -.095],
    [.206, .107, -.095], [.192, 0, -.095]], .023, mat.graphite));
  for (const side of [-1, 1]) {
    mic.add(rod([side * .145, 0, -.093], [side * .211, 0, -.093], .059, mat.silver));
  }

  const telephone = add(group, new THREE.Group(), .833, 0, .115);
  telephone.name = 'Bürotelefon';
  telephone.rotation.y = .20;
  add(telephone, box(1.05, .11, .85, .052, mat.dark), 0, .06, -.013);
  const deck = add(telephone, new THREE.Group(), 0, .166, 0);
  deck.rotation.x = .185;
  add(deck, box(1.12, .144, .90, .063, mat.chalk));

  // The continuous receiver swells into two earcups and rises clear of its cradle.
  const sections = [
    [0, .087, .064, .261], [.23, .089, .066, .252], [.30, .095, .073, .243],
    [.35, .113, .096, .229], [.391, .140, .123, .213], [.432, .144, .126, .210],
    [.493, .140, .122, .212], [.523, .129, .113, .213], [.538, .095, .088, .216],
    [.543, .045, .042, .216], [.544, 0, 0, .216],
  ];
  const stations = sections.slice(1).reverse().map(([x, ...rest]) => [-x, ...rest]).concat(sections);
  const vertices = [], indices = [], sides = 28;
  for (let i = 0; i < stations.length; i++) {
    const [x, depth, height, mid] = stations[i];
    for (let j = 0; j < sides; j++) {
      const angle = j * 2 * Math.PI / sides;
      const rounded = (n) => Math.sign(n) * Math.pow(Math.abs(n), .75);
      vertices.push(x, mid + height * rounded(Math.cos(angle)),
        -.246 + depth * rounded(Math.sin(angle)) + .028 * (Math.abs(x) / .544) ** 2);
      if (i === 0) continue;
      const a = (i - 1) * sides + j, b = (i - 1) * sides + (j + 1) % sides;
      indices.push(a, b, a + sides, b, b + sides, a + sides);
    }
  }
  const receiverShape = new THREE.BufferGeometry();
  receiverShape.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  receiverShape.setIndex(indices);
  receiverShape.computeVertexNormals();
  deck.add(new THREE.Mesh(receiverShape, mat.graphite));
  for (const x of [-.395, .395]) add(deck, box(.255, .067, .225, .032, mat.dark), x, .105, -.238);
  add(deck, box(.56, .017, .103, .015, mat.graphite), 0, .079, -.027);
  add(deck, box(.472, .01, .061, .012, mat.glass), -.017, .09, -.027);
  add(deck, box(.030, .012, .018, .006, mat.accent), .248, .09, -.026);

  const keyTemplate = box(.115, .026, .048, .011, mat.graphite);
  const keypad = new THREE.InstancedMesh(keyTemplate.geometry, mat.graphite, 12);
  const transform = new THREE.Matrix4();
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 3; col++) {
      transform.makeTranslation((col - 1) * .144, .085, .084 + row * .081);
      keypad.setMatrixAt(row * 3 + col, transform);
    }
  }
  deck.add(keypad);

  // The short coiled cord rests beside the phone and joins the left receiver cup.
  const wire = [[-.49, .41, -.168], [-.583, .355, -.205], [-.636, .137, -.245]];
  for (let i = 0; i <= 72; i++) {
    const phase = i * Math.PI / 4;
    wire.push([-.638 + .036 * Math.cos(phase), .052 + .028 * Math.sin(phase), -.218 + i * .0053]);
  }
  wire.push([-.593, .058, .204], [-.512, .077, .181]);
  const spring = new THREE.CatmullRomCurve3(wire.map(p => new THREE.Vector3(...p)));
  telephone.add(new THREE.Mesh(new THREE.TubeGeometry(spring, 160, .009, 6, false), mat.ink));
}
