#!/usr/bin/env python3
"""
Módulo de inferencia Coqui XTTS v2 para ChatLiz
Aplica clonación de voz de alta fidelidad, acondicionamiento acústico y parámetros de prosodia humana:
- temperature: 0.78 (entre 0.75 y 0.82 para mayor variabilidad acústica y entonación)
- speed: 0.98 (entre 0.95 y 1.0 para naturalidad sin apelotonamiento)
- repetition_penalty: 2.0 (evita bucles y artefactos)
- gpt_cond_len: 6 (segundos de acondicionamiento de audio de referencia)
- language: 'es'
- speaker_wav: archivo de referencia de audio (ej: elizabeth_reference.wav)
"""

import sys
import os
import argparse
import json
import base64

def infer_xtts(
    text: str,
    speaker_wav: str = "./voices/elizabeth_reference.wav",
    out_path: str = "./static/uploads/xtts_output.wav",
    language: str = "es",
    temperature: float = 0.78,
    speed: float = 0.98,
    repetition_penalty: float = 2.0,
    gpt_cond_len: int = 6
):
    # Validar audio de referencia
    if not os.path.exists(speaker_wav):
        fallback_candidates = [
            "./voices/elizabeth_reference.wav",
            "./voices/elizabeth.wav",
            os.path.join(os.path.dirname(__file__), "..", "voices", "elizabeth_reference.wav"),
            os.path.join(os.path.dirname(__file__), "..", "voices", "elizabeth.wav")
        ]
        for candidate in fallback_candidates:
            if os.path.exists(candidate):
                speaker_wav = candidate
                break

    try:
        from TTS.api import TTS
        tts = TTS(model_name="tts_models/multilingual/multi-dataset/xtts_v2")
        
        # Inferencia con parámetros optimizados
        tts.tts_to_file(
            text=text,
            speaker_wav=speaker_wav,
            language=language,
            file_path=out_path,
            temperature=temperature,
            speed=speed,
            repetition_penalty=repetition_penalty,
            gpt_cond_len=gpt_cond_len
        )
        
        if os.path.exists(out_path) and os.path.getsize(out_path) > 100:
            with open(out_path, "rb") as f:
                b64 = base64.b64encode(f.read()).decode("utf-8")
            return {
                "success": True,
                "engine": "coqui_xtts_v2_python",
                "audioBase64": f"data:audio/wav;base64,{b64}",
                "speaker_wav_used": speaker_wav,
                "parameters": {
                    "temperature": temperature,
                    "speed": speed,
                    "repetition_penalty": repetition_penalty,
                    "gpt_cond_len": gpt_cond_len,
                    "language": language
                }
            }
        else:
            return {"success": False, "error": "El archivo de audio generado está vacío"}
    except ImportError:
        return {
            "success": False,
            "error": "Módulo Python TTS no instalado localmente; el backend utilizará la API remota XTTS v2 o el sintetizador acústico neuronal."
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

def main():
    parser = argparse.ArgumentParser(description="ChatLiz XTTS v2 Inference Engine")
    parser.add_argument("--text", type=str, required=True, help="Texto a sintetizar")
    parser.add_argument("--speaker_wav", type=str, default="./voices/elizabeth_reference.wav", help="Ruta al archivo WAV de referencia")
    parser.add_argument("--out_path", type=str, default="./static/uploads/xtts_output.wav", help="Ruta del archivo WAV de salida")
    parser.add_argument("--language", type=str, default="es", help="Idioma de síntesis")
    parser.add_argument("--temperature", type=float, default=0.78, help="Temperatura acústica (0.75 - 0.82)")
    parser.add_argument("--speed", type=float, default=0.98, help="Velocidad vocal (0.95 - 1.0)")
    parser.add_argument("--repetition_penalty", type=float, default=2.0, help="Penalización de repetición")
    parser.add_argument("--gpt_cond_len", type=int, default=6, help="Segundos de acondicionamiento de voz de referencia")
    
    args = parser.parse_args()
    result = infer_xtts(
        text=args.text,
        speaker_wav=args.speaker_wav,
        out_path=args.out_path,
        language=args.language,
        temperature=args.temperature,
        speed=args.speed,
        repetition_penalty=args.repetition_penalty,
        gpt_cond_len=args.gpt_cond_len
    )
    print(json.dumps(result))

if __name__ == "__main__":
    main()
