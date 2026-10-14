'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Search,
  ChevronDown,
  Building,
} from 'lucide-react';
import ConfirmDialog from '@/components/admin/ConfirmDialog.jsx';

const PREDEFINED_DEGREES = [
  'BCA',
  'B.Sc. Computer Science',
  'B.Sc. Information Technology',
  'B.Sc.',
  'B.Com.',
  'B.A.',
  'B.E.',
  'B.Tech',
  'MCA',
  'M.Sc. Computer Science',
  'M.Sc. IT',
  'MBA',
  'M.Tech',
  'Ph.D.',
  'Diploma',
  'Other',
];

export default function AdminEducationPage() {
  const [educations, setEducations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEdu, setCurrentEdu] = useState(null);

  const [formData, setFormData] = useState({
    institution: '',
    degree: 'BCA',
    customDegree: '',
    fieldOfStudy: '',
    university: '',
    status: 'Completed', // Pursuing | Completed | Discontinued
    startYear: new Date().getFullYear() - 3,
    endYear: new Date().getFullYear(),
    expectedGradYear: new Date().getFullYear() + 1,
    grade: '',
    activities: '',
    description: '',
    sortOrder: 0,
    isPublished: true,
  });

  const [degreeSearch, setDegreeSearch] = useState('');
  const [degreeDropdownOpen, setDegreeDropdownOpen] = useState(false);
  const degreeDropdownRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Close degree dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (degreeDropdownRef.current && !degreeDropdownRef.current.contains(event.target)) {
        setDegreeDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [suggestions, setSuggestions] = useState({ institutions: [], universities: [] });

  const fetchEducation = async () => {
    try {
      const [res, sugRes] = await Promise.all([
        fetch('/api/admin/education'),
        fetch('/api/admin/suggestions'),
      ]);
      const data = await res.json();
      if (data.education) setEducations(data.education);
      if (sugRes.ok) {
        const sugData = await sugRes.json();
        setSuggestions({
          institutions: sugData.institutions || [],
          universities: sugData.universities || [],
        });
      }
    } catch (err) {
      setError('Failed to fetch education records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEducation();
  }, []);

  const filteredDegrees = useMemo(() => {
    if (!degreeSearch) return PREDEFINED_DEGREES;
    return PREDEFINED_DEGREES.filter((d) =>
      d.toLowerCase().includes(degreeSearch.toLowerCase())
    );
  }, [degreeSearch]);

  const handleCreateNew = () => {
    setCurrentEdu(null);
    setFormData({
      institution: '',
      degree: 'BCA',
      customDegree: '',
      fieldOfStudy: '',
      university: '',
      status: 'Completed',
      startYear: new Date().getFullYear() - 3,
      endYear: new Date().getFullYear(),
      expectedGradYear: new Date().getFullYear() + 1,
      grade: '',
      activities: '',
      description: '',
      sortOrder: 0,
      isPublished: true,
    });
    setDegreeSearch('');
    setIsEditing(true);
    setError(null);
  };

  const handleEdit = (edu) => {
    setCurrentEdu(edu);
    const isPredefined = PREDEFINED_DEGREES.includes(edu.degree);
    const startYr = edu.startDate ? new Date(edu.startDate).getFullYear() : new Date().getFullYear() - 3;
    const endYr = edu.endDate ? new Date(edu.endDate).getFullYear() : new Date().getFullYear();

    setFormData({
      institution: edu.institution,
      degree: isPredefined ? edu.degree : 'Other',
      customDegree: isPredefined ? '' : edu.degree,
      fieldOfStudy: edu.fieldOfStudy || '',
      university: edu.university || '',
      status: edu.status || 'Completed',
      startYear: startYr,
      endYear: endYr,
      expectedGradYear: edu.expectedGradYear || (startYr + 3),
      grade: edu.grade || '',
      activities: edu.activities || '',
      description: edu.description || '',
      sortOrder: edu.sortOrder,
      isPublished: edu.isPublished,
    });
    setDegreeSearch(isPredefined ? edu.degree : 'Other');
    setIsEditing(true);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Resolve final degree string
    const finalDegree =
      formData.degree === 'Other'
        ? formData.customDegree.trim()
        : formData.degree;

    if (!finalDegree) {
      setError('Please specify a valid degree name.');
      setSaving(false);
      return;
    }

    const startYearNum = Number(formData.startYear);
    const endYearNum = Number(formData.endYear);
    const expectedGradYearNum = Number(formData.expectedGradYear);

    // Conditional client-side validation
    if (formData.status === 'Pursuing') {
      if (!expectedGradYearNum) {
        setError('Expected graduation year is required for pursuing education.');
        setSaving(false);
        return;
      }
      if (expectedGradYearNum < startYearNum) {
        setError('Expected graduation year cannot be earlier than start year.');
        setSaving(false);
        return;
      }
    } else if (formData.status === 'Completed') {
      if (!endYearNum) {
        setError('Completion year is required for completed education.');
        setSaving(false);
        return;
      }
      if (endYearNum < startYearNum) {
        setError('Completion year cannot be earlier than start year.');
        setSaving(false);
        return;
      }
    } else if (formData.status === 'Discontinued') {
      if (!formData.description || formData.description.trim().length === 0) {
        setError('Please provide a note/reason in the description for discontinued education.');
        setSaving(false);
        return;
      }
    }

    const payload = {
      institution: formData.institution.trim(),
      degree: finalDegree,
      fieldOfStudy: formData.fieldOfStudy.trim() || null,
      university: formData.university.trim() || null,
      status: formData.status,
      startDate: `${startYearNum}-01-01`,
      endDate: formData.status === 'Pursuing' ? null : `${endYearNum}-01-01`,
      expectedGradYear: formData.status === 'Pursuing' ? expectedGradYearNum : null,
      grade: formData.grade.trim() || null,
      activities: formData.activities.trim() || null,
      description: formData.description.trim() || null,
      sortOrder: Number(formData.sortOrder) || 0,
      isPublished: Boolean(formData.isPublished),
    };

    if (currentEdu) payload.id = currentEdu.id;

    try {
      const res = await fetch('/api/admin/education', {
        method: currentEdu ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save education record.');
      }

      setMessage(`Education at "${formData.institution}" saved successfully.`);
      setIsEditing(false);
      fetchEducation();
      setTimeout(() => setMessage(null), 3500);
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
      const res = await fetch(`/api/admin/education?id=${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to delete education record.');
      }

      setMessage(`Record for "${deleteTarget.institution}" deleted.`);
      setDeleteTarget(null);
      fetchEducation();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  // Generate years list (1995 to current + 6)
  const currentYear = new Date().getFullYear();
  const yearOptions = useMemo(() => {
    const list = [];
    for (let y = currentYear + 7; y >= 1995; y--) {
      list.push(y);
    }
    return list;
  }, [currentYear]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-light text-white tracking-tight flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-sky-400" />
            <span>Education Manager</span>
          </h1>
          <p className="text-xs text-slate-400">
            Document academic degrees, college affiliations, coursework, and honors.
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={handleCreateNew}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-medium bg-white text-black hover:bg-slate-200 transition-colors shadow-lg self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Record</span>
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
              <GraduationCap className="w-4 h-4 text-sky-400" />
              <span>{currentEdu ? 'Edit Academic Record' : 'New Academic Record'}</span>
            </h2>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Education Status Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 block">
              Education Status <span className="text-sky-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2.5 max-w-md">
              {['Pursuing', 'Completed', 'Discontinued'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, status: st }))}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                    formData.status === st
                      ? st === 'Pursuing'
                        ? 'bg-sky-500/20 border-sky-400/40 text-sky-200 shadow-sm'
                        : st === 'Completed'
                        ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200 shadow-sm'
                        : 'bg-amber-500/20 border-amber-400/40 text-amber-200 shadow-sm'
                      : 'bg-white/[0.03] border-white/10 text-slate-400 hover:bg-white/5'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Institution / College */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                College / Institute Name <span className="text-sky-400">*</span>
              </label>
              <input
                type="text"
                required
                list="institution-list"
                value={formData.institution}
                onChange={(e) => setFormData((prev) => ({ ...prev, institution: e.target.value }))}
                placeholder="e.g. Pune Institute of Computer Technology"
                className="w-full px-4 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none"
              />
              <datalist id="institution-list">
                {suggestions.institutions.map((inst) => (
                  <option key={inst} value={inst} />
                ))}
              </datalist>
            </div>

            {/* Affiliated University */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Affiliated University <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                list="university-list"
                value={formData.university}
                onChange={(e) => setFormData((prev) => ({ ...prev, university: e.target.value }))}
                placeholder="e.g. Savitribai Phule Pune University"
                className="w-full px-4 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none"
              />
              <datalist id="university-list">
                {suggestions.universities.map((uni) => (
                  <option key={uni} value={uni} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Searchable Degree Selector */}
            <div className="space-y-1.5 relative" ref={degreeDropdownRef}>
              <label className="text-xs font-medium text-slate-300 block">
                Degree <span className="text-sky-400">*</span>
              </label>
              <div
                onClick={() => setDegreeDropdownOpen((prev) => !prev)}
                className="w-full px-4 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white flex items-center justify-between cursor-pointer hover:border-white/20"
              >
                <span>{formData.degree || 'Select Degree'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>

              {degreeDropdownOpen && (
                <div className="absolute z-20 left-0 right-0 mt-1 rounded-xl bg-[#0f111a] border border-white/15 shadow-2xl p-2 space-y-1">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={degreeSearch}
                      onChange={(e) => setDegreeSearch(e.target.value)}
                      placeholder="Search degree..."
                      autoFocus
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-0.5 pt-1">
                    {filteredDegrees.map((deg) => (
                      <button
                        key={deg}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, degree: deg }));
                          setDegreeDropdownOpen(false);
                          setDegreeSearch('');
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                          formData.degree === deg
                            ? 'bg-sky-500/20 text-sky-300 font-medium'
                            : 'text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        {deg}
                      </button>
                    ))}
                    {filteredDegrees.length === 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            degree: 'Other',
                            customDegree: degreeSearch,
                          }));
                          setDegreeDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-sky-400 hover:bg-sky-500/10"
                      >
                        Use custom degree: &quot;{degreeSearch}&quot;
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Specialization / Field of Study */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Specialization / Field of Study
              </label>
              <input
                type="text"
                value={formData.fieldOfStudy}
                onChange={(e) => setFormData((prev) => ({ ...prev, fieldOfStudy: e.target.value }))}
                placeholder="e.g. Artificial Intelligence & Data Science"
                className="w-full px-4 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none"
              />
            </div>
          </div>

          {/* Custom Degree Input when 'Other' selected */}
          {formData.degree === 'Other' && (
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Custom Degree Name <span className="text-sky-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.customDegree}
                onChange={(e) => setFormData((prev) => ({ ...prev, customDegree: e.target.value }))}
                placeholder="Enter complete degree title..."
                className="w-full px-4 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none"
              />
            </div>
          )}

          {/* Conditional Year Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Start Year <span className="text-sky-400">*</span>
              </label>
              <select
                value={formData.startYear}
                onChange={(e) => setFormData((prev) => ({ ...prev, startYear: Number(e.target.value) }))}
                className="w-full px-4 py-2 rounded-xl text-xs bg-[#0b0c13] border border-white/10 text-white focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {formData.status === 'Pursuing' ? (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Expected Graduation Year <span className="text-sky-400">*</span>
                </label>
                <select
                  value={formData.expectedGradYear}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, expectedGradYear: Number(e.target.value) }))
                  }
                  className="w-full px-4 py-2 rounded-xl text-xs bg-[#0b0c13] border border-white/10 text-white focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  {formData.status === 'Discontinued' ? 'Last Attended Year' : 'Completion Year'}{' '}
                  <span className="text-sky-400">*</span>
                </label>
                <select
                  value={formData.endYear}
                  onChange={(e) => setFormData((prev) => ({ ...prev, endYear: Number(e.target.value) }))}
                  className="w-full px-4 py-2 rounded-xl text-xs bg-[#0b0c13] border border-white/10 text-white focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Grade / CGPA <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={formData.grade}
                onChange={(e) => setFormData((prev) => ({ ...prev, grade: e.target.value }))}
                placeholder="e.g. 9.1 / 10.0 or First Class"
                className="w-full px-4 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Activities & Societies <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={formData.activities}
              onChange={(e) => setFormData((prev) => ({ ...prev, activities: e.target.value }))}
              placeholder="e.g. ACM Student Chapter, Technical Paper Presentation Finalist"
              className="w-full px-4 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-slate-300 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              {formData.status === 'Discontinued' ? (
                <>
                  Reason / Discontinuation Note <span className="text-sky-400">*</span>
                </>
              ) : (
                'Description / Academic Highlights'
              )}
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder={
                formData.status === 'Discontinued'
                  ? 'State context or reason for program transition...'
                  : 'Notable coursework, core projects, academic achievements...'
              }
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
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Save Record</span>}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-6 rounded-2xl glass-panel space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : educations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] text-slate-400">
                    <th className="pb-3 font-medium">Institution & University</th>
                    <th className="pb-3 font-medium">Degree & Field</th>
                    <th className="pb-3 font-medium">Timeline</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {educations.map((edu) => {
                    const startYr = edu.startDate ? new Date(edu.startDate).getFullYear() : '';
                    const endYr = edu.endDate ? new Date(edu.endDate).getFullYear() : '';

                    return (
                      <tr key={edu.id} className="hover:bg-white/[0.02]">
                        <td className="py-3.5 pr-4">
                          <p className="font-medium text-white">{edu.institution}</p>
                          {edu.university && (
                            <p className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                              <Building className="w-3 h-3 text-slate-500" />
                              <span>{edu.university}</span>
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 pr-4">
                          <p className="text-slate-200 font-medium">{edu.degree}</p>
                          {edu.fieldOfStudy && (
                            <p className="text-[11px] text-slate-400">{edu.fieldOfStudy}</p>
                          )}
                        </td>
                        <td className="py-3.5 pr-4 text-slate-300">
                          {edu.status === 'Pursuing' ? (
                            <span className="text-sky-300">
                              {startYr} – {edu.expectedGradYear ? `Expected ${edu.expectedGradYear}` : 'Present'}
                            </span>
                          ) : (
                            <span>
                              {startYr} – {endYr || 'Present'}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                edu.status === 'Pursuing'
                                  ? 'bg-sky-500/15 text-sky-400 border border-sky-500/20'
                                  : edu.status === 'Completed'
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                              }`}
                            >
                              {edu.status || 'Completed'}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] ${
                                edu.isPublished
                                  ? 'bg-white/10 text-white'
                                  : 'bg-white/5 text-slate-500'
                              }`}
                            >
                              {edu.isPublished ? 'Published' : 'Draft'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 text-right space-x-1.5">
                          <button
                            type="button"
                            onClick={() => handleEdit(edu)}
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
                            title="Edit Record"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(edu)}
                            className="p-1.5 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/10"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 space-y-3">
              <GraduationCap className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-400">No education records added yet.</p>
              <button
                type="button"
                onClick={handleCreateNew}
                className="px-4 py-2 rounded-full text-xs font-medium glass-button"
              >
                Add Academic Record
              </button>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Education Record"
        message={`Are you sure you want to delete the academic record for "${deleteTarget?.institution}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isProcessing={deleting}
      />
    </div>
  );
}
