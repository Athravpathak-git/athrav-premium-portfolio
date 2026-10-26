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
  Trophy,
  Terminal,
  Compass,
  CheckCircle2,
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
  const achievements = await getAchievementsList(true);
  const services = await getServicesList(true);

  // Helper to check section visibility
  const isSectionEnabled = (key: string) => {
    const sec = sections.find((s) => s.sectionKey === key);
    return sec ? sec.isEnabled : true;
  };

  const featuredSkills = skills.filter((s) => s.isFeatured).slice(0, 8);

  return (
    <div className="relative overflow-hidden bg-cream dark:bg-forest-950 text-forest dark:text-cream-100 transition-colors">
      {/* ==================================================================== */}
      {/* 1. HERO SECTION WITH 3D ORBITAL CENTERPIECE (TWO-COLUMN BALANCED)    */}
      {/* ==================================================================== */}
      <section className="relative min-h-[92vh] flex items-center pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Column 1: Typography, Introduction & Actions */}
            <div className="lg:col-span-7 space-y-6 z-10">
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cream-300 dark:border-forest-700 bg-ivory dark:bg-forest-900 shadow-sm text-xs font-mono text-forest-700 dark:text-sage-200">
                <span className="w-2 h-2 rounded-full bg-forest dark:bg-champagne-400 animate-pulse" />
                <span>Aspiring AI Engineer • BCA 2nd Year</span>
              </div>

              {/* Main Titles */}
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-forest dark:text-ivory">
                  ATHRAV PATHAK
                </h1>
                <p className="text-2xl sm:text-3xl font-semibold text-champagne-700 dark:text-champagne-300 tracking-tight">
                  Aspiring AI Engineer
                </p>
              </div>

              {/* Professional Introduction Paragraph */}
              <p className="max-w-xl text-base sm:text-lg text-forest-700/90 dark:text-sage-100 leading-relaxed font-normal">
                Pursuing a Bachelor of Computer Applications with a dedicated focus on machine learning algorithms,
                neural network foundations, and modern software engineering. Committed to building robust,
                intelligent digital platforms from core mathematical principles to scalable production systems.
              </p>

              {/* Athrav's Actual Saved Profile Photo Card */}
              {profile.avatarUrl && (
                <div className="inline-flex items-center gap-3.5 p-2.5 pr-5 rounded-2xl border border-cream-300 dark:border-forest-700 bg-ivory/90 dark:bg-forest-900/90 shadow-sm backdrop-blur-sm">
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="w-12 h-12 rounded-xl object-cover border border-champagne-400/50 shadow-sm shrink-0"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-forest dark:text-ivory leading-tight">{profile.name}</h4>
                    <p className="text-xs font-mono text-forest-600 dark:text-sage">Verified Portfolio Portrait</p>
                  </div>
                </div>
              )}

              {/* Call to Actions */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-forest hover:bg-forest-600 text-ivory font-bold text-sm transition-all shadow-md hover:scale-[1.02]"
                >
                  <span>Explore Projects</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-ivory dark:bg-forest-900 hover:bg-cream-200 border border-cream-300 dark:border-forest-700 text-forest dark:text-ivory font-semibold text-sm transition-all shadow-sm"
                >
                  <span>Contact Me</span>
                  <Mail className="w-4 h-4 text-forest-600 dark:text-sage" />
                </Link>

                <a
                  href="https://github.com/Athravpathak-git"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-ivory/70 dark:bg-forest-900/70 hover:bg-ivory border border-cream-300 dark:border-forest-700 text-forest-700 dark:text-sage hover:text-forest font-mono text-xs transition-all shadow-sm"
                  aria-label="GitHub Profile"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                </a>
              </div>
            </div>

            {/* Column 2: Interactive 3D Centerpiece */}
            <div className="lg:col-span-5 relative w-full h-[420px] sm:h-[480px] lg:h-[520px] flex items-center justify-center">
              <div className="w-full h-full relative">
                <Hero3DClient />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 2. ABOUT & CAREER VISION PREVIEW                                     */}
      {/* ==================================================================== */}
      {isSectionEnabled('about') && (
        <section className="py-24 border-t border-cream-300/70 dark:border-forest-800 bg-ivory/60 dark:bg-forest-900/40 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-5 space-y-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-cream-300 dark:border-forest-700 bg-ivory dark:bg-forest-900 text-xs font-mono text-forest-700 dark:text-sage">
                  <Compass className="w-3.5 h-3.5 text-champagne-600" />
                  <span>Engineering Direction</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-forest dark:text-ivory">
                  Bridging Theoretical AI & Practical Software
                </h2>
                <p className="text-forest-700/90 dark:text-sage-100 leading-relaxed text-sm sm:text-base">
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
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-forest dark:text-champagne-300 hover:text-champagne-600 transition-colors"
                  >
                    <span>Read full biography & technical goals</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-cream-300 dark:border-forest-700 bg-ivory dark:bg-forest-900 p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-cream-200 dark:bg-forest-800 border border-cream-300 dark:border-forest-700 flex items-center justify-center text-forest dark:text-champagne-300">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-forest dark:text-ivory">Academic Foundations</h3>
                  <p className="text-xs text-forest-700/80 dark:text-sage-100 leading-relaxed">
                    Completing Year 2 coursework in Bachelor of Computer Applications with steady focus on data structures, relational databases, and algorithm complexity.
                  </p>
                </div>

                <div className="rounded-2xl border border-cream-300 dark:border-forest-700 bg-ivory dark:bg-forest-900 p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-cream-200 dark:bg-forest-800 border border-cream-300 dark:border-forest-700 flex items-center justify-center text-forest dark:text-champagne-300">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-forest dark:text-ivory">Machine Learning Focus</h3>
                  <p className="text-xs text-forest-700/80 dark:text-sage-100 leading-relaxed">
                    Studying supervised & unsupervised learning models, regression evaluation, loss minimization, and PyTorch / Scikit-Learn pipelines.
                  </p>
                </div>

                <div className="rounded-2xl border border-cream-300 dark:border-forest-700 bg-ivory dark:bg-forest-900 p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-cream-200 dark:bg-forest-800 border border-cream-300 dark:border-forest-700 flex items-center justify-center text-forest dark:text-champagne-300">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-forest dark:text-ivory">Full-Stack Modernity</h3>
                  <p className="text-xs text-forest-700/80 dark:text-sage-100 leading-relaxed">
                    Building performant web platforms with Next.js App Router, React 19, TypeScript, Tailwind CSS, and relational database systems.
                  </p>
                </div>

                <div className="rounded-2xl border border-cream-300 dark:border-forest-700 bg-ivory dark:bg-forest-900 p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-cream-200 dark:bg-forest-800 border border-cream-300 dark:border-forest-700 flex items-center justify-center text-forest dark:text-champagne-300">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-forest dark:text-ivory">Disciplined Mindset</h3>
                  <p className="text-xs text-forest-700/80 dark:text-sage-100 leading-relaxed">
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
        <section className="py-16 border-t border-cream-300/70 dark:border-forest-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Showcase3DClient />
          </div>
        </section>
      )}

      {/* ==================================================================== */}
      {/* 4. TECHNICAL SKILLS PREVIEW                                          */}
      {/* ==================================================================== */}
      {isSectionEnabled('skills') && (
        <section className="py-24 border-t border-cream-300/70 dark:border-forest-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="space-y-3">
                <span className="text-xs font-mono text-forest-600 dark:text-sage uppercase tracking-wider font-medium">
                  Competencies & Stack
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-forest dark:text-ivory">
                  Technical Capabilities & Tooling
                </h2>
                <p className="text-sm text-forest-700/80 dark:text-sage-100 max-w-xl leading-relaxed">
                  Active technologies and tools I utilize for software engineering, data modeling, and machine learning exploration.
                </p>
              </div>
              <Link
                href="/skills"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-forest dark:text-champagne-300 hover:text-champagne-600 transition-colors"
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
        <section className="py-24 border-t border-cream-300/70 dark:border-forest-800 bg-ivory/50 dark:bg-forest-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="space-y-3">
                <span className="text-xs font-mono text-forest-600 dark:text-sage uppercase tracking-wider font-medium">
                  Engineering Implementations
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-forest dark:text-ivory">
                  Featured Projects
                </h2>
                <p className="text-sm text-forest-700/80 dark:text-sage-100 max-w-xl leading-relaxed">
                  Practical software systems exploring agentic workflows, computer vision, and machine learning pipelines.
                </p>
              </div>
              <Link
                href="/projects"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-forest dark:text-champagne-300 hover:text-champagne-600 transition-colors"
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
      <section className="py-24 border-t border-cream-300/70 dark:border-forest-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Education Card */}
            {isSectionEnabled('education') && education.length > 0 && (
              <div className="rounded-2xl border border-cream-300 dark:border-forest-700 bg-ivory dark:bg-forest-900 p-8 space-y-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cream-200 dark:bg-forest-800 border border-cream-300 dark:border-forest-700 flex items-center justify-center text-forest dark:text-champagne-300">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono text-forest-600 dark:text-sage uppercase font-medium">Current Education</span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-forest dark:text-ivory">{education[0].degree}</h3>
                  <p className="text-sm font-medium text-forest-600 dark:text-sage">{education[0].institution}</p>
                  <div className="inline-block text-xs font-mono text-forest dark:text-champagne-300 bg-sage-100 dark:bg-forest-800 border border-sage-300 dark:border-forest-700 px-2.5 py-1 rounded-full font-medium">
                    {education[0].status}
                  </div>
                </div>

                <p className="text-sm text-forest-700/80 dark:text-sage-100 leading-relaxed">
                  {education[0].description}
                </p>

                <div className="pt-2">
                  <Link
                    href="/education"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-forest dark:text-champagne-300 hover:text-champagne-600 transition-colors"
                  >
                    <span>View complete academic path</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* Experience Card */}
            {isSectionEnabled('experience') && experience.length > 0 && (
              <div className="rounded-2xl border border-cream-300 dark:border-forest-700 bg-ivory dark:bg-forest-900 p-8 space-y-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cream-200 dark:bg-forest-800 border border-cream-300 dark:border-forest-700 flex items-center justify-center text-forest dark:text-champagne-300">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono text-forest-600 dark:text-sage uppercase font-medium">Internship Experience</span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-forest dark:text-ivory">{experience[0].role}</h3>
                  <p className="text-sm font-medium text-forest-600 dark:text-sage">{experience[0].company}</p>
                  <div className="inline-block text-xs font-mono text-forest dark:text-champagne-300 bg-cream-200 dark:bg-forest-800 border border-cream-300 dark:border-forest-700 px-2.5 py-1 rounded-full font-medium">
                    {experience[0].employmentType} • {experience[0].workplaceType}
                  </div>
                </div>

                <p className="text-sm text-forest-700/80 dark:text-sage-100 leading-relaxed">
                  {experience[0].description}
                </p>

                <div className="pt-2">
                  <Link
                    href="/experience"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-forest dark:text-champagne-300 hover:text-champagne-600 transition-colors"
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
        <section className="py-24 border-t border-cream-300/70 dark:border-forest-800 bg-ivory/50 dark:bg-forest-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="space-y-3">
                <span className="text-xs font-mono text-forest-600 dark:text-sage uppercase tracking-wider font-medium">
                  Credentials & Training
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-forest dark:text-ivory">
                  Certifications & Coursework
                </h2>
                <p className="text-sm text-forest-700/80 dark:text-sage-100 max-w-xl leading-relaxed">
                  Specialized online coursework and simulations across machine learning, software development, and data analytics.
                </p>
              </div>
              <Link
                href="/certifications"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-forest dark:text-champagne-300 hover:text-champagne-600 transition-colors"
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
        <section className="py-24 border-t border-cream-300/70 dark:border-forest-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <span className="text-xs font-mono text-forest-600 dark:text-sage uppercase tracking-wider font-medium">
                Capabilities
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-forest dark:text-ivory">
                What I Build
              </h2>
              <p className="text-sm text-forest-700/80 dark:text-sage-100 leading-relaxed">
                Applied development and prototyping competencies ready for internships, student collaborative teams, and project initiatives.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((srv) => (
                <div
                  key={srv.id}
                  className="rounded-2xl border border-cream-300 dark:border-forest-700 bg-ivory dark:bg-forest-900 p-6 space-y-4 hover:border-champagne-500 shadow-sm hover:shadow-md transition-all"
                >
                  <h3 className="text-lg font-bold text-forest dark:text-ivory">{srv.title}</h3>
                  <p className="text-xs text-forest-700/80 dark:text-sage-100 leading-relaxed">{srv.description}</p>
                  <div className="flex flex-wrap gap-1 pt-2">
                    {srv.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="text-[10px] font-mono text-forest-700 dark:text-sage bg-cream-200/70 dark:bg-forest-800 px-2 py-0.5 rounded border border-cream-300 dark:border-forest-700"
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
        <section className="py-24 border-t border-cream-300/70 dark:border-forest-800 bg-cream-300/40 dark:bg-forest-900/40 relative">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cream-300 dark:border-forest-700 bg-ivory dark:bg-forest-900 text-xs font-mono text-forest dark:text-champagne-300 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-champagne-600" />
              <span>Let&apos;s Build Together</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-forest dark:text-ivory">
              Interested in Collaboration or Internships?
            </h2>

            <p className="text-base text-forest-700/90 dark:text-sage-100 max-w-xl mx-auto leading-relaxed">
              Whether you are looking for an aspiring AI engineer for your team, have feedback on my work, or want to explore collaborative projects, I would love to connect.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-forest hover:bg-forest-600 text-ivory font-bold text-sm transition-all shadow-md hover:scale-[1.02]"
              >
                <span>Initiate Contact</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="https://github.com/Athravpathak-git"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-ivory dark:bg-forest-900 border border-cream-300 dark:border-forest-700 text-forest dark:text-ivory font-mono text-xs transition-all shadow-sm hover:bg-cream-200"
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
