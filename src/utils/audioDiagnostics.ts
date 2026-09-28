// Script de Diagnóstico para el Cliente (Frontend)
// Inspecciona cabeceras mágicas, decodificación Web Audio API y reporte visual interactivo

export interface AudioDiagnosticReport {
  timestamp: string;
  sourceType: string;
  dataLengthBytes: number;
  detectedHeader: string;
  isWavRIFF: boolean;
  sampleRate: string;
  numberOfChannels: string | number;
  durationSeconds: string;
  decodeSuccess: boolean;
  errorStage: string;
  errorMessage: string;
}

export async function testVoiceWithDiagnostics(
  audioSource: string | Blob | ArrayBuffer,
  mimeTypeHint = "audio/wav"
): Promise<AudioDiagnosticReport> {
  const report: AudioDiagnosticReport = {
    timestamp: new Date().toISOString(),
    sourceType: typeof audioSource === "string" ? "Base64/URL" : "ArrayBuffer/Blob",
    dataLengthBytes: 0,
    detectedHeader: "Desconocido",
    isWavRIFF: false,
    sampleRate: "N/A",
    numberOfChannels: "N/A",
    durationSeconds: "N/A",
    decodeSuccess: false,
    errorStage: "Ninguna",
    errorMessage: "Sin errores registrados",
  };

  try {
    let arrayBuffer: ArrayBuffer;

    // 1. Fase de Ingesta / Conversión de Datos
    report.errorStage = "Conversión de Datos";
    if (typeof audioSource === "string") {
      if (audioSource.startsWith("data:") || audioSource.length > 500) {
        const cleanBase64 = audioSource.replace(/^data:audio\/\w+;base64,/, "");
        const binaryString = window.atob(cleanBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        arrayBuffer = bytes.buffer;
      } else {
        const response = await fetch(audioSource);
        arrayBuffer = await response.arrayBuffer();
      }
    } else if (audioSource instanceof Blob) {
      arrayBuffer = await audioSource.arrayBuffer();
    } else if (audioSource instanceof ArrayBuffer) {
      arrayBuffer = audioSource;
    } else {
      throw new Error("Formato de audio no compatible");
    }

    report.dataLengthBytes = arrayBuffer ? arrayBuffer.byteLength : 0;

    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error("El buffer de audio recibido está completamente vacío (0 bytes).");
    }

    // 2. Inspección de Cabeceras Mágicas (Magic Bytes)
    report.errorStage = "Inspección de Cabecera";
    const bytesHeader = new Uint8Array(arrayBuffer.slice(0, 12));
    const headerStr = Array.from(bytesHeader.slice(0, 4))
      .map((b) => String.fromCharCode(b))
      .join("");

    report.detectedHeader = headerStr;
    report.isWavRIFF = headerStr === "RIFF";

    if (!report.isWavRIFF) {
      console.warn("Advertencia: El audio no contiene la cabecera 'RIFF' estándar de archivo WAV.");
    }

    // 3. Fase de Decodificación Web Audio API
    report.errorStage = "Decodificación Web Audio API";
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Clonamos el buffer porque decodeAudioData lo invalida al procesarlo
    const bufferCopy = arrayBuffer.slice(0);
    const decodedBuffer = await audioCtx.decodeAudioData(bufferCopy);

    report.decodeSuccess = true;
    report.sampleRate = `${decodedBuffer.sampleRate} Hz`;
    report.numberOfChannels = decodedBuffer.numberOfChannels;
    report.durationSeconds = `${decodedBuffer.duration.toFixed(2)} seg`;

    // 4. Intentar Reproducción
    report.errorStage = "Reproducción";
    const source = audioCtx.createBufferSource();
    source.buffer = decodedBuffer;
    source.connect(audioCtx.destination);
    source.start(0);

    report.errorStage = "Completado Exitosamente";
  } catch (err: any) {
    report.decodeSuccess = false;
    report.errorMessage = err?.message || String(err);
    console.error("Error en Diagnóstico de Audio:", err);
  } finally {
    showDiagnosticUI(report);
  }

  return report;
}

// Ventana emergente (UI) con el reporte completo
export function showDiagnosticUI(report: AudioDiagnosticReport): void {
  if (typeof document === "undefined") return;

  const existingModal = document.getElementById("audio-diag-modal");
  if (existingModal) existingModal.remove();

  const modal = document.createElement("div");
  modal.id = "audio-diag-modal";
  modal.style.cssText = `
    position: fixed; top: 20px; right: 20px; z-index: 99999;
    width: 380px; max-width: calc(100vw - 40px); background: #111827; color: #f3f4f6;
    border: 2px solid ${report.decodeSuccess ? "#10b981" : "#ef4444"};
    border-radius: 12px; padding: 16px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.85); backdrop-filter: blur(10px);
  `;

  const statusColor = report.decodeSuccess ? "#10b981" : "#ef4444";
  const statusText = report.decodeSuccess ? "ÉXITO (Reproduciendo)" : "FALLO CRÍTICO";

  const rawJson = JSON.stringify(report, null, 2);

  modal.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
      <strong style="color: ${statusColor}; font-size: 13px;">[DIAGNÓSTICO DE AUDIO] ${statusText}</strong>
      <button id="close-diag-btn" style="background:none; border:none; color:#9ca3af; cursor:pointer; font-size: 18px; line-height: 1;">✕</button>
    </div>
    <div style="background:#1f2937; padding:10px; border-radius:6px; margin-bottom:10px; overflow-x:auto;">
      <div style="margin-bottom:4px;"><b>Fase del Error:</b> <span style="color:#f59e0b">${report.errorStage}</span></div>
      <div style="margin-bottom:4px;"><b>Detalle:</b> <span style="color:${report.decodeSuccess ? '#10b981' : '#f87171'}">${report.errorMessage}</span></div>
      <hr style="border-color:#374151; margin:8px 0;">
      <div><b>Cabecera:</b> ${report.detectedHeader} (WAV RIFF: ${report.isWavRIFF})</div>
      <div><b>Tamaño:</b> ${report.dataLengthBytes} bytes</div>
      <div><b>Frecuencia:</b> ${report.sampleRate}</div>
      <div><b>Canales:</b> ${report.numberOfChannels}</div>
      <div><b>Duración:</b> ${report.durationSeconds}</div>
    </div>
    <button id="copy-diag-btn" style="width:100%; padding:8px; background:#3b82f6; color:white; border:none; border-radius:6px; cursor:pointer; font-weight:bold; font-size:12px; transition:background 0.2s;">
      📋 Copiar Informe
    </button>
  `;

  document.body.appendChild(modal);

  const closeBtn = document.getElementById("close-diag-btn");
  if (closeBtn) {
    closeBtn.onclick = () => modal.remove();
  }

  const copyBtn = document.getElementById("copy-diag-btn");
  if (copyBtn) {
    copyBtn.onclick = () => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(rawJson);
        copyBtn.innerText = "✅ ¡Informe Copiado al Portapapeles!";
        setTimeout(() => {
          if (copyBtn) copyBtn.innerText = "📋 Copiar Informe";
        }, 2500);
      }
    };
  }
}
