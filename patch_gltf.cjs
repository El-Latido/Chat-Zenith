const fs = require('fs');

let content = fs.readFileSync('src/components/Builder3D.tsx', 'utf8');

const gltfComponent = `
function GLTFModel({ url, scale = 1 }: { url: string, scale?: number | [number, number, number] }) {
    try {
        const { scene } = useGLTF(url);
        return <primitive object={scene.clone()} scale={scale} />;
    } catch (e) {
        // Fallback en caso de error de red o CORS
        return (
           <group position={[0, -0.5, 0]}>
               <mesh position={[0, 0.5, 0]}>
                   <cylinderGeometry args={[0.2, 0.3, 1, 8]} />
                   <meshStandardMaterial color="#5c4033" />
               </mesh>
               <mesh position={[0, 1.5, 0]}>
                   <dodecahedronGeometry args={[1, 1]} />
                   <meshStandardMaterial color="#2d5a27" />
               </mesh>
           </group>
        );
    }
}
`;

content = content.replace("function PlacedObject", gltfComponent + "\nfunction PlacedObject");

const oldTreeCode = `item.subType === 'Árbol' ? (
                   <group position={[0, -0.5, 0]}>
                       <mesh position={[0, 0.5, 0]}>
                           <cylinderGeometry args={[0.2, 0.3, 1, 8]} />
                           <meshStandardMaterial color="#5c4033" />
                       </mesh>
                       <mesh position={[0, 1.5, 0]}>
                           <dodecahedronGeometry args={[1, 1]} />
                           <meshStandardMaterial color="#2d5a27" />
                       </mesh>
                   </group>
                ) : (
                    <dodecahedronGeometry args={[0.8, 1]} />
                )`;

const newTreeCode = `item.subType === 'Árbol' ? (
                   <React.Suspense fallback={<dodecahedronGeometry args={[0.8, 1]} />}>
                       <GLTFModel url="https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Fox/glTF/Fox.gltf" scale={0.02} />
                   </React.Suspense>
                ) : (
                    <React.Suspense fallback={<dodecahedronGeometry args={[0.8, 1]} />}>
                       <GLTFModel url="https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Duck/glTF/Duck.gltf" scale={0.5} />
                   </React.Suspense>
                )`;

content = content.replace(oldTreeCode, newTreeCode);

fs.writeFileSync('src/components/Builder3D.tsx', content);
