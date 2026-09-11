import {
  Note,
  PDFDocument,
  PDFHighlight,
  CalendarEvent,
  Flashcard,
  DeepQuestion,
  ConcreteExample,
  AppSettings,
  StudyStats,
} from '../types';

export const INITIAL_SETTINGS: AppSettings = {
  theme: 'midnight',
  fontFamily: 'JetBrains Mono',
  fontSize: 14,
  lineNumbers: true,
  livePreviewSplit: true,
  defaultHighlightColor: '#facc15', // yellow
  aiProvider: 'gemini',
  aiModel: 'gemini-3.8-flash',
  geminiApiKey: '',
  groqApiKey: '',
  openaiApiKey: '',
  opencodeApiKey: '',
  customCss: `/* Custom IDE Overlays */
.ide-badge-pdf {
  font-family: ui-monospace, monospace;
}
`,
  language: 'auto',
};

export const INITIAL_PDFS: PDFDocument[] = [
  {
    id: 'pdf-neuro-01',
    title: 'Principles of Cognitive Neuroscience & Synaptic Plasticity.pdf',
    fileName: 'Principles_Cognitive_Neuroscience.pdf',
    pageCount: 5,
    linkedNoteIds: ['note-neuro-01', 'note-neuro-02', 'note-pdf-ref-01'],
    outline: [
      { id: 'toc-1', title: '1. Introduction to Hebbian Plasticity', pageNumber: 1 },
      { id: 'toc-2', title: '2. Long-Term Potentiation (LTP) Molecular Cascades', pageNumber: 2 },
      { id: 'toc-3', title: '3. Dendritic Spine Remodeling & Actin Dynamics', pageNumber: 3 },
      { id: 'toc-4', title: '4. Memory Consolidation: Systems vs Synaptic', pageNumber: 4 },
      { id: 'toc-5', title: '5. Computational Models of Memory Networks', pageNumber: 5 },
    ],
    pagesData: [
      {
        pageNumber: 1,
        title: 'Chapter 1: Foundations of Hebbian Learning',
        contentText: `Principles of Cognitive Neuroscience (Vol. 14, Issue 2)
1. Introduction to Hebbian Plasticity

The postulate formulated by Donald Hebb in 1949 asserts: "When an axon of cell A is near enough to excite cell B and repeatedly or persistently takes part in firing it, some growth process or metabolic change takes place in one or both cells such that A's efficiency, as one of the cells firing B, is increased."

This foundational principle, colloquially summarized as "neurons that fire together wire together", constitutes the cellular foundation for associative learning, conditioned reflexes, and hippocampal memory trace encoding.

Key Properties:
- Input Specificity: Only stimulated synapses demonstrate enhancement.
- Cooperativity: Simultaneous activation of multiple weak pathways induces potentiation.
- Associativity: Concurrent weak and strong inputs allow the weak input to be potentiated.`,
      },
      {
        pageNumber: 2,
        title: 'Chapter 2: Long-Term Potentiation (LTP) Cascades',
        contentText: `2. Molecular Cascades in Long-Term Potentiation

LTP represents a persistent strengthening of synapses based on recent patterns of activity.

The triggering of LTP in CA1 hippocampal pyramidal neurons requires:
1. Glutamate Release: Presynaptic depolarization releases glutamate into the synaptic cleft.
2. AMPA Receptor Activation: Sodium (Na+) influx causes local postsynaptic depolarization.
3. NMDA Receptor Mg2+ Expulsion: At resting potentials (-70mV), the NMDA channel pore is blocked by magnesium ions (Mg2+). Sustained depolarization expels the Mg2+ block, allowing calcium (Ca2+) influx.
4. CaMKII Activation: Calcium binds to calmodulin, activating Ca2+/calmodulin-dependent protein kinase II (CaMKII).
5. Retrograde Signaling: Nitric oxide (NO) diffuses retrogradely to enhance presynaptic vesicle release probability.`,
      },
      {
        pageNumber: 3,
        title: 'Chapter 3: Dendritic Spine Remodeling & Actin',
        contentText: `3. Structural Plasticity and Spine Dynamics

Potentiated synapses undergo profound morphological enlargement.
- Actin Polymerization: Within seconds of NMDA activation, globular actin (G-actin) polymerizes into filamentous actin (F-actin), enlarging the spine head.
- AMPA Receptor Insertion: Recycling endosomes traffic GluA1-containing AMPA receptors to the postsynaptic density (PSD-95 scaffold).
- Protein Synthesis Dependency: Late-LTP (L-LTP) extending beyond 3 hours requires transcription mediated by CREB (cAMP response element-binding protein) and translation of Arc/Arg3.1 and PKM-zeta.`,
      },
      {
        pageNumber: 4,
        title: 'Chapter 4: Systems vs Synaptic Memory Consolidation',
        contentText: `4. Memory Consolidation: Two Interlocking Temporal Scales

Consolidation is the process whereby fragile transient memory traces stabilize into durable long-term representations.

A. Synaptic Consolidation (Hours):
Occurs locally across synaptic networks in the hippocampus and amygdala. Relies on kinase cascades, immediate early genes (c-Fos, Zif268), and local protein synthesis.

B. Systems Consolidation (Weeks to Years):
Involves the gradual redistribution of hippocampal-dependent memories toward distributed neocortical networks. During slow-wave sleep (SWS), sharp-wave ripples (SWRs, 150-250 Hz) in CA3/CA1 replay encoded daytime activity patterns, training the prefrontal cortex and parietal association areas.`,
      },
      {
        pageNumber: 5,
        title: 'Chapter 5: Mathematical Formulation of Hebbian Plasticity',
        contentText: `5. Computational Modeling of Synaptic Dynamics

In discrete time computational models, the synaptic weight adjustment Δw_ij between presynaptic unit j and postsynaptic unit i is governed by:

Δw_ij = η · x_i · x_j

Where η denotes the learning rate parameter, x_j is presynaptic firing rate, and x_i is postsynaptic response.

To prevent unbounded divergence of synaptic weights, Bienenstock, Cooper, and Munro (BCM theory) introduced a sliding modification threshold θ_m:

Δw_ij = η · x_j · x_i · (x_i - θ_m)

Where θ_m dynamically scales with the time-averaged postsynaptic history, yielding bidirectional synaptic plasticity (LTP when x_i > θ_m, and Long-Term Depression / LTD when x_i < θ_m).`,
      },
    ],
    createdAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'pdf-quantum-01',
    title: 'Quantum Computation & Information Entanglement.pdf',
    fileName: 'Quantum_Computation_Principles.pdf',
    pageCount: 3,
    linkedNoteIds: ['note-quantum-01'],
    outline: [
      { id: 'toc-q1', title: '1. Qubit State Vectors & Bloch Sphere', pageNumber: 1 },
      { id: 'toc-q2', title: '2. Quantum Entanglement & Bell States', pageNumber: 2 },
      { id: 'toc-q3', title: '3. Shor & Grover Algorithm Complexity', pageNumber: 3 },
    ],
    pagesData: [
      {
        pageNumber: 1,
        title: 'Chapter 1: Qubits and Superposition',
        contentText: `Quantum Information Theory
A pure qubit state |ψ⟩ is a linear superposition of orthonormal basis states |0⟩ and |1⟩:
|ψ⟩ = α|0⟩ + β|1⟩
Where α, β ∈ ℂ and satisfy normalisation: |α|² + |β|² = 1.
Geometrically represented on the Bloch Sphere with polar angle θ and azimuth φ:
|ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩`,
      },
      {
        pageNumber: 2,
        title: 'Chapter 2: Bell States & EPR Paradox',
        contentText: `The four maximally entangled two-qubit Bell states form an orthonormal basis:
|Φ⁺⟩ = (|00⟩ + |11⟩) / √2
|Φ⁻⟩ = (|00⟩ - |11⟩) / √2
|Ψ⁺⟩ = (|01⟩ + |10⟩) / √2
|Ψ⁻⟩ = (|01⟩ - |10⟩) / √2
Measurement of one qubit collapses the paired qubit state instantaneously, regardless of spatial separation.`,
      },
      {
        pageNumber: 3,
        title: 'Chapter 3: Quantum Speedups and Complexity',
        contentText: `Quantum Algorithms:
1. Grover's Search: Quadratic speedup O(√N) for unstructured database search of size N.
2. Shor's Algorithm: Polynomial time O((log N)³) for integer factorization, breaking RSA cryptography through Quantum Fourier Transform (QFT).`,
      },
    ],
    createdAt: '2026-09-05T14:30:00.000Z',
  },
];

export const INITIAL_HIGHLIGHTS: PDFHighlight[] = [
  {
    id: 'hl-1',
    pdfId: 'pdf-neuro-01',
    pageNumber: 1,
    rect: { x: 10, y: 15, width: 80, height: 12 },
    color: '#facc15',
    capturedText: 'When an axon of cell A is near enough to excite cell B and repeatedly or persistently takes part in firing it, some growth process or metabolic change takes place...',
    noteId: 'note-neuro-01',
    createdAt: '2026-09-02T11:00:00.000Z',
  },
  {
    id: 'hl-2',
    pdfId: 'pdf-neuro-01',
    pageNumber: 2,
    rect: { x: 10, y: 35, width: 80, height: 18 },
    color: '#4ade80', // green
    capturedText: 'At resting potentials (-70mV), the NMDA channel pore is blocked by magnesium ions (Mg2+). Sustained depolarization expels the Mg2+ block, allowing calcium (Ca2+) influx.',
    noteId: 'note-neuro-02',
    createdAt: '2026-09-03T09:20:00.000Z',
  },
  {
    id: 'hl-3',
    pdfId: 'pdf-neuro-01',
    pageNumber: 4,
    rect: { x: 10, y: 45, width: 80, height: 16 },
    color: '#f43f5e', // red/pink
    capturedText: 'During slow-wave sleep (SWS), sharp-wave ripples (SWRs, 150-250 Hz) in CA3/CA1 replay encoded daytime activity patterns, training the prefrontal cortex.',
    noteId: 'note-neuro-01',
    createdAt: '2026-09-04T16:00:00.000Z',
  },
];

export const INITIAL_NOTES: Note[] = [
  // Folder 1: Neurociencia
  {
    id: 'folder-neuro',
    title: 'Neurociencia & Memoria',
    content: '',
    parentId: null,
    type: 'folder',
    isExpanded: true,
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-01T08:00:00.000Z',
  },
  {
    id: 'note-neuro-01',
    title: 'Plasticidad Sináptica y Regla de Hebb',
    parentId: 'folder-neuro',
    type: 'note',
    pinned: true,
    tags: ['neurociencia', 'plasticidad', 'memoria'],
    content: `# Plasticidad Sináptica y Regla de Hebb

La plasticidad sináptica es la capacidad biológica del sistema nervioso para modular la fuerza de las conexiones interneuronales en función de su actividad temporal.

> *"Neurons that fire together, wire together."* — Donald O. Hebb (1949)

Ver referencia en literatura fundamental: [PDF: Principles of Cognitive Neuroscience & Synaptic Plasticity.pdf p. 1]

## 1. Postulado Hebbiano y Ecuación Fundamental

En modelos matemáticos de redes neuronales biológicas, la variación en el peso sináptico $\\Delta w_{ij}$ entre la neurona presináptica $j$ y la postsináptica $i$ se modela mediante:

$$\\Delta w_{ij} = \\eta \\cdot x_i \\cdot x_j$$

Donde:
- $\\eta$ representa la tasa de aprendizaje (*learning rate*).
- $x_j$ es la tasa de disparo presináptica.
- $x_i$ es la respuesta despolarizante postsináptica.

Para prevenir la divergencia infinita de pesos, la regla BCM introduce el umbral dinámico $\\theta_m$:

$$\\Delta w_{ij} = \\eta \\cdot x_j \\cdot x_i \\cdot (x_i - \\theta_m)$$

## 2. Conexión con otros conceptos
Para el mecanismo biofísico a nivel de membrana, consultar @Potenciación a Largo Plazo (LTP) y Canales NMDA.

En cuanto a la estabilización temporal a largo plazo durante el sueño, revisar @Consolidación de Memoria y Ondas Lentas.

## 3. Principios Clave
- **Especificidad sináptica:** Solo los contactos excitados activamente experimentan cambios de conductancia.
- **Asociatividad:** Vías débiles que coinciden con despolarizaciones intensas logran potenciarse.
- **Cooperatividad:** La sumación temporal y espacial de múltiples potenciales postsinápticos es requerida para el desbloqueo por magnesio.`,
    createdAt: '2026-09-01T09:00:00.000Z',
    updatedAt: '2026-09-07T12:00:00.000Z',
  },
  {
    id: 'note-neuro-02',
    title: 'Potenciación a Largo Plazo (LTP) y Canales NMDA',
    parentId: 'folder-neuro',
    type: 'note',
    tags: ['biofisica', 'receptores', 'ltp'],
    content: `# Potenciación a Largo Plazo (LTP) y Canales NMDA

La Potenciación a Largo Plazo (**LTP**) es el sustrato celular de la memoria declarativa en el hipocampo (*cornu ammonis* CA1 y CA3).

Referencia directa del mecanismo biofísico: [PDF: Principles of Cognitive Neuroscience & Synaptic Plasticity.pdf p. 2]

## Cascada Bioquímica de Inducción

1. **Liberación Presináptica:** Exocitosis de vesículas de glutamato hacia la hendidura sináptica.
2. **Receptores AMPA:** Entrada rápida de iones $Na^+$, generando un potencial excitador postsináptico (EPSP).
3. **Desbloqueo de Magnesio ($Mg^{2+}$):**
   A potenciales de reposo ($-70\\text{ mV}$), el poro del canal **NMDA** se encuentra ocluido por un ion magnesio.
   La despolarización sostenida (alrededor de $-30\\text{ mV}$) repele electrostáticamente al $Mg^{2+}$.
4. **Influjo de Calcio ($Ca^{2+}$):** El influjo masivo activa a la quinasa dependiente de calcio/calmodulina tipo II (**CaMKII**).
5. **Inserción de Receptores AMPA:** Se movilizan subunidades GluA1 desde endosomas de reciclaje hacia la densidad postsináptica (PSD-95).

$$[Ca^{2+}]_{\\text{citosol}} \\uparrow \\longrightarrow \\text{CaMKII fosforilada} \\longrightarrow \\text{Inserción AMPAR}$$

Revisar cómo se relaciona con la regla general en @Plasticidad Sináptica y Regla de Hebb.`,
    createdAt: '2026-09-02T10:00:00.000Z',
    updatedAt: '2026-09-06T15:30:00.000Z',
  },
  {
    id: 'note-neuro-03',
    title: 'Consolidación de Memoria y Ondas Lentas',
    parentId: 'folder-neuro',
    type: 'note',
    tags: ['sueño', 'consolidacion', 'corteza'],
    content: `# Consolidación de Memoria y Ondas Lentas

La memoria declarativa transita por dos estadios temporales:
- **Consolidación Sináptica:** Dependiente de síntesis local de proteínas en el hipocampo (duración: $1$ a $6$ horas).
- **Consolidación de Sistemas:** Migración y reorganización distribuida hacia la neocorteza (semanas a meses).

Cita del texto canónico: [PDF: Principles of Cognitive Neuroscience & Synaptic Plasticity.pdf p. 4]

## El Papel del Sueño No-REM (SWS)
Durante la fase de ondas lentas del sueño, se observan oscilaciones acopladas:
1. **Ondas Delta y Oscilaciones Lentas corticales** ($<1\\text{ Hz}$).
2. **Husos del sueño talámicos** (*spindles*, $11-16\\text{ Hz}$).
3. **Ondas agudas y rizos hipocampales** (*Sharp-Wave Ripples*, $150-250\\text{ Hz}$).

Esta sincronía permite el *replay* acelerado de secuencias neuronales codificadas en el hipocampo durante la vigilia, transfiriendo información hacia la corteza prefrontal medial.`,
    createdAt: '2026-09-03T11:00:00.000Z',
    updatedAt: '2026-09-06T18:00:00.000Z',
  },
  // Note integrated from PDF highlight directly
  {
    id: 'note-pdf-ref-01',
    title: 'Nota PDF: Ondas Agudas Hipocampales (SWRs)',
    parentId: 'folder-neuro',
    type: 'pdf_note',
    pdfId: 'pdf-neuro-01',
    pdfPage: 4,
    tags: ['pdf-note', 'swr', 'neurociencia'],
    content: `# Nota PDF: Ondas Agudas Hipocampales (SWRs)

> **Texto Capturado del PDF:**
> "During slow-wave sleep (SWS), sharp-wave ripples (SWRs, 150-250 Hz) in CA3/CA1 replay encoded daytime activity patterns, training the prefrontal cortex."

[PDF: Principles of Cognitive Neuroscience & Synaptic Plasticity.pdf p. 4]

## Análisis Crítico
Las oscilaciones de alta frecuencia (150-250 Hz) representan la despolarización masiva y sincronizada de hasta el 15% de las neuronas de CA1.
Vinculado directamente con @Consolidación de Memoria y Ondas Lentas.`,
    createdAt: '2026-09-04T16:05:00.000Z',
    updatedAt: '2026-09-04T16:05:00.000Z',
  },

  // Folder 2: Computación Cuántica
  {
    id: 'folder-quantum',
    title: 'Computación Cuántica & Algoritmos',
    content: '',
    parentId: null,
    type: 'folder',
    isExpanded: true,
    createdAt: '2026-09-05T09:00:00.000Z',
    updatedAt: '2026-09-05T09:00:00.000Z',
  },
  {
    id: 'note-quantum-01',
    title: 'Qubits, Esfera de Bloch y Superposición',
    parentId: 'folder-quantum',
    type: 'note',
    tags: ['cuantica', 'qubit', 'algebra'],
    content: `# Qubits, Esfera de Bloch y Superposición

A diferencia del bit clásico, el qubit reside en un espacio de Hilbert de dos dimensiones $\\mathcal{H}_2$.

[PDF: Quantum Computation & Information Entanglement.pdf p. 1]

## Estado Puro en Notación Dirac
$$|\\psi\\rangle = \\alpha |0\\rangle + \\beta |1\\rangle, \\quad \\alpha, \\beta \\in \\mathbb{C}$$

Con la condición de normalización:
$$|\\alpha|^2 + |\\beta|^2 = 1$$

## Parametrización en la Esfera de Bloch
$$|\\psi\\rangle = \\cos\\left(\\frac{\\theta}{2}\\right)|0\\rangle + e^{i\\phi}\\sin\\left(\\frac{\\theta}{2}\\right)|1\\rangle$$

Donde $\\theta \\in [0, \\pi]$ y $\\phi \\in [0, 2\\pi)$ representan los ángulos de latitud y longitud sobre la superficie esférica unitaria.

Ver también @Entrelazamiento Cuántico y Estados de Bell.`,
    createdAt: '2026-09-05T10:00:00.000Z',
    updatedAt: '2026-09-08T14:00:00.000Z',
  },
  {
    id: 'note-quantum-02',
    title: 'Entrelazamiento Cuántico y Estados de Bell',
    parentId: 'folder-quantum',
    type: 'note',
    tags: ['cuantica', 'entrelazamiento', 'bell'],
    content: `# Entrelazamiento Cuántico y Estados de Bell

El entrelazamiento cuántico ocurre cuando el estado cuántico compuesto de dos o más subsistemas no puede factorizarse como el producto tensorial de sus estados individuales:

$$|\\psi_{AB}\\rangle \\neq |\\psi_A\\rangle \\otimes |\\psi_B\\rangle$$

[PDF: Quantum Computation & Information Entanglement.pdf p. 2]

## Base Canónica de Bell
Los 4 estados de máxima correlación cuántica son:

$$|\\Phi^+\\rangle = \\frac{1}{\\sqrt{2}}(|00\\rangle + |11\\rangle)$$
$$|\\Phi^-\\rangle = \\frac{1}{\\sqrt{2}}(|00\\rangle - |11\\rangle)$$
$$|\\Psi^+\\rangle = \\frac{1}{\\sqrt{2}}(|01\\rangle + |10\\rangle)$$
$$|\\Psi^-\\rangle = \\frac{1}{\\sqrt{2}}(|01\\rangle - |10\\rangle)$$

Conectado conceptualmente con @Qubits, Esfera de Bloch y Superposición.`,
    createdAt: '2026-09-05T11:00:00.000Z',
    updatedAt: '2026-09-08T15:00:00.000Z',
  },
];

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'event-exam-neuro',
    title: 'Examen Parcial de Neurociencia Cognitiva',
    date: '2026-09-12', // 2 days from today!
    time: '09:00',
    type: 'exam',
    linkedNoteIds: ['note-neuro-01', 'note-neuro-02', 'note-neuro-03', 'note-pdf-ref-01'],
    priority: 'high',
    completed: false,
  },
  {
    id: 'event-proj-quantum',
    title: 'Entrega Simulación Algoritmo de Grover',
    date: '2026-09-16',
    time: '23:59',
    type: 'assignment',
    linkedNoteIds: ['note-quantum-01', 'note-quantum-02'],
    priority: 'medium',
    completed: false,
  },
  {
    id: 'event-lecture-hebb',
    title: 'Seminario: Dinámica de Espinas Dendríticas',
    date: '2026-09-18',
    time: '16:30',
    type: 'lecture',
    linkedNoteIds: ['note-neuro-01'],
    priority: 'low',
    completed: false,
  },
];

export const INITIAL_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc-1',
    noteId: 'note-neuro-01',
    question: '¿Cuál es la fórmula matemática clásica de la regla de Hebb y qué representa cada variable?',
    answer: 'Δw_ij = η · x_i · x_j. η es la tasa de aprendizaje, x_j la actividad presináptica y x_i la respuesta postsináptica.',
    sourceContext: 'Regla de Hebb',
    interval: 1,
    repetition: 1,
    easeFactor: 2.5,
    dueDate: '2026-09-10', // due today!
    linkedEventId: 'event-exam-neuro',
  },
  {
    id: 'fc-2',
    noteId: 'note-neuro-02',
    question: '¿Por qué el canal NMDA se describe como un "detector de coincidencia" biofísico?',
    answer: 'Porque requiere dos eventos simultáneos: unión de glutamato presináptico Y despolarización de membrana postsináptica previa (vía AMPA) para desalojar el bloqueo por ion magnesio (Mg2+).',
    sourceContext: 'Canales NMDA',
    interval: 1,
    repetition: 0,
    easeFactor: 2.5,
    dueDate: '2026-09-10', // due today!
    linkedEventId: 'event-exam-neuro',
  },
  {
    id: 'fc-3',
    noteId: 'note-neuro-03',
    question: '¿Qué tres oscilaciones cerebrales se sincronizan durante el sueño de ondas lentas (SWS) para consolidar recuerdos?',
    answer: '1. Oscilaciones lentas corticales (<1 Hz), 2. Husos talámicos (11-16 Hz), 3. Ondas agudas y rizos hipocampales (SWRs, 150-250 Hz).',
    sourceContext: 'Consolidación de Memoria',
    interval: 2,
    repetition: 2,
    easeFactor: 2.6,
    dueDate: '2026-09-11',
    linkedEventId: 'event-exam-neuro',
  },
  {
    id: 'fc-4',
    noteId: 'note-quantum-01',
    question: '¿Cuál es la condición de normalización para los coeficientes de amplitud α y β de un qubit puro?',
    answer: '|α|² + |β|² = 1, donde |α|² y |β|² representan las probabilidades de medir |0⟩ y |1⟩ respectivamente.',
    sourceContext: 'Qubits y Superposición',
    interval: 3,
    repetition: 2,
    easeFactor: 2.5,
    dueDate: '2026-09-10', // due today!
    linkedEventId: 'event-proj-quantum',
  },
  {
    id: 'fc-5',
    noteId: 'note-quantum-02',
    question: 'Escribe el estado de Bell |Φ⁺⟩ en la base computacional estándar.',
    answer: '|Φ⁺⟩ = (|00⟩ + |11⟩) / √2',
    sourceContext: 'Estados de Bell',
    interval: 6,
    repetition: 3,
    easeFactor: 2.7,
    dueDate: '2026-09-14',
  },
];

export const INITIAL_DEEP_QUESTIONS: DeepQuestion[] = [
  {
    id: 'dq-1',
    noteId: 'note-neuro-02',
    concept: 'Bloqueo por Magnesio (Mg2+) en Receptores NMDA',
    question: '¿Por qué el cerebro desarrolló un canal permeable a Ca2+ dependiente de voltaje (NMDA) en lugar de permitir que los receptores AMPA fuesen directamente permeables a calcio en todas las sinapsis?',
    rationale: 'Interrogación elaborativa: examina las restricciones de toxicidad celular por calcio (excitotoxicidad) y la necesidad de una compuerta estricta de coincidencia asociativa.',
    userAnswer: '',
  },
  {
    id: 'dq-2',
    noteId: 'note-quantum-02',
    concept: 'Entrelazamiento Cuántico vs Teorema de No-Clonación',
    question: '¿Cómo se concilia el colapso instantáneo de estados de Bell con el principio de causalidad relativista (no comunicación superlumínica) y el teorema de no clonación?',
    rationale: 'Obliga a conectar los postulados de medición cuántica con la imposibilidad de modular la probabilidad marginal del observador distante.',
    userAnswer: '',
  },
];

export const INITIAL_CONCRETE_EXAMPLES: ConcreteExample[] = [
  {
    id: 'ce-1',
    noteId: 'note-neuro-01',
    concept: 'Regla de Hebb y Plasticidad Sináptica',
    analogy: 'Piensa en el tráfico peatonal en un parque con césped: al inicio todos caminan por cualquier sendero. Pero cuando muchos peatones eligen repetidamente el mismo atajo, el pasto se erosiona y se crea un camino de tierra bien marcado. Luego, el municipio pavimenta ese sendero (consolidación estructural).',
    realWorldExample: 'El cerebro de los taxistas de Londres: estudios con resonancia magnética mostraron un hipocampo posterior significativamente más grande que el promedio debido a años de navegación y refuerzo asociativo espacial del mapa urbano ("The Knowledge").',
  },
  {
    id: 'ce-2',
    noteId: 'note-quantum-01',
    concept: 'Superposición Cuántica y Esfera de Bloch',
    analogy: 'Una moneda girando sobre una mesa no es ni cara ni cruz mientras gira con velocidad angular constante: está en una combinación dinámica de ambos estados. Solo cuando pones la palma de la mano encima (acto de medición) la fuerzas a caer en cara (0) o cruz (1).',
    realWorldExample: 'En computación cuántica de iones atrapados (trapped ions), pulsos láser de radiofrecuencia con duración exacta rotan el vector de espín del ion a cualquier latitud de la esfera de Bloch con precisión sub-microscópica.',
  },
];

export const INITIAL_STUDY_STATS: StudyStats = {
  dailyStreak: 6,
  lastStudyDate: '2026-09-09',
  totalReviews: 42,
  activityHistory: [
    { date: '2026-09-04', count: 5 },
    { date: '2026-09-05', count: 8 },
    { date: '2026-09-06', count: 4 },
    { date: '2026-09-07', count: 7 },
    { date: '2026-09-08', count: 6 },
    { date: '2026-09-09', count: 9 },
    { date: '2026-09-10', count: 3 },
  ],
};
