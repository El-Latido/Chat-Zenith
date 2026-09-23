# ⚛️ Elizabeth Quantum Hybrid AI

Arquitectura de Aprendizaje Automático Cuántico Híbrido (**QML - Quantum Machine Learning**) basada en **PennyLane**, **PyTorch** y **Qiskit**, integrada al núcleo cognitivo de **Elizabeth** en ChatLiz.

## 🌟 Características
- **VQC (Variational Quantum Circuit)** con Angle Embedding en rotaciones $R_Y$.
- **Ansatz Variacional Parametrizado** con capas de rotación $R_Y, R_Z$ y entrelazamiento circular completo mediante compuertas $CNOT$.
- **Diferenciación Analítica Exacta**: Utiliza `diff_method="backprop"` sobre `default.qubit` para evitar la lentitud del *parameter-shift rule* estocástico.
- **PennyLane TorchLayer**: Conversión del circuito cuántico en una capa nativa `nn.Module` de PyTorch.
- **Red Clásica Post-Cuántica**: Proyección a través de capas lineales con activación SiLU y Dropout.

## 🚀 Instalación y Ejecución
```bash
pip install -r requirements.txt
python main.py
```
