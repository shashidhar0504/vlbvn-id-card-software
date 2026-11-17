import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  User,
  Building2,
  MapPin,
  Mail,
  Phone,
  Shield,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Camera,
  X
} from 'lucide-react';
import { api } from '../services/api.js';

export const ApplyPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [chapters, setChapters] = useState<string[]>([]);
  const [membershipTypes, setMembershipTypes] = useState<string[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [sameAsMobile, setSameAsMobile] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [duplicateRef, setDuplicateRef] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    gender: 'Male',
    mobile: '',
    whatsapp: '',
    email: '',
    residentialAddress: '',
    companyName: '',
    businessCategory: 'Manufacturing & Industrial',
    designation: '',
    city: '',
    state: 'Karnataka',
    businessAddress: '',
    website: '',
    membershipType: 'Visionary Life Member',
    chapter: 'Bengaluru Central',
    requestedRole: '',
    additionalInfo: '',
    declarationConfirmed: false
  });

  useEffect(() => {
    api.getMeta()
      .then(res => {
        if (res.chapters) setChapters(res.chapters);
        if (res.membershipTypes) setMembershipTypes(res.membershipTypes);
      })
      .catch(err => {
        console.error('Failed to load chapters:', err);
      });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => {
        const updated = { ...prev, [name]: value };
        if (name === 'mobile' && sameAsMobile) {
          updated.whatsapp = value;
        }
        return updated;
      });
    }
  };

  const handleSameAsMobileToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSameAsMobile(checked);
    if (checked) {
      setFormData(prev => ({ ...prev, whatsapp: prev.mobile }));
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 6 * 1024 * 1024) {
      setErrorMessage('Photograph size must be less than 6MB.');
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setErrorMessage(null);
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setDuplicateRef(null);

    // Form validations
    if (!formData.fullName.trim()) {
      setErrorMessage('Full Name is required.');
      return;
    }
    if (!photoFile) {
      setErrorMessage('Please upload a profile photograph for your ID card.');
      return;
    }
    if (!formData.mobile.trim() || formData.mobile.replace(/\D/g, '').length < 10) {
      setErrorMessage('Please provide a valid 10-digit mobile number.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    if (!formData.companyName.trim()) {
      setErrorMessage('Business / Company Name is required.');
      return;
    }
    if (!formData.designation.trim()) {
      setErrorMessage('Professional Designation is required.');
      return;
    }
    if (!formData.residentialAddress.trim()) {
      setErrorMessage('Residential Address is required.');
      return;
    }
    if (!formData.city.trim()) {
      setErrorMessage('City is required.');
      return;
    }
    if (!formData.declarationConfirmed) {
      setErrorMessage('You must confirm the declaration to submit your application.');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = new FormData();
      payload.append('fullName', formData.fullName);
      payload.append('dob', formData.dob);
      payload.append('gender', formData.gender);
      payload.append('mobile', formData.mobile);
      payload.append('whatsapp', formData.whatsapp || formData.mobile);
      payload.append('email', formData.email);
      payload.append('residentialAddress', formData.residentialAddress);
      payload.append('companyName', formData.companyName);
      payload.append('businessCategory', formData.businessCategory);
      payload.append('designation', formData.designation);
      payload.append('city', formData.city);
      payload.append('state', formData.state);
      payload.append('businessAddress', formData.businessAddress);
      payload.append('website', formData.website);
      payload.append('membershipType', formData.membershipType);
      payload.append('chapter', formData.chapter);
      payload.append('requestedRole', formData.requestedRole);
      payload.append('additionalInfo', formData.additionalInfo);
      payload.append('declarationConfirmed', 'true');
      payload.append('photo', photoFile);

      const res = await api.submitApplication(payload);

      // Successfully submitted
      navigate(`/apply/success?ref=${encodeURIComponent(res.reference_no)}&name=${encodeURIComponent(formData.fullName)}&email=${encodeURIComponent(formData.email)}&chapter=${encodeURIComponent(formData.chapter)}`);
    } catch (err: any) {
      console.error('Submission failed:', err);
      setErrorMessage(err.message || 'Failed to submit application. Please check your network and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const businessCategories = [
    'Manufacturing & Industrial',
    'Information Technology & Software',
    'Construction, Civil & Real Estate',
    'Agriculture, Agro-Processing & Commodities',
    'Healthcare, Pharmaceuticals & Hospitals',
    'Retail, Wholesale & FMCG',
    'Consulting, Finance, Legal & CA',
    'Textiles, Garments & Apparel',
    'Education & Skill Institutions',
    'Hospitality, Travel & Logistics',
    'Energy, Solar & Mining',
    'Other Diversified Business'
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header Banner */}
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold-100 border border-gold-300 text-gold-800 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-gold-600" />
          <span>Single Registration Form</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-charcoal-950">
          VLBVN Membership Application
        </h1>
        <p className="text-sm text-charcoal-700 max-w-xl mx-auto">
          Please provide accurate details. After administrative scrutiny, your personalized clean digital ID card will be generated and dispatched automatically to your email.
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-8 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 shadow-sm animate-shake">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-bold">Submission Notice: </span>
            {errorMessage}
          </div>
        </div>
      )}

      {/* Registration Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-cream-300 shadow-xl overflow-hidden divide-y divide-cream-200">
        
        {/* Section 1: Personal Information */}
        <div className="p-6 sm:p-10 space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-cream-200">
            <div className="w-8 h-8 rounded-lg bg-gold-100 text-gold-700 flex items-center justify-center font-bold text-sm">
              <User className="w-4 h-4 text-gold-700" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-charcoal-950">1. Personal Information</h2>
              <p className="text-xs text-charcoal-600">Applicant identity and portrait photograph for ID card</p>
            </div>
          </div>

          {/* Photo Upload Box */}
          <div className="bg-cream-50/70 p-6 rounded-2xl border-2 border-dashed border-gold-300/80 flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group shrink-0">
              <div className="w-32 h-36 rounded-xl bg-charcoal-900 border-2 border-gold-400 overflow-hidden flex items-center justify-center shadow-md">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Uploaded photo preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-3 text-gold-300 space-y-1">
                    <Camera className="w-8 h-8 mx-auto opacity-70" />
                    <span className="text-[10px] block font-medium">Photo Preview</span>
                  </div>
                )}
              </div>
              {photoPreview && (
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute -top-2 -right-2 p-1 bg-rose-600 text-white rounded-full shadow hover:bg-rose-700 transition"
                  title="Remove photo"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <label className="block text-sm font-bold text-charcoal-900">
                Profile Photograph <span className="text-rose-500">*</span>
              </label>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Upload a clear passport-style portrait photo with a plain background. This photograph will be printed on your official digital ID card. Supported formats: JPEG, PNG, WebP (Max 6MB).
              </p>
              <div className="pt-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoSelect}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  id="photo-upload-input"
                />
                <label
                  htmlFor="photo-upload-input"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-charcoal-950 bg-gold-400 hover:bg-gold-500 cursor-pointer shadow-sm transition"
                >
                  <Upload className="w-4 h-4 text-charcoal-950" />
                  <span>{photoFile ? 'Change Photograph' : 'Choose Photo from Computer'}</span>
                </label>
                {photoFile && (
                  <span className="ml-3 text-xs text-emerald-700 font-semibold">
                    ✓ {photoFile.name} ({(photoFile.size / 1024).toFixed(0)} KB)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Personal Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
                Full Name (As to appear on ID Card) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                required
                placeholder="e.g. Basavaraj S. Patil"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 outline-none text-sm transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
                Date of Birth (Optional)
              </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 outline-none text-sm transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
                Gender (Optional)
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 outline-none text-sm transition bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="mobile"
                  required
                  placeholder="e.g. 9880012345"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 outline-none text-sm transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider">
                  WhatsApp Number <span className="text-rose-500">*</span>
                </label>
                <label className="inline-flex items-center gap-1.5 text-xs text-charcoal-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sameAsMobile}
                    onChange={handleSameAsMobileToggle}
                    className="rounded text-gold-600 focus:ring-gold-400"
                  />
                  <span>Same as Mobile</span>
                </label>
              </div>
              <input
                type="tel"
                name="whatsapp"
                required
                disabled={sameAsMobile}
                placeholder="e.g. 9880012345"
                value={formData.whatsapp}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 outline-none text-sm transition ${
                  sameAsMobile ? 'bg-cream-100 text-charcoal-600' : ''
                }`}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
                Registered Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="e.g. basavaraj.patil@example.com"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 outline-none text-sm transition"
              />
              <p className="text-[11px] text-charcoal-600 mt-1">
                Your approved digital ID card and verification credentials will be delivered directly to this address.
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
                Residential Address <span className="text-rose-500">*</span>
              </label>
              <textarea
                name="residentialAddress"
                required
                rows={2}
                placeholder="Full residential street, area, pincode..."
                value={formData.residentialAddress}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 outline-none text-sm transition resize-none"
              />
            </div>

          </div>
        </div>

        {/* Section 2: Professional Information */}
        <div className="p-6 sm:p-10 space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-cream-200">
            <div className="w-8 h-8 rounded-lg bg-gold-100 text-gold-700 flex items-center justify-center font-bold text-sm">
              <Building2 className="w-4 h-4 text-gold-700" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-charcoal-950">2. Professional & Business Details</h2>
              <p className="text-xs text-charcoal-600">Company name, sector, designation, and enterprise location</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
                Business / Company Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="companyName"
                required
                placeholder="e.g. Patil Global Infrastructure Ltd."
                value={formData.companyName}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 outline-none text-sm transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
                Business Category <span className="text-rose-500">*</span>
              </label>
              <select
                name="businessCategory"
                value={formData.businessCategory}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 outline-none text-sm transition bg-white"
              >
                {businessCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
                Designation / Professional Role <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="designation"
                required
                placeholder="e.g. Managing Director / Founder / Partner"
                value={formData.designation}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 outline-none text-sm transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
                City <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                required
                placeholder="e.g. Bengaluru / Hubballi / Belagavi"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 outline-none text-sm transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
                State <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="state"
                required
                placeholder="e.g. Karnataka"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 outline-none text-sm transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
                Business Address (Optional)
              </label>
              <input
                type="text"
                name="businessAddress"
                placeholder="Commercial office or plant address..."
                value={formData.businessAddress}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 outline-none text-sm transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
                Company Website (Optional)
              </label>
              <input
                type="url"
                name="website"
                placeholder="https://example.com"
                value={formData.website}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 outline-none text-sm transition"
              />
            </div>

          </div>
        </div>

        {/* Section 3: Membership Information */}
        <div className="p-6 sm:p-10 space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-cream-200">
            <div className="w-8 h-8 rounded-lg bg-gold-100 text-gold-700 flex items-center justify-center font-bold text-sm">
              <Shield className="w-4 h-4 text-gold-700" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-charcoal-950">3. Membership Information</h2>
              <p className="text-xs text-charcoal-600">Select chapter association and membership tier</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            <div>
              <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
                Chapter / City Association <span className="text-rose-500">*</span>
              </label>
              <select
                name="chapter"
                value={formData.chapter}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 outline-none text-sm transition bg-white"
              >
                {(chapters.length > 0 ? chapters : ['Bengaluru Central', 'Hubballi - Dharwad', 'Belagavi', 'Mysuru', 'Kalaburagi', 'Mumbai', 'Pune', 'Global']).map((ch) => (
                  <option key={ch} value={ch}>{ch}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
                Membership Type <span className="text-rose-500">*</span>
              </label>
              <select
                name="membershipType"
                value={formData.membershipType}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 outline-none text-sm transition bg-white"
              >
                {(membershipTypes.length > 0 ? membershipTypes : [
                  'Visionary Life Member',
                  'Executive Business Member',
                  'Associate Member',
                  'Young Lingayat Entrepreneur (YLE)'
                ]).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
                Additional Information or Chapter Reference (Optional)
              </label>
              <textarea
                name="additionalInfo"
                rows={2}
                placeholder="Mention referring VLPN member name or specific interests (B2B, exports, angel investing)..."
                value={formData.additionalInfo}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 outline-none text-sm transition resize-none"
              />
            </div>

          </div>
        </div>

        {/* Section 4: Declaration & Submit */}
        <div className="p-6 sm:p-10 bg-cream-50/60 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-cream-300 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="declarationConfirmed"
                required
                checked={formData.declarationConfirmed}
                onChange={handleInputChange}
                className="mt-1 w-4 h-4 rounded text-gold-600 focus:ring-gold-400 border-gray-300"
              />
              <span className="text-xs text-charcoal-800 leading-relaxed font-medium">
                I hereby declare that all information provided above is true and accurate to the best of my knowledge. I agree to abide by the Constitution, Code of Ethics, and membership guidelines of the <strong>Veerashaiva Lingayat Business Visionary Network (VLBVN Community)</strong>.
              </span>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-xs text-charcoal-600 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>SSL Encrypted & Admin Verified Submission</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 rounded-xl text-base font-bold text-charcoal-950 shadow-lg transition-all ${
                isSubmitting
                  ? 'bg-gold-200 cursor-not-allowed opacity-75'
                  : 'bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-600 hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-charcoal-950 border-t-transparent rounded-full animate-spin" />
                  <span>Submitting & Uploading Photo...</span>
                </>
              ) : (
                <>
                  <span>Submit Membership Application</span>
                  <ArrowRight className="w-5 h-5 text-charcoal-950" />
                </>
              )}
            </button>
          </div>
        </div>

      </form>

    </div>
  );
};
