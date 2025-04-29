import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useSpring, animated } from '@react-spring/three';
import { AdaptiveDpr, AdaptiveEvents, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Üç boyutlu ışıklı parçacık
function Particle({ position, color }) {
  const mesh = useRef();
  const [hovered, setHover] = React.useState(false);
  
  // Hareket animasyonu
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    mesh.current.position.y = position[1] + Math.sin(time + position[0] * 10) * 0.5;
    mesh.current.rotation.x = time * 0.2;
    mesh.current.rotation.z = time * 0.1;
  });
  
  // Hover animasyonu
  const { scale } = useSpring({
    scale: hovered ? 1.4 : 1,
    config: { tension: 300, friction: 10 }
  });

  return (
    <animated.mesh 
      ref={mesh} 
      position={position} 
      scale={scale}
      onPointerOver={() => setHover(true)} 
      onPointerOut={() => setHover(false)}
    >
      <icosahedronGeometry args={[0.5, 0]} />
      <meshStandardMaterial 
        color={color} 
        emissive={color} 
        emissiveIntensity={0.5}
        roughness={0.5} 
        metalness={0.8} 
      />
    </animated.mesh>
  );
}

// Üç boyutlu arka plan gradient ışık efekti
function GradientLight() {
  const light = useRef();
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.5;
    light.current.position.x = Math.sin(t) * 10;
    light.current.position.z = Math.cos(t) * 10;
  });

  return (
    <>
      <pointLight 
        ref={light} 
        position={[0, 5, 5]} 
        intensity={5} 
        color="#00e5ff" 
      />
      <pointLight position={[-10, -5, -5]} intensity={3} color="#7c4dff" />
    </>
  );
}

// Parlayan arka plan ızgara
function Grid() {
  const gridRef = useRef();
  
  const uniforms = useMemo(() => ({
    time: { value: 0 },
    color: { value: new THREE.Color('#00e5ff') }
  }), []);
  
  useFrame(({ clock }) => {
    gridRef.current.material.uniforms.time.value = clock.getElapsedTime() * 0.5;
  });

  return (
    <mesh ref={gridRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
      <planeGeometry args={[40, 40, 20, 20]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={`
          varying vec3 vPosition;
          uniform float time;
          void main() {
            vPosition = position;
            vec3 pos = position;
            float dist = length(position.xz);
            pos.y += sin(dist * 0.5 - time * 2.0) * 0.5;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 color;
          uniform float time;
          varying vec3 vPosition;
          void main() {
            float dist = length(vPosition.xz);
            float pulse = sin(dist * 0.5 - time * 2.0) * 0.5 + 0.5;
            float grid = max(
              abs(mod(vPosition.x + 0.5, 2.0) - 1.0),
              abs(mod(vPosition.z + 0.5, 2.0) - 1.0)
            );
            float mask = smoothstep(0.9, 0.95, 1.0 - grid);
            vec3 finalColor = mix(vec3(0.1, 0.1, 0.2), color, pulse) * mask;
            gl_FragColor = vec4(finalColor, mask * 0.8);
          }
        `}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

// Ana üç boyutlu sahne
function Scene() {
  // Rastgele parçacıklar oluştur
  const particles = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 20
      ],
      color: i % 3 === 0 
        ? '#00e5ff'  // Turkuaz 
        : i % 3 === 1 
          ? '#f50057' // Pembe
          : '#7c4dff'  // Mor
    }));
  }, []);

  return (
    <>
      <GradientLight />
      <ambientLight intensity={0.2} />
      <fog attach="fog" args={['#080818', 10, 50]} />
      <Grid />
      {particles.map((props, i) => (
        <Particle key={i} {...props} />
      ))}
    </>
  );
}

// Dış bileşen - Canvas wrapper
export default function Background3D() {
  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      zIndex: -1 
    }}>
      <Canvas
        camera={{ position: [0, 5, 15], fov: 60 }}
        dpr={[1, 2]}
        gl={{ 
          antialias: true,
          alpha: true,
          logarithmicDepthBuffer: true,
        }}
      >
        <Scene />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          autoRotate 
          autoRotateSpeed={0.5} 
          rotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2} 
          minPolarAngle={Math.PI / 3}
        />
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
      </Canvas>
    </div>
  );
}