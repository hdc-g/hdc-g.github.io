import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const vertexNames = ["0", "1", "2", "3", "4", "5"];
const edges = [
  { id: 0, vertices: [0, 1], uv: [[0, -1], [0, 1]] },
  { id: 1, vertices: [0, 2], uv: [[0, -1], [1, -1]] },
  { id: 2, vertices: [1, 2], uv: [[0, 1], [1, -1]] },
  { id: 3, vertices: [1, 3], uv: [[0, 1], [1, 1]] },
  { id: 4, vertices: [2, 3], uv: [[1, -1], [1, 1]] },
  { id: 5, vertices: [2, 4], uv: [[1, -1], [2, -1]] },
  { id: 6, vertices: [3, 4], uv: [[1, 1], [2, -1]] },
  { id: 7, vertices: [3, 5], uv: [[1, 1], [2, 1]] },
  { id: 8, vertices: [4, 5], uv: [[2, -1], [2, 1]] },
  { id: 9, vertices: [4, 1], uv: [[2, -1], [3, -1]] },
  { id: 10, vertices: [5, 1], uv: [[2, 1], [3, -1]] },
  { id: 11, vertices: [5, 0], uv: [[2, 1], [3, 1]] }
];

const triangles = [
  { id: 0, vertices: [1, 0, 2], edges: [1, 2, 0], uv: [[0, 1], [0, -1], [1, -1]] },
  { id: 1, vertices: [1, 2, 3], edges: [4, 3, 2], uv: [[0, 1], [1, -1], [1, 1]] },
  { id: 2, vertices: [3, 2, 4], edges: [5, 6, 4], uv: [[1, 1], [1, -1], [2, -1]] },
  { id: 3, vertices: [3, 4, 5], edges: [8, 7, 6], uv: [[1, 1], [2, -1], [2, 1]] },
  { id: 4, vertices: [5, 4, 1], edges: [9, 10, 8], uv: [[2, 1], [2, -1], [3, -1]] },
  { id: 5, vertices: [5, 1, 0], edges: [0, 11, 10], uv: [[2, 1], [3, -1], [3, 1]] }
];

const subscript = n => String(n).split("").map(d => "₀₁₂₃₄₅₆₇₈₉"[Number(d)]).join("");
const triLabel = n => `Δ${subscript(n)}`;
const edgeLabel = n => `ℓ${subscript(n)}`;
const triMath = n => `\\(\\Delta_{${n}}\\)`;
const edgeMath = n => `\\(\\ell_{${n}}\\)`;

const trianglesRow = document.getElementById("triangles-row");
const edgesRow = document.getElementById("edges-row");
const verticesRow = document.getElementById("vertices-row");
const simplicialMap = document.getElementById("simplicial-map");
const simplicialLevels = document.getElementById("simplicial-levels");

function typesetMath(elements = [simplicialMap]) {
  return window.MathJax?.typesetPromise
    ? window.MathJax.typesetPromise(elements)
    : Promise.resolve();
}

function setMathContent(element, tex) {
  window.MathJax?.typesetClear?.([element]);
  element.innerHTML = `\\(${tex}\\)`;
  void typesetMath([element]);
}

triangles.forEach(triangle => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "simplex triangle-simplex";
  button.dataset.triangle = triangle.id;
  button.setAttribute("aria-label", `Seleccionar el triángulo ${triLabel(triangle.id)}`);
  button.innerHTML = `<strong class="math-label">${triMath(triangle.id)}</strong>`;
  button.addEventListener("click", () => selectTriangle(triangle.id));
  trianglesRow.append(button);
});

edges.forEach(edge => {
  const node = document.createElement("button");
  node.type = "button";
  node.className = "simplex edge-simplex";
  node.dataset.edge = edge.id;
  node.innerHTML = `<span class="math-label">${edgeMath(edge.id)}</span>`;
  node.title = `${edgeLabel(edge.id)} = {${edge.vertices.join(", ")}}`;
  node.setAttribute("aria-label", `Seleccionar la arista ${edgeLabel(edge.id)}, con vértices ${edge.vertices.join(" y ")}`);
  node.addEventListener("click", () => selectEdge(edge.id));
  edgesRow.append(node);
});

vertexNames.forEach((name, id) => {
  const node = document.createElement("span");
  node.className = "simplex vertex-simplex";
  node.dataset.vertex = id;
  node.textContent = name;
  verticesRow.append(node);
});

const canvasHost = document.getElementById("mobius-canvas");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
camera.position.set(5.7, 4.5, 6.4);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
canvasHost.append(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 4.6;
controls.maxDistance = 14;
controls.target.set(0, 0, 0);

scene.add(new THREE.HemisphereLight(0xffffff, 0xdce8f2, 2.7));
const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
keyLight.position.set(4, 7, 5);
keyLight.castShadow = true;
scene.add(keyLight);
const rimLight = new THREE.DirectionalLight(0x8db7d9, 2.0);
rimLight.position.set(-5, -2, -4);
scene.add(rimLight);

const mobiusGroup = new THREE.Group();
mobiusGroup.rotation.x = -0.16;
mobiusGroup.rotation.z = 0.08;
scene.add(mobiusGroup);

function mobiusPoint(cellU, bandV) {
  const u = (cellU / 3) * Math.PI * 2;
  const v = bandV * 0.86;
  const radius = 2.45;
  return new THREE.Vector3(
    (radius + v * Math.cos(u / 2)) * Math.cos(u),
    v * Math.sin(u / 2),
    (radius + v * Math.cos(u / 2)) * Math.sin(u)
  );
}

function makeTriangularPatch(uvCorners, subdivisions = 13) {
  const positions = [];
  const indices = [];
  const rowStart = [];
  let cursor = 0;

  for (let i = 0; i <= subdivisions; i += 1) {
    rowStart.push(cursor);
    for (let j = 0; j <= subdivisions - i; j += 1) {
      const a = i / subdivisions;
      const b = j / subdivisions;
      const c = 1 - a - b;
      const u = a * uvCorners[0][0] + b * uvCorners[1][0] + c * uvCorners[2][0];
      const v = a * uvCorners[0][1] + b * uvCorners[1][1] + c * uvCorners[2][1];
      const point = mobiusPoint(u, v);
      positions.push(point.x, point.y, point.z);
      cursor += 1;
    }
  }

  for (let i = 0; i < subdivisions; i += 1) {
    const rowLength = subdivisions + 1 - i;
    for (let j = 0; j < rowLength - 1; j += 1) {
      const a = rowStart[i] + j;
      const b = rowStart[i] + j + 1;
      const c = rowStart[i + 1] + j;
      indices.push(a, c, b);
      if (j < rowLength - 2) {
        const d = rowStart[i + 1] + j + 1;
        indices.push(b, c, d);
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

const triangleMeshes = [];
const baseTriangleColors = [0x527ea3, 0x6b93b4, 0x365f7b, 0x789bb8, 0x4f728c, 0x294f68];
triangles.forEach(triangle => {
  const material = new THREE.MeshPhysicalMaterial({
    color: baseTriangleColors[triangle.id],
    roughness: 0.7,
    metalness: 0,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9,
    clearcoat: 0.15
  });
  const mesh = new THREE.Mesh(makeTriangularPatch(triangle.uv), material);
  mesh.userData.triangleId = triangle.id;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  triangleMeshes.push(mesh);
  mobiusGroup.add(mesh);
});

function curveFromUV(uvPair) {
  const points = [];
  for (let i = 0; i <= 32; i += 1) {
    const t = i / 32;
    const u = THREE.MathUtils.lerp(uvPair[0][0], uvPair[1][0], t);
    const v = THREE.MathUtils.lerp(uvPair[0][1], uvPair[1][1], t);
    points.push(mobiusPoint(u, v));
  }
  return new THREE.CatmullRomCurve3(points);
}

const edgeMeshes = [];
edges.forEach(edge => {
  const material = new THREE.MeshStandardMaterial({ color: 0x1f3b52, roughness: 0.5 });
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curveFromUV(edge.uv), 32, 0.027, 6, false), material);
  tube.userData.edgeId = edge.id;
  edgeMeshes.push(tube);
  mobiusGroup.add(tube);
});

const vertexMeshes = [];
const vertexUV = [[0, -1], [0, 1], [1, -1], [1, 1], [2, -1], [2, 1]];
vertexUV.forEach((uv, id) => {
  const material = new THREE.MeshStandardMaterial({ color: 0xfdfbf5, roughness: 0.38 });
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.095, 20, 14), material);
  sphere.position.copy(mobiusPoint(uv[0], uv[1]));
  sphere.userData.vertexId = id;
  vertexMeshes.push(sphere);
  mobiusGroup.add(sphere);
});

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let pointerDown = null;

renderer.domElement.addEventListener("pointerdown", event => {
  pointerDown = { x: event.clientX, y: event.clientY };
});

renderer.domElement.addEventListener("pointerup", event => {
  if (!pointerDown || Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y) > 5) return;
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const edgeHit = raycaster.intersectObjects(edgeMeshes, false)[0];
  const triangleHit = raycaster.intersectObjects(triangleMeshes, false)[0];
  if (edgeHit && (!triangleHit || edgeHit.distance < triangleHit.distance + 0.08)) {
    selectEdge(edgeHit.object.userData.edgeId);
  } else if (triangleHit) {
    selectTriangle(triangleHit.object.userData.triangleId);
  } else {
    resetSelection();
  }
});

simplicialMap.addEventListener("click", event => {
  if (!event.target.closest(".simplex")) resetSelection();
});

function drawFaceLinks(selection) {
  const map = simplicialLevels;
  const svg = document.getElementById("face-links");
  const mapRect = map.getBoundingClientRect();
  const placedLabelBoxes = [];
  svg.innerHTML = `<defs><marker id="face-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M 0 0 L 8 4 L 0 8 z"></path></marker></defs>`;

  const bounds = element => {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left - mapRect.left + rect.width / 2,
      top: rect.top - mapRect.top,
      bottom: rect.bottom - mapRect.top,
      width: rect.width
    };
  };

  const pointOnBezier = (p0, p1, p2, p3, t) => {
    const mt = 1 - t;
    return {
      x: mt ** 3 * p0.x + 3 * mt ** 2 * t * p1.x + 3 * mt * t ** 2 * p2.x + t ** 3 * p3.x,
      y: mt ** 3 * p0.y + 3 * mt ** 2 * t * p1.y + 3 * mt * t ** 2 * p2.y + t ** 3 * p3.y
    };
  };

  const connect = (from, to, label, { fanIndex = 0, fanCount = 1, labelT = 0.52 } = {}) => {
    const fromBounds = bounds(from);
    const toBounds = bounds(to);
    const lane = fanIndex - (fanCount - 1) / 2;
    const laneSpacing = fanCount === 3 ? 22 : 20;
    const start = { x: fromBounds.x + lane * laneSpacing, y: fromBounds.bottom + 4 };
    const end = { x: toBounds.x, y: toBounds.top - 7 };
    const gap = Math.max(24, end.y - start.y);
    const control1 = { x: start.x, y: start.y + Math.min(48, gap * 0.48) };
    const control2 = { x: end.x, y: end.y - Math.min(42, gap * 0.42) };
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", `M ${start.x} ${start.y} C ${control1.x} ${control1.y}, ${control2.x} ${control2.y}, ${end.x} ${end.y}`);
    path.setAttribute("marker-end", "url(#face-arrow)");
    svg.append(path);

    const labelPoint = pointOnBezier(start, control1, control2, end, labelT);
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    const labelOffset = lane < 0 ? -8 : 8;
    const labelX = labelPoint.x + labelOffset;
    text.setAttribute("x", String(labelX));
    text.setAttribute("text-anchor", lane < 0 ? "end" : "start");
    text.setAttribute("dominant-baseline", "central");
    text.textContent = label;
    svg.append(text);

    const candidateOffsets = [
      [0, 0], [0, -18], [0, 18],
      [-18, 0], [18, 0],
      [-18, -18], [18, -18], [-18, 18], [18, 18],
      [0, -36], [0, 36], [-36, 0], [36, 0],
      [-36, -36], [36, -36], [-36, 36], [36, 36],
      [0, -54], [0, 54]
    ];
    for (const [offsetX, offsetY] of candidateOffsets) {
      text.setAttribute("x", String(labelX + offsetX));
      text.setAttribute("y", String(labelPoint.y + offsetY));
      const box = text.getBBox();
      const overlaps = placedLabelBoxes.some(placed =>
        box.x < placed.x + placed.width + 6 &&
        box.x + box.width + 6 > placed.x &&
        box.y < placed.y + placed.height + 5 &&
        box.y + box.height + 5 > placed.y
      );
      if (!overlaps || offsetY === 54) {
        placedLabelBoxes.push({ x: box.x, y: box.y, width: box.width, height: box.height });
        break;
      }
    }
  };

  const connectEdgeToVertices = (edgeId, groupIndex = 0) => {
    const edgeNode = document.querySelector(`[data-edge="${edgeId}"]`);
    edges[edgeId].vertices.forEach((vertexId, vertexPosition) => {
      const vertexNode = document.querySelector(`[data-vertex="${vertexId}"]`);
      connect(edgeNode, vertexNode, `d${subscript(1 - vertexPosition)}`, {
        fanIndex: vertexPosition,
        fanCount: 2,
        labelT: 0.42 + vertexPosition * 0.18 + groupIndex * 0.035
      });
    });
  };

  if (selection.type === "edge") {
    connectEdgeToVertices(selection.id);
    return;
  }

  const triangle = triangles[selection.id];
  const triNode = document.querySelector(`[data-triangle="${triangle.id}"]`);
  triangle.edges.forEach((edgeId, faceIndex) => {
    const edgeNode = document.querySelector(`[data-edge="${edgeId}"]`);
    connect(triNode, edgeNode, `d${subscript(faceIndex)}`, {
      fanIndex: faceIndex,
      fanCount: 3,
      labelT: 0.38 + faceIndex * 0.12
    });
    connectEdgeToVertices(edgeId, faceIndex);
  });
}

let currentSelection = null;

function clearSelectionClasses() {
  simplicialMap.classList.add("has-selection");
  document.querySelectorAll(".simplex").forEach(node => node.classList.remove("is-selected", "is-related"));
}

function paintGeometry(selectedTriangle, selectedEdges, selectedVertices) {
  triangleMeshes.forEach((mesh, meshId) => {
    const selected = meshId === selectedTriangle;
    mesh.material.color.setHex(selected ? 0x2f76b7 : baseTriangleColors[meshId]);
    mesh.material.opacity = selected ? 1 : 0.88;
    mesh.material.emissive.setHex(selected ? 0x0b3557 : 0x000000);
    mesh.material.emissiveIntensity = selected ? 0.2 : 0;
  });
  edgeMeshes.forEach((mesh, edgeId) => {
    const selected = selectedEdges.includes(edgeId);
    mesh.material.color.setHex(selected ? 0x0066cc : 0x1f3b52);
    mesh.material.emissive.setHex(selected ? 0x073c73 : 0x000000);
    mesh.material.emissiveIntensity = selected ? 0.55 : 0;
  });
  vertexMeshes.forEach((mesh, vertexId) => {
    const selected = selectedVertices.includes(vertexId);
    mesh.material.color.setHex(selected ? 0xdbeafe : 0xffffff);
    mesh.material.emissive.setHex(selected ? 0x0066cc : 0x000000);
    mesh.material.emissiveIntensity = selected ? 0.3 : 0;
    mesh.scale.setScalar(selected ? 1.55 : 1);
  });
}

function resetSelection() {
  currentSelection = null;
  simplicialMap.classList.remove("has-selection");
  document.querySelectorAll(".simplex").forEach(node => node.classList.remove("is-selected", "is-related"));
  document.getElementById("face-links").innerHTML = "";
  document.getElementById("selected-simplex").textContent = "Ninguno";
  document.getElementById("selected-faces").textContent = "Elige un símplice";
  document.getElementById("selected-vertices").textContent = "para ver sus caras";
  paintGeometry(null, [], []);
}

function selectTriangle(id) {
  const triangle = triangles[id];
  currentSelection = { type: "triangle", id };
  clearSelectionClasses();
  document.querySelector(`[data-triangle="${id}"]`).classList.add("is-selected");
  triangle.edges.forEach(edgeId => document.querySelector(`[data-edge="${edgeId}"]`).classList.add("is-related"));
  triangle.vertices.forEach(vertexId => document.querySelector(`[data-vertex="${vertexId}"]`).classList.add("is-related"));

  setMathContent(document.getElementById("selected-simplex"), `\\Delta_{${id}}`);
  setMathContent(
    document.getElementById("selected-faces"),
    triangle.edges.map((edgeId, i) => `d_{${i}} = \\ell_{${edgeId}}`).join(" \\;\\cdot\\; ")
  );
  setMathContent(
    document.getElementById("selected-vertices"),
    `\\{${triangle.vertices.slice().sort((a, b) => a - b).join(", ")}\\}`
  );

  paintGeometry(id, triangle.edges, triangle.vertices);
  requestAnimationFrame(() => drawFaceLinks(currentSelection));
}

function selectEdge(id) {
  const edge = edges[id];
  currentSelection = { type: "edge", id };
  clearSelectionClasses();
  document.querySelector(`[data-edge="${id}"]`).classList.add("is-selected");
  edge.vertices.forEach(vertexId => document.querySelector(`[data-vertex="${vertexId}"]`).classList.add("is-related"));

  setMathContent(document.getElementById("selected-simplex"), `\\ell_{${id}}`);
  setMathContent(document.getElementById("selected-faces"), `d_1 = ${edge.vertices[0]}`);
  setMathContent(document.getElementById("selected-vertices"), `d_0 = ${edge.vertices[1]}`);

  paintGeometry(null, [id], edge.vertices);
  requestAnimationFrame(() => drawFaceLinks(currentSelection));
}

function resize() {
  const width = canvasHost.clientWidth;
  const height = canvasHost.clientHeight;
  const aspect = width / height;
  renderer.setSize(width, height, false);
  camera.aspect = aspect;
  camera.fov = aspect < 1
    ? THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(20)) / aspect))
    : 40;
  camera.updateProjectionMatrix();
  if (currentSelection) drawFaceLinks(currentSelection);
}

new ResizeObserver(resize).observe(canvasHost);
new ResizeObserver(() => {
  if (currentSelection) requestAnimationFrame(() => drawFaceLinks(currentSelection));
}).observe(simplicialLevels);
window.addEventListener("resize", resize);

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

resize();
resetSelection();
window.addEventListener("load", () => void typesetMath());
animate();
