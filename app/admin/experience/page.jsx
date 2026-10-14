'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Briefcase,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Search,
  ChevronDown,
  Building2,
  MapPin,
  Calendar,
} from 'lucide-react';
import ConfirmDialog from '@/components/admin/ConfirmDialog.jsx';

const PREDEFINED_COMPANIES = [
  'Infosys',
  'Tata Consultancy Services (TCS)',
  'Wipro',
  'Cognizant',
  'HCLTech',
  'Tech Mahindra',
  'Google',
  'Microsoft',
  'Amazon',
  'IBM',
  'Meta',
  'Apple',
  'Accenture',
  'Capgemini',
  'LTIMindtree',
  'Oracle',
  'Other',
];

const EMPLOYMENT_TYPES = [
  'Full-time',
  'Internship',
  'Contract',
  'Freelance',
  'Apprenticeship',
];

const WORKPLACE_TYPES = [
  'On-site',
  'Remote',
  'Hybrid',
];

export default function AdminExperiencePage() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentExp, setCurrentExp] = useState(null);

  const [formData, setFormData] = useState({
    role: '',
    company: 'Infosys',
    customCompany: '',
    employmentType: 'Full-time',
    workplaceType: 'On-site',
    location: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
    technologies: '',
    sortOrder: 0,
    isPublished: true,
  });

  const [companySearch, setCompanySearch] = useState('');
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const companyDropdownRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Close company dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(event.target)) {
        setCompanyDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [allCompanies, setAllCompanies] = useState(PREDEFINED_COMPANIES);
  const [techSuggestions, setTechSuggestions] = useState([]);

  const fetchExp = async () => {
    try {
      const [res, sugRes] = await Promise.all([
        fetch('/api/admin/experience'),
        fetch('/api/admin/suggestions'),
      ]);
      const data = await res.json();
      if (data.experiences) setExperiences(data.experiences);
      if (sugRes.ok) {
        const sugData = await sugRes.json();
        if (sugData.companies) {
          const merged = Array.from(new Set([...sugData.companies, ...PREDEFINED_COMPANIES]));
          setAllCompanies(merged);
        }
        if (sugData.techTags) {
          setTechSuggestions(sugData.techTags);
        }
      }
    } catch (err) {
      setError('Failed to fetch experiences.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExp();
  }, []);

  const filteredCompanies = useMemo(() => {
    if (!companySearch) return allCompanies;
    return allCompanies.filter((c) =>
      c.toLowerCase().includes(companySearch.toLowerCase())
    );
  }, [companySearch, allCompanies]);

  const handleCreateNew = () => {
    setCurrentExp(null);
    setFormData({
      role: '',
      company: 'Infosys',
      customCompany: '',
      employmentType: 'Full-time',
      workplaceType: 'On-site',
      location: '',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: '',
      isCurrent: true,
      description: '',
      technologies: '',
      sortOrder: 0,
      isPublished: true,
    });
    setCompanySearch('');
    setIsEditing(true);
    setError(null);
  };

  const handleEdit = (exp) => {
    setCurrentExp(exp);
    const isPredefined = PREDEFINED_COMPANIES.includes(exp.company);

    setFormData({
      role: exp.role,
      company: isPredefined ? exp.company : 'Other',
      customCompany: isPredefined ? '' : exp.company,
      employmentType: exp.employmentType || 'Full-time',
      workplaceType: exp.workplaceType || 'On-site',
      location: exp.location || '',
      startDate: exp.startDate ? exp.startDate.slice(0, 10) : '',
      endDate: exp.endDate ? exp.endDate.slice(0, 10) : '',
      isCurrent: exp.isCurrent,
      description: exp.description || '',
      technologies: Array.isArray(exp.technologies) ? exp.technologies.join(', ') : '',
      sortOrder: exp.sortOrder,
      isPublished: exp.isPublished,
    });
    setCompanySearch(isPredefined ? exp.company : 'Other');
    setIsEditing(true);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const finalCompany =
      formData.company === 'Other'
        ? formData.customCompany.trim()
        : formData.company;

    if (!finalCompany) {
      setError('Please provide a valid company or organization name.');
      setSaving(false);
      return;
    }

    if (!formData.startDate) {
      setError('Start date is required.');
      setSaving(false);
      return;
    }

    if (!formData.isCurrent && !formData.endDate) {
      setError('Please provide an end date or check "Currently working here".');
      setSaving(false);
      return;
    }

    if (!formData.isCurrent && formData.endDate && formData.endDate < formData.startDate) {
      setError('End date cannot be earlier than start date.');
      setSaving(false);
      return;
    }

    const techArray = formData.technologies
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      role: formData.role.trim(),
      company: finalCompany,
      employmentType: formData.employmentType,
      workplaceType: formData.workplaceType,
      location: formData.location.trim() || null,
      startDate: `${formData.startDate}T00:00:00Z`,
      endDate: formData.isCurrent ? null : formData.endDate ? `${formData.endDate}T00:00:00Z` : null,
      isCurrent: Boolean(formData.isCurrent),
      description: formData.description.trim(),
      technologies: techArray,
      sortOrder: Number(formData.sortOrder) || 0,
      isPublished: Boolean(formData.isPublished),
    };

    if (currentExp) payload.id = currentExp.id;

    try {
      const res = await fetch('/api/admin/experience', {
        method: currentExp ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save experience.');
      }

      setMessage(`Experience at "${finalCompany}" saved successfully.`);
      setIsEditing(false);
      fetchExp();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/experience?id=${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to delete experience.');
      }

      setMessage(`Experience at "${deleteTarget.company}" deleted.`);
      setDeleteTarget(null);
      fetchExp();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-light text-white tracking-tight flex items-center space-x-2">
            <Briefcase className="w-5 h-5 text-sky-400" />
            <span>Experience Manager</span>
          </h1>
          <p className="text-xs text-slate-400">
            Document professional engineering positions, internships, and technical impact.
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={handleCreateNew}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-medium bg-white text-black hover:bg-slate-200 transition-colors shadow-lg self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Position</span>
          </button>
        )}
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-2xl glass-panel space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <h2 className="text-sm font-medium text-white flex items-center space-x-2">
              <Briefcase className="w-4 h-4 text-sky-400" />
              <span>{currentExp ? 'Edit Position' : 'New Position'}</span>
            </h2>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Role / Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Role / Title <span className="text-sky-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.role}
                onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                placeholder="e.g. Full-Stack Software Engineer Intern"
                className="w-full px-4 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none"
              />
            </div>

            {/* Accessible Company Combobox */}
            <div className="space-y-1.5 relative" ref={companyDropdownRef}>
              <label className="text-xs font-medium text-slate-300 block">
                Company / Organization <span className="text-sky-400">*</span>
              </label>
              <div
                onClick={() => setCompanyDropdownOpen((prev) => !prev)}
                className="w-full px-4 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white flex items-center justify-between cursor-pointer hover:border-white/20"
              >
                <span>{formData.company || 'Select Company'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>

              {companyDropdownOpen && (
                <div className="absolute z-20 left-0 right-0 mt-1 rounded-xl bg-[#0f111a] border border-white/15 shadow-2xl p-2 space-y-1">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={companySearch}
                      onChange={(e) => setCompanySearch(e.target.value)}
                      placeholder="Filter or search company..."
                      autoFocus
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-0.5 pt-1">
                    {filteredCompanies.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, company: c }));
                          setCompanyDropdownOpen(false);
                          setCompanySearch('');
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                          formData.company === c
                            ? 'bg-sky-500/20 text-sky-300 font-medium'
                            : 'text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                    {filteredCompanies.length === 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            company: 'Other',
                            customCompany: companySearch,
                          }));
                          setCompanyDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-sky-400 hover:bg-sky-500/10"
                      >
                        Use custom company: &quot;{companySearch}&quot;
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Custom Company Input if Other */}
          {formData.company === 'Other' && (
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Custom Company Name <span className="text-sky-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.customCompany}
                onChange={(e) => setFormData((prev) => ({ ...prev, customCompany: e.target.value }))}
                placeholder="Enter enterprise, startup, or organization name..."
                className="w-full px-4 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none"
              />
            </div>
          )}

          {/* Employment Type & Workplace Type & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 block">Employment Type</label>
              <select
                value={formData.employmentType}
                onChange={(e) => setFormData((prev) => ({ ...prev, employmentType: e.target.value }))}
                className="w-full px-4 py-2 rounded-xl text-xs bg-[#0b0c13] border border-white/10 text-white focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none"
              >
                {EMPLOYMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 block">Workplace Model</label>
              <select
                value={formData.workplaceType}
                onChange={(e) => setFormData((prev) => ({ ...prev, workplaceType: e.target.value }))}
                className="w-full px-4 py-2 rounded-xl text-xs bg-[#0b0c13] border border-white/10 text-white focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none"
              >
                {WORKPLACE_TYPES.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Location <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="e.g. Pune, India"
                className="w-full px-4 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none"
              />
            </div>
          </div>

          {/* Timeline & Currently Working Here */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Start Date <span className="text-sky-400">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-4 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300">
                  End Date {!formData.isCurrent && <span className="text-sky-400">*</span>}
                </label>
                <label className="flex items-center space-x-1.5 text-xs text-sky-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isCurrent}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isCurrent: e.target.checked,
                        endDate: e.target.checked ? '' : prev.endDate,
                      }))
                    }
                    className="rounded border-white/20 bg-white/5 text-sky-400 focus:ring-0"
                  />
                  <span>Currently working here</span>
                </label>
              </div>
              <input
                type="date"
                disabled={formData.isCurrent}
                value={formData.endDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-4 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none disabled:opacity-40"
              />
            </div>
          </div>

          {/* Technologies */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Technologies & Tools <span className="text-slate-500 font-normal">(Comma-separated)</span>
            </label>
            <input
              type="text"
              list="exp-tech-list"
              value={formData.technologies}
              onChange={(e) => setFormData((prev) => ({ ...prev, technologies: e.target.value }))}
              placeholder="e.g. Next.js, Node.js, PostgreSQL, Docker, AWS, Tailwind CSS"
              className="w-full px-4 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none"
            />
            <datalist id="exp-tech-list">
              {techSuggestions.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </div>

          {/* Description & Impact */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Key Responsibilities & Deliverables <span className="text-sky-400">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="• Engineered high-performance REST APIs handling data persistence...&#10;• Designed relational database schemas in PostgreSQL with automated Prisma migrations...&#10;• Collaborated on frontend App Router user experiences."
              className="w-full px-4 py-2.5 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="flex items-center space-x-6 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300 block">Sort Order</label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData((prev) => ({ ...prev, sortOrder: e.target.value }))}
                className="w-24 px-3 py-1.5 rounded-xl text-xs bg-white/5 border border-white/10 text-white focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none"
              />
            </div>

            <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer pt-4">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData((prev) => ({ ...prev, isPublished: e.target.checked }))}
                className="rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-0"
              />
              <span className={formData.isPublished ? 'text-emerald-400 font-medium' : ''}>
                Publish on public website
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium glass-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center space-x-2 px-6 py-2 rounded-full text-xs font-medium bg-white text-black hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Save Position</span>}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-6 rounded-2xl glass-panel space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : experiences.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] text-slate-400">
                    <th className="pb-3 font-medium">Role & Organization</th>
                    <th className="pb-3 font-medium">Employment Model</th>
                    <th className="pb-3 font-medium">Timeline</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {experiences.map((exp) => (
                    <tr key={exp.id} className="hover:bg-white/[0.02]">
                      <td className="py-3.5 pr-4">
                        <p className="font-medium text-white">{exp.role}</p>
                        <p className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-slate-500" />
                          <span>{exp.company}</span>
                          {exp.location && <span>• {exp.location}</span>}
                        </p>
                      </td>
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-sky-500/10 text-sky-300 border border-sky-500/20">
                            {exp.employmentType || 'Full-time'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 text-slate-400">
                            {exp.workplaceType || 'On-site'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4 text-slate-300">
                        {new Date(exp.startDate).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })}{' '}
                        –{' '}
                        {exp.isCurrent
                          ? 'Present'
                          : exp.endDate
                          ? new Date(exp.endDate).toLocaleDateString('en-US', {
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'Present'}
                      </td>
                      <td className="py-3.5 pr-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] ${
                            exp.isPublished
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-white/5 text-slate-500'
                          }`}
                        >
                          {exp.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="py-3.5 text-right space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handleEdit(exp)}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
                          title="Edit Position"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(exp)}
                          className="p-1.5 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/10"
                          title="Delete Position"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 space-y-3">
              <Briefcase className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-400">No positions recorded yet.</p>
              <button
                type="button"
                onClick={handleCreateNew}
                className="px-4 py-2 rounded-full text-xs font-medium glass-button"
              >
                Add Position
              </button>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Position"
        message={`Are you sure you want to delete "${deleteTarget?.role}" at "${deleteTarget?.company}"?`}
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isProcessing={deleting}
      />
    </div>
  );
}
