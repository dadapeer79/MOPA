import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text3D, Center } from '@react-three/drei';

export function FloatingNumber({ value, currency = '₹' }) {
  const ref = useRef();
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    ref.current.position.y = Math.sin(time) * 0.1;
    ref.current.rotation.y = Math.sin(time * 0.5) * 0.1;
  });

  return (
    <group ref={ref}>
      <Center>
        <Text3D
          font="/fonts/inter_bold.json"
          size={0.5}
          height={0.1}
          curveSegments={12}
        >
          {`${currency}${value.toLocaleString('en-IN')}`}
          <meshStandardMaterial 
            color="#00ffff"
            emissive="#003333"
            metalness={0.8}
            roughness={0.2}
          />
        </Text3D>
      </Center>
    </group>
  );
}