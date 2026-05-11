'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, Points } from '@react-three/drei';
import * as THREE from 'three';

function DataVizObject({ data = [0, 0, 0, 0] }) {
  const ref = useRef<THREE.Group>(null);
  
  const points = data.length === 0 ? [] : data.map((value, i) => {
    const angle = (i / data.length) * Math.PI * 2;
    const maxValue = Math.max(...data) || 1;
    const normalizedValue = value / maxValue;
    return new THREE.Vector3(
      Math.cos(angle) * 2,
      normalizedValue * 2,
      Math.sin(angle) * 2
    );
  });

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.005;
      const time = state.clock.getElapsedTime();
      ref.current.position.y = Math.sin(time) * 0.2;
    }
  });

  return (
    <group ref={ref}>
      {points.length > 0 && (
        <>
          <Line
            points={[...points, points[0]]}
            color="#00a0ff"
            lineWidth={2}
            transparent
            opacity={0.6}
          />
          {points.map((point, i) => (
            <Points key={i}>
              <pointsMaterial color="#00ffff" size={0.1} />
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={1}
                  array={new Float32Array([point.x, point.y, point.z])}
                  itemSize={3}
                />
              </bufferGeometry>
            </Points>
          ))}
        </>
      )}
    </group>
  );
}

type FloatingDataVizProps = {
  data?: number[] | null;
};

export function FloatingDataViz({ data }: FloatingDataVizProps) {
  // If data is undefined, null, or empty, provide default placeholder data
  const safeData = !data || data.length === 0 ? [0, 0, 0, 0] : data;
  
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 2, 8], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <DataVizObject data={safeData} />
      </Canvas>
    </div>
  );
}