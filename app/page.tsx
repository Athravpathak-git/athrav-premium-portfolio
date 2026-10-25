import React from 'react';
import Link from 'next/link';
import {
  getProfile,
  getHomepageSections,
  getProjectsList,
  getCertificationsList,
  getSkillsList,
  getEducationList,
  getExperienceList,
  getAchievementsList,
  getServicesList,
} from '@/lib/data-service';
import { Hero3DClient } from '@/components/public/Hero3DClient';
import { Showcase3DClient } from '@/components/public/Showcase3DClient';
import { ProjectCard } from '@/components/public/ProjectCard';
import { CertificateCard } from '@/components/public/CertificateCard';
import { SkillBadge } from '@/components/public/SkillBadge';
import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Cpu,
  GraduationCap,
  Layers,
  Award,
  Briefcase,
  Trophy,
  Terminal,
  Compass,
  CheckCircle2,
  Github,
} from 'lucide-react';

export default async function HomePage() {
  const profile = await getProfile();
  const sections = await getHomepageSections();
  const projects = await getProjectsList({ publishedOnly: true, featuredOnly: true });
  const allProjects = await getProjectsList({ publishedOnly: true });
  const certifications = await getCertificationsList({ publishedOnly: true, featuredOnly: true });
  const skills = await getSkillsList(true);
  const education = await getEducationList(true);
  const experience = await getExperienceList(true);
  const achievements = await getAchievementsList(true);
  const services = await getServicesList(true);

  // Helper to check section visibility
  const isSectionEnabled = (key: string) => {
    const sec = sections.find((s) => s.sectionKey === key);
    return sec ? sec.isEnabled : true;
  };

  const featuredSkills = skills.filter((s) => s.isFeatured).slice(0, 8);

  return (
    <div className="relative overflow-hidden bg-black text-white">
      {/* ==================================================================== */}
      {/* 1. HERO SECTION WITH 3D ORBITAL EXPERIENCE                           */}
      {/* ==================================================================== */}
      <section className="relative min-h-[94vh] flex items-center justify-center pt-36 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Three.js 3D Background Canvas */}
        <div className="absolute inset-0 z-0">
          <Hero3DClient />
        </div>

        {/* Subtle radial overlay to ensure contrast and readability */}
        <div className="absolute inset-0 z-0 bg-radial-gradient from-transparent via-black/40 to-black pointer-events-none" />

        {/* Foreground Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-7">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 bg-zinc-900/60 backdrop-blur-xl text-xs font-mono text-silver-300 shadow-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Aspiring AI Engineer • BCA 2nd Year</span>
          </div>

          {/* Main Title */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white">
              ATHRAV PATHAK
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl font-medium tracking-tight bg-gradient-to-r from-white via-silver-200 to-zinc-400 bg-clip-text text-transparent">
              Building Intelligent Digital Experiences.
            </p>
          </div>

          {/* Intro Description */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-zinc-400 leading-relaxed font-normal">
            Pursuing a Bachelor of Computer Applications with a dedicated focus on machine learning algorithms,
            deep learning fundamentals, and modern full-stack web platforms.
          </p>

          {/* Call to Actions */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white hover:bg-silver-100 text-zinc-950 font-semibold text-sm transition-all duration-200 shadow-xl shadow-white/10 hover:scale-[1.02]"
            >
              <span>Explore Projects</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-zinc-900/70 hover:bg-zinc-800/80 border border-white/15 text-white font-medium text-sm transition-all duration-200 backdrop-blur-md hover:border-white/30"
            >
              <span>About My Journey</span>
              <ArrowUpRight className="w-4 h-4 text-zinc-400" />
            </Link>

            <a
              href="https://github.com/Athravpathak-git"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-zinc-900/50 hover:bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white font-mono text-xs transition-all"
              aria-label="GitHub Profile"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-zinc-400 flex flex-col items-center gap-2 pointer-events-none">
          <span className="text-[10px] font-mono tracking-widest uppercase">Scroll</span>
          <div className="w-4 h-7 rounded-full border border-white/20 flex items-start justify-center p-1">
            <div className="w-1 h-2 rounded-full bg-silver-400 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 2. ABOUT & CAREER VISION PREVIEW                                     */}
      {/* ==================================================================== */}
      {isSectionEnabled('about') && (
        <section className="py-24 border-t border-white/10 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-5 space-y-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-zinc-900 text-xs font-mono text-silver-300">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Engineering Direction</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                  Bridging Theoretical AI & Practical Software
                </h2>
                <p className="text-zinc-400 leading-relaxed text-sm sm:text-base">
                  As a second-year BCA student, I approach artificial intelligence not merely as API consumerism,
                  but from the mathematical ground up: gradient descent optimization, loss functions, tensor operations,
                  and software engineering craft.
                </p>
                <div className="pt-2">
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-silver-300 hover:text-white transition-colors"
                  >
                    <span>Read full biography & technical goals</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-silver-300">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Academic Progress</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Currently completing Year 2 coursework in Bachelor of Computer Applications with steady focus on data structures, databases, and algorithms.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-silver-300">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Machine Learning Focus</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Studying supervised & unsupervised learning algorithms, model evaluation metrics, and PyTorch/Scikit-Learn implementations.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-silver-300">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Full-Stack Modernity</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Building performant web platforms with Next.js App Router, React 19, TypeScript, Tailwind CSS, and PostgreSQL.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-silver-300">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Disciplined Mindset</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Writing clean, type-safe, tested code and embracing transparent progress without inflated claims or fabricated metrics.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ==================================================================== */}
      {/* 3. 3D SPATIAL SHOWCASE                                               */}
      {/* ==================================================================== */}
      {isSectionEnabled('showcase') && (
        <section className="py-16 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Showcase3DClient />
          </div>
        </section>
      )}

      {/* ==================================================================== */}
      {/* 4. TECHNICAL SKILLS PREVIEW                                          */}
      {/* ==================================================================== */}
      {isSectionEnabled('skills') && (
        <section className="py-24 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="space-y-3">
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                  Competencies & Stack
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                  Technical Skills & AI Tooling
                </h2>
                <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
                  Active technologies and tools I utilize for software engineering, data modeling, and machine learning exploration.
                </p>
              </div>
              <Link
                href="/skills"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-silver-300 hover:text-white transition-colors"
              >
                <span>View all categorized skills</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredSkills.map((skill) => (
                <SkillBadge key={skill.id} skill={skill} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==================================================================== */}
      {/* 5. FEATURED PROJECTS                                                 */}
      {/* ==================================================================== */}
      {isSectionEnabled('projects') && (
        <section className="py-24 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="space-y-3">
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                  Engineering Implementations
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                  Featured Projects
                </h2>
                <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
                  Practical software systems exploring agentic workflows, computer vision, and machine learning pipelines.
                </p>
              </div>
              <Link
                href="/projects"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-silver-300 hover:text-white transition-colors"
              >
                <span>Browse all {allProjects.length} projects</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==================================================================== */}
      {/* 6. EDUCATION & INTERNSHIP PREVIEWS                                   */}
      {/* ==================================================================== */}
      <section className="py-24 border-t border-white/10 bg-zinc-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Education Card */}
            {isSectionEnabled('education') && education.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-8 space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/15 flex items-center justify-center text-silver-300">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono text-zinc-400 uppercase">Current Education</span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white">{education[0].degree}</h3>
                  <p className="text-sm font-medium text-silver-300">{education[0].institution}</p>
                  <div className="inline-block text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                    {education[0].status}
                  </div>
                </div>

                <p className="text-sm text-zinc-400 leading-relaxed">
                  {education[0].description}
                </p>

                <div className="pt-2">
                  <Link
                    href="/education"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-silver-300 hover:text-white"
                  >
                    <span>View complete academic path</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* Experience Card */}
            {isSectionEnabled('experience') && experience.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-8 space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/15 flex items-center justify-center text-silver-300">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono text-zinc-400 uppercase">Internship Program</span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white">{experience[0].role}</h3>
                  <p className="text-sm font-medium text-silver-300">{experience[0].company}</p>
                  <div className="inline-block text-xs font-mono text-zinc-400 bg-zinc-900 border border-white/10 px-2.5 py-1 rounded-full">
                    {experience[0].employmentType} • {experience[0].workplaceType}
                  </div>
                </div>

                <p className="text-sm text-zinc-400 leading-relaxed">
                  {experience[0].description}
                </p>

                <div className="pt-2">
                  <Link
                    href="/experience"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-silver-300 hover:text-white"
                  >
                    <span>View internship & experience details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 7. FEATURED CERTIFICATIONS                                           */}
      {/* ==================================================================== */}
      {isSectionEnabled('certifications') && (
        <section className="py-24 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="space-y-3">
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                  Credentials & Training
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                  Certifications & Coursework
                </h2>
                <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
                  Specialized online coursework and simulations across machine learning, software development, and data analytics.
                </p>
              </div>
              <Link
                href="/certifications"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-silver-300 hover:text-white transition-colors"
              >
                <span>View all certifications</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certifications.map((cert) => (
                <CertificateCard key={cert.id} cert={cert} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==================================================================== */}
      {/* 8. SERVICES / WHAT I CAN BUILD                                       */}
      {/* ==================================================================== */}
      {isSectionEnabled('services') && (
        <section className="py-24 border-t border-white/10 bg-zinc-950/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                Capabilities
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                What I Build
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Applied development and prototyping competencies ready for internships, student collaborative teams, and project initiatives.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((srv) => (
                <div
                  key={srv.id}
                  className="rounded-2xl border border-white/10 bg-zinc-950/80 p-6 space-y-4 hover:border-white/20 transition-all"
                >
                  <h3 className="text-lg font-semibold text-white">{srv.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{srv.description}</p>
                  <div className="flex flex-wrap gap-1 pt-2">
                    {srv.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-white/5"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==================================================================== */}
      {/* 9. CONTACT CALL TO ACTION                                            */}
      {/* ==================================================================== */}
      {isSectionEnabled('contact') && (
        <section className="py-24 border-t border-white/10 relative">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-zinc-900 text-xs font-mono text-silver-300">
              <Sparkles className="w-3.5 h-3.5 text-silver-300" />
              <span>Let&apos;s Build Together</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Interested in Collaboration or Internships?
            </h2>

            <p className="text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
              Whether you are looking for an aspiring AI engineer for your team, have feedback on my work, or want to explore collaborative projects, I would love to connect.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white hover:bg-silver-100 text-zinc-950 font-semibold text-sm transition-all shadow-xl shadow-white/10"
              >
                <span>Initiate Contact</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="https://github.com/Athravpathak-git"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-zinc-900 border border-white/15 text-zinc-300 hover:text-white font-mono text-xs transition-all"
              >
                <Github className="w-4 h-4" />
                <span>Visit GitHub Profile</span>
              </a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
