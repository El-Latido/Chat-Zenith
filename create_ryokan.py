import os

code = """
import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Outlines, TransformControls, useTexture } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

function buildMergedGeometry(configs: any[]) {
    const geos = configs.map(c => {
        let geo;
        if (c.type === 'box') geo = new THREE.BoxGeometry(...(c.args || []));
        else if (c.type === 'plane') geo = new THREE.PlaneGeometry(...(c.args || []));
        else if (c.type === 'cylinder') geo = new THREE.CylinderGeometry(...(c.args || []));
        else if (c.type === 'sphere') geo = new THREE.SphereGeometry(...(c.args || []));
        else geo = new THREE.BoxGeometry();

        const mat = new THREE.Matrix4();
        mat.compose(
            c.position ? new THREE.Vector3(...c.position) : new THREE.Vector3(),
            c.rotation ? new THREE.Quaternion().setFromEuler(new THREE.Euler(...c.rotation)) : new THREE.Quaternion(),
            c.scale ? new THREE.Vector3(...c.scale) : new THREE.Vector3(1, 1, 1)
        );
        geo.applyMatrix4(mat);
        return geo;
    });
    return mergeGeometries(geos);
}

function SakuraPetals() {
  const count = 300;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 40;
      const y = Math.random() * 15 + 2;
      const z = (Math.random() - 0.5) * 40;
      temp.push({ position: new THREE.Vector3(x, y, z), speed: Math.random() * 0.02 + 0.01, phase: Math.random() * Math.PI * 2 });
    }
    return temp;
  }, []);

  useFrame(() => {
    particles.forEach((particle, i) => {
      particle.position.y -= particle.speed;
      particle.position.x += Math.sin(particle.position.y * 2 + particle.phase) * 0.02;
      particle.position.z += Math.cos(particle.position.y * 2 + particle.phase) * 0.02;
      if (particle.position.y < 0) {
        particle.position.y = 20;
      }
      dummy.position.copy(particle.position);
      dummy.rotation.set(particle.phase + particle.position.y, particle.phase, 0);
      dummy.scale.setScalar(0.2);
      dummy.updateMatrix();
      mesh.current?.setMatrixAt(i, dummy.matrix);
    });
    if (mesh.current) mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} castShadow>
      <planeGeometry args={[0.2, 0.2]} />
      <meshBasicMaterial color="#ffb7c5" side={THREE.DoubleSide} transparent opacity={0.9} />
    </instancedMesh>
  );
}

function SteamParticles() {
  const count = 100;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 20;
      const y = Math.random() * 4;
      const z = (Math.random() - 0.5) * 20;
      temp.push({ position: new THREE.Vector3(x, y, z), speed: Math.random() * 0.01 + 0.005, phase: Math.random() * Math.PI * 2 });
    }
    return temp;
  }, []);

  useFrame(() => {
    particles.forEach((particle, i) => {
      particle.position.y += particle.speed;
      particle.position.x += Math.sin(particle.position.y + particle.phase) * 0.01;
      if (particle.position.y > 6) {
        particle.position.y = 0;
      }
      dummy.position.copy(particle.position);
      const scale = 1 + particle.position.y * 0.8;
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      mesh.current?.setMatrixAt(i, dummy.matrix);
    });
    if (mesh.current) {
        mesh.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} position={[0,0.5,0]}>
      <sphereGeometry args={[0.8, 8, 8]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.04} depthWrite={false} />
    </instancedMesh>
  );
}

function Avatars() {
    // Matching positions from the image: in the pool, on the rocks, near the edge
    const positions = [
        [-6, -0.2, 2], [-4, -0.2, 4], [2, -0.2, 5], [5, -0.2, 3], // In water
        [-8, 0.5, 0], [7, 0.5, -2], [-2, 0.5, 8], [0, 0.5, 8], // On edge rocks
        [-10, 1.5, -2], [4, 0.5, -5] // Further back
    ];
    
    return (
        <group>
            {positions.map((pos, i) => (
                <group key={i} position={pos as any}>
                    {/* Body (Bathing suit colors) */}
                    <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
                        <cylinderGeometry args={[0.2, 0.2, 0.8]} />
                        <meshStandardMaterial color={['#222222', '#dd2222', '#22dd22', '#2222dd', '#ffffff'][i % 5]} roughness={0.8} />
                    </mesh>
                    {/* Head */}
                    <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
                        <sphereGeometry args={[0.15]} />
                        <meshStandardMaterial color="#ffccaa" roughness={0.5} />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

// Procedural textures to mimic the photo without external assets
function useRealisticTextures() {
    return useMemo(() => {
        const createTex = (type: string) => {
            const c = document.createElement('canvas');
            c.width = 512; c.height = 512;
            const ctx = c.getContext('2d')!;
            
            if (type === 'stone_path') {
                ctx.fillStyle = '#3a3d40';
                ctx.fillRect(0, 0, 512, 512);
                ctx.strokeStyle = '#222';
                ctx.lineWidth = 4;
                for(let i=0; i<80; i++) {
                    ctx.fillStyle = `hsl(210, 5%, ${Math.random() * 15 + 20}%)`;
                    ctx.beginPath();
                    const cx = Math.random() * 512;
                    const cy = Math.random() * 512;
                    const r = Math.random() * 30 + 20;
                    ctx.arc(cx, cy, r, 0, Math.PI*2);
                    ctx.fill();
                    ctx.stroke();
                }
            } else if (type === 'shoji') {
                ctx.fillStyle = '#fff9f0';
                ctx.fillRect(0, 0, 512, 512);
                ctx.strokeStyle = '#1a1008';
                ctx.lineWidth = 6;
                for(let i=0; i<=512; i+=64) {
                    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke(); // vertical
                    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke(); // horizontal
                }
            } else if (type === 'wood_dark') {
                ctx.fillStyle = '#1c130d';
                ctx.fillRect(0, 0, 512, 512);
                ctx.fillStyle = '#2a1d14';
                for(let i=0; i<300; i++) {
                    ctx.fillRect(0, Math.random()*512, 512, Math.random()*3+1);
                }
            } else if (type === 'roof_tile') {
                ctx.fillStyle = '#1a1c1e';
                ctx.fillRect(0, 0, 512, 512);
                ctx.strokeStyle = '#0d0e0f';
                ctx.lineWidth = 4;
                for(let i=0; i<=512; i+=32) {
                    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke();
                }
            } else if (type === 'rock') {
                ctx.fillStyle = '#444';
                ctx.fillRect(0, 0, 512, 512);
                for(let i=0; i<1000; i++) {
                    ctx.fillStyle = Math.random() > 0.5 ? '#333' : '#555';
                    ctx.fillRect(Math.random()*512, Math.random()*512, Math.random()*10+2, Math.random()*10+2);
                }
            }
            
            const tex = new THREE.CanvasTexture(c);
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            if (type === 'shoji') tex.repeat.set(4, 2);
            else tex.repeat.set(8, 8);
            return tex;
        };

        return {
            stonePath: createTex('stone_path'),
            shoji: createTex('shoji'),
            woodDark: createTex('wood_dark'),
            roofTile: createTex('roof_tile'),
            rock: createTex('rock')
        };
    }, []);
}

export function RyokanNeo({ item, isExplore, onSelect, onTransformEnd, isSelected, toolMode }: any) {
    const parentGroupRef = useRef<THREE.Group>(null);
    const tex = useRealisticTextures();

    return (
        <group 
            ref={parentGroupRef} 
            position={item.position as [number, number, number]} 
            rotation={item.rotation as [number, number, number]} 
            onClick={(e) => { if (!isExplore) { e.stopPropagation(); onSelect(item.id); } }}
        >
            <RigidBody type="fixed" colliders="trimesh">
                {/* --- 1. MAIN HOUSE (Center-Right, Elevated) --- */}
                <group position={[10, 2, -12]}>
                    {/* Elevated Foundation */}
                    <mesh position={[0, -1, 0]} castShadow receiveShadow>
                        <boxGeometry args={[32, 2, 22]} />
                        <meshStandardMaterial map={tex.rock} roughness={0.9} />
                    </mesh>

                    {/* Deck / Terrace */}
                    <mesh position={[0, 0.1, 8]} castShadow receiveShadow>
                        <boxGeometry args={[28, 0.2, 12]} />
                        <meshStandardMaterial map={tex.woodDark} roughness={0.8} />
                    </mesh>
                    
                    {/* First Floor Interior */}
                    <group position={[0, 0.2, 0]}>
                        <mesh position={[0, 0, 0]} receiveShadow>
                            <boxGeometry args={[26, 0.1, 14]} />
                            <meshStandardMaterial color="#d4c3a3" roughness={0.9} /> {/* Tatami base */}
                        </mesh>
                        {/* Chabudai (Low Tables) & Cushions */}
                        <mesh position={[-6, 0.3, 2]} castShadow><boxGeometry args={[3, 0.4, 2]} /><meshStandardMaterial map={tex.woodDark} /></mesh>
                        <mesh position={[-6, 0.1, 4]} castShadow><boxGeometry args={[1, 0.1, 1]} /><meshStandardMaterial color="#333" /></mesh>
                        <mesh position={[-6, 0.1, 0]} castShadow><boxGeometry args={[1, 0.1, 1]} /><meshStandardMaterial color="#333" /></mesh>
                        
                        <mesh position={[4, 0.3, 0]} castShadow><boxGeometry args={[4, 0.4, 2.5]} /><meshStandardMaterial map={tex.woodDark} /></mesh>
                        
                        {/* Sofa Area */}
                        <mesh position={[10, 0.5, 4]} castShadow><boxGeometry args={[4, 0.8, 2]} /><meshStandardMaterial color="#ddd" /></mesh>
                        <mesh position={[10, 0.1, 4]} castShadow><boxGeometry args={[5, 0.05, 4]} /><meshStandardMaterial color="#554433" /></mesh>
                    </group>

                    {/* First Floor Walls & Shoji */}
                    <mesh position={[-13, 2.2, 0]} castShadow receiveShadow>
                        <boxGeometry args={[0.5, 4.4, 14]} />
                        <meshStandardMaterial map={tex.woodDark} roughness={0.8} />
                    </mesh>
                    <mesh position={[13, 2.2, 0]} castShadow receiveShadow>
                        <boxGeometry args={[0.5, 4.4, 14]} />
                        <meshStandardMaterial map={tex.woodDark} roughness={0.8} />
                    </mesh>
                    {/* Back Wall */}
                    <mesh position={[0, 2.2, -7]} castShadow receiveShadow>
                        <boxGeometry args={[26, 4.4, 0.5]} />
                        <meshStandardMaterial map={tex.woodDark} roughness={0.8} />
                    </mesh>
                    {/* Glowing Shoji Panels (Front & Sides) */}
                    <mesh position={[0, 2.2, 7]} castShadow receiveShadow>
                        <boxGeometry args={[26, 4.4, 0.1]} />
                        <meshStandardMaterial map={tex.shoji} emissive="#ffddaa" emissiveIntensity={1.2} transparent opacity={0.9} />
                    </mesh>

                    {/* Mid Roof (Between floors) */}
                    <mesh position={[0, 4.8, 2]} castShadow receiveShadow>
                        <boxGeometry args={[34, 0.8, 26]} />
                        <meshStandardMaterial map={tex.roofTile} roughness={0.9} />
                    </mesh>

                    {/* Second Floor */}
                    <group position={[0, 5.2, -2]}>
                        {/* Second Floor Floor */}
                        <mesh position={[0, 0, 0]} castShadow receiveShadow>
                            <boxGeometry args={[24, 0.2, 14]} />
                            <meshStandardMaterial map={tex.woodDark} roughness={0.8} />
                        </mesh>
                        
                        {/* Glass Balcony */}
                        <mesh position={[0, 1.2, 8]} castShadow receiveShadow>
                            <boxGeometry args={[24, 2.4, 0.1]} />
                            <meshPhysicalMaterial color="#aaddff" transmission={0.95} roughness={0.05} ior={1.5} transparent opacity={1} />
                        </mesh>
                        <mesh position={[-12, 1.2, 4]} castShadow receiveShadow>
                            <boxGeometry args={[0.1, 2.4, 8]} />
                            <meshPhysicalMaterial color="#aaddff" transmission={0.95} roughness={0.05} ior={1.5} transparent opacity={1} />
                        </mesh>
                        <mesh position={[12, 1.2, 4]} castShadow receiveShadow>
                            <boxGeometry args={[0.1, 2.4, 8]} />
                            <meshPhysicalMaterial color="#aaddff" transmission={0.95} roughness={0.05} ior={1.5} transparent opacity={1} />
                        </mesh>

                        {/* Second Floor Room */}
                        <mesh position={[0, 2, -1]} castShadow receiveShadow>
                            <boxGeometry args={[18, 4, 10]} />
                            <meshStandardMaterial map={tex.woodDark} roughness={0.8} />
                        </mesh>
                        {/* Second Floor Shoji */}
                        <mesh position={[0, 2, 4.1]} castShadow receiveShadow>
                            <boxGeometry args={[18, 4, 0.1]} />
                            <meshStandardMaterial map={tex.shoji} emissive="#ffddaa" emissiveIntensity={1.5} transparent opacity={0.9} />
                        </mesh>
                        
                        {/* Main Roof */}
                        <mesh position={[0, 5.5, 0]} castShadow receiveShadow>
                            <coneGeometry args={[16, 6, 4]} />
                            <meshStandardMaterial map={tex.roofTile} roughness={0.9} />
                        </mesh>
                    </group>
                </group>

                {/* --- 2. SAUNA BUILDING (Far Right) --- */}
                <group position={[32, 1, -15]}>
                    <mesh position={[0, 2, 0]} castShadow receiveShadow>
                        <boxGeometry args={[10, 4, 10]} />
                        <meshStandardMaterial map={tex.woodDark} roughness={0.9} />
                    </mesh>
                    {/* Steamed Window */}
                    <mesh position={[0, 2, 5.1]} castShadow receiveShadow>
                        <boxGeometry args={[8, 3, 0.1]} />
                        <meshPhysicalMaterial color="#ffffff" transmission={0.4} roughness={0.8} ior={1.4} transparent opacity={0.8} />
                    </mesh>
                    <mesh position={[0, 5, 0]} castShadow receiveShadow>
                        <coneGeometry args={[8, 3, 4]} />
                        <meshStandardMaterial map={tex.roofTile} roughness={0.9} />
                    </mesh>
                    {/* Small Hot Tub next to sauna */}
                    <mesh position={[-8, 0, 4]} receiveShadow>
                        <boxGeometry args={[6, 1, 6]} />
                        <meshStandardMaterial map={tex.woodDark} />
                    </mesh>
                    <mesh position={[-8, 0.8, 4]} rotation={[-Math.PI/2, 0, 0]}>
                        <planeGeometry args={[5, 5]} />
                        <meshPhysicalMaterial color="#00ffff" emissive="#0088cc" emissiveIntensity={0.5} transmission={0.9} roughness={0.1} />
                    </mesh>
                </group>

                {/* --- 3. WATERFALLS (Top Left) --- */}
                <group position={[-25, 0, -20]}>
                    {/* Rocks */}
                    <mesh position={[0, 6, 0]} castShadow receiveShadow>
                        <boxGeometry args={[15, 12, 10]} />
                        <meshStandardMaterial map={tex.rock} roughness={1} />
                    </mesh>
                    <mesh position={[5, 12, -5]} castShadow receiveShadow>
                        <boxGeometry args={[20, 10, 10]} />
                        <meshStandardMaterial map={tex.rock} roughness={1} />
                    </mesh>
                    
                    {/* Water Falls (Glowing Cyan) */}
                    <mesh position={[2, 9, 5.1]} rotation={[0, 0, -0.1]}>
                        <planeGeometry args={[6, 12]} />
                        <meshPhysicalMaterial color="#aaddff" emissive="#00aaff" emissiveIntensity={1} transmission={0.9} roughness={0.1} />
                    </mesh>
                    <mesh position={[0, 3, 5.2]} rotation={[0.2, 0, 0]}>
                        <planeGeometry args={[8, 8]} />
                        <meshPhysicalMaterial color="#aaddff" emissive="#00aaff" emissiveIntensity={1} transmission={0.9} roughness={0.1} />
                    </mesh>
                    <pointLight position={[2, 6, 8]} color="#00ffff" intensity={2} distance={20} />
                </group>

                {/* --- 4. ONSEN (Hot Spring, Bottom Left) --- */}
                <group position={[-8, 0, 8]}>
                    {/* Rocky Edge Base */}
                    <mesh position={[0, -0.5, 0]} receiveShadow>
                        <cylinderGeometry args={[18, 18, 1, 32]} />
                        <meshStandardMaterial map={tex.rock} roughness={1} />
                    </mesh>
                    
                    {/* Water */}
                    <mesh position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                        <circleGeometry args={[16, 32]} />
                        <meshPhysicalMaterial color="#00ffff" emissive="#00aaff" emissiveIntensity={0.3} transmission={0.95} roughness={0.0} ior={1.33} thickness={3} clearcoat={1} transparent opacity={0.9} />
                    </mesh>

                    {/* Surrounding Rocks */}
                    {Array.from({ length: 24 }).map((_, i) => {
                        const angle = (i / 24) * Math.PI * 2;
                        const r = 16.5;
                        return (
                            <mesh key={`rock-${i}`} position={[Math.cos(angle)*r, 0.5, Math.sin(angle)*r]} rotation={[Math.random(), Math.random(), 0]} castShadow receiveShadow>
                                <dodecahedronGeometry args={[1.5 + Math.random(), 1]} />
                                <meshStandardMaterial map={tex.rock} roughness={1} color={Math.random() > 0.5 ? '#666' : '#556b2f'} /> {/* Some mossy rocks */}
                            </mesh>
                        )
                    })}

                    {/* Cyan Neon Edge following the path curve (approximate with torus segments or boxes) */}
                    {Array.from({ length: 32 }).map((_, i) => {
                        const angle = (i / 32) * Math.PI * 2;
                        const r = 19; // Further out for the path neon
                        return (
                            <mesh key={`neon-${i}`} position={[Math.cos(angle)*r, 0.1, Math.sin(angle)*r]} rotation={[0, -angle, 0]}>
                                <boxGeometry args={[4, 0.1, 0.2]} />
                                <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={3} />
                            </mesh>
                        )
                    })}
                </group>

                {/* --- 5. STONE DRAGON (Center) --- */}
                <group position={[-4, 0.5, -4]}>
                    {/* Base Rock */}
                    <mesh position={[0, 1, 0]} castShadow receiveShadow>
                        <dodecahedronGeometry args={[3, 1]} />
                        <meshStandardMaterial map={tex.rock} color="#4a5e3d" roughness={1} />
                    </mesh>
                    {/* Dragon Body (Abstracted with spheres/cylinders) */}
                    <mesh position={[0, 3, 0]} castShadow receiveShadow><sphereGeometry args={[1.5]} /><meshStandardMaterial map={tex.rock} color="#3a4e2d" roughness={1} /></mesh>
                    <mesh position={[2, 2.5, 0]} castShadow receiveShadow><cylinderGeometry args={[0.8, 1, 3]} rotation={[0, 0, Math.PI/4]} /><meshStandardMaterial map={tex.rock} color="#3a4e2d" roughness={1} /></mesh>
                    <mesh position={[-2, 4, 1]} castShadow receiveShadow><boxGeometry args={[1.5, 2, 2.5]} /><meshStandardMaterial map={tex.rock} color="#3a4e2d" roughness={1} /></mesh>
                    {/* Glowing Eyes & Mouth */}
                    <mesh position={[-2.5, 4.5, 2.1]}><sphereGeometry args={[0.2]} /><meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={5} /></mesh>
                    <mesh position={[-1.5, 4.5, 2.1]}><sphereGeometry args={[0.2]} /><meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={5} /></mesh>
                    <pointLight position={[-2, 4, 3]} color="#00ffff" intensity={3} distance={15} />
                </group>

                {/* --- 6. SAKURA TREES & FLORA --- */}
                {/* Main Giant Sakura (Behind Dragon) */}
                <group position={[-12, 1, -12]}>
                    <mesh position={[0, 6, 0]} castShadow receiveShadow><cylinderGeometry args={[1.5, 2, 12]} /><meshStandardMaterial map={tex.woodDark} roughness={1} /></mesh>
                    <mesh position={[0, 14, 0]} castShadow receiveShadow><sphereGeometry args={[10, 16, 16]} /><meshStandardMaterial color="#ff6699" emissive="#ff1493" emissiveIntensity={0.3} transparent opacity={0.9} roughness={0.6} /></mesh>
                    <mesh position={[4, 12, 4]} castShadow receiveShadow><sphereGeometry args={[6, 16, 16]} /><meshStandardMaterial color="#ff6699" emissive="#ff1493" emissiveIntensity={0.3} transparent opacity={0.9} roughness={0.6} /></mesh>
                    <mesh position={[-4, 10, -4]} castShadow receiveShadow><sphereGeometry args={[7, 16, 16]} /><meshStandardMaterial color="#ff6699" emissive="#ff1493" emissiveIntensity={0.3} transparent opacity={0.9} roughness={0.6} /></mesh>
                </group>

                {/* Red Maple Trees (Scattered) */}
                {[[-28, 0, 5], [15, 0, -5], [25, 0, 15]].map((pos, i) => (
                    <group key={`maple-${i}`} position={pos as any}>
                        <mesh position={[0, 3, 0]} castShadow receiveShadow><cylinderGeometry args={[0.4, 0.6, 6]} /><meshStandardMaterial map={tex.woodDark} /></mesh>
                        <mesh position={[0, 6, 0]} castShadow receiveShadow><sphereGeometry args={[4, 8, 8]} /><meshStandardMaterial color="#cc0000" emissive="#aa0000" emissiveIntensity={0.2} transparent opacity={0.9} /></mesh>
                    </group>
                ))}

                {/* --- 7. PERGOLA (Wisteria) (Right Side) --- */}
                <group position={[14, 0, 8]}>
                    <mesh position={[-4, 3, -3]} castShadow receiveShadow><boxGeometry args={[0.4, 6, 0.4]} /><meshStandardMaterial map={tex.woodDark} /></mesh>
                    <mesh position={[4, 3, -3]} castShadow receiveShadow><boxGeometry args={[0.4, 6, 0.4]} /><meshStandardMaterial map={tex.woodDark} /></mesh>
                    <mesh position={[-4, 3, 3]} castShadow receiveShadow><boxGeometry args={[0.4, 6, 0.4]} /><meshStandardMaterial map={tex.woodDark} /></mesh>
                    <mesh position={[4, 3, 3]} castShadow receiveShadow><boxGeometry args={[0.4, 6, 0.4]} /><meshStandardMaterial map={tex.woodDark} /></mesh>
                    <mesh position={[0, 6, 0]} castShadow receiveShadow><boxGeometry args={[10, 0.4, 8]} /><meshStandardMaterial map={tex.woodDark} /></mesh>
                    
                    {/* Hanging Wisteria (Purple) */}
                    {Array.from({ length: 30 }).map((_, i) => (
                        <mesh key={`wist-${i}`} position={[(Math.random()-0.5)*9, 4.5, (Math.random()-0.5)*7]} castShadow receiveShadow>
                            <cylinderGeometry args={[0.2, 0.5, 3]} />
                            <meshStandardMaterial color="#8a2be2" emissive="#8a2be2" emissiveIntensity={0.2} roughness={0.6} />
                        </mesh>
                    ))}

                    {/* Warm Lanterns hanging */}
                    {Array.from({ length: 6 }).map((_, i) => (
                        <group key={`lan-${i}`} position={[(i%3)*3 - 3, 4.5, Math.floor(i/3)*4 - 2]}>
                            <mesh><boxGeometry args={[0.5, 0.8, 0.5]} /><meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={4} /></mesh>
                            <pointLight color="#ffaa00" intensity={3} distance={12} />
                        </group>
                    ))}
                </group>

                {/* --- 8. TORII GATE (Foreground Right) --- */}
                <group position={[25, 0, 25]} rotation={[0, Math.PI/8, 0]}>
                    <mesh position={[-4, 5, 0]} castShadow receiveShadow><cylinderGeometry args={[0.6, 0.6, 10]} /><meshStandardMaterial color="#111" roughness={0.2} /></mesh>
                    <mesh position={[4, 5, 0]} castShadow receiveShadow><cylinderGeometry args={[0.6, 0.6, 10]} /><meshStandardMaterial color="#111" roughness={0.2} /></mesh>
                    <mesh position={[0, 8, 0]} castShadow receiveShadow><boxGeometry args={[11, 1, 1]} /><meshStandardMaterial color="#111" roughness={0.2} /></mesh>
                    <mesh position={[0, 9.5, 0]} castShadow receiveShadow><boxGeometry args={[13, 1.2, 1.2]} /><meshStandardMaterial color="#111" roughness={0.2} /></mesh>
                    
                    {/* Neon Magenta Lines */}
                    <mesh position={[-4.6, 5, 0]}><cylinderGeometry args={[0.05, 0.05, 10]} /><meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={4} /></mesh>
                    <mesh position={[4.6, 5, 0]}><cylinderGeometry args={[0.05, 0.05, 10]} /><meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={4} /></mesh>
                    <mesh position={[0, 8, 0.55]}><boxGeometry args={[11.1, 0.1, 0.1]} /><meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={4} /></mesh>
                    <mesh position={[0, 9.7, 0.65]}><boxGeometry args={[13.1, 0.1, 0.1]} /><meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={4} /></mesh>
                    
                    {/* Stone path through Torii */}
                    <mesh position={[0, 0.05, -5]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
                        <planeGeometry args={[8, 20]} />
                        <meshStandardMaterial map={tex.stonePath} roughness={0.9} />
                    </mesh>
                    {/* Neon edge for path */}
                    <mesh position={[-4, 0.1, -5]}><boxGeometry args={[0.1, 0.1, 20]} /><meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={3} /></mesh>
                    <mesh position={[4, 0.1, -5]}><boxGeometry args={[0.1, 0.1, 20]} /><meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={3} /></mesh>
                </group>

                {/* --- 9. PERIMETER FENCE (Bamboo) --- */}
                {/* 
                    Crucial fix: Do NOT block the Torii gate (which is at x=25, z=25).
                    We'll create segments of fence.
                */}
                <mesh castShadow receiveShadow geometry={useMemo(() => buildMergedGeometry([
                    // Back wall
                    ...Array.from({ length: 160 }).map((_, i) => ({ type: 'cylinder', args: [0.1, 0.1, 4], position: [-40 + (i * 0.5), 2, -40] })),
                    // Left wall
                    ...Array.from({ length: 160 }).map((_, i) => ({ type: 'cylinder', args: [0.1, 0.1, 4], position: [-40, 2, -40 + (i * 0.5)] })),
                    // Right wall
                    ...Array.from({ length: 160 }).map((_, i) => ({ type: 'cylinder', args: [0.1, 0.1, 4], position: [40, 2, -40 + (i * 0.5)] })),
                    // Front wall - LEFT SIDE (x: -40 to x: 15)
                    ...Array.from({ length: 110 }).map((_, i) => ({ type: 'cylinder', args: [0.1, 0.1, 4], position: [-40 + (i * 0.5), 2, 40] })),
                    // Front wall - RIGHT SIDE (x: 35 to x: 40) -> LEAVES A BIG GAP from x=15 to x=35 for Torii
                    ...Array.from({ length: 10 }).map((_, i) => ({ type: 'cylinder', args: [0.1, 0.1, 4], position: [35 + (i * 0.5), 2, 40] })),
                ]), [])}>
                    <meshStandardMaterial map={tex.woodDark} roughness={0.9} color="#889966" />
                </mesh>

                {/* --- 10. BACKGROUND MOUNTAINS --- */}
                <mesh castShadow receiveShadow position={[0, -5, -60]}>
                    <boxGeometry args={[150, 20, 20]} />
                    <meshStandardMaterial map={tex.rock} color="#1a2a1a" roughness={1} />
                </mesh>
                <mesh castShadow receiveShadow position={[0, 10, -80]}>
                    <boxGeometry args={[200, 30, 20]} />
                    <meshStandardMaterial map={tex.rock} color="#0d150d" roughness={1} />
                </mesh>

                {/* Stone Path matching photo (connects Onsen, House, Torii) */}
                <mesh position={[2, 0.02, 0]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
                    <planeGeometry args={[40, 40]} />
                    <meshStandardMaterial map={tex.stonePath} roughness={0.9} transparent opacity={0.7} />
                </mesh>
                
                <Avatars />
            </RigidBody>
            
            {/* Global Ambient Lighting */}
            <pointLight position={[-8, 2, 8]} color="#00ffff" intensity={3} distance={30} /> {/* Glow from pool */}
            <pointLight position={[10, 5, -5]} color="#ffddaa" intensity={4} distance={40} /> {/* Glow from house */}
            
            <SteamParticles />
            <SakuraPetals />

            {isSelected && (toolMode === 'MOVER' || toolMode === 'ROTAR' || toolMode === 'ESCALAR') && (
                <TransformControls 
                    object={parentGroupRef} 
                    mode={toolMode === 'MOVER' ? 'translate' : toolMode === 'ROTAR' ? 'rotate' : 'scale'} 
                    onMouseUp={(e) => {
                        if (parentGroupRef.current) { 
                            const pos: [number,number,number] = [parentGroupRef.current.position.x, parentGroupRef.current.position.y, parentGroupRef.current.position.z]; 
                            const rot: [number,number,number] = [parentGroupRef.current.rotation.x, parentGroupRef.current.rotation.y, parentGroupRef.current.rotation.z]; 
                            const scale: [number,number,number] = [parentGroupRef.current.scale.x, parentGroupRef.current.scale.y, parentGroupRef.current.scale.z]; 
                            onTransformEnd(item.id, pos, rot, scale); 
                        }
                    }} 
                />
            )}
            {isSelected && <Outlines thickness={2} color="#D4AF37" />}
        </group>
    );
}
"""
with open("src/components/RyokanNeo.tsx", "w") as f:
    f.write(code)
