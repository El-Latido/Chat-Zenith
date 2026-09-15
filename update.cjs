const fs = require('fs');
const content = fs.readFileSync('src/components/Builder3D.tsx', 'utf8');
const newContent = content.replace(
`const ADMIN_UID = "AQUI_PONDRE_MI_UID";

export function Builder3D({ user }: Builder3DProps) {
  // Validate if the current user is the admin
  if (user.uid !== ADMIN_UID) {`,
`const ADMIN_UID = "AQUI_PONDRE_MI_UID";
const ALLOW_DEV_ACCESS = true; // Interruptor flexible para modo desarrollador/pruebas

export function Builder3D({ user }: Builder3DProps) {
  // Validate si tiene acceso (desarrollo o admin)
  const hasAccess = ALLOW_DEV_ACCESS || (user && user.uid === ADMIN_UID);

  if (!hasAccess) {`
);
fs.writeFileSync('src/components/Builder3D.tsx', newContent);
console.log("Updated");
