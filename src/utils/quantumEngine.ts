/**
 * Quantum Engine for ChatLiz & Elizabeth's Cognitive Core
 * Simulates pure quantum states, quantum gates, entanglement, and Pauli-Z expectation values
 * for Quantum Machine Learning (QML) and hybrid neural computation.
 */

export interface Complex {
  re: number;
  im: number;
}

export function complex(re: number, im = 0): Complex {
  return { re, im };
}

export function add(a: Complex, b: Complex): Complex {
  return { re: a.re + b.re, im: a.im + b.im };
}

export function sub(a: Complex, b: Complex): Complex {
  return { re: a.re - b.re, im: a.im - b.im };
}

export function mul(a: Complex, b: Complex): Complex {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  };
}

export function magnitudeSq(c: Complex): number {
  return c.re * c.re + c.im * c.im;
}

export class QuantumState {
  public nQubits: number;
  public dim: number;
  public state: Complex[];

  constructor(nQubits: number) {
    if (nQubits < 1 || nQubits > 12) {
      throw new Error("QuantumState supports 1 to 12 qubits in memory simulation.");
    }
    this.nQubits = nQubits;
    this.dim = 1 << nQubits;
    this.state = new Array(this.dim).fill(null).map(() => complex(0, 0));
    // Initialize to |0...0>
    this.state[0] = complex(1, 0);
  }

  // Reset to ground state |0...0>
  public reset(): void {
    for (let i = 0; i < this.dim; i++) {
      this.state[i] = i === 0 ? complex(1, 0) : complex(0, 0);
    }
  }

  // Apply single-qubit unitary gate matrix [[u00, u01], [u10, u11]]
  public applyGate1Q(targetQubit: number, u00: Complex, u01: Complex, u10: Complex, u11: Complex): void {
    const bit = 1 << (this.nQubits - 1 - targetQubit);
    for (let i = 0; i < this.dim; i++) {
      if ((i & bit) === 0) {
        const j = i | bit;
        const v0 = this.state[i];
        const v1 = this.state[j];

        // new_v0 = u00 * v0 + u01 * v1
        const newV0 = add(mul(u00, v0), mul(u01, v1));
        // new_v1 = u10 * v0 + u11 * v1
        const newV1 = add(mul(u10, v0), mul(u11, v1));

        this.state[i] = newV0;
        this.state[j] = newV1;
      }
    }
  }

  // Hadamard Gate: H = 1/sqrt(2) * [[1, 1], [1, -1]]
  public h(targetQubit: number): this {
    const s = 1 / Math.SQRT2;
    this.applyGate1Q(
      targetQubit,
      complex(s, 0),
      complex(s, 0),
      complex(s, 0),
      complex(-s, 0)
    );
    return this;
  }

  // Pauli-X (NOT) Gate: [[0, 1], [1, 0]]
  public x(targetQubit: number): this {
    this.applyGate1Q(
      targetQubit,
      complex(0, 0),
      complex(1, 0),
      complex(1, 0),
      complex(0, 0)
    );
    return this;
  }

  // Pauli-Y Gate: [[0, -i], [i, 0]]
  public y(targetQubit: number): this {
    this.applyGate1Q(
      targetQubit,
      complex(0, 0),
      complex(0, -1),
      complex(0, 1),
      complex(0, 0)
    );
    return this;
  }

  // Pauli-Z Gate: [[1, 0], [0, -1]]
  public z(targetQubit: number): this {
    this.applyGate1Q(
      targetQubit,
      complex(1, 0),
      complex(0, 0),
      complex(0, 0),
      complex(-1, 0)
    );
    return this;
  }

  // Rotation around Y axis: RY(theta) = [[cos(theta/2), -sin(theta/2)], [sin(theta/2), cos(theta/2)]]
  public ry(targetQubit: number, theta: number): this {
    const half = theta / 2;
    const c = Math.cos(half);
    const s = Math.sin(half);
    this.applyGate1Q(
      targetQubit,
      complex(c, 0),
      complex(-s, 0),
      complex(s, 0),
      complex(c, 0)
    );
    return this;
  }

  // Rotation around Z axis: RZ(theta) = [[e^(-i*theta/2), 0], [0, e^(i*theta/2)]]
  public rz(targetQubit: number, theta: number): this {
    const half = theta / 2;
    this.applyGate1Q(
      targetQubit,
      complex(Math.cos(-half), Math.sin(-half)),
      complex(0, 0),
      complex(0, 0),
      complex(Math.cos(half), Math.sin(half))
    );
    return this;
  }

  // Controlled-NOT (CNOT) Gate: flips target qubit if control qubit is 1
  public cnot(controlQubit: number, targetQubit: number): this {
    if (controlQubit === targetQubit) {
      throw new Error("Control and target qubits cannot be identical in CNOT gate.");
    }
    const cBit = 1 << (this.nQubits - 1 - controlQubit);
    const tBit = 1 << (this.nQubits - 1 - targetQubit);

    for (let i = 0; i < this.dim; i++) {
      // If control bit is 1 and target bit is 0, swap amplitude with target bit = 1
      if ((i & cBit) !== 0 && (i & tBit) === 0) {
        const j = i | tBit;
        const tmp = this.state[i];
        this.state[i] = this.state[j];
        this.state[j] = tmp;
      }
    }
    return this;
  }

  // Measure expectation value of Pauli-Z on a given qubit: <Z_i> = P(0) - P(1)
  public expvalPauliZ(targetQubit: number): number {
    const bit = 1 << (this.nQubits - 1 - targetQubit);
    let expval = 0;
    for (let i = 0; i < this.dim; i++) {
      const prob = magnitudeSq(this.state[i]);
      if ((i & bit) === 0) {
        expval += prob; // Eigenvalue +1 for |0>
      } else {
        expval -= prob; // Eigenvalue -1 for |1>
      }
    }
    return Math.max(-1, Math.min(1, expval));
  }

  // Get probabilities across all basis states
  public getProbabilities(): number[] {
    return this.state.map((c) => magnitudeSq(c));
  }

  // Run a Variational Quantum Circuit layer with Angle Embedding and Ring Entanglement
  public static runHybridAnsatz(
    inputs: number[],
    weights: number[][][],
    nQubits = 4,
    nLayers = 2
  ): number[] {
    const sim = new QuantumState(nQubits);

    // 1. Angle Embedding (Input Features -> RY rotations)
    for (let i = 0; i < nQubits; i++) {
      const val = inputs[i] !== undefined ? inputs[i] : 0;
      sim.ry(i, val);
    }

    // 2. Parametrized Ansatz Layers
    for (let l = 0; l < nLayers; l++) {
      const layerWeights = weights[l] || [];
      for (let i = 0; i < nQubits; i++) {
        const wY = layerWeights[i]?.[0] || 0;
        const wZ = layerWeights[i]?.[1] || 0;
        sim.ry(i, wY);
        sim.rz(i, wZ);
      }
      // Ring (Circular) Entanglement via CNOTs
      for (let i = 0; i < nQubits; i++) {
        sim.cnot(i, (i + 1) % nQubits);
      }
    }

    // 3. Pauli-Z expectation values vector: [<Z_0>, <Z_1>, ...]
    const out: number[] = [];
    for (let i = 0; i < nQubits; i++) {
      out.push(sim.expvalPauliZ(i));
    }
    return out;
  }
}
