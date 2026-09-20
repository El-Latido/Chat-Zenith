import fs from "fs";
import path from "path";
import { uploadFiles, whoAmI } from "@huggingface/hub";

export async function deployToHuggingFaceSpace(
  token: string,
  targetSpace: string = "chatliz-online/ChatLiz"
) {
  const cleanToken = (token || "").trim();
  const cleanSpace = (targetSpace || "").trim() || "chatliz-online/ChatLiz";

  if (!cleanToken) {
    throw new Error("El token de Hugging Face es requerido.");
  }

  if (!cleanToken.startsWith("hf_")) {
    throw new Error("El token debe comenzar con 'hf_'. Por favor revísalo.");
  }

  // 1. Validar identidad en Hugging Face
  let hfUser = "hf_user";
  try {
    const userInfo = await whoAmI({ credentials: { accessToken: cleanToken } });
    hfUser = userInfo?.name || "hf_user";
  } catch (authErr: any) {
    const msg = authErr?.message || String(authErr);
    if (msg.includes("401") || msg.includes("Unauthorized") || msg.includes("Invalid")) {
      throw new Error("Token no válido o expirado. Genera uno nuevo en huggingface.co/settings/tokens con permisos de 'Write'");
    }
    if (msg.includes("403") || msg.includes("Forbidden")) {
      throw new Error("El token no tiene permisos de escritura ('Write'). Asegúrate de otorgar el rol 'Write' en tu cuenta de Hugging Face.");
    }
    throw new Error(`Error de autenticación con Hugging Face: ${msg}`);
  }

  // 2. Recolectar archivos del proyecto Chat-Liz
  const rootDir = process.cwd();
  const allowedRoots = new Set(["src", "public", "server"]);
  const allowedRootFiles = new Set([
    "Dockerfile",
    "README.md",
    "package.json",
    "server.ts",
    "vite.config.ts",
    "tsconfig.json",
    "tsconfig.app.json",
    "tsconfig.node.json",
    "index.html",
    "metadata.json",
    "components.json",
    "firebase-applet-config.json"
  ]);

  const fileList: string[] = [];

  for (const item of fs.readdirSync(rootDir)) {
    if (allowedRootFiles.has(item)) {
      fileList.push(item);
    } else if (allowedRoots.has(item)) {
      function walk(subDir: string) {
        for (const sub of fs.readdirSync(subDir)) {
          const full = path.join(subDir, sub);
          if (fs.statSync(full).isDirectory()) {
            walk(full);
          } else {
            // Ignorar zips masivos o archivos temporales
            if (!sub.endsWith(".zip") && !sub.endsWith(".tmp") && !sub.endsWith(".log")) {
              fileList.push(path.relative(rootDir, full));
            }
          }
        }
      }
      walk(path.join(rootDir, item));
    }
  }

  if (fileList.length === 0) {
    throw new Error("No se encontraron archivos de código fuente para sincronizar.");
  }

  const operations = fileList.map((relPath) => ({
    path: relPath,
    content: new Blob([fs.readFileSync(path.join(rootDir, relPath))]),
  }));

  // 3. Subir mediante la API oficial de Hugging Face
  const commitRes = await uploadFiles({
    accessToken: cleanToken,
    repo: { type: "space", name: cleanSpace },
    commitTitle: "Transporte de aspecto, diseño, limpiador de 20 mensajes y funcionalidades desde Chat-Zenith",
    commitDescription: `Sincronizado automáticamente por ${hfUser} desde Chat-Zenith`,
    files: operations,
  });

  const spaceSubdomain = cleanSpace.split("/")[1]?.toLowerCase() || cleanSpace.toLowerCase();
  const spaceAuthor = cleanSpace.split("/")[0]?.toLowerCase() || "";
  const spaceUrl = `https://${spaceAuthor}-${spaceSubdomain}.hf.space/`;

  return {
    success: true,
    message: "¡Transporte completado con éxito! Hugging Face está compilando tu Space con el Limpiador de 20 mensajes, Radio HD y nuevo diseño.",
    user: hfUser,
    space: cleanSpace,
    commitUrl: commitRes.commit?.url,
    spaceUrl,
  };
}
