# =====================================================================
# main.py - Pipeline de Entrenamiento e Inferencia Cuántica Híbrida
# =====================================================================

import torch
import torch.nn as nn
from model import QuantumHybrid

EPOCHS = 35
LEARNING_RATE = 0.03
BATCH_SIZE = 4

def generate_synthetic_quantum_data():
    """
    Genera dataset de ejemplo con simetría no lineal fácil de aprender por entrelazamiento.
    """
    torch.manual_seed(42)
    # 8 muestras con 4 dimensiones normalizadas en [0, pi]
    X_raw = torch.tensor([
        [0.10, 0.20, 0.30, 0.40],
        [0.85, 0.90, 0.75, 0.80],
        [0.15, 0.25, 0.35, 0.45],
        [0.90, 0.80, 0.70, 0.65],
        [0.20, 0.10, 0.40, 0.30],
        [0.80, 0.85, 0.90, 0.75],
        [0.30, 0.35, 0.20, 0.25],
        [0.70, 0.75, 0.85, 0.90]
    ], dtype=torch.float32)

    X = X_raw * torch.pi
    y = torch.tensor([0, 1, 0, 1, 0, 1, 0, 1], dtype=torch.long)
    return X, y

def main():
    print("=========================================================")
    print("⚛️  ELIZABETH QUANTUM HYBRID AI ENGINE")
    print("    Arquitectura: Variational Quantum Circuit + PyTorch")
    print("=========================================================\n")

    X, y = generate_synthetic_quantum_data()
    model = QuantumHybrid(n_classes=2)
    
    optimizer = torch.optim.AdamW(model.parameters(), lr=LEARNING_RATE, weight_decay=1e-4)
    criterion = nn.CrossEntropyLoss()

    print("🚀 Iniciando entrenamiento cuántico...")
    model.train()
    for epoch in range(EPOCHS):
        optimizer.zero_grad()
        logits = model(X)
        loss = criterion(logits, y)
        loss.backward()
        optimizer.step()

        if epoch % 5 == 0 or epoch == EPOCHS - 1:
            predictions = torch.argmax(logits, dim=1)
            accuracy = (predictions == y).float().mean().item() * 100
            print(f"  [Época {epoch:02d}/{EPOCHS}] Pérdida: {loss.item():.4f} | Precisión: {accuracy:.1f}%")

    print("\n🔍 Evaluando inferencia cuántica en nuevos estados:")
    model.eval()
    with torch.no_grad():
        test_inputs = torch.tensor([
            [0.15, 0.22, 0.31, 0.38], # Estado cercano a clase 0
            [0.88, 0.82, 0.79, 0.73]  # Estado cercano a clase 1
        ], dtype=torch.float32) * torch.pi

        logits_test = model(test_inputs)
        probs = torch.softmax(logits_test, dim=1)

        for i, p in enumerate(probs):
            predicted_class = torch.argmax(p).item()
            conf = p[predicted_class].item() * 100
            print(f"  Muestra {i+1} -> Clase predicha: {predicted_class} (Confianza: {conf:.2f}%) | Distribución: [Clase 0: {p[0]:.3f}, Clase 1: {p[1]:.3f}]")

    # Guardar pesos optimizados
    checkpoint_path = "quantum_hybrid.pt"
    torch.save(model.state_dict(), checkpoint_path)
    print(f"\n✅ Núcleo cuántico entrenado y guardado en '{checkpoint_path}'.")

if __name__ == "__main__":
    main()
