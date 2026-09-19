#!/usr/bin/env python3
import sys
import os
import shutil
import subprocess
import json
import urllib.request
import urllib.error

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "Falta el token de Hugging Face"}))
        sys.exit(1)

    token = sys.argv[1].strip()
    space_name = sys.argv[2].strip() if len(sys.argv) > 2 else "chatliz-online/ChatLiz"

    if not token.startswith("hf_"):
        print(json.dumps({"success": False, "error": "El token debe comenzar con 'hf_'"}))
        sys.exit(1)

    # 1. Validar el token con Hugging Face
    try:
        req = urllib.request.Request(
            "https://huggingface.co/api/whoami-v2",
            headers={
                "Authorization": f"Bearer {token}",
                "User-Agent": "ChatLiz-Deployer/1.0"
            }
        )
        with urllib.request.urlopen(req) as resp:
            user_info = json.loads(resp.read().decode())
            hf_user = user_info.get("name", "hf_user")
    except urllib.error.HTTPError as e:
        if e.code == 401:
            print(json.dumps({"success": False, "error": "Token no válido o expirado. Genera uno nuevo en huggingface.co/settings/tokens con permisos de 'Write'"}))
        elif e.code == 403:
            print(json.dumps({"success": False, "error": "El token no tiene permisos de escritura (Write). Asegúrate de otorgar 'Write' permissions."}))
        else:
            print(json.dumps({"success": False, "error": f"Error de autenticación con Hugging Face (código {e.code})"}))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({"success": False, "error": f"Error al contactar con Hugging Face: {str(e)}"}))
        sys.exit(1)

    # 2. Preparar carpeta temporal
    work_dir = "/tmp/hf_space_sync"
    if os.path.exists(work_dir):
        shutil.rmtree(work_dir, ignore_errors=True)
    os.makedirs(work_dir, exist_ok=True)

    remote_url = f"https://{hf_user}:{token}@huggingface.co/spaces/{space_name}"

    try:
        # Clonar el espacio existente
        clone_res = subprocess.run(
            ["git", "clone", "--depth", "1", remote_url, work_dir],
            capture_output=True,
            text=True,
            timeout=60
        )
        if clone_res.returncode != 0:
            # Si falla la clonación por ser nuevo o privado, inicializamos git
            subprocess.run(["git", "init"], cwd=work_dir, check=True)
            subprocess.run(["git", "remote", "add", "origin", remote_url], cwd=work_dir, check=True)

        # Configurar usuario git
        subprocess.run(["git", "config", "user.name", hf_user], cwd=work_dir, check=True)
        subprocess.run(["git", "config", "user.email", f"{hf_user}@users.noreply.huggingface.co"], cwd=work_dir, check=True)

        # 3. Copiar archivos del proyecto actual hacia work_dir
        source_dir = os.path.abspath(".")
        
        # Eliminar archivos viejos excepto .git
        for item in os.listdir(work_dir):
            if item == ".git":
                continue
            item_path = os.path.join(work_dir, item)
            if os.path.isdir(item_path):
                shutil.rmtree(item_path, ignore_errors=True)
            else:
                try:
                    os.remove(item_path)
                except Exception:
                    pass

        exclude_dirs = {"node_modules", "dist", ".git", ".aistudio", "__pycache__"}
        exclude_exts = {".log", ".tmp", ".zip", ".jpg", ".jpeg"}

        # Copiar estructura
        for root, dirs, files in os.walk(source_dir):
            dirs[:] = [d for d in dirs if d not in exclude_dirs and not d.startswith(".")]
            rel_path = os.path.relpath(root, source_dir)
            target_sub_dir = os.path.join(work_dir, rel_path) if rel_path != "." else work_dir
            os.makedirs(target_sub_dir, exist_ok=True)

            for file in files:
                # Omitir temporales, parches, binarios y secretos
                if any(file.endswith(ext) for ext in exclude_exts):
                    continue
                if file.startswith(".env") or file.startswith("patch_") or file.startswith("test_"):
                    continue
                if file.startswith("replace_") or file.startswith("reconstruct") or file.startswith("rewrite_"):
                    continue
                if "chatliz-hf-space" in file or "mecha_celestial_bg" in file:
                    continue

                src_file = os.path.join(root, file)
                dst_file = os.path.join(target_sub_dir, file)
                shutil.copy2(src_file, dst_file)

        # 4. Git commit & push
        subprocess.run(["git", "add", "-A"], cwd=work_dir, check=True)

        # Verificar si hay cambios
        status_res = subprocess.run(["git", "status", "--porcelain"], cwd=work_dir, capture_output=True, text=True)
        if not status_res.stdout.strip():
            print(json.dumps({
                "success": True,
                "message": "El espacio en Hugging Face ya se encuentra 100% actualizado con la última versión.",
                "user": hf_user,
                "space": space_name,
                "spaceUrl": f"https://{space_name.split('/')[-1].lower()}-{space_name.split('/')[0].lower()}.hf.space/"
            }))
            sys.exit(0)

        commit_res = subprocess.run(
            ["git", "commit", "-m", "Transporte de aspecto, diseño y funcionalidad desde Chat-Zenith"],
            cwd=work_dir,
            capture_output=True,
            text=True
        )

        push_res = subprocess.run(
            ["git", "push", "origin", "HEAD:main"],
            cwd=work_dir,
            capture_output=True,
            text=True,
            timeout=120
        )

        if push_res.returncode != 0:
            # Intentar con force push si hay divergencia
            push_force = subprocess.run(
                ["git", "push", "-f", "origin", "HEAD:main"],
                cwd=work_dir,
                capture_output=True,
                text=True,
                timeout=120
            )
            if push_force.returncode != 0:
                print(json.dumps({
                    "success": False,
                    "error": f"Error en git push: {push_force.stderr or push_res.stderr}"
                }))
                sys.exit(1)

        # Limpiar
        shutil.rmtree(work_dir, ignore_errors=True)

        print(json.dumps({
            "success": True,
            "message": "¡Transporte completado con éxito! Hugging Face está compilando tu Space.",
            "user": hf_user,
            "space": space_name,
            "spaceUrl": "https://chatliz-online-chatliz.hf.space/"
        }))

    except Exception as e:
        shutil.rmtree(work_dir, ignore_errors=True)
        print(json.dumps({"success": False, "error": f"Excepción durante el despliegue: {str(e)}"}))
        sys.exit(1)

if __name__ == "__main__":
    main()
