import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma.js';
import { requireAdmin } from '@/lib/auth-guard.js';

const CURATED_INSTITUTIONS = [
  'Savitribai Phule Pune University',
  'University of Mumbai',
  'Delhi University',
  'Anna University',
  'Indian Institute of Technology (IIT)',
  'National Institute of Technology (NIT)',
  'Birla Institute of Technology and Science (BITS)',
  'Vellore Institute of Technology (VIT)',
  'Symbiosis International University',
  'Stanford Online',
  'MIT OpenCourseWare',
  'Harvard Online',
];

const CURATED_COMPANIES = [
  'Infosys',
  'Tata Consultancy Services (TCS)',
  'Wipro',
  'Cognizant',
  'Accenture',
  'Google',
  'Microsoft',
  'Amazon',
  'Meta',
  'Apple',
  'NVIDIA',
  'IBM',
  'Oracle',
  'Cisco',
  'Capgemini',
  'Persistent Systems',
  'HCL Technologies',
  'Freelance / Self-Employed',
];

const CURATED_ISSUERS = [
  'Coursera',
  'IBM',
  'Infosys Springboard',
  'Google Cloud',
  'Amazon Web Services (AWS)',
  'Microsoft',
  'Meta',
  'Cisco',
  'Oracle',
  'Forage',
  'Tata Consultancy Services',
  'HackerRank',
  'LeetCode',
  'freeCodeCamp',
  'Udemy',
  'edX',
  'Stanford Online',
];

const CURATED_TECH_TAGS = [
  'Next.js',
  'React',
  'JavaScript',
  'TypeScript',
  'Node.js',
  'PostgreSQL',
  'Prisma ORM',
  'Tailwind CSS',
  'Three.js',
  'Docker',
  'Express.js',
  'Redis',
  'GraphQL',
  'REST APIs',
  'Python',
  'Git & GitHub',
  'Linux',
  'CI/CD',
  'Jest / Vitest',
  'Argon2id',
  'JWT & Session Auth',
  'Zod Validation',
  'WebSockets',
  'AWS',
  'Vercel',
  'Nginx',
];

export async function GET(req) {
  const { errorResponse } = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  try {
    // 1. Fetch DB institutions and universities
    const educations = await prisma.education.findMany({
      select: { institution: true, university: true, degree: true },
    });

    const dbInstitutions = educations.map((e) => e.institution).filter(Boolean);
    const dbUniversities = educations.map((e) => e.university).filter(Boolean);
    const dbDegrees = educations.map((e) => e.degree).filter(Boolean);

    // 2. Fetch DB companies and technologies from Experience
    const experiences = await prisma.experience.findMany({
      select: { company: true, technologies: true },
    });

    const dbCompanies = experiences.map((e) => e.company).filter(Boolean);
    const dbExpTech = experiences.flatMap((e) => (Array.isArray(e.technologies) ? e.technologies : []));

    // 3. Fetch DB issuers from Certifications
    const certifications = await prisma.certification.findMany({
      select: { issuer: true },
    });
    const dbIssuers = certifications.map((c) => c.issuer).filter(Boolean);

    // 4. Fetch DB skills and project tech tags
    const skills = await prisma.skill.findMany({
      select: { name: true },
    });
    const dbSkills = skills.map((s) => s.name).filter(Boolean);

    const projects = await prisma.project.findMany({
      select: { techStack: true, category: true },
    });
    const dbProjectTech = projects.flatMap((p) => (Array.isArray(p.techStack) ? p.techStack : []));
    const dbCategories = projects.map((p) => p.category).filter(Boolean);

    // Merge and deduplicate
    const uniqueInstitutions = Array.from(new Set([...dbInstitutions, ...CURATED_INSTITUTIONS]));
    const uniqueUniversities = Array.from(new Set([...dbUniversities, ...CURATED_INSTITUTIONS]));
    const uniqueCompanies = Array.from(new Set([...dbCompanies, ...CURATED_COMPANIES]));
    const uniqueIssuers = Array.from(new Set([...dbIssuers, ...CURATED_ISSUERS]));
    const uniqueTechTags = Array.from(
      new Set([...CURATED_TECH_TAGS, ...dbSkills, ...dbProjectTech, ...dbExpTech])
    );
    const uniqueCategories = Array.from(
      new Set(['Full Stack', 'Backend & Systems', 'Database Architecture', 'Security & Cloud', ...dbCategories])
    );

    return NextResponse.json({
      institutions: uniqueInstitutions,
      universities: uniqueUniversities,
      companies: uniqueCompanies,
      issuers: uniqueIssuers,
      techTags: uniqueTechTags,
      categories: uniqueCategories,
    });
  } catch (error) {
    console.error('Error fetching admin suggestions:', error);
    return NextResponse.json(
      {
        institutions: CURATED_INSTITUTIONS,
        universities: CURATED_INSTITUTIONS,
        companies: CURATED_COMPANIES,
        issuers: CURATED_ISSUERS,
        techTags: CURATED_TECH_TAGS,
        categories: ['Full Stack', 'Backend & Systems', 'Database Architecture'],
      },
      { status: 200 }
    );
  }
}
