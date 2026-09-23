# =====================================================================
# model.py - Arquitectura de Red Neuronal Híbrida Cuántica (QNN)
# Desarrollada para Elizabeth (ChatLiz) con PennyLane y PyTorch
# =====================================================================

import torch
import torch.nn as nn
import pennylane as qml

# ----------------- Hiperparámetros Cuánticos -----------------
N_QUBITS = 4     # Número de qubits del procesador cuántico
N_LAYERS = 2     # Profundidad de capas variacionales (Ansatz)

# Dispositivo cuántico con simulación de estado puro y soporte analítico directo
dev = qml.device("default.qubit", wires=N_QUBITS)

@qml.qnode(dev, interface="torch", diff_method="backprop")
def qnn_circuit(inputs, weights):
    """
    Circuito Cuántico Variacional (VQC):
    1. Angle Embedding: Codifica vectores de entrada continuos en rotaciones RY.
    2. Ansatz Variacional: Rotaciones parametrizadas RY y RZ seguidas de entrelazamiento circular CNOT.
    3. Medición observable: Valores esperados de Pauli-Z para cada qubit.
    """
    # 1. Codificación de características clásicas en amplitudes de fase
    for i in range(N_QUBITS):
        qml.RY(inputs[i], wires=i)

    # 2. Capas de procesamiento cuántico entrelazado
    for l in range(N_LAYERS):
        for i in range(N_QUBITS):
            qml.RY(weights[l, i, 0], wires=i)
            qml.RZ(weights[l, i, 1], wires=i)

        # Entrelazamiento cuántico circular (Ring Entanglement)
        for i in range(N_QUBITS):
            qml.CNOT(wires=[i, (i + 1) % N_QUBITS])

    # 3. Medición de observables Pauli-Z
    return [qml.expval(qml.PauliZ(i)) for i in range(N_QUBITS)]


class QuantumHybrid(nn.Module):
    """
    Modelo Neuronal Híbrido:
    Combina una Capa Cuántica TorchLayer con capas densas clásicas y regularización.
    """
    def __init__(self, n_classes=2):
        super().__init__()
        weight_shapes = {"weights": (N_LAYERS, N_QUBITS, 2)}
        # Capa cuántica integrada directamente al grafo de computación de PyTorch
        self.q_layer = qml.qnn.TorchLayer(qnn_circuit, weight_shapes)
        
        # Red de clasificación clásica post-cuántica
        self.classifier = nn.Sequential(
            nn.Linear(N_QUBITS, 8),
            nn.SiLU(), # Activación suave
            nn.Dropout(0.1),
            nn.Linear(8, n_classes)
        )

    def forward(self, x):
        # x shape: [batch_size, N_QUBITS]
        q_features = self.q_layer(x)
        logits = self.classifier(q_features)
        return logits
