import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

import User from "../models/User";
import Volume from "../models/Volume";
import Issue from "../models/Issue";
import Article from "../models/Article";
import Manuscript from "../models/Manuscript";
import EditorialBoard from "../models/EditorialBoard";
import JournalSettings from "../models/JournalSettings";
import PageContent from "../models/PageContent";
import ContactMessage from "../models/ContactMessage";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/academic_journal";

const SAMPLE_PDF_BUFFER = Buffer.from(
  "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000060 00000 n\n0000000117 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF"
);

function ensureSampleStorage() {
  const uploadDir = path.join(process.cwd(), "storage", "uploads");
  const manuscriptDir = path.join(uploadDir, "manuscripts");
  const articleDir = path.join(uploadDir, "articles");

  fs.mkdirSync(manuscriptDir, { recursive: true });
  fs.mkdirSync(articleDir, { recursive: true });

  fs.writeFileSync(path.join(manuscriptDir, "sample-manuscript.pdf"), SAMPLE_PDF_BUFFER);
  fs.writeFileSync(path.join(articleDir, "sample-article.pdf"), SAMPLE_PDF_BUFFER);
}

async function seed() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);

  console.log("Setting up sample local storage files...");
  ensureSampleStorage();

  // 1. Admin Account
  const adminEmail = process.env.ADMIN_EMAIL || "admin@journal.ac.org";
  const adminPassword = process.env.ADMIN_PASSWORD || "AdminPassword2026!";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await User.findOneAndUpdate(
    { email: adminEmail.toLowerCase() },
    {
      name: "Journal Chief Administrator",
      email: adminEmail.toLowerCase(),
      passwordHash,
      role: "admin",
      isActive: true,
    },
    { upsert: true, new: true }
  );
  console.log(`✓ Admin user: ${adminEmail}`);

  // 2. Journal Settings
  await JournalSettings.findOneAndUpdate(
    {},
    {
      journalName: "International Journal of Advanced Scientific Research",
      shortName: "IJASR",
      issn: "2834-912X",
      publisherName: "Apex Scholarly Publishing",
      description:
        "A peer-reviewed, open-access international journal dedicated to publishing cutting-edge scholarly research across science, engineering, computing, and interdisciplinary fields.",
      publicationFrequency: "Quarterly (4 issues per year)",
      email: "editorial@journal.ac.org",
      phone: "+1 (555) 234-5678",
      address: "100 Academic Way, Cambridge, MA 02138, USA",
      logo: "/images/journal-logo.png",
      primaryColor: "#102A43",
      secondaryColor: "#1769AA",
      paymentFee: 350,
      paymentCurrency: "USD",
      paymentProvider: "External Scholarly Payment Portal",
      paymentLink: "https://buy.stripe.com/demo-journal-apc",
      paymentInstructions:
        "Please provide your Manuscript Reference ID (e.g. MS-2026-XXXX) in the payment note. After completion, our editorial office manually verifies the transaction within 24-48 business hours.",
    },
    { upsert: true, new: true }
  );
  console.log("✓ Journal Settings seeded");

  // 3. Editorial Board Members (6 members)
  const editorialMembers = [
    {
      name: "Prof. Eleanor Vance, Ph.D.",
      academicTitle: "Chair Professor of Artificial Intelligence",
      role: "Editor-in-Chief",
      institution: "Massachusetts Institute of Technology, USA",
      country: "United States",
      specialization: "Machine Learning, Neural Computation, AI Ethics",
      displayOrder: 1,
    },
    {
      name: "Dr. Alistair MacIntyre, D.Sc.",
      academicTitle: "Director of Research",
      role: "Managing Editor",
      institution: "University of Oxford, UK",
      country: "United Kingdom",
      specialization: "Computational Physics, High-Performance Computing",
      displayOrder: 2,
    },
    {
      name: "Prof. Hiroshi Tanaka, Ph.D.",
      academicTitle: "Professor of Materials Engineering",
      role: "Associate Editor",
      institution: "University of Tokyo, Japan",
      country: "Japan",
      specialization: "Nanotechnology, Quantum Materials, Energy Storage",
      displayOrder: 3,
    },
    {
      name: "Dr. Sofia Rodriguez, Ph.D.",
      academicTitle: "Senior Research Fellow",
      role: "Associate Editor",
      institution: "ETH Zurich, Switzerland",
      country: "Switzerland",
      specialization: "Bioinformatics, Genomics, Structural Biology",
      displayOrder: 4,
    },
    {
      name: "Prof. Kwame Mensah, Ph.D.",
      academicTitle: "Associate Professor of Renewable Systems",
      role: "Editorial Board Member",
      institution: "University of Cape Town, South Africa",
      country: "South Africa",
      specialization: "Renewable Energy, Microgrids, Sustainable Engineering",
      displayOrder: 5,
    },
    {
      name: "Dr. Priya Sharma, Ph.D.",
      academicTitle: "Associate Professor of Data Systems",
      role: "Editorial Board Member",
      institution: "Indian Institute of Science, Bangalore",
      country: "India",
      specialization: "Distributed Systems, Cloud Security, Big Data",
      displayOrder: 6,
    },
  ];

  await EditorialBoard.deleteMany({});
  await EditorialBoard.insertMany(editorialMembers);
  console.log("✓ 6 Editorial Board members seeded");

  // 4. Volumes (4 volumes)
  await Volume.deleteMany({});
  const volumesData = [
    { volumeNumber: 1, year: 2023, description: "Inaugural Volume covering foundational multidisciplinary advancements." },
    { volumeNumber: 2, year: 2024, description: "Volume 2 exploring smart computing, green engineering, and biomedical advances." },
    { volumeNumber: 3, year: 2025, description: "Volume 3 dedicated to next-generation AI and sustainable materials." },
    { volumeNumber: 4, year: 2026, description: "Current Volume 4 highlighting breakthrough research in computational intelligence." },
  ];
  const volumes = await Volume.insertMany(volumesData);
  console.log("✓ 4 Volumes seeded");

  // 5. Issues (8 issues - 2 per volume)
  await Issue.deleteMany({});
  const issuesData = [];

  for (const vol of volumes) {
    issuesData.push({
      issueNumber: 1,
      volume: vol._id,
      title: `Volume ${vol.volumeNumber}, Issue 1 (Spring ${vol.year})`,
      description: `Peer-reviewed scientific contributions published in the Spring issue of ${vol.year}.`,
      publicationDate: new Date(`${vol.year}-03-15`),
      status: "published",
    });
    issuesData.push({
      issueNumber: 2,
      volume: vol._id,
      title: `Volume ${vol.volumeNumber}, Issue 2 (Fall ${vol.year})`,
      description: `Peer-reviewed scientific contributions published in the Fall issue of ${vol.year}.`,
      publicationDate: new Date(`${vol.year}-09-20`),
      status: vol.volumeNumber === 4 ? "draft" : "published", // Current issue is Vol 4 Issue 1 (published), Vol 4 Issue 2 is draft
    });
  }

  const issues = await Issue.insertMany(issuesData);
  console.log("✓ 8 Issues seeded");

  // Current Issue is Vol 4, Issue 1
  const publishedIssues = issues.filter((i) => i.status === "published");

  // 6. Published Sample Articles (15 articles)
  await Article.deleteMany({});

  const sampleArticlesMeta = [
    {
      title: "Self-Supervised Contrastive Learning in Deep Neural Networks for Multi-Modal Medical Diagnostics",
      slug: "self-supervised-contrastive-learning-multi-modal-medical-diagnostics",
      authors: [
        { name: "Eleanor Vance", affiliation: "MIT Department of AI" },
        { name: "David K. Miller", affiliation: "Harvard Medical School" },
      ],
      abstract:
        "Medical image diagnostics frequently suffer from sparse annotation and distribution shift across diverse imaging modalities. In this paper, we propose a self-supervised contrastive framework tailored for cross-modal imaging representations that jointly aligns MRI and CT diagnostic scans. Our empirical evaluations across 40,000 patient records demonstrate a 14.2% improvement in diagnostic area under curve (AUC) while reducing reliance on human-curated ground truth labels by more than 60%.",
      keywords: ["Deep Learning", "Contrastive Learning", "Medical Diagnostics", "Computer Vision"],
      category: "Computer Science & AI",
      doi: "10.1007/s11263-026-0192-3",
    },
    {
      title: "Thermodynamic Stability of Perovskite Heterostructures for High-Efficiency Tandem Solar Cells",
      slug: "thermodynamic-stability-perovskite-heterostructures-solar-cells",
      authors: [
        { name: "Hiroshi Tanaka", affiliation: "University of Tokyo" },
        { name: "Chen Wei", affiliation: "Tsinghua University" },
      ],
      abstract:
        "Perovskite tandem photovoltaic architectures provide a viable route toward breaking the Shockley-Queisser limit of silicon solar cells. However, degradation under thermal cycles remains a limiting obstacle for industrial commercialization. We present atomic-scale molecular dynamics simulations combined with in-situ grazing-incidence X-ray diffraction demonstrating 28.4% power conversion efficiency retained over 1,500 continuous operation hours under standard illumination.",
      keywords: ["Photovoltaics", "Perovskites", "Renewable Energy", "Materials Science"],
      category: "Materials Science",
      doi: "10.1007/s11263-026-0193-4",
    },
    {
      title: "Fault-Tolerant Consensus in Decentralized Edge Networks: A Zero-Knowledge Approach",
      slug: "fault-tolerant-consensus-decentralized-edge-networks-zero-knowledge",
      authors: [
        { name: "Priya Sharma", affiliation: "Indian Institute of Science" },
        { name: "Lucas Gomez", affiliation: "Polytechnic University of Madrid" },
      ],
      abstract:
        "Resource-constrained mobile edge computing topologies require ultra-low latency transaction validation resilient against Byzantine failures. We introduce zk-EdgeConsensus, an asymmetric cryptographic consensus algorithm utilizing recursive SNARKs to achieve block finality within 42 milliseconds on heterogeneous embedded nodes with minimal memory footprint.",
      keywords: ["Edge Computing", "Zero-Knowledge Proofs", "Consensus Algorithms", "Distributed Systems"],
      category: "Computer Science & AI",
      doi: "10.1007/s11263-026-0194-5",
    },
    {
      title: "Catalytic Degradation of Microplastics via Immobilized Biocompatible Metalloprotein Complexes",
      slug: "catalytic-degradation-microplastics-metalloprotein-complexes",
      authors: [
        { name: "Sofia Rodriguez", affiliation: "ETH Zurich" },
        { name: "Marcus Lindqvist", affiliation: "Karolinska Institute" },
      ],
      abstract:
        "Anthropogenic accumulation of polyethylene terephthalate (PET) and microplastic polymers threatens marine ecosystems globally. Here, we engineer a hyperthermostable engineered bacterial PETase mutant conjugated to magnetic nanoparticle scaffolds. The resulting enzyme biocatalyst completely depolymerizes post-consumer PET particles into monomeric terephthalic acid within 36 hours under mild pH and ambient temperature.",
      keywords: ["Biocatalysis", "Microplastics", "Environmental Engineering", "Synthetic Biology"],
      category: "Environmental Sciences",
      doi: "10.1007/s11263-026-0195-6",
    },
    {
      title: "Quantum Annealing for Combinatorial Optimization in Resilient Smart Grid Topologies",
      slug: "quantum-annealing-combinatorial-optimization-smart-grids",
      authors: [
        { name: "Kwame Mensah", affiliation: "University of Cape Town" },
        { name: "Sarah Jenkins", affiliation: "Imperial College London" },
      ],
      abstract:
        "Modern smart microgrid networks require instant re-routing under abrupt catastrophic fluctuations in renewable generation. We formulate the optimal load dispatch and transmission line islanding problem as a Quadratic Unconstrained Binary Optimization (QUBO) problem executed on modern quantum annealing processors, reducing solution search spaces from exponential bounds to polynomial time.",
      keywords: ["Quantum Computing", "Smart Grids", "Optimization", "Power Systems"],
      category: "Electrical Engineering",
      doi: "10.1007/s11263-026-0196-7",
    },
    {
      title: "Longitudinal Epigenetic Tracking of Cellular Senescence via Single-Cell Transcriptomics",
      slug: "longitudinal-epigenetic-tracking-cellular-senescence",
      authors: [
        { name: "Arthur Pendelton", affiliation: "Johns Hopkins University" },
        { name: "Elena Rostova", affiliation: "Max Planck Institute" },
      ],
      abstract:
        "Cellular senescence drives multiple age-associated chronic degenerative pathologies. Utilizing single-cell RNA sequencing and methylation profiling across human fibroblast lineages over a 24-month horizon, we map transcriptional trajectories of senescence-associated secretory phenotype (SASP) triggers, unveiling novel therapeutic targets for selective senolytic interventions.",
      keywords: ["Epigenetics", "Single-Cell Genomics", "Aging", "Molecular Biology"],
      category: "Biomedical Sciences",
      doi: "10.1007/s11263-026-0197-8",
    },
    {
      title: "Aerodynamic Drag Reduction in Supersonic Civil Aircraft Through Active Boundary Layer Suction",
      slug: "aerodynamic-drag-reduction-supersonic-boundary-layer-suction",
      authors: [
        { name: "Jean-Pierre Laurent", affiliation: "ISAE-SUPAERO" },
        { name: "Kenji Sato", affiliation: "JAXA" },
      ],
      abstract:
        "Commercial supersonic transport requires severe reductions in wave drag and skin friction to achieve fuel-economic flight profiles. Numerical Reynolds-Averaged Navier-Stokes simulations coupled with Mach 2.2 wind-tunnel verification show that micro-perforated boundary layer suction surfaces delay turbulent transition by 38%, achieving an 11% net reduction in total cruise aerodynamic drag.",
      keywords: ["Aerodynamics", "Supersonic Flight", "Fluid Dynamics", "Computational Mechanics"],
      category: "Aerospace Engineering",
      doi: "10.1007/s11263-026-0198-9",
    },
    {
      title: "Federated Privacy-Preserving Natural Language Models in Multi-Jurisdictional Financial Compliance",
      slug: "federated-privacy-preserving-language-models-financial-compliance",
      authors: [
        { name: "Carlos Mendez", affiliation: "University of Toronto" },
        { name: "Hannah Schmidt", affiliation: "Goethe University Frankfurt" },
      ],
      abstract:
        "Strict anti-money laundering (AML) detection necessitates cross-institutional knowledge sharing without violating GDPR or personal financial confidentiality regulations. We describe an enterprise-grade federated transformer model trained across ten financial institutions using differential privacy guarantees with epsilon value 0.5, detecting fraud rings with 94.7% precision.",
      keywords: ["Federated Learning", "Differential Privacy", "NLP", "Financial Technology"],
      category: "Computer Science & AI",
      doi: "10.1007/s11263-026-0199-0",
    },
    {
      title: "Microbial Fuel Cells Driven by Anaerobic Waste Effluent in Urban Wastewater Treatment",
      slug: "microbial-fuel-cells-anaerobic-waste-effluent",
      authors: [
        { name: "Nadia Al-Mansoor", affiliation: "KAUST" },
        { name: "Samuel O'Connor", affiliation: "University of Sydney" },
      ],
      abstract:
        "Continuous energy harvesting from municipal wastewater remains a critical milestone for carbon-neutral sanitation. This empirical study measures bio-electrochemical power outputs from dual-chambered microbial fuel cells utilizing Shewanella oneidensis biofilms, demonstrating simultaneous 88% chemical oxygen demand removal and 1.4 W/m² continuous energy generation.",
      keywords: ["Microbial Fuel Cells", "Bioenergy", "Wastewater Treatment", "Sustainability"],
      category: "Environmental Sciences",
      doi: "10.1007/s11263-026-0200-1",
    },
    {
      title: "Autonomous Navigation of Micro-UAV Swarms in GPS-Denied Confined Subterranean Environments",
      slug: "autonomous-navigation-micro-uav-swarms-subterranean",
      authors: [
        { name: "Zackary Bell", affiliation: "Carnegie Mellon University" },
        { name: "Li Wei", affiliation: "National University of Singapore" },
      ],
      abstract:
        "Search-and-rescue operations in collapsed tunnels require agile micro aerial vehicle swarms operating without global positioning satellites. We formulate a decentralized visual-inertial SLAM swarm pipeline with ultra-wideband inter-agent distance bounding, proving robust mapping and obstacle evasion at speeds exceeding 5 m/s in complete darkness.",
      keywords: ["Swarm Robotics", "SLAM", "Autonomous Systems", "Computer Vision"],
      category: "Robotics & Automation",
      doi: "10.1007/s11263-026-0201-2",
    },
    {
      title: "Graph Neural Networks for De Novo Molecular Generation of Selective Kinase Inhibitors",
      slug: "graph-neural-networks-de-novo-molecular-generation-kinase-inhibitors",
      authors: [
        { name: "Miriam E. Goldstein", affiliation: "Weizmann Institute of Science" },
        { name: "Tobias Becker", affiliation: "University of Vienna" },
      ],
      abstract:
        "Targeted cancer chemotherapies hinge upon the design of small molecules exhibiting high selectivity against mutant protein kinases. By coupling graph generative adversarial networks with 3D crystal structure docking predictors, we generated and synthesized 12 candidate inhibitors, two of which demonstrated sub-nanomolar binding affinities against oncogenic EGFR variants.",
      keywords: ["Graph Neural Networks", "Cheminformatics", "Drug Discovery", "Molecular Biology"],
      category: "Biomedical Sciences",
      doi: "10.1007/s11263-026-0202-3",
    },
    {
      title: "High-Entropy Alloy Coatings for Severe Cavitation Erosion Resistance in Hydroturbines",
      slug: "high-entropy-alloy-coatings-cavitation-erosion-hydroturbines",
      authors: [
        { name: "Rajesh Varma", affiliation: "IIT Madras" },
        { name: "Alexander Gross", affiliation: "Technical University of Munich" },
      ],
      abstract:
        "High-head hydroelectric power generators experience severe wear due to cavitation-induced shock pressures. We synthesized FeCoCrNiMo high-entropy alloy coatings via laser cladding on stainless steel substrates. Ultrasonic cavitation testing confirms a six-fold increase in wear life compared to traditional stellite overlays.",
      keywords: ["High-Entropy Alloys", "Laser Cladding", "Tribology", "Hydraulic Machinery"],
      category: "Materials Science",
      doi: "10.1007/s11263-026-0203-4",
    },
    {
      title: "Real-Time Volumetric Holographic Display via Acoustic Levitation of Photoluminescent Particles",
      slug: "real-time-volumetric-holographic-display-acoustic-levitation",
      authors: [
        { name: "Simon Croft", affiliation: "University of Bristol" },
        { name: "Yuki Takahashi", affiliation: "Kyoto University" },
      ],
      abstract:
        "True volumetric three-dimensional displays without wearable headgear offer transformative interfaces for surgical guidance and spatial modeling. We demonstrate a multi-particle ultrasonic phased array levitating microscopic fluorophore-coated beads illuminated by high-speed RGB laser steering to create persistent 30 fps full-color spatial animations in free space.",
      keywords: ["Acoustics", "Holography", "Volumetric Displays", "Optoelectronics"],
      category: "Applied Physics",
      doi: "10.1007/s11263-026-0204-5",
    },
    {
      title: "Decentralized Carbon Accounting and Verification Protocols Using Distributed Ledgers",
      slug: "decentralized-carbon-accounting-verification-distributed-ledgers",
      authors: [
        { name: "Amara Diallo", affiliation: "Cheikh Anta Diop University" },
        { name: "Claire Dupont", affiliation: "Sciences Po" },
      ],
      abstract:
        "Corporate net-zero commitments require auditability and prevention of double-counting in voluntary carbon offset registries. We model a verifiable decentralized carbon credit tokenization architecture integrated with satellite imagery IoT telemetry for direct forest biomass calculation and automated retirement.",
      keywords: ["Carbon Offsets", "Sustainability", "Distributed Ledger", "Climate Policy"],
      category: "Environmental Sciences",
      doi: "10.1007/s11263-026-0205-6",
    },
    {
      title: "Neuromorphic Memristive Synapses for Ultra-Low Power Spiking Neural Processing",
      slug: "neuromorphic-memristive-synapses-spiking-neural-processing",
      authors: [
        { name: "Gabriel Silva", affiliation: "University of São Paulo" },
        { name: "Hye-Jin Park", affiliation: "KAIST" },
      ],
      abstract:
        "Edge intelligence on sub-milliwatt battery budgets requires hardware architectures mimicking biological brain computing. We fabricate two-terminal transition metal oxide memristive devices exhibiting analog synaptic plasticity and spike-timing-dependent plasticity (STDP), enabling continuous on-chip speech keyword spotting at under 85 microwatts of total power consumption.",
      keywords: ["Neuromorphic Computing", "Memristors", "Spiking Neural Networks", "Semiconductors"],
      category: "Electrical Engineering",
      doi: "10.1007/s11263-026-0206-7",
    },
  ];

  const articlesToInsert = sampleArticlesMeta.map((art, idx) => {
    // Assign to issues evenly across published issues
    const targetIssue = publishedIssues[idx % publishedIssues.length];
    return {
      ...art,
      volume: targetIssue.volume,
      issue: targetIssue._id,
      publicationDate: targetIssue.publicationDate || new Date(),
      status: "published",
      pdfFile: {
        storageKey: "articles/sample-article.pdf",
        originalName: `${art.slug}.pdf`,
        mimeType: "application/pdf",
        size: SAMPLE_PDF_BUFFER.length,
      },
    };
  });

  await Article.insertMany(articlesToInsert);
  console.log("✓ 15 Published Articles seeded");

  // 7. Manuscript Submissions (8 manuscripts with diverse statuses)
  await Manuscript.deleteMany({});
  const manuscriptData = [
    {
      submissionId: "MS-2026-1042",
      authorName: "Dr. Marcus Vance",
      authorEmail: "m.vance@stanford.edu",
      authorPhone: "+1 (650) 723-2300",
      institution: "Stanford University",
      department: "Department of Bioengineering",
      country: "United States",
      title: "CRISPR-Cas13 Targeted RNA Editing for In-Vivo Correction of Muscular Dystrophy Mutations",
      manuscriptType: "Research Article",
      category: "Biomedical Sciences",
      abstract:
        "Duchenne muscular dystrophy is caused by frameshift mutations in the dystrophin gene. In this paper, we demonstrate systemic delivery of engineered Cas13 orthologs capable of precise adenosine-to-inosine editing without genomic off-target cleavage.",
      keywords: ["Gene Editing", "CRISPR", "RNA Therapeutics", "Genetics"],
      coAuthors: [{ name: "Clara Oswald", affiliation: "Stanford Medicine" }],
      pdfFile: {
        storageKey: "manuscripts/sample-manuscript.pdf",
        originalName: "CRISPR_Cas13_Editing_Manuscript.pdf",
        mimeType: "application/pdf",
        size: SAMPLE_PDF_BUFFER.length,
      },
      status: "submitted",
      paymentStatus: "pending",
      adminNotes: "Fresh submission received today. Awaiting initial editorial screening.",
    },
    {
      submissionId: "MS-2026-1038",
      authorName: "Prof. Kenneth Chang",
      authorEmail: "kchang@ntu.edu.sg",
      authorPhone: "+65 6790 5888",
      institution: "Nanyang Technological University",
      department: "School of Materials Science",
      country: "Singapore",
      title: "Gallium Nitride Solid-State Power Modulators for Next-Generation Particle Accelerators",
      manuscriptType: "Research Article",
      category: "Electrical Engineering",
      abstract:
        "High-gradient RF particle accelerators require megawatt pulsed power supplies with sub-nanosecond jitter. We design and test a multi-stage GaN transistor array providing 1.2 MW peak pulse output.",
      keywords: ["GaN", "Power Electronics", "Particle Physics", "Solid State"],
      coAuthors: [{ name: "Bao Nguyen", affiliation: "NTU Singapore" }],
      pdfFile: {
        storageKey: "manuscripts/sample-manuscript.pdf",
        originalName: "GaN_Power_Modulators.pdf",
        mimeType: "application/pdf",
        size: SAMPLE_PDF_BUFFER.length,
      },
      status: "under_review",
      paymentStatus: "pending",
      adminNotes: "Sent out to 2 peer reviewers on Nov 10. Reviews expected by end of month.",
    },
    {
      submissionId: "MS-2026-1025",
      authorName: "Dr. Fatima Zahra",
      authorEmail: "f.zahra@sorbonne.fr",
      authorPhone: "+33 1 44 27 44 27",
      institution: "Sorbonne Université",
      department: "Laboratoire d'Informatique",
      country: "France",
      title: "Geometric Deep Learning for Automated Proof Synthesis in Non-Euclidean Spaces",
      manuscriptType: "Research Article",
      category: "Computer Science & AI",
      abstract:
        "Automated theorem provers struggle with topological and Riemannian geometry lemmas. We introduce a geometric neural inductive bias enabling interactive synthesis of formal Coq proofs.",
      keywords: ["Formal Verification", "Geometric Deep Learning", "Coq", "Topology"],
      coAuthors: [],
      pdfFile: {
        storageKey: "manuscripts/sample-manuscript.pdf",
        originalName: "Geometric_DL_Proof_Synthesis.pdf",
        mimeType: "application/pdf",
        size: SAMPLE_PDF_BUFFER.length,
      },
      status: "revision_requested",
      paymentStatus: "not_required",
      adminNotes: "Reviewers asked for comparative benchmarks against Isabelle/HOL. Minor revision requested.",
    },
    {
      submissionId: "MS-2026-1019",
      authorName: "Prof. Lars Lindgren",
      authorEmail: "l.lindgren@chalmers.se",
      authorPhone: "+46 31 772 1000",
      institution: "Chalmers University of Technology",
      department: "Microtechnology and Nanoscience",
      country: "Sweden",
      title: "Superconducting Transmon Qubits With Amorphous Dielectric Loss Below 10^-7",
      manuscriptType: "Research Article",
      category: "Applied Physics",
      abstract:
        "Two-level system defects at metal-air and substrate interfaces currently degrade superconducting quantum processor coherence times. We present ultra-clean surface chemical passivation yielding T1 times surpassing 450 microseconds.",
      keywords: ["Quantum Computing", "Superconducting Qubits", "Coherence", "Cryogenics"],
      coAuthors: [
        { name: "Astrid Berglund", affiliation: "Chalmers" },
        { name: "Jonas Wallin", affiliation: "Chalmers" },
      ],
      pdfFile: {
        storageKey: "manuscripts/sample-manuscript.pdf",
        originalName: "Superconducting_Qubit_Loss.pdf",
        mimeType: "application/pdf",
        size: SAMPLE_PDF_BUFFER.length,
      },
      status: "accepted",
      paymentStatus: "paid",
      adminNotes: "Peer review completed with excellent feedback. Manuscript accepted. Payment confirmed via external link.",
    },
    {
      submissionId: "MS-2026-1011",
      authorName: "Dr. Rachel Kim",
      authorEmail: "rachel.kim@snu.ac.kr",
      authorPhone: "+82 2 880 5114",
      institution: "Seoul National University",
      department: "Department of Chemical and Biological Engineering",
      country: "South Korea",
      title: "Solid-State Polymer Electrolytes With Fast Lithium-Ion Transport for 500 Wh/kg Batteries",
      manuscriptType: "Research Article",
      category: "Materials Science",
      abstract:
        "Lithium metal batteries require dendrite-suppressing solid electrolytes that maintain high ionic conductivity at room temperature. We synthesize a crosslinked zwitterionic network reaching 1.2 mS/cm conductivity.",
      keywords: ["Lithium Batteries", "Solid State Electrolytes", "Energy Storage"],
      coAuthors: [],
      pdfFile: {
        storageKey: "manuscripts/sample-manuscript.pdf",
        originalName: "Solid_State_Polymer_Electrolytes.pdf",
        mimeType: "application/pdf",
        size: SAMPLE_PDF_BUFFER.length,
      },
      status: "accepted",
      paymentStatus: "pending",
      adminNotes: "Accepted for publication in Volume 4, Issue 2. Awaiting APC payment confirmation.",
    },
    {
      submissionId: "MS-2026-1005",
      authorName: "Prof. Arthur Pendelton",
      authorEmail: "a.pendelton@jhu.edu",
      authorPhone: "+1 (410) 516-8000",
      institution: "Johns Hopkins University",
      department: "Biomedical Sciences",
      country: "United States",
      title: "Longitudinal Epigenetic Tracking of Cellular Senescence via Single-Cell Transcriptomics",
      manuscriptType: "Research Article",
      category: "Biomedical Sciences",
      abstract:
        "Cellular senescence drives multiple age-associated chronic degenerative pathologies. Utilizing single-cell RNA sequencing and methylation profiling across human fibroblast lineages over a 24-month horizon, we map transcriptional trajectories.",
      keywords: ["Epigenetics", "Single-Cell Genomics", "Aging"],
      coAuthors: [{ name: "Elena Rostova", affiliation: "Max Planck Institute" }],
      pdfFile: {
        storageKey: "manuscripts/sample-manuscript.pdf",
        originalName: "Epigenetic_Tracking_Senescence.pdf",
        mimeType: "application/pdf",
        size: SAMPLE_PDF_BUFFER.length,
      },
      status: "published",
      paymentStatus: "paid",
      adminNotes: "Published in Volume 4 Issue 1.",
    },
    {
      submissionId: "MS-2026-0992",
      authorName: "Dr. Victor Morales",
      authorEmail: "vmorales@unam.mx",
      authorPhone: "+52 55 5622 1332",
      institution: "National Autonomous University of Mexico",
      department: "Geophysics Institute",
      country: "Mexico",
      title: "Seismic Inversion Anomalies in the Trans-Mexican Volcanic Belt Using Ambient Noise Correlation",
      manuscriptType: "Short Communication",
      category: "Earth Sciences",
      abstract:
        "Ambient seismic noise tomography yields high-resolution Rayleigh wave dispersion curves across central Mexican magma chambers, identifying low-velocity shear zones indicating partial melt concentrations.",
      keywords: ["Seismology", "Volcanology", "Geophysics", "Tomography"],
      coAuthors: [],
      pdfFile: {
        storageKey: "manuscripts/sample-manuscript.pdf",
        originalName: "Seismic_Inversion_Mexico.pdf",
        mimeType: "application/pdf",
        size: SAMPLE_PDF_BUFFER.length,
      },
      status: "rejected",
      paymentStatus: "not_required",
      adminNotes: "Scope out of bounds for current editorial volume focus. Author advised to submit to specialized volcanology journal.",
    },
    {
      submissionId: "MS-2026-0985",
      authorName: "Dr. Beatrice Ndege",
      authorEmail: "b.ndege@uonbi.ac.ke",
      authorPhone: "+254 20 491 0000",
      institution: "University of Nairobi",
      department: "School of Computing",
      country: "Kenya",
      title: "Offline-First Mobile Health Telemetry for Maternal Monitoring in Rural Rift Valley Communities",
      manuscriptType: "Research Article",
      category: "Health Informatics",
      abstract:
        "Rural maternal healthcare delivery faces chronic intermittent cellular network blackouts. We deploy a store-and-forward peer mesh telemetry protocol across 50 rural clinic centers.",
      keywords: ["Health Informatics", "Mobile Health", "Store-and-Forward", "Public Health"],
      coAuthors: [{ name: "James Kariuki", affiliation: "Nairobi Health Services" }],
      pdfFile: {
        storageKey: "manuscripts/sample-manuscript.pdf",
        originalName: "Mobile_Health_Telemetry_Nairobi.pdf",
        mimeType: "application/pdf",
        size: SAMPLE_PDF_BUFFER.length,
      },
      status: "accepted",
      paymentStatus: "waived",
      adminNotes: "APC fee waiver approved for low-resource institution under open access support program.",
    },
  ];

  await Manuscript.insertMany(manuscriptData);
  console.log("✓ 8 Manuscript submissions seeded");

  // 8. Contact Messages (3 messages)
  await ContactMessage.deleteMany({});
  const contactMessages = [
    {
      name: "Prof. Robert Thorne",
      email: "rthorne@princeton.edu",
      subject: "Inquiry Regarding Special Issue on Quantum Materials",
      message:
        "Dear Editorial Board,\n\nOur research consortium would like to propose a guest-edited Special Issue dedicated to Topologically Protected Surface States. Could you please provide information on the proposal submission guidelines and typical timeline for consideration?\n\nSincerely,\nProf. Robert Thorne",
      isRead: false,
      createdAt: new Date("2026-11-16T10:30:00Z"),
    },
    {
      name: "Dr. Li Mei",
      email: "limei@fudan.edu.cn",
      subject: "Question about Manuscript Reference MS-2026-1038",
      message:
        "Hello,\n\nI submitted our manuscript last week and wanted to verify whether additional supplementary video files can be uploaded for peer review. Thank you for your assistance.",
      isRead: true,
      createdAt: new Date("2026-11-14T14:15:00Z"),
    },
    {
      name: "Sarah Jenkins, Library Acquisitions",
      email: "acquisitions@oxfordlibraries.org",
      subject: "Open Access Indexing and OAI-PMH Endpoints",
      message:
        "Dear Publishing Team,\n\nWe are indexing your journal within our university open access repository. Could you confirm your OAI-PMH metadata harvest endpoint or RSS feeds for recently published volumes?\n\nBest regards,\nSarah Jenkins",
      isRead: false,
      createdAt: new Date("2026-11-12T09:00:00Z"),
    },
  ];
  await ContactMessage.insertMany(contactMessages);
  console.log("✓ 3 Contact messages seeded");

  // 9. Website CMS Content
  await PageContent.deleteMany({});
  const pageContents = [
    {
      pageKey: "homepage_hero",
      title: "Advancing Research. Sharing Knowledge. Inspiring Innovation.",
      content:
        "A professional academic publishing platform dedicated to advancing scholarly research, upholding rigorous peer review standards, and promoting global knowledge sharing.",
    },
    {
      pageKey: "about_overview",
      title: "Journal Overview",
      content:
        "The International Journal of Advanced Scientific Research (IJASR) is a multidisciplinary, peer-reviewed, open-access scholarly publication. Founded to provide researchers, academics, and industry professionals with an unhindered global medium to disseminate innovative research, IJASR maintains high standards of editorial integrity, ethical scholarship, and rapid dissemination.",
    },
    {
      pageKey: "aims_scope",
      title: "Aims and Scope",
      content:
        "IJASR welcomes original research papers, comprehensive reviews, short communications, and case studies across a broad spectrum of scholarly inquiries:\n\n• Computer Science & Artificial Intelligence\n• Electrical, Mechanical & Civil Engineering\n• Materials Science & Nanotechnology\n• Biomedical & Environmental Sciences\n• Applied Physics, Chemistry & Mathematics\n• Sustainable Energy & Climate Technologies\n\nAll submitted works undergo a thorough double-blind peer review process to assess methodological rigor, originality, and scholarly contribution.",
    },
    {
      pageKey: "mission_objectives",
      title: "Mission and Objectives",
      content:
        "Our core mission is to eliminate barriers to scientific literature through universal open access, empowering researchers everywhere to build upon cutting-edge findings without subscription fees or paywalls.",
    },
    {
      pageKey: "publication_ethics",
      title: "Publication Ethics & Malpractice Statement",
      content:
        "IJASR is committed to maintaining the highest ethical standards of scholarly publishing. We adhere strictly to the guidelines established by the Committee on Publication Ethics (COPE). Authors must warrant that submitted work is entirely original, has not been published previously, and is not currently under review elsewhere. Any instances of plagiarism, data fabrication, or unauthorized image manipulation will lead to immediate manuscript rejection or formal retraction.",
    },
    {
      pageKey: "open_access_policy",
      title: "Open Access Policy",
      content:
        "This journal provides immediate, permanent open access to its content under the Creative Commons Attribution 4.0 International License (CC BY 4.0). Readers are free to share, copy, distribute, and adapt the material in any medium or format, provided proper credit is given to the original authors and journal citation.",
    },
    {
      pageKey: "peer_review_policy",
      title: "Peer Review Policy",
      content:
        "Every submission is subject to initial editorial screening by the Editor-in-Chief to ensure alignment with journal scope and basic formatting standards. Suitable manuscripts are subsequently assigned to at least two independent expert reviewers for double-blind evaluation. The typical review cycle averages 3 to 5 weeks.",
    },
    {
      pageKey: "copyright_licensing",
      title: "Copyright and Licensing",
      content:
        "Authors retain unrestricted copyright of their articles while granting the journal the non-exclusive right of first publication under the Creative Commons Attribution (CC BY 4.0) license.",
    },
    {
      pageKey: "author_guidelines",
      title: "Comprehensive Author Guidelines",
      content:
        "1. Manuscript Preparation:\nManuscripts must be submitted in English, typed in a standard readable font (11 or 12 pt, 1.5 line spacing). Standard sections include Title, Abstract (150-300 words), Keywords (4-6), Introduction, Materials and Methods, Results, Discussion, Conclusion, and References.\n\n2. References:\nUse APA 7th Edition or IEEE citation format consistently throughout the manuscript.\n\n3. Figures & Tables:\nAll figures and charts must be embedded within the manuscript PDF with clear captions and numbering.\n\n4. Submission Format:\nOnly PDF files under 10 MB are accepted via our online submission portal.",
    },
  ];

  await PageContent.insertMany(pageContents);
  console.log("✓ Website Page Content seeded");

  console.log("\n========================================================");
  console.log("🎉 DATABASE SEEDED SUCCESSFULLY WITH SAMPLE DATA!");
  console.log(`Admin Login Email:    ${adminEmail}`);
  console.log(`Admin Login Password: ${adminPassword}`);
  console.log("========================================================\n");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Database seeding failed:", err);
  process.exit(1);
});
