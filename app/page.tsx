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
import { ProfilePortrait } from '@/components/public/ProfilePortrait';
import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Cpu,
  GraduationCap,
  Layers,
  Award,
  Briefcase,
  Terminal,
  Compass,
  Github,
  Mail,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const profile = await getProfile();
  const sections = await getHomepageSections();
  const projects = await getProjectsList({ publishedOnly: true, featuredOnly: true });
  const allProjects = await getProjectsList({ publishedOnly: true });
  const certifications = await getCertificationsList({ publishedOnly: true, featuredOnly: true });
  const skills = await getSkillsList(true);
  const education = await getEducationList(true);
  const experience = await getExperienceList(true);
  const services = await getServicesList(true);

  // Helper to check section visibility
  const isSectionEnabled = (key: string) => {
    const sec = sections.find((s) => s.sectionKey === key);
    return sec ? sec.isEnabled : true;
  };

  const featuredSkills = skills.filter((s) => s.isFeatured).slice(0, 8);

  return (
    <div className="relative overflow-hidden bg-cream text-charcoal">
      {/* ==================================================================== */}
      {/* 1. EDITORIAL 3D HERO: BURGUNDY GLASS RIBBON & LUXURY TYPOGRAPHY     */}
      {/* ==================================================================== */}
      <section className="relative min-h-[92vh] flex items-center pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Editorial Typography & Actions */}
            <div className="lg:col-span-7 space-y-7 z-10">
              {/* Small Introductory Label */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border-soft bg-white shadow-sm text-xs font-mono text-burgundy">
                <span className="w-2 h-2 rounded-full bg-rosegold animate-pulse" />
                <span className="font-semibold tracking-wider uppercase">
                  CREATIVE DEVELOPER · AI & MACHINE LEARNING
                </span>
              </div>

              {/* Main Headline */}
              <div className="space-y-3">
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-extrabold tracking-tight text-burgundy leading-[1.05]">
                  Building ideas into{' '}
                  <span className="italic font-normal text-rosegold">thoughtful digital experiences.</span>
                </h1>
                <p className="text-xl sm:text-2xl font-serif text-charcoal/80 tracking-tight">
                  Athrav Pathak — Aspiring AI Engineer & Creative Developer
                </p>
              </div>

              {/* Short Professional Introduction */}
              <p className="max-w-xl text-base sm:text-lg text-charcoal/85 leading-relaxed font-normal">
                Second-year Computer Applications undergraduate exploring machine learning architectures,
                deep learning algorithms, and modern full-stack development. Dedicated to crafting elegant,
                reliable software that translates ambitious concepts into refined computational realities.
              </p>

              {/* Verified Portrait Preview Pill */}
              {profile.avatarUrl && (
                <div className="inline-flex items-center gap-3.5 p-2 pr-5 rounded-2xl border border-border-soft bg-white/95 shadow-sm backdrop-blur-sm">
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="w-12 h-12 rounded-xl object-cover object-top border border-border-soft shadow-sm shrink-0"
                  />
                  <div>
                    <h4 className="text-sm font-serif font-bold text-burgundy leading-tight">{profile.name}</h4>
                    <p className="text-xs font-mono text-rosegold font-medium">BCA Undergraduate • Year 2</p>
                  </div>
                </div>
              )}

              {/* Hero Call to Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-burgundy hover:bg-burgundy-500 text-white font-bold text-sm transition-all shadow-md hover:scale-[1.01]"
                >
                  <span>Explore Projects</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white hover:bg-cream-100 border border-border-soft text-burgundy font-semibold text-sm transition-all shadow-sm"
                >
                  <span>Get in Touch</span>
                  <Mail className="w-4 h-4 text-rosegold" />
                </Link>

                <a
                  href="https://github.com/Athravpathak-git"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-4 rounded-xl bg-white/80 hover:bg-white border border-border-soft text-charcoal font-mono text-xs transition-all shadow-sm"
                  aria-label="GitHub Profile"
                >
                  <Github className="w-4 h-4 text-rosegold" />
                  <span>GitHub</span>
                </a>
              </div>
            </div>

            {/* Right Column: 3D Burgundy Glass Ribbon Art Sculpture */}
            <div className="lg:col-span-5 relative w-full h-[420px] sm:h-[480px] lg:h-[540px] flex items-center justify-center pointer-events-none">
              <div className="w-full h-full relative">
                <Hero3DClient />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 2. REFINED SELECTED PROJECTS — EDITORIAL GRID                        */}
      {/* ==================================================================== */}
      {isSectionEnabled('projects') && (
        <section className="py-24 border-t border-border-soft bg-white/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="space-y-3">
                <span className="text-xs font-mono text-rosegold uppercase tracking-wider font-semibold">
                  Selected Works & Prototypes
                </span>
                <h2 className="text-3xl sm:text-5xl font-serif font-extrabold tracking-tight text-burgundy">
                  Featured Projects
                </h2>
                <p className="text-sm text-charcoal/80 max-w-xl leading-relaxed">
                  Practical software engineering and machine learning projects exploring autonomous systems,
                  computer vision inference, and statistical learning pipelines.
                </p>
              </div>
              <Link
                href="/projects"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-burgundy hover:text-rosegold transition-colors"
              >
                <span>Browse all {allProjects.length} projects</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Editorial Grid layout with varying card sizes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-7">
              {projects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  featuredLarge={index === 0}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==================================================================== */}
      {/* 3. ABOUT & PHILOSOPHY PREVIEW                                        */}
      {/* ==================================================================== */}
      {isSectionEnabled('about') && (
        <section className="py-24 border-t border-border-soft bg-cream-50/70 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-5 space-y-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border-soft bg-white text-xs font-mono text-rosegold font-semibold">
                  <Compass className="w-3.5 h-3.5 text-rosegold" />
                  <span>Engineering Direction</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-serif font-extrabold tracking-tight text-burgundy">
                  Bridging Theoretical AI & Practical Software
                </h2>
                <p className="text-charcoal/85 leading-relaxed text-sm sm:text-base">
                  As a second-year BCA student, I approach artificial intelligence with deep academic curiosity
                  and practical discipline: gradient descent optimization, loss functions, tensor workflows,
                  and type-safe modern software development.
                </p>

                {/* Profile Portrait Component */}
                <div className="pt-2 max-w-xs">
                  <ProfilePortrait
                    avatarUrl={profile.avatarUrl}
                    name={profile.name}
                    headline="BCA Undergraduate • Year 2"
                    status={profile.status}
                  />
                </div>

                <div className="pt-2">
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-burgundy hover:text-rosegold transition-colors"
                  >
                    <span>Read full biography & technical goals</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="rounded-2xl border border-border-soft bg-white p-7 space-y-3 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-cream-100 border border-border-soft flex items-center justify-center text-burgundy">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-serif font-bold text-burgundy">Academic Foundations</h3>
                  <p className="text-xs text-charcoal/80 leading-relaxed">
                    Completing Year 2 coursework in Bachelor of Computer Applications with steady focus on data structures, relational databases, and algorithm complexity.
                  </p>
                </div>

                <div className="rounded-2xl border border-border-soft bg-white p-7 space-y-3 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-cream-100 border border-border-soft flex items-center justify-center text-burgundy">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-serif font-bold text-burgundy">Machine Learning Focus</h3>
                  <p className="text-xs text-charcoal/80 leading-relaxed">
                    Studying supervised & unsupervised learning models, regression evaluation, loss minimization, and PyTorch / Scikit-Learn pipelines.
                  </p>
                </div>

                <div className="rounded-2xl border border-border-soft bg-white p-7 space-y-3 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-cream-100 border border-border-soft flex items-center justify-center text-burgundy">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-serif font-bold text-burgundy">Full-Stack Modernity</h3>
                  <p className="text-xs text-charcoal/80 leading-relaxed">
                    Building performant web platforms with Next.js App Router, React 19, TypeScript, Tailwind CSS, and relational database systems.
                  </p>
                </div>

                <div className="rounded-2xl border border-border-soft bg-white p-7 space-y-3 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-cream-100 border border-border-soft flex items-center justify-center text-burgundy">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-serif font-bold text-burgundy">Disciplined Mindset</h3>
                  <p className="text-xs text-charcoal/80 leading-relaxed">
                    Writing clean, type-safe, tested code and embracing transparent progress without inflated claims or fabricated metrics.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ==================================================================== */}
      {/* 4. 3D SPATIAL SHOWCASE                                               */}
      {/* ==================================================================== */}
      {isSectionEnabled('showcase') && (
        <section className="py-16 border-t border-border-soft">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Showcase3DClient />
          </div>
        </section>
      )}

      {/* ==================================================================== */}
      {/* 5. TECHNICAL STACK PREVIEW                                           */}
      {/* ==================================================================== */}
      {isSectionEnabled('skills') && (
        <section className="py-24 border-t border-border-soft bg-white/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="space-y-3">
                <span className="text-xs font-mono text-rosegold uppercase tracking-wider font-semibold">
                  Competencies & Stack
                </span>
                <h2 className="text-3xl sm:text-4xl font-serif font-extrabold tracking-tight text-burgundy">
                  Technical Capabilities & Tooling
                </h2>
                <p className="text-sm text-charcoal/80 max-w-xl leading-relaxed">
                  Active technologies and tools utilized for software engineering, data modeling, and machine learning exploration.
                </p>
              </div>
              <Link
                href="/skills"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-burgundy hover:text-rosegold transition-colors"
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
      {/* 6. EDUCATION & INTERNSHIP PREVIEWS                                   */}
      {/* ==================================================================== */}
      <section className="py-24 border-t border-border-soft bg-cream-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Education Card */}
            {isSectionEnabled('education') && education.length > 0 && (
              <div className="rounded-2xl border border-border-soft bg-white p-8 space-y-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cream-100 border border-border-soft flex items-center justify-center text-burgundy">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono text-rosegold uppercase font-semibold">Current Education</span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-serif font-bold text-burgundy">{education[0].degree}</h3>
                  <p className="text-sm font-semibold text-rosegold">{education[0].institution}</p>
                  <div className="inline-block text-xs font-mono text-burgundy bg-cream-100 border border-border-soft px-2.5 py-1 rounded-full font-medium">
                    {education[0].status}
                  </div>
                </div>

                <p className="text-sm text-charcoal/80 leading-relaxed">
                  {education[0].description}
                </p>

                <div className="pt-2">
                  <Link
                    href="/education"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-burgundy hover:text-rosegold transition-colors"
                  >
                    <span>View complete academic path</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* Experience Card */}
            {isSectionEnabled('experience') && experience.length > 0 && (
              <div className="rounded-2xl border border-border-soft bg-white p-8 space-y-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cream-100 border border-border-soft flex items-center justify-center text-burgundy">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono text-rosegold uppercase font-semibold">Internship Experience</span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-serif font-bold text-burgundy">{experience[0].role}</h3>
                  <p className="text-sm font-semibold text-rosegold">{experience[0].company}</p>
                  <div className="inline-block text-xs font-mono text-burgundy bg-cream-100 border border-border-soft px-2.5 py-1 rounded-full font-medium">
                    {experience[0].employmentType} • {experience[0].workplaceType}
                  </div>
                </div>

                <p className="text-sm text-charcoal/80 leading-relaxed">
                  {experience[0].description}
                </p>

                <div className="pt-2">
                  <Link
                    href="/experience"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-burgundy hover:text-rosegold transition-colors"
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
        <section className="py-24 border-t border-border-soft bg-white/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="space-y-3">
                <span className="text-xs font-mono text-rosegold uppercase tracking-wider font-semibold">
                  Credentials & Training
                </span>
                <h2 className="text-3xl sm:text-4xl font-serif font-extrabold tracking-tight text-burgundy">
                  Certifications & Coursework
                </h2>
                <p className="text-sm text-charcoal/80 max-w-xl leading-relaxed">
                  Verified coursework across machine learning theory, software development, and algorithms.
                </p>
              </div>
              <Link
                href="/certifications"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-burgundy hover:text-rosegold transition-colors"
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
      {/* 8. WHAT I BUILD                                                      */}
      {/* ==================================================================== */}
      {isSectionEnabled('services') && (
        <section className="py-24 border-t border-border-soft">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <span className="text-xs font-mono text-rosegold uppercase tracking-wider font-semibold">
                Capabilities
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-extrabold tracking-tight text-burgundy">
                What I Build
              </h2>
              <p className="text-sm text-charcoal/80 leading-relaxed">
                Applied development and prototyping competencies ready for internships, student collaborative teams, and project initiatives.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((srv) => (
                <div
                  key={srv.id}
                  className="rounded-2xl border border-border-soft bg-white p-6 space-y-4 hover:border-rosegold shadow-sm hover:shadow-md transition-all"
                >
                  <h3 className="text-lg font-serif font-bold text-burgundy">{srv.title}</h3>
                  <p className="text-xs text-charcoal/80 leading-relaxed">{srv.description}</p>
                  <div className="flex flex-wrap gap-1 pt-2">
                    {srv.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="text-[10px] font-mono text-charcoal bg-cream-100 px-2 py-0.5 rounded border border-border-soft"
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
        <section className="py-24 border-t border-border-soft bg-cream-100/60 relative">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border-soft bg-white text-xs font-mono text-burgundy shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-rosegold" />
              <span>Let&apos;s Build Together</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-serif font-extrabold tracking-tight text-burgundy">
              Interested in Collaboration or Internships?
            </h2>

            <p className="text-base text-charcoal/85 max-w-xl mx-auto leading-relaxed">
              Whether you are looking for an aspiring AI engineer for your team, have feedback on my work, or want to explore collaborative projects, I would love to connect.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-burgundy hover:bg-burgundy-500 text-white font-bold text-sm transition-all shadow-md hover:scale-[1.01]"
              >
                <span>Initiate Contact</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="https://github.com/Athravpathak-git"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-4 rounded-xl bg-white border border-border-soft text-charcoal font-mono text-xs transition-all shadow-sm hover:bg-cream-100"
              >
                <Github className="w-4 h-4 text-rosegold" />
                <span>Visit GitHub Profile</span>
              </a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
