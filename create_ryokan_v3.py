import os

code = """
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Outlines, TransformControls } from '@react-three/drei';
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
  const count = 600;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 80;
      const y = Math.random() * 30 + 5;
      const z = (Math.random() - 0.5) * 80;
      temp.push({ position: new THREE.Vector3(x, y, z), speed: Math.random() * 0.04 + 0.02, phase: Math.random() * Math.PI * 2 });
    }
    return temp;
  }, []);

  useFrame(() => {
    particles.forEach((particle, i) => {
      particle.position.y -= particle.speed;
      particle.position.x += Math.sin(particle.position.y * 2 + particle.phase) * 0.03;
      particle.position.z += Math.cos(particle.position.y * 2 + particle.phase) * 0.03;
      if (particle.position.y < 0) {
        particle.position.y = 40;
      }
      dummy.position.copy(particle.position);
      dummy.rotation.set(particle.phase + particle.position.y, particle.phase, 0);
      dummy.scale.setScalar(0.3);
      dummy.updateMatrix();
      mesh.current?.setMatrixAt(i, dummy.matrix);
    });
    if (mesh.current) mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} castShadow>
      <planeGeometry args={[0.3, 0.3]} />
      <meshBasicMaterial color="#ffb7c5" side={THREE.DoubleSide} transparent opacity={0.9} />
    </instancedMesh>
  );
}

function SteamParticles() {
  const count = 250;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 35;
      const y = Math.random() * 6;
      const z = (Math.random() - 0.5) * 35;
      temp.push({ position: new THREE.Vector3(x, y, z), speed: Math.random() * 0.015 + 0.005, phase: Math.random() * Math.PI * 2 });
    }
    return temp;
  }, []);

  useFrame(() => {
    particles.forEach((particle, i) => {
      particle.position.y += particle.speed;
      particle.position.x += Math.sin(particle.position.y + particle.phase) * 0.02;
      if (particle.position.y > 10) {
        particle.position.y = 0;
      }
      dummy.position.copy(particle.position);
      const scale = 1 + particle.position.y * 1.2;
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
      <sphereGeometry args={[1.2, 8, 8]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.05} depthWrite={false} />
    </instancedMesh>
  );
}

function Avatars() {
    const positions = [
        [-9, -0.5, 3], [-6, -0.5, 6], [3, -0.5, 7.5], [7.5, -0.5, 4.5], // In water
        [-12, 1, 0], [10.5, 1, -3], [-3, 1, 12], [0, 1, 12], // On edge rocks
        [-15, 2, -3], [6, 1, -7.5] // Further back
    ];
    
    return (
        <group>
            {positions.map((pos, i) => (
                <group key={i} position={pos as any}>
                    {/* Body */}
                    <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
                        <cylinderGeometry args={[0.3, 0.3, 1.2]} />
                        <meshStandardMaterial color={['#222222', '#dd2222', '#22dd22', '#2222dd', '#ffffff'][i % 5]} roughness={0.8} />
                    </mesh>
                    {/* Head */}
                    <mesh position={[0, 1.35, 0]} castShadow receiveShadow>
                        <sphereGeometry args={[0.22]} />
                        <meshStandardMaterial color="#ffccaa" roughness={0.5} />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

function usePBRTextures() {
    return useMemo(() => {
        const createTex = (type: string) => {
            const size = 1024;
            const c = document.createElement('canvas'); c.width = size; c.height = size; const ctx = c.getContext('2d')!;
            const cBump = document.createElement('canvas'); cBump.width = size; cBump.height = size; const ctxBump = cBump.getContext('2d')!;
            const cEm = document.createElement('canvas'); cEm.width = size; cEm.height = size; const ctxEm = cEm.getContext('2d')!;

            ctxBump.fillStyle = '#888888'; ctxBump.fillRect(0,0,size,size);
            ctxEm.fillStyle = '#000000'; ctxEm.fillRect(0,0,size,size);

            if (type === 'stone_path') {
                ctx.fillStyle = '#2c2e30'; ctx.fillRect(0, 0, size, size);
                ctxBump.fillStyle = '#444444'; ctxBump.fillRect(0, 0, size, size);
                
                for(let i=0; i<400; i++) {
                    const cx = Math.random() * size; const cy = Math.random() * size; const r = Math.random() * 40 + 20;
                    ctx.fillStyle = `hsl(210, 5%, ${Math.random() * 15 + 15}%)`;
                    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fill();
                    ctxBump.fillStyle = '#ffffff'; 
                    ctxBump.beginPath(); ctxBump.arc(cx, cy, r*0.9, 0, Math.PI*2); ctxBump.fill();
                }

                // Cyan neon embedded in joints
                ctxEm.strokeStyle = '#00ffff';
                ctxEm.lineWidth = 6;
                ctxEm.beginPath();
                ctxEm.moveTo(0, size/2);
                ctxEm.bezierCurveTo(size/3, size/2 + 150, size*2/3, size/2 - 150, size, size/2);
                ctxEm.stroke();
            } else if (type === 'wood_dark') {
                ctx.fillStyle = '#1c130d'; ctx.fillRect(0, 0, size, size);
                ctxBump.fillStyle = '#888888'; ctxBump.fillRect(0, 0, size, size);
                for(let i=0; i<1500; i++) {
                    const y = Math.random()*size; const h = Math.random()*6+1; const alpha = Math.random()*0.5;
                    ctx.fillStyle = `rgba(42, 29, 20, ${alpha})`; ctx.fillRect(0, y, size, h);
                    ctxBump.fillStyle = `rgba(200, 200, 200, ${alpha})`; ctxBump.fillRect(0, y, size, h);
                }
            } else if (type === 'shoji') {
                ctx.fillStyle = '#fff4e6'; ctx.fillRect(0, 0, size, size);
                ctxBump.fillStyle = '#aaaaaa'; ctxBump.fillRect(0, 0, size, size);
                ctx.fillStyle = '#2a1d14'; ctxBump.fillStyle = '#ffffff'; 
                const grid = 128;
                for(let i=0; i<=size; i+=grid) {
                    ctx.fillRect(i, 0, 10, size); ctx.fillRect(0, i, size, 10);
                    ctxBump.fillRect(i, 0, 10, size); ctxBump.fillRect(0, i, size, 10);
                }
            } else if (type === 'rock') {
                ctx.fillStyle = '#333333'; ctx.fillRect(0, 0, size, size);
                ctxBump.fillStyle = '#444444'; ctxBump.fillRect(0, 0, size, size);
                for(let i=0; i<2000; i++) {
                    const x = Math.random()*size; const y = Math.random()*size; const w = Math.random()*20+5;
                    ctx.fillStyle = Math.random() > 0.5 ? '#222' : '#444';
                    ctxBump.fillStyle = Math.random() > 0.5 ? '#fff' : '#000';
                    ctx.fillRect(x,y,w,w); ctxBump.fillRect(x,y,w,w);
                }
            }

            const map = new THREE.CanvasTexture(c); map.wrapS = map.wrapT = THREE.RepeatWrapping;
            const bumpMap = new THREE.CanvasTexture(cBump); bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping;
            const emissiveMap = new THREE.CanvasTexture(cEm); emissiveMap.wrapS = emissiveMap.wrapT = THREE.RepeatWrapping;
            if(type !== 'shoji') { map.repeat.set(4,4); bumpMap.repeat.set(4,4); emissiveMap.repeat.set(4,4); }

            return { map, bumpMap, emissiveMap };
        };

        return {
            stonePath: createTex('stone_path'),
            woodDark: createTex('wood_dark'),
            shoji: createTex('shoji'),
            rock: createTex('rock')
        };
    }, []);
}

export function RyokanNeo({ item, isExplore, onSelect, onTransformEnd, isSelected, toolMode }: any) {
    const parentGroupRef = useRef<THREE.Group>(null);
    const tex = usePBRTextures();

    return (
        <group 
            ref={parentGroupRef} 
            position={item.position as [number, number, number]} 
            rotation={item.rotation as [number, number, number]} 
            onClick={(e) => { if (!isExplore) { e.stopPropagation(); onSelect(item.id); } }}
        >
            <RigidBody type="fixed" colliders="trimesh">
                {/* --- 0. MASSIVE WORLD SCALE MOUNTAINS --- */}
                <group position={[0, -10, -100]}>
                    <mesh position={[0, 0, 0]} castShadow receiveShadow>
                        <boxGeometry args={[400, 20, 100]} />
                        <meshStandardMaterial map={tex.rock} bumpMap={tex.rock.bumpMap} color="#1a251a" roughness={1} />
                    </mesh>
                    <mesh position={[0, 25, -40]} castShadow receiveShadow>
                        <boxGeometry args={[500, 30, 100]} />
                        <meshStandardMaterial map={tex.rock} bumpMap={tex.rock.bumpMap} color="#0f1a0f" roughness={1} />
                    </mesh>
                    <mesh position={[0, 50, -80]} castShadow receiveShadow>
                        <boxGeometry args={[600, 50, 100]} />
                        <meshStandardMaterial map={tex.rock} bumpMap={tex.rock.bumpMap} color="#0a110a" roughness={1} />
                    </mesh>
                </group>

                {/* --- 1. MAIN HOUSE (Expanded 1.5x) --- */}
                <group position={[15, 3, -18]} scale={1.5}>
                    {/* Elevated Foundation */}
                    <mesh position={[0, -1, 0]} castShadow receiveShadow>
                        <boxGeometry args={[32, 2, 22]} />
                        <meshStandardMaterial map={tex.rock.map} bumpMap={tex.rock.bumpMap} roughness={0.9} />
                    </mesh>

                    {/* Deck / Terrace */}
                    <mesh position={[0, 0.1, 8]} castShadow receiveShadow>
                        <boxGeometry args={[28, 0.2, 12]} />
                        <meshStandardMaterial map={tex.woodDark.map} bumpMap={tex.woodDark.bumpMap} roughness={0.7} />
                    </mesh>
                    
                    {/* First Floor Interior (Highly Detailed) */}
                    <group position={[0, 0.2, 0]}>
                        <mesh position={[0, 0, 0]} receiveShadow>
                            <boxGeometry args={[26, 0.1, 14]} />
                            <meshStandardMaterial color="#d4c3a3" roughness={0.9} />
                        </mesh>
                        {/* Center Chabudai (Low Tables) */}
                        <mesh position={[-4, 0.3, 2]} castShadow><boxGeometry args={[4, 0.4, 2.5]} /><meshStandardMaterial map={tex.woodDark.map} /></mesh>
                        <mesh position={[-4, 0.1, 4.5]} castShadow><boxGeometry args={[1.2, 0.15, 1.2]} /><meshStandardMaterial color="#222" /></mesh>
                        <mesh position={[-4, 0.1, -0.5]} castShadow><boxGeometry args={[1.2, 0.15, 1.2]} /><meshStandardMaterial color="#222" /></mesh>
                        <mesh position={[-1.5, 0.1, 2]} castShadow><boxGeometry args={[1.2, 0.15, 1.2]} /><meshStandardMaterial color="#222" /></mesh>
                        <mesh position={[-6.5, 0.1, 2]} castShadow><boxGeometry args={[1.2, 0.15, 1.2]} /><meshStandardMaterial color="#222" /></mesh>
                        
                        {/* Right Sofa Area */}
                        <mesh position={[8, 0.5, 4]} castShadow><boxGeometry args={[6, 1, 2.5]} /><meshStandardMaterial color="#e0e0e0" roughness={0.6} /></mesh>
                        <mesh position={[8, 0.1, 4]} castShadow><boxGeometry args={[7, 0.1, 5]} /><meshStandardMaterial color="#443322" /></mesh>
                        <mesh position={[8, 0.4, 1.5]} castShadow><boxGeometry args={[3, 0.6, 1.5]} /><meshStandardMaterial map={tex.woodDark.map} /></mesh>
                    </group>

                    {/* First Floor Walls & Shoji */}
                    <mesh position={[-13, 2.2, 0]} castShadow receiveShadow>
                        <boxGeometry args={[0.5, 4.4, 14]} />
                        <meshStandardMaterial map={tex.woodDark.map} bumpMap={tex.woodDark.bumpMap} roughness={0.8} />
                    </mesh>
                    <mesh position={[13, 2.2, 0]} castShadow receiveShadow>
                        <boxGeometry args={[0.5, 4.4, 14]} />
                        <meshStandardMaterial map={tex.woodDark.map} bumpMap={tex.woodDark.bumpMap} roughness={0.8} />
                    </mesh>
                    <mesh position={[0, 2.2, -7]} castShadow receiveShadow>
                        <boxGeometry args={[26, 4.4, 0.5]} />
                        <meshStandardMaterial map={tex.woodDark.map} bumpMap={tex.woodDark.bumpMap} roughness={0.8} />
                    </mesh>
                    
                    {/* Glowing Shoji Panels with exact grid texture */}
                    <mesh position={[0, 2.2, 7]} castShadow receiveShadow>
                        <boxGeometry args={[26, 4.4, 0.1]} />
                        <meshStandardMaterial map={tex.shoji.map} bumpMap={tex.shoji.bumpMap} emissiveMap={tex.shoji.map} emissive="#ffddaa" emissiveIntensity={1.5} transparent opacity={0.9} roughness={0.4} />
                    </mesh>

                    {/* Mid Roof */}
                    <mesh position={[0, 4.8, 2]} castShadow receiveShadow>
                        <boxGeometry args={[34, 0.8, 26]} />
                        <meshStandardMaterial color="#1a1c1e" roughness={0.9} />
                    </mesh>

                    {/* Second Floor */}
                    <group position={[0, 5.2, -2]}>
                        <mesh position={[0, 0, 0]} castShadow receiveShadow>
                            <boxGeometry args={[24, 0.2, 14]} />
                            <meshStandardMaterial map={tex.woodDark.map} bumpMap={tex.woodDark.bumpMap} roughness={0.8} />
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

                        <mesh position={[0, 2, -1]} castShadow receiveShadow>
                            <boxGeometry args={[18, 4, 10]} />
                            <meshStandardMaterial map={tex.woodDark.map} bumpMap={tex.woodDark.bumpMap} roughness={0.8} />
                        </mesh>
                        
                        <mesh position={[0, 2, 4.1]} castShadow receiveShadow>
                            <boxGeometry args={[18, 4, 0.1]} />
                            <meshStandardMaterial map={tex.shoji.map} bumpMap={tex.shoji.bumpMap} emissiveMap={tex.shoji.map} emissive="#ffddaa" emissiveIntensity={2} transparent opacity={0.9} />
                        </mesh>
                        
                        {/* Main Roof */}
                        <mesh position={[0, 5.5, 0]} castShadow receiveShadow>
                            <coneGeometry args={[16, 6, 4]} />
                            <meshStandardMaterial color="#1a1c1e" roughness={0.9} />
                        </mesh>
                    </group>
                </group>

                {/* --- 2. SAUNA BUILDING (Far Right, Scaled) --- */}
                <group position={[48, 1.5, -22]} scale={1.5}>
                    <mesh position={[0, 2, 0]} castShadow receiveShadow>
                        <boxGeometry args={[10, 4, 10]} />
                        <meshStandardMaterial map={tex.woodDark.map} bumpMap={tex.woodDark.bumpMap} roughness={0.9} />
                    </mesh>
                    <mesh position={[0, 2, 5.1]} castShadow receiveShadow>
                        <boxGeometry args={[8, 3, 0.1]} />
                        <meshPhysicalMaterial color="#ffffff" transmission={0.4} roughness={0.8} ior={1.4} transparent opacity={0.8} />
                    </mesh>
                    <mesh position={[0, 5, 0]} castShadow receiveShadow>
                        <coneGeometry args={[8, 3, 4]} />
                        <meshStandardMaterial color="#1a1c1e" roughness={0.9} />
                    </mesh>
                    <mesh position={[-8, 0, 4]} receiveShadow>
                        <boxGeometry args={[6, 1, 6]} />
                        <meshStandardMaterial map={tex.woodDark.map} bumpMap={tex.woodDark.bumpMap} />
                    </mesh>
                    <mesh position={[-8, 0.8, 4]} rotation={[-Math.PI/2, 0, 0]}>
                        <planeGeometry args={[5, 5]} />
                        <meshPhysicalMaterial color="#00ffff" emissive="#0088cc" emissiveIntensity={0.5} transmission={0.9} roughness={0.1} />
                    </mesh>
                </group>

                {/* --- 3. WATERFALLS (Top Left) --- */}
                <group position={[-38, 0, -30]} scale={1.5}>
                    <mesh position={[0, 6, 0]} castShadow receiveShadow>
                        <boxGeometry args={[15, 12, 10]} />
                        <meshStandardMaterial map={tex.rock.map} bumpMap={tex.rock.bumpMap} roughness={1} />
                    </mesh>
                    <mesh position={[5, 12, -5]} castShadow receiveShadow>
                        <boxGeometry args={[20, 10, 10]} />
                        <meshStandardMaterial map={tex.rock.map} bumpMap={tex.rock.bumpMap} roughness={1} />
                    </mesh>
                    
                    <mesh position={[2, 9, 5.1]} rotation={[0, 0, -0.1]}>
                        <planeGeometry args={[6, 12]} />
                        <meshPhysicalMaterial color="#aaddff" emissive="#00aaff" emissiveIntensity={1.5} transmission={0.9} roughness={0.1} />
                    </mesh>
                    <mesh position={[0, 3, 5.2]} rotation={[0.2, 0, 0]}>
                        <planeGeometry args={[8, 8]} />
                        <meshPhysicalMaterial color="#aaddff" emissive="#00aaff" emissiveIntensity={1.5} transmission={0.9} roughness={0.1} />
                    </mesh>
                    <pointLight position={[2, 6, 8]} color="#00ffff" intensity={4} distance={30} />
                </group>

                {/* --- 4. ONSEN (Clean Stone Slab & Hidden Neon) --- */}
                <group position={[-12, 0, 12]} scale={1.5}>
                    {/* Clean Stone Slab Lip Perimeter */}
                    <mesh position={[0, 0.3, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
                        <ringGeometry args={[16, 18, 64]} />
                        <meshStandardMaterial map={tex.stonePath.map} bumpMap={tex.stonePath.bumpMap} roughness={0.8} />
                    </mesh>
                    
                    {/* Hidden Cyan LED UNDER the slab */}
                    <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[15.7, 16, 64]} />
                        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={6} />
                    </mesh>

                    {/* Water */}
                    <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                        <circleGeometry args={[16, 64]} />
                        <meshPhysicalMaterial color="#00ffff" emissive="#00aaff" emissiveIntensity={0.2} transmission={0.95} roughness={0.0} ior={1.33} thickness={5} clearcoat={1} transparent opacity={0.9} />
                    </mesh>
                </group>

                {/* --- 5. STONE DRAGON --- */}
                <group position={[-6, 0.5, -6]} scale={1.5}>
                    <mesh position={[0, 1, 0]} castShadow receiveShadow>
                        <dodecahedronGeometry args={[3, 1]} />
                        <meshStandardMaterial map={tex.rock.map} bumpMap={tex.rock.bumpMap} color="#4a5e3d" roughness={1} />
                    </mesh>
                    <mesh position={[0, 3, 0]} castShadow receiveShadow><sphereGeometry args={[1.5]} /><meshStandardMaterial map={tex.rock.map} color="#3a4e2d" roughness={1} /></mesh>
                    <mesh position={[2, 2.5, 0]} castShadow receiveShadow><cylinderGeometry args={[0.8, 1, 3]} rotation={[0, 0, Math.PI/4]} /><meshStandardMaterial map={tex.rock.map} color="#3a4e2d" roughness={1} /></mesh>
                    <mesh position={[-2, 4, 1]} castShadow receiveShadow><boxGeometry args={[1.5, 2, 2.5]} /><meshStandardMaterial map={tex.rock.map} color="#3a4e2d" roughness={1} /></mesh>
                    <mesh position={[-2.5, 4.5, 2.1]}><sphereGeometry args={[0.2]} /><meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={8} /></mesh>
                    <mesh position={[-1.5, 4.5, 2.1]}><sphereGeometry args={[0.2]} /><meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={8} /></mesh>
                    <pointLight position={[-2, 4, 3]} color="#00ffff" intensity={5} distance={20} />
                </group>

                {/* --- 6. HUGE SAKURA TREE --- */}
                <group position={[-18, 1.5, -18]} scale={2.5}>
                    <mesh position={[0, 6, 0]} castShadow receiveShadow><cylinderGeometry args={[1.5, 2.5, 12]} /><meshStandardMaterial map={tex.woodDark.map} bumpMap={tex.woodDark.bumpMap} roughness={1} /></mesh>
                    <mesh position={[0, 14, 0]} castShadow receiveShadow><sphereGeometry args={[10, 16, 16]} /><meshStandardMaterial color="#ff6699" emissive="#ff1493" emissiveIntensity={0.4} transparent opacity={0.95} roughness={0.8} /></mesh>
                    <mesh position={[4, 12, 4]} castShadow receiveShadow><sphereGeometry args={[7, 16, 16]} /><meshStandardMaterial color="#ff6699" emissive="#ff1493" emissiveIntensity={0.4} transparent opacity={0.95} roughness={0.8} /></mesh>
                    <mesh position={[-4, 10, -4]} castShadow receiveShadow><sphereGeometry args={[8, 16, 16]} /><meshStandardMaterial color="#ff6699" emissive="#ff1493" emissiveIntensity={0.4} transparent opacity={0.95} roughness={0.8} /></mesh>
                </group>

                {/* --- 7. PERGOLA (Wisteria) --- */}
                <group position={[21, 0, 12]} scale={1.5}>
                    <mesh position={[-4, 3, -3]} castShadow receiveShadow><boxGeometry args={[0.4, 6, 0.4]} /><meshStandardMaterial map={tex.woodDark.map} bumpMap={tex.woodDark.bumpMap} /></mesh>
                    <mesh position={[4, 3, -3]} castShadow receiveShadow><boxGeometry args={[0.4, 6, 0.4]} /><meshStandardMaterial map={tex.woodDark.map} bumpMap={tex.woodDark.bumpMap} /></mesh>
                    <mesh position={[-4, 3, 3]} castShadow receiveShadow><boxGeometry args={[0.4, 6, 0.4]} /><meshStandardMaterial map={tex.woodDark.map} bumpMap={tex.woodDark.bumpMap} /></mesh>
                    <mesh position={[4, 3, 3]} castShadow receiveShadow><boxGeometry args={[0.4, 6, 0.4]} /><meshStandardMaterial map={tex.woodDark.map} bumpMap={tex.woodDark.bumpMap} /></mesh>
                    <mesh position={[0, 6, 0]} castShadow receiveShadow><boxGeometry args={[10, 0.4, 8]} /><meshStandardMaterial map={tex.woodDark.map} bumpMap={tex.woodDark.bumpMap} /></mesh>
                    
                    {Array.from({ length: 40 }).map((_, i) => (
                        <mesh key={`wist-${i}`} position={[(Math.random()-0.5)*9, 4.5, (Math.random()-0.5)*7]} castShadow receiveShadow>
                            <cylinderGeometry args={[0.2, 0.6, 3.5]} />
                            <meshStandardMaterial color="#8a2be2" emissive="#8a2be2" emissiveIntensity={0.3} roughness={0.6} />
                        </mesh>
                    ))}

                    {Array.from({ length: 6 }).map((_, i) => (
                        <group key={`lan-${i}`} position={[(i%3)*3 - 3, 4.5, Math.floor(i/3)*4 - 2]}>
                            <mesh><boxGeometry args={[0.6, 1, 0.6]} /><meshStandardMaterial color="#ffaa00" emissive="#ffdd88" emissiveIntensity={6} /></mesh>
                            <pointLight color="#ffaa00" intensity={5} distance={20} />
                        </group>
                    ))}
                </group>

                {/* --- 8. HUGE TORII GATE --- */}
                <group position={[38, 0, 38]} rotation={[0, Math.PI/8, 0]} scale={1.8}>
                    <mesh position={[-4, 5, 0]} castShadow receiveShadow><cylinderGeometry args={[0.8, 0.8, 10]} /><meshStandardMaterial color="#111" roughness={0.2} /></mesh>
                    <mesh position={[4, 5, 0]} castShadow receiveShadow><cylinderGeometry args={[0.8, 0.8, 10]} /><meshStandardMaterial color="#111" roughness={0.2} /></mesh>
                    <mesh position={[0, 8, 0]} castShadow receiveShadow><boxGeometry args={[11, 1, 1]} /><meshStandardMaterial color="#111" roughness={0.2} /></mesh>
                    <mesh position={[0, 9.5, 0]} castShadow receiveShadow><boxGeometry args={[13, 1.2, 1.2]} /><meshStandardMaterial color="#111" roughness={0.2} /></mesh>
                    
                    {/* Neon Magenta Lines */}
                    <mesh position={[-4.8, 5, 0]}><cylinderGeometry args={[0.08, 0.08, 10]} /><meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={6} /></mesh>
                    <mesh position={[4.8, 5, 0]}><cylinderGeometry args={[0.08, 0.08, 10]} /><meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={6} /></mesh>
                    <mesh position={[0, 8, 0.55]}><boxGeometry args={[11.1, 0.15, 0.15]} /><meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={6} /></mesh>
                    <mesh position={[0, 9.7, 0.65]}><boxGeometry args={[13.1, 0.15, 0.15]} /><meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={6} /></mesh>
                </group>

                {/* --- 9. PERIMETER FENCE (CLEAR TORII GAP) --- */}
                <mesh castShadow receiveShadow geometry={useMemo(() => buildMergedGeometry([
                    ...Array.from({ length: 320 }).map((_, i) => ({ type: 'cylinder', args: [0.15, 0.15, 6], position: [-80 + (i * 0.5), 3, -80] })),
                    ...Array.from({ length: 320 }).map((_, i) => ({ type: 'cylinder', args: [0.15, 0.15, 6], position: [-80, 3, -80 + (i * 0.5)] })),
                    ...Array.from({ length: 320 }).map((_, i) => ({ type: 'cylinder', args: [0.15, 0.15, 6], position: [80, 3, -80 + (i * 0.5)] })),
                    // Gap left for Torii (stops at x=10)
                    ...Array.from({ length: 180 }).map((_, i) => ({ type: 'cylinder', args: [0.15, 0.15, 6], position: [-80 + (i * 0.5), 3, 80] })),
                    // Gap resumes at x=60
                    ...Array.from({ length: 40 }).map((_, i) => ({ type: 'cylinder', args: [0.15, 0.15, 6], position: [60 + (i * 0.5), 3, 80] })),
                ]), [])}>
                    <meshStandardMaterial map={tex.woodDark.map} bumpMap={tex.woodDark.bumpMap} roughness={0.9} color="#889966" />
                </mesh>

                {/* --- 10. STONE PATH WITH EMBEDDED NEON --- */}
                <mesh position={[3, 0.05, 0]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
                    <planeGeometry args={[120, 120]} />
                    {/* Embedded neon in texture emissive map */}
                    <meshStandardMaterial map={tex.stonePath.map} bumpMap={tex.stonePath.bumpMap} emissiveMap={tex.stonePath.emissiveMap} emissive="#00ffff" emissiveIntensity={3} roughness={0.8} />
                </mesh>
                
                <Avatars />
            </RigidBody>
            
            <pointLight position={[-15, 5, 15]} color="#00ffff" intensity={5} distance={50} />
            <pointLight position={[20, 10, -10]} color="#ffddaa" intensity={6} distance={60} />
            
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
