const fs = require('fs');

let content = fs.readFileSync('src/components/Builder3D.tsx', 'utf8');

const correctGLTFComponent = `
function GLTFModel({ url, scale = 1 }: { url: string, scale?: number | [number, number, number] }) {
    const { scene } = useGLTF(url);
    return <primitive object={scene.clone()} scale={scale} />;
}
`;

content = content.replace(/function GLTFModel[\s\S]*?\}\n/m, correctGLTFComponent);

fs.writeFileSync('src/components/Builder3D.tsx', content);
