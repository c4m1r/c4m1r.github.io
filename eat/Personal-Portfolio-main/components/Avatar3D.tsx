import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, Html } from '@react-three/drei';
import * as THREE from 'three';

const AvatarImage = () => {
  const groupRef = useRef<THREE.Group>(null);
  const [imgError, setImgError] = useState(false);

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle parallax look-at effect
      const targetX = state.pointer.x * 0.5;
      const targetY = state.pointer.y * 0.5;
      
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetX, 0.1);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -targetY, 0.1);
    }
  });

  return (
    <Float speed={2.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={groupRef}>
        {/* 
          Using Html to render the image as a DOM element within the 3D scene.
        */}
        <Html 
          transform 
          distanceFactor={6}
          position={[0, 0, 0]}
          style={{
            transformStyle: 'preserve-3d',
            pointerEvents: 'none',
            userSelect: 'none',
            width: '320px', 
            height: '320px'
          }}
        >
          <div className="w-full h-full flex items-center justify-center">
            {!imgError ? (
              <img 
                src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Man%20Technologist%20Light%20Skin%20Tone.png"
                alt="Avatar"
                className="w-full h-full object-contain filter drop-shadow-2xl"
                onError={() => {
                  console.warn("Avatar image failed to load, switching to fallback.");
                  setImgError(true);
                }}
                crossOrigin="anonymous"
              />
            ) : (
              // Fallback to text emoji if image fails
              <div className="text-[8rem] sm:text-[10rem] leading-none filter drop-shadow-2xl animate-pulse cursor-default">
                👨🏻‍💻
              </div>
            )}
          </div>
        </Html>
      </group>
    </Float>
  );
};

const SimpleShadow = () => {
  return (
     <mesh position={[0, -2.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.4, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.15} />
     </mesh>
  )
}

const Avatar3D: React.FC = () => {
  return (
    <div className="w-full h-full cursor-pointer touch-none">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} />
        <ambientLight intensity={1} />
        <AvatarImage />
        <SimpleShadow />
      </Canvas>
    </div>
  );
};

export default Avatar3D;