import { ArrowHelper, Group, Vector3 } from 'three';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';

export const FLOW_STYLE = Object.freeze({
  trackWidth: 2.2,
  outlineExtra: 1,
  headLengthRatio: 0.32,
  headWidthRatio: 0.14,
  shaftLengthRatio: 1,
});

export function createStroke(points, { color, width = FLOW_STYLE.trackWidth, opacity = 1, depthTest = false, order = 5 } = {}) {
  const geometry = new LineSegmentsGeometry();
  geometry.setPositions(points);
  const group = new Group();
  for (const [strokeColor, strokeWidth, strokeOpacity, layer] of [
    ['#14262e', width + FLOW_STYLE.outlineExtra, Math.min(0.72, opacity), order],
    [color, width, opacity, order + 1],
  ]) {
    const material = new LineMaterial({ color: strokeColor, linewidth: strokeWidth, transparent: true, opacity: strokeOpacity, depthTest, depthWrite: false, toneMapped: false });
    const line = new LineSegments2(geometry, material);
    line.frustumCulled = false;
    line.renderOrder = layer;
    group.add(line);
  }
  return {
    group,
    set(nextPoints) {
      const starts = geometry.attributes.instanceStart;
      const ends = geometry.attributes.instanceEnd;
      for (let index = 0; index < nextPoints.length / 6; index += 1) {
        starts.setXYZ(index, ...nextPoints.subarray(index * 6, index * 6 + 3));
        ends.setXYZ(index, ...nextPoints.subarray(index * 6 + 3, index * 6 + 6));
      }
      starts.data.needsUpdate = true;
    },
    dispose() {
      group.removeFromParent();
      geometry.dispose();
      group.children.forEach(object => object.material.dispose());
    },
  };
}

export function createFlowArrow({ color = '#ffcf76', size = 0.09, depthTest = false, opacity = 1 } = {}) {
  const arrow = new ArrowHelper(
    new Vector3(1, 0, 0),
    new Vector3(),
    size * FLOW_STYLE.shaftLengthRatio,
    color,
    size * FLOW_STYLE.headLengthRatio,
    size * FLOW_STYLE.headWidthRatio,
  );
  arrow.line.material.transparent = true;
  arrow.line.material.opacity = Math.max(0.82, opacity);
  arrow.line.material.depthTest = depthTest;
  arrow.line.material.depthWrite = false;
  arrow.cone.material.transparent = true;
  arrow.cone.material.opacity = Math.max(0.9, opacity);
  arrow.cone.material.depthTest = depthTest;
  arrow.cone.material.depthWrite = false;
  arrow.line.renderOrder = 6;
  arrow.cone.renderOrder = 7;
  return arrow;
}

export function setFlowArrowPose(arrow, tip, direction, size) {
  arrow.position.copy(tip).addScaledVector(direction, -size * FLOW_STYLE.shaftLengthRatio);
  arrow.setDirection(direction);
  arrow.setLength(
    size * FLOW_STYLE.shaftLengthRatio,
    size * FLOW_STYLE.headLengthRatio,
    size * FLOW_STYLE.headWidthRatio,
  );
}

export function disposeFlowArrow(arrow) {
  arrow.removeFromParent();
  arrow.line.geometry.dispose();
  arrow.line.material.dispose();
  arrow.cone.geometry.dispose();
  arrow.cone.material.dispose();
}

// Moving heads intentionally use the same thin shaft + small cone language as the drone ArrowHelper overlays.
export function createFlowLines(curve, { color = '#ffcf76', count = 5, size = 0.09, speed = 0.16, track = true, depthTest = false, opacity = 1 } = {}) {
  const group = new Group();
  const strokes = [];
  if (track) {
    const points = curve.getPoints(100);
    const segments = [];
    for (let index = 1; index < points.length; index += 1) segments.push(...points[index - 1].toArray(), ...points[index].toArray());
    const stroke = createStroke(segments, { color, width: FLOW_STYLE.trackWidth, opacity: Math.min(opacity, 0.78), depthTest, order: 4 });
    strokes.push(stroke);
    group.add(stroke.group);
  }

  const direction = new Vector3(1, 0, 0);
  const position = new Vector3();
  const arrows = Array.from({ length: count }, () => {
    const arrow = createFlowArrow({ color, size, depthTest, opacity });
    group.add(arrow);
    return arrow;
  });

  return {
    group,
    update(time) {
      arrows.forEach((arrow, index) => {
        const u = ((time * speed + index / count) % 1 + 1) % 1;
        curve.getPointAt(u, position);
        curve.getTangentAt(u, direction).normalize();
        setFlowArrowPose(arrow, position, direction, size);
      });
    },
    dispose() {
      group.removeFromParent();
      strokes.forEach(stroke => stroke.dispose());
      arrows.forEach(disposeFlowArrow);
    },
  };
}
