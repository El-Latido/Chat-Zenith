import os

code = """
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Outlines, TransformControls, MeshReflectorMaterial } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

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
  const count = isMobile ? 200 : 800;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 100 - 10;
      const y = Math.random() * 40 + 5;
      const z = (Math.random() - 0.5) * 100 - 10;
      temp.push({ position: new THREE.Vector3(x, y, z), speed: Math.random() * 0.05 + 0.03, phase: Math.random() * Math.PI * 2 });
    }
    return temp;
  }, []);

  useFrame(() => {
    particles.forEach((particle, i) => {
      particle.position.y -= particle.speed;
      particle.position.x += Math.sin(particle.position.y * 1.5 + particle.phase) * 0.04;
      particle.position.z += Math.cos(particle.position.y * 1.5 + particle.phase) * 0.04;
      if (particle.position.y < 0) {
        particle.position.y = 50;
      }
      dummy.position.copy(particle.position);
      dummy.rotation.set(particle.phase + particle.position.y, particle.phase, 0);
      dummy.scale.setScalar(0.25);
      dummy.updateMatrix();
      mesh.current?.setMatrixAt(i, dummy.matrix);
    });
    if (mesh.current) mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} castShadow>
      <planeGeometry args={[0.4, 0.4]} />
      <meshStandardMaterial color="#ffb7c5" emissive="#ff1493" emissiveIntensity={0.2} side={THREE.DoubleSide} roughness={0.5} />
    </instancedMesh>
  );
}

function SteamParticles() {
  const count = isMobile ? 80 : 200;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const tex = usePBRTextures();

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 40 - 15;
      const y = Math.random() * 10;
      const z = (Math.random() - 0.5) * 40 + 15;
      temp.push({ position: new THREE.Vector3(x, y, z), speed: Math.random() * 0.02 + 0.01, phase: Math.random() * Math.PI * 2 });
    }
    return temp;
  }, []);

  useFrame(() => {
    particles.forEach((particle, i) => {
      particle.position.y += particle.speed;
      particle.position.x += Math.sin(particle.position.y * 0.5 + particle.phase) * 0.03;
      if (particle.position.y > 15) {
        particle.position.y = 0;
      }
      dummy.position.copy(particle.position);
      const scale = 2 + particle.position.y * 1.5;
      dummy.scale.setScalar(scale);
      dummy.rotation.z = particle.phase + particle.position.y * 0.1;
      dummy.updateMatrix();
      mesh.current?.setMatrixAt(i, dummy.matrix);
    });
    if (mesh.current) {
        mesh.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} position={[0,0,0]}>
      <planeGeometry args={[2, 2]} />
      <meshBasicMaterial map={tex.cloud.alpha} transparent opacity={0.08} depthWrite={false} color="#aaddff" blending={THREE.AdditiveBlending} />
    </instancedMesh>
  );
}

function SakuraTree({ position, scale }: { position: [number, number, number], scale: number }) {
    const tex = usePBRTextures();
    const count = isMobile ? 60 : 150;
    const mesh = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    
    useMemo(() => {
        if (!mesh.current) return;
        for (let i = 0; i < count; i++) {
            const phi = Math.acos(-1 + (2 * i) / count);
            const theta = Math.sqrt(count * Math.PI) * phi;
            const r = 9 + Math.random() * 3;
            dummy.position.setFromSphericalCoords(r, phi, theta);
            dummy.position.y += 12; // offset up to canopy
            dummy.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
            dummy.scale.setScalar(2.5 + Math.random()*1.5);
            dummy.updateMatrix();
            mesh.current.setMatrixAt(i, dummy.matrix);
        }
        mesh.current.instanceMatrix.needsUpdate = true;
    }, [count]);

    return (
        <group position={position} scale={scale}>
            <mesh position={[0, 6, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[1.5, 2.5, 12, 8]} />
                <meshStandardMaterial map={tex.woodDark.map} bumpMap={tex.woodDark.bumpMap} roughness={1} />
            </mesh>
            <mesh position={[2, 10, 2]} rotation={[0, 0, -Math.PI/4]} castShadow><cylinderGeometry args={[0.5, 1, 8]} /><meshStandardMaterial map={tex.woodDark.map} roughness={1} /></mesh>
            <mesh position={[-2, 11, -2]} rotation={[0, 0, Math.PI/4]} castShadow><cylinderGeometry args={[0.5, 1, 8]} /><meshStandardMaterial map={tex.woodDark.map} roughness={1} /></mesh>
            
            <instancedMesh ref={mesh} args={[undefined, undefined, count]} castShadow>
                <planeGeometry args={[5, 5]} />
                <meshStandardMaterial map={tex.leaf.map} alphaMap={tex.leaf.alpha} alphaTest={0.4} color="#ff88bb" side={THREE.DoubleSide} roughness={0.8} />
            </instancedMesh>
        </group>
    );
}

function usePBRTextures() {
    return useMemo(() => {
        const createTex = (type: string) => {
            const size = isMobile ? 256 : 1024;
            const c = document.createElement('canvas'); c.width = size; c.height = size; const ctx = c.getContext('2d')!;
            const cBump = document.createElement('canvas'); cBump.width = size; cBump.height = size; const ctxBump = cBump.getContext('2d')!;
            const cEm = document.createElement('canvas'); cEm.width = size; cEm.height = size; const ctxEm = cEm.getContext('2d')!;
            const cAlpha = document.createElement('canvas'); cAlpha.width = size; cAlpha.height = size; const ctxAlpha = cAlpha.getContext('2d')!;

            ctxBump.fillStyle = '#888888'; ctxBump.fillRect(0,0,size,size);
            ctxEm.fillStyle = '#000000'; ctxEm.fillRect(0,0,size,size);
            ctxAlpha.fillStyle = '#ffffff'; ctxAlpha.fillRect(0,0,size,size);

            if (type === 'stone_path') {
                ctx.fillStyle = '#222426'; ctx.fillRect(0, 0, size, size);
                ctxBump.fillStyle = '#333333'; ctxBump.fillRect(0, 0, size, size);
                
                for(let i=0; i< (isMobile ? 200 : 600); i++) {
                    const cx = Math.random() * size; const cy = Math.random() * size; const r = Math.random() * 30 + 15;
                    ctx.fillStyle = `hsl(210, 8%, ${Math.random() * 20 + 20}%)`;
                    ctx.beginPath(); 
                    const sides = Math.floor(Math.random() * 4) + 5;
                    for(let j=0; j<sides; j++) {
                        const a = (j/sides) * Math.PI * 2;
                        const dist = r * (0.8 + Math.random()*0.4);
                        if(j===0) ctx.moveTo(cx + Math.cos(a)*dist, cy + Math.sin(a)*dist);
                        else ctx.lineTo(cx + Math.cos(a)*dist, cy + Math.sin(a)*dist);
                    }
                    ctx.fill();
                    ctxBump.fillStyle = '#ffffff'; 
                    ctxBump.beginPath(); ctxBump.arc(cx, cy, r*0.9, 0, Math.PI*2); ctxBump.fill();
                }

                ctxEm.strokeStyle = '#00aaaa';
                ctxEm.lineWidth = 4;
                ctxEm.beginPath();
                ctxEm.moveTo(0, size/2);
                ctxEm.bezierCurveTo(size/3, size/2 + 100, size*2/3, size/2 - 100, size, size/2);
                ctxEm.stroke();
            } else if (type === 'wood_dark') {
                ctx.fillStyle = '#18120d'; ctx.fillRect(0, 0, size, size);
                ctxBump.fillStyle = '#666666'; ctxBump.fillRect(0, 0, size, size);
                for(let i=0; i< (isMobile ? 800 : 2500); i++) {
                    const y = Math.random()*size; const h = Math.random()*8+1; const alpha = Math.random()*0.7;
                    ctx.fillStyle = `rgba(50, 35, 25, ${alpha})`; ctx.fillRect(0, y, size, h);
                    ctxBump.fillStyle = `rgba(220, 220, 220, ${alpha})`; ctxBump.fillRect(0, y, size, h);
                }
            } else if (type === 'shoji') {
                ctx.fillStyle = '#fff9f0'; ctx.fillRect(0, 0, size, size);
                ctxBump.fillStyle = '#aaaaaa'; ctxBump.fillRect(0, 0, size, size);
                ctx.fillStyle = '#1c130d'; ctxBump.fillStyle = '#ffffff'; 
                const grid = size / 8;
                for(let i=0; i<=size; i+=grid) {
                    ctx.fillRect(i, 0, 8, size); ctx.fillRect(0, i, size, 8);
                    ctxBump.fillRect(i, 0, 8, size); ctxBump.fillRect(0, i, size, 8);
                }
            } else if (type === 'rock') {
                ctx.fillStyle = '#222222'; ctx.fillRect(0, 0, size, size);
                ctxBump.fillStyle = '#333333'; ctxBump.fillRect(0, 0, size, size);
                for(let i=0; i< (isMobile ? 1000 : 3000); i++) {
                    const x = Math.random()*size; const y = Math.random()*size; const w = Math.random()*25+5;
                    ctx.fillStyle = Math.random() > 0.5 ? '#1a1a1a' : '#333333';
                    ctxBump.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#000000';
                    ctx.fillRect(x,y,w,w); ctxBump.fillRect(x,y,w,w);
                }
            } else if (type === 'leaf') {
                ctx.fillStyle = '#558855'; ctx.fillRect(0, 0, size, size);
                ctxAlpha.fillStyle = '#000000'; ctxAlpha.fillRect(0,0,size,size);
                for(let i=0; i<50; i++) {
                    const cx = Math.random() * size; const cy = Math.random() * size;
                    ctxAlpha.fillStyle = '#ffffff';
                    ctxAlpha.beginPath(); ctxAlpha.arc(cx, cy, Math.random()*40+20, 0, Math.PI*2); ctxAlpha.fill();
                    ctx.fillStyle = `hsl(${Math.random()*20+120}, 40%, ${Math.random()*20+30}%)`; 
                    ctx.beginPath(); ctx.arc(cx, cy, Math.random()*40+20, 0, Math.PI*2); ctx.fill();
                }
            } else if (type === 'cloud') {
                ctxAlpha.fillStyle = '#000000'; ctxAlpha.fillRect(0,0,size,size);
                const gradient = ctxAlpha.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
                gradient.addColorStop(0, 'rgba(255,255,255,1)');
                gradient.addColorStop(1, 'rgba(0,0,0,0)');
                ctxAlpha.fillStyle = gradient;
                ctxAlpha.fillRect(0,0,size,size);
            }

            const map = new THREE.CanvasTexture(c); map.wrapS = map.wrapT = THREE.RepeatWrapping;
            const bumpMap = new THREE.CanvasTexture(cBump); bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping;
            const emissiveMap = new THREE.CanvasTexture(cEm); emissiveMap.wrapS = emissiveMap.wrapT = THREE.RepeatWrapping;
            const alpha = new THREE.CanvasTexture(cAlpha); alpha.wrapS = alpha.wrapT = THREE.RepeatWrapping;
            
            if(type !== 'shoji' && type !== 'cloud' && type !== 'leaf') { 
                map.repeat.set(4,4); bumpMap.repeat.set(4,4); emissiveMap.repeat.set(4,4); 
            }

            return { map, bumpMap, emissiveMap, alpha };
        };

        return {
            stonePath: createTex('stone_path'),
            woodDark: createTex('wood_dark'),
            shoji: createTex('shoji'),
            rock: createTex('rock'),
            leaf: createTex('leaf'),
            cloud: createTex('cloud')
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
                
                {/* --- 0. MOUNTAINS & BACKGROUND HOUSES --- */}
                <group position={[0, -10, -100]}>
                    <mesh position={[0, 0, 0]} castShadow receiveShadow>
                        <boxGeometry args={[600, 20, 150]} />
                        <meshStandardMaterial map={tex.rock.map} bumpMap={tex.rock.bumpMap} color="#151b15" roughness={0.9} />
                    </mesh>
                    <mesh position={[0, 25, -50]} castShadow receiveShadow>
                        <boxGeometry args={[700, 30, 100]} />
                        <meshStandardMaterial map={tex.rock.map} bumpMap={tex.rock.bumpMap} color="#0c120c" roughness={0.9} />
                    </mesh>
                    
                    {/* Background Mountain Terrace Houses */}
                    <group position={[-60, 35, -40]}>
                        <mesh position={[0, 0, 0]} castShadow><boxGeometry args={[20, 2, 20]} /><meshStandardMaterial color="#1a251a" /></mesh>
                        <mesh position={[0, 5, 0]} castShadow><boxGeometry args={[12, 8, 12]} /><meshStandardMaterial map={tex.woodDark.map} /></mesh>
                        <mesh position={[0, 5, 6.1]}><boxGeometry args={[10, 6, 0.1]} /><meshStandardMaterial map={tex.shoji.map} emissive="#ffbb88" emissiveIntensity={1} /></mesh>
                        <group position={[0, 10, 0]}>
                            <mesh position={[0, 1.5, 0]}><boxGeometry args={[14, 0.5, 14]} /><meshStandardMaterial color="#111" /></mesh>
                            <mesh position={[0, 3, 0]} rotation={[0, Math.PI/4, 0]}><coneGeometry args={[11, 4, 4]} /><meshStandardMaterial color="#111" /></mesh>
                        </group>
                    </group>
                    <group position={[80, 20, -10]} scale={0.8}>
                        <mesh position={[0, 0, 0]} castShadow><boxGeometry args={[20, 2, 20]} /><meshStandardMaterial color="#1a251a" /></mesh>
                        <mesh position={[0, 5, 0]} castShadow><boxGeometry args={[12, 8, 12]} /><meshStandardMaterial map={tex.woodDark.map} /></mesh>
                        <mesh position={[0, 5, 6.1]}><boxGeometry args={[10, 6, 0.1]} /><meshStandardMaterial map={tex.shoji.map} emissive="#ffbb88" emissiveIntensity={1} /></mesh>
                        <group position={[0, 10, 0]}>
                            <mesh position={[0, 1.5, 0]}><boxGeometry args={[14, 0.5, 14]} /><meshStandardMaterial color="#111" /></mesh>
                            <mesh position={[0, 3, 0]} rotation={[0, Math.PI/4, 0]}><coneGeometry args={[11, 4, 4]} /><meshStandardMaterial color="#111" /></mesh>
                        </group>
                    </group>
                </group>

                {/* --- 1. MAIN HOUSE --- */}
                <group position={[15, 3, -18]} scale={1.5}>
                    <mesh position={[0, -1, 0]} castShadow receiveShadow>
                        <boxGeometry args={[32, 2, 22]} />
                        <meshStandardMaterial map={tex.rock.map} bumpMap={tex.rock.bumpMap} roughness={0.9} />
                    </mesh>

                    <mesh position={[0, 0.1, 8]} castShadow receiveShadow>
                        <boxGeometry args={[28, 0.2, 12]} />
                        <meshStandardMaterial map={tex.woodDark.map} bumpMap={tex.woodDark.bumpMap} roughness={0.7} />
                    </mesh>
                    
                    {/* First Floor Interior */}
                    <group position={[0, 0.2, 0]}>
                        <mesh position={[0, 0, 0]} receiveShadow><boxGeometry args={[26, 0.1, 14]} /><meshStandardMaterial color="#d4c3a3" roughness={0.9} /></mesh>
                        
                        <mesh position={[-4, 0.3, 2]} castShadow><boxGeometry args={[4, 0.4, 2.5]} /><meshStandardMaterial map={tex.woodDark.map} bumpMap={tex.woodDark.bumpMap} roughness={0.6}/></mesh>
                        <mesh position={[-4, 0.1, 4.5]} castShadow><boxGeometry args={[1.2, 0.15, 1.2]} /><meshStandardMaterial color="#222" roughness={0.9}/></mesh>
                        <mesh position={[-4, 0.1, -0.5]} castShadow><boxGeometry args={[1.2, 0.15, 1.2]} /><meshStandardMaterial color="#222" roughness={0.9}/></mesh>
                        <mesh position={[-1.5, 0.1, 2]} castShadow><boxGeometry args={[1.2, 0.15, 1.2]} /><meshStandardMaterial color="#222" roughness={0.9}/></mesh>
                        <mesh position={[-6.5, 0.1, 2]} castShadow><boxGeometry args={[1.2, 0.15, 1.2]} /><meshStandardMaterial color="#222" roughness={0.9}/></mesh>
                        
                        <mesh position={[8, 0.5, 4]} castShadow><boxGeometry args={[6, 1, 2.5]} /><meshStandardMaterial color="#c0c0c0" roughness={0.8} /></mesh>
                        <mesh position={[8, 0.1, 4]} castShadow><boxGeometry args={[7, 0.1, 5]} /><meshStandardMaterial color="#332211" roughness={0.9}/></mesh>
                        <mesh position={[8, 0.4, 1.5]} castShadow><boxGeometry args={[3, 0.6, 1.5]} /><meshStandardMaterial map={tex.woodDark.map} bumpMap={tex.woodDark.bumpMap} roughness={0.6}/></mesh>
                        
                        {/* New Interior Staircase connecting 1st and 2nd floor */}
                        <group position={[-10, 0.1, -4]}>
                            {Array.from({length: 12}).map((_, i) => (
                                <mesh key={`stair-${i}`} position={[0, i*0.4, i*0.4]} castShadow>
                                    <boxGeometry args={[2.5, 0.4, 0.6]} />
                                    <meshStandardMaterial map={tex.woodDark.map} roughness={0.7} />
                                </mesh>
                            ))}
                            {/* Decorative traditional statue on stairs base */}
                            <mesh position={[1, 1, 2]} castShadow>
                                <boxGeometry args={[0.6, 1.5, 0.6]} />
                                <meshStandardMaterial color="#885533" roughness={0.4} />
                            </mesh>
                        </group>
                    </group>

                    <mesh position={[-13, 2.2, 0]} castShadow receiveShadow><boxGeometry args={[0.5, 4.4, 14]} /><meshStandardMaterial map={tex.woodDark.map} bumpMap={tex.woodDark.bumpMap} roughness={0.8} /></mesh>
                    <mesh position={[13, 2.2, 0]} castShadow receiveShadow><boxGeometry args={[0.5, 4.4, 14]} /><meshStandardMaterial map={tex.woodDark.map} bumpMap={tex.woodDark.bumpMap} roughness={0.8} /></mesh>
                    <mesh position={[0, 2.2, -7]} castShadow receiveShadow><boxGeometry args={[26, 4.4, 0.5]} /><meshStandardMaterial map={tex.woodDark.map} bumpMap={tex.woodDark.bumpMap} roughness={0.8} /></mesh>
                    <mesh position={[0, 2.2, 7]} castShadow receiveShadow>
                        <boxGeometry args={[26, 4.4, 0.1]} />
                        <meshStandardMaterial map={tex.shoji.map} bumpMap={tex.shoji.bumpMap} emissiveMap={tex.shoji.map} emissive="#ffddaa" emissiveIntensity={2} transparent opacity={0.95} roughness={0.4} />
                    </mesh>

                    {/* Mid Roof correctly built (no protruding corners) */}
                    <group position={[0, 4.6, 0]}>
                        <mesh position={[0, 0.4, 0]} castShadow><boxGeometry args={[29, 0.8, 17]} /><meshStandardMaterial color="#111" /></mesh>
                        {/* Angled trims */}
                        <mesh position={[0, 0.6, 8.5]} rotation={[-0.2, 0, 0]} castShadow><boxGeometry args={[30, 1.5, 1]} /><meshStandardMaterial color="#1a1c1e" /></mesh>
                        <mesh position={[0, 0.6, -8.5]} rotation={[0.2, 0, 0]} castShadow><boxGeometry args={[30, 1.5, 1]} /><meshStandardMaterial color="#1a1c1e" /></mesh>
                        <mesh position={[-14.5, 0.6, 0]} rotation={[0, 0, 0.2]} castShadow><boxGeometry args={[1, 1.5, 18]} /><meshStandardMaterial color="#1a1c1e" /></mesh>
                        <mesh position={[14.5, 0.6, 0]} rotation={[0, 0, -0.2]} castShadow><boxGeometry args={[1, 1.5, 18]} /><meshStandardMaterial color="#1a1c1e" /></mesh>
                    </group>

                    {/* Second Floor */}
                    <group position={[0, 5.2, -2]}>
                        <mesh position={[0, 0, 0]} castShadow receiveShadow><boxGeometry args={[24, 0.2, 14]} /><meshStandardMaterial map={tex.woodDark.map} bumpMap={tex.woodDark.bumpMap} roughness={0.8} /></mesh>
                        
                        <mesh position={[0, 1.2, 8]} castShadow receiveShadow><boxGeometry args={[24, 2.4, 0.1]} /><meshPhysicalMaterial color="#ffffff" transmission={0.98} roughness={0.0} ior={1.5} transparent opacity={1} /></mesh>
                        <mesh position={[-12, 1.2, 4]} castShadow receiveShadow><boxGeometry args={[0.1, 2.4, 8]} /><meshPhysicalMaterial color="#ffffff" transmission={0.98} roughness={0.0} ior={1.5} transparent opacity={1} /></mesh>
                        <mesh position={[12, 1.2, 4]} castShadow receiveShadow><boxGeometry args={[0.1, 2.4, 8]} /><meshPhysicalMaterial color="#ffffff" transmission={0.98} roughness={0.0} ior={1.5} transparent opacity={1} /></mesh>

                        <mesh position={[0, 2, -1]} castShadow receiveShadow><boxGeometry args={[18, 4, 10]} /><meshStandardMaterial map={tex.woodDark.map} bumpMap={tex.woodDark.bumpMap} roughness={0.8} /></mesh>
                        
                        <mesh position={[0, 2, 4.1]} castShadow receiveShadow>
                            <boxGeometry args={[18, 4, 0.1]} />
                            <meshStandardMaterial map={tex.shoji.map} bumpMap={tex.shoji.bumpMap} emissiveMap={tex.shoji.map} emissive="#ffddaa" emissiveIntensity={2.5} transparent opacity={0.95} />
                        </mesh>
                        
                        {/* Main Hip Roof - Fixed perfect architecture */}
                        <group position={[0, 4.2, -1]}>
                            <mesh position={[0, 2.2, 0]} castShadow><boxGeometry args={[12, 0.6, 0.6]} /><meshStandardMaterial color="#111" /></mesh>
                            <mesh position={[0, 1.2, 2.6]} rotation={[-0.45, 0, 0]} castShadow><boxGeometry args={[18, 3.5, 0.5]} /><meshStandardMaterial color="#1a1c1e" /></mesh>
                            <mesh position={[0, 1.2, -2.6]} rotation={[0.45, 0, 0]} castShadow><boxGeometry args={[18, 3.5, 0.5]} /><meshStandardMaterial color="#1a1c1e" /></mesh>
                            <mesh position={[-9.2, 1.2, 0]} rotation={[0, 0, 0.45]} castShadow><boxGeometry args={[0.5, 3.5, 6]} /><meshStandardMaterial color="#1a1c1e" /></mesh>
                            <mesh position={[9.2, 1.2, 0]} rotation={[0, 0, -0.45]} castShadow><boxGeometry args={[0.5, 3.5, 6]} /><meshStandardMaterial color="#1a1c1e" /></mesh>
                            {/* Fill corners */}
                            <mesh position={[-7.5, 1, 3.5]} rotation={[-0.4, 0.6, 0.4]} castShadow><boxGeometry args={[4, 0.5, 4]} /><meshStandardMaterial color="#111" /></mesh>
                            <mesh position={[7.5, 1, 3.5]} rotation={[-0.4, -0.6, -0.4]} castShadow><boxGeometry args={[4, 0.5, 4]} /><meshStandardMaterial color="#111" /></mesh>
                            <mesh position={[-7.5, 1, -3.5]} rotation={[0.4, -0.6, 0.4]} castShadow><boxGeometry args={[4, 0.5, 4]} /><meshStandardMaterial color="#111" /></mesh>
                            <mesh position={[7.5, 1, -3.5]} rotation={[0.4, 0.6, -0.4]} castShadow><boxGeometry args={[4, 0.5, 4]} /><meshStandardMaterial color="#111" /></mesh>
                        </group>
                    </group>
                </group>

                {/* --- 2. SAUNA BUILDING --- */}
                <group position={[55, 1.5, -25]} scale={1.8}>
                    <mesh position={[0, 2, 0]} castShadow receiveShadow><boxGeometry args={[10, 4, 10]} /><meshStandardMaterial map={tex.woodDark.map} bumpMap={tex.woodDark.bumpMap} roughness={0.9} /></mesh>
                    <mesh position={[0, 2, 5.1]} castShadow receiveShadow><boxGeometry args={[8, 3, 0.1]} /><meshPhysicalMaterial color="#ffffff" transmission={0.6} roughness={0.5} ior={1.4} transparent opacity={0.8} /></mesh>
                    <mesh position={[0, 5.5, 0]} scale={[1, 1, 1]} rotation={[0, Math.PI/4, 0]} castShadow receiveShadow>
                        <coneGeometry args={[9, 3, 4]} />
                        <meshStandardMaterial color="#1a1c1e" roughness={0.9} />
                    </mesh>
                    {/* Small tub */}
                    <mesh position={[-8, 0, 4]} receiveShadow><boxGeometry args={[6, 1, 6]} /><meshStandardMaterial map={tex.woodDark.map} bumpMap={tex.woodDark.bumpMap} /></mesh>
                    <mesh position={[-8, 0.8, 4]} rotation={[-Math.PI/2, 0, 0]}>
                        <planeGeometry args={[5, 5]} />
                        <MeshReflectorMaterial blur={isMobile ? [0,0] : [100, 50]} resolution={isMobile ? 256 : 512} mixBlur={1} mixStrength={40} roughness={0.1} color="#005588" metalness={0.8} mirror={0.8} />
                    </mesh>
                </group>

                {/* --- 3. WATERFALLS --- */}
                <group position={[-45, 0, -35]} scale={1.8}>
                    <mesh position={[0, 6, 0]} castShadow receiveShadow><boxGeometry args={[15, 12, 10]} /><meshStandardMaterial map={tex.rock.map} bumpMap={tex.rock.bumpMap} roughness={1} /></mesh>
                    <mesh position={[5, 12, -5]} castShadow receiveShadow><boxGeometry args={[20, 10, 10]} /><meshStandardMaterial map={tex.rock.map} bumpMap={tex.rock.bumpMap} roughness={1} /></mesh>
                    
                    {/* Flowing Water with volume */}
                    <mesh position={[2, 9, 5.1]} rotation={[0, 0, -0.1]}><boxGeometry args={[6, 12, 0.4]} /><meshPhysicalMaterial color="#bbddff" emissive="#0088cc" emissiveIntensity={0.5} transmission={0.9} roughness={0.2} ior={1.33} /></mesh>
                    <mesh position={[0, 3, 5.2]} rotation={[0.2, 0, 0]}><boxGeometry args={[8, 8, 0.4]} /><meshPhysicalMaterial color="#bbddff" emissive="#0088cc" emissiveIntensity={0.5} transmission={0.9} roughness={0.2} ior={1.33} /></mesh>
                    <pointLight position={[2, 6, 8]} color="#00aaff" intensity={4} distance={40} />
                </group>

                {/* --- 4. ONSEN (Perfect Clean Stone Slab + Hidden Neon + Reflector Water) --- */}
                <group position={[-16, 0, 16]} scale={1.8}>
                    {/* Clean Stone Slab Lip Perimeter (No generic rocks) */}
                    <mesh position={[0, 0.3, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
                        <ringGeometry args={[16, 18, 64]} />
                        <meshStandardMaterial map={tex.stonePath.map} bumpMap={tex.stonePath.bumpMap} roughness={0.8} />
                    </mesh>
                    
                    <mesh position={[0, -0.2, 0]} castShadow receiveShadow>
                        <cylinderGeometry args={[16, 16, 1, 64, 1, true]} />
                        <meshStandardMaterial map={tex.stonePath.map} bumpMap={tex.stonePath.bumpMap} roughness={0.8} side={THREE.BackSide}/>
                    </mesh>

                    {/* Hidden Cyan LED UNDER the slab, softer */}
                    <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[15.6, 16, 64]} />
                        <meshStandardMaterial color="#00aaff" emissive="#00aaff" emissiveIntensity={2} />
                    </mesh>
                    <pointLight position={[0, -0.5, 0]} color="#00aaff" intensity={2} distance={25} />

                    {/* Deep clear water */}
                    <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                        <circleGeometry args={[16, 64]} />
                        <MeshReflectorMaterial
                            blur={isMobile ? [0,0] : [300, 100]}
                            resolution={isMobile ? 256 : 1024}
                            mixBlur={1}
                            mixStrength={60}
                            roughness={0.1}
                            depthScale={1}
                            minDepthThreshold={0.4}
                            maxDepthThreshold={1.4}
                            color="#0088bb"
                            metalness={0.5}
                            mirror={0.8}
                        />
                    </mesh>
                    
                    {/* Rocky bottom visible through water */}
                    <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                        <circleGeometry args={[16, 32]} />
                        <meshStandardMaterial map={tex.rock.map} roughness={1} />
                    </mesh>
                </group>

                {/* --- 5. STONE DRAGON --- */}
                <group position={[-8, 0.5, -8]} scale={2}>
                    <mesh position={[0, 1, 0]} castShadow receiveShadow><dodecahedronGeometry args={[3, 1]} /><meshStandardMaterial map={tex.rock.map} bumpMap={tex.rock.bumpMap} color="#4a5e3d" roughness={1} /></mesh>
                    <mesh position={[0, 3, 0]} castShadow receiveShadow><sphereGeometry args={[1.5]} /><meshStandardMaterial map={tex.rock.map} color="#3a4e2d" roughness={1} /></mesh>
                    <mesh position={[2, 2.5, 0]} castShadow receiveShadow><cylinderGeometry args={[0.8, 1, 3]} rotation={[0, 0, Math.PI/4]} /><meshStandardMaterial map={tex.rock.map} color="#3a4e2d" roughness={1} /></mesh>
                    <mesh position={[-2, 4, 1]} castShadow receiveShadow><boxGeometry args={[1.5, 2, 2.5]} /><meshStandardMaterial map={tex.rock.map} color="#3a4e2d" roughness={1} /></mesh>
                    <mesh position={[-2.5, 4.5, 2.1]}><sphereGeometry args={[0.2]} /><meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={6} /></mesh>
                    <mesh position={[-1.5, 4.5, 2.1]}><sphereGeometry args={[0.2]} /><meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={6} /></mesh>
                    <pointLight position={[-2, 4, 3]} color="#00ffff" intensity={4} distance={25} />
                </group>

                {/* --- 6. MASSIVE SAKURA TREES --- */}
                <SakuraTree position={[-25, 1.5, -25]} scale={3.5} />
                <SakuraTree position={[45, 1.5, -10]} scale={2.5} />

                {/* --- 7. PERGOLA (Wisteria) --- */}
                <group position={[28, 0, 15]} scale={1.8}>
                    <mesh position={[-4, 3, -3]} castShadow receiveShadow><boxGeometry args={[0.4, 6, 0.4]} /><meshStandardMaterial map={tex.woodDark.map} bumpMap={tex.woodDark.bumpMap} /></mesh>
                    <mesh position={[4, 3, -3]} castShadow receiveShadow><boxGeometry args={[0.4, 6, 0.4]} /><meshStandardMaterial map={tex.woodDark.map} bumpMap={tex.woodDark.bumpMap} /></mesh>
                    <mesh position={[-4, 3, 3]} castShadow receiveShadow><boxGeometry args={[0.4, 6, 0.4]} /><meshStandardMaterial map={tex.woodDark.map} bumpMap={tex.woodDark.bumpMap} /></mesh>
                    <mesh position={[4, 3, 3]} castShadow receiveShadow><boxGeometry args={[0.4, 6, 0.4]} /><meshStandardMaterial map={tex.woodDark.map} bumpMap={tex.woodDark.bumpMap} /></mesh>
                    <mesh position={[0, 6, 0]} castShadow receiveShadow><boxGeometry args={[10, 0.4, 8]} /><meshStandardMaterial map={tex.woodDark.map} bumpMap={tex.woodDark.bumpMap} /></mesh>
                    
                    {Array.from({ length: 40 }).map((_, i) => (
                        <mesh key={`wist-${i}`} position={[(Math.random()-0.5)*9, 4.5, (Math.random()-0.5)*7]} castShadow receiveShadow>
                            <planeGeometry args={[1.5, 4]} />
                            <meshStandardMaterial map={tex.leaf.map} alphaMap={tex.leaf.alpha} alphaTest={0.4} color="#8a2be2" side={THREE.DoubleSide} roughness={0.6} />
                        </mesh>
                    ))}

                    {/* Warm paper lanterns */}
                    {Array.from({ length: 6 }).map((_, i) => (
                        <group key={`lan-${i}`} position={[(i%3)*3 - 3, 4.5, Math.floor(i/3)*4 - 2]}>
                            <mesh><boxGeometry args={[0.6, 1, 0.6]} /><meshStandardMaterial color="#fff0d0" emissive="#ffdd88" emissiveIntensity={3} /></mesh>
                            <pointLight color="#ffaa00" intensity={3} distance={25} />
                        </group>
                    ))}
                </group>

                {/* --- 8. HUGE TORII GATE (Softer Neon) --- */}
                <group position={[50, 0, 50]} rotation={[0, Math.PI/6, 0]} scale={2.2}>
                    <mesh position={[-4, 5, 0]} castShadow receiveShadow><cylinderGeometry args={[0.8, 0.8, 10]} /><meshStandardMaterial color="#080808" roughness={0.2} /></mesh>
                    <mesh position={[4, 5, 0]} castShadow receiveShadow><cylinderGeometry args={[0.8, 0.8, 10]} /><meshStandardMaterial color="#080808" roughness={0.2} /></mesh>
                    <mesh position={[0, 8, 0]} castShadow receiveShadow><boxGeometry args={[11, 1, 1]} /><meshStandardMaterial color="#080808" roughness={0.2} /></mesh>
                    <mesh position={[0, 9.5, 0]} castShadow receiveShadow><boxGeometry args={[13, 1.2, 1.2]} /><meshStandardMaterial color="#080808" roughness={0.2} /></mesh>
                    
                    {/* Subtle Neon Magenta Lines */}
                    <mesh position={[-4.8, 5, 0]}><cylinderGeometry args={[0.08, 0.08, 10]} /><meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={2} /></mesh>
                    <mesh position={[4.8, 5, 0]}><cylinderGeometry args={[0.08, 0.08, 10]} /><meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={2} /></mesh>
                    <mesh position={[0, 8, 0.55]}><boxGeometry args={[11.1, 0.15, 0.15]} /><meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={2} /></mesh>
                    <mesh position={[0, 9.7, 0.65]}><boxGeometry args={[13.1, 0.15, 0.15]} /><meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={2} /></mesh>
                    <pointLight position={[0, 10, 0]} color="#ff00ff" intensity={3} distance={30} />
                </group>

                {/* --- 9. PERIMETER FENCE --- */}
                <mesh castShadow receiveShadow geometry={useMemo(() => buildMergedGeometry([
                    ...Array.from({ length: 400 }).map((_, i) => ({ type: 'cylinder', args: [0.15, 0.15, 8], position: [-120 + (i * 0.5), 4, -120] })),
                    ...Array.from({ length: 400 }).map((_, i) => ({ type: 'cylinder', args: [0.15, 0.15, 8], position: [-120, 4, -120 + (i * 0.5)] })),
                    ...Array.from({ length: 400 }).map((_, i) => ({ type: 'cylinder', args: [0.15, 0.15, 8], position: [80, 4, -120 + (i * 0.5)] })),
                    ...Array.from({ length: 180 }).map((_, i) => ({ type: 'cylinder', args: [0.15, 0.15, 8], position: [-120 + (i * 0.5), 4, 130] })),
                    ...Array.from({ length: 100 }).map((_, i) => ({ type: 'cylinder', args: [0.15, 0.15, 8], position: [50 + (i * 0.5), 4, 130] })),
                ]), [])}>
                    <meshStandardMaterial map={tex.woodDark.map} bumpMap={tex.woodDark.bumpMap} roughness={0.9} color="#667755" />
                </mesh>

                {/* --- 10. STONE PATH --- */}
                <mesh position={[0, 0.05, 0]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
                    <planeGeometry args={[260, 260]} />
                    <meshStandardMaterial map={tex.stonePath.map} bumpMap={tex.stonePath.bumpMap} emissiveMap={tex.stonePath.emissiveMap} emissive="#00aaaa" emissiveIntensity={2} roughness={0.8} />
                </mesh>
                
            </RigidBody>
            
            <pointLight position={[-20, 8, 20]} color="#00ffff" intensity={4} distance={70} />
            <pointLight position={[30, 15, -15]} color="#ffddaa" intensity={6} distance={80} />
            <ambientLight intensity={0.2} color="#001133" />
            
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
