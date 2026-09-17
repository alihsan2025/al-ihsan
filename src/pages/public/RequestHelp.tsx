import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  HandHeart,
  ShieldCheck,
  HeartPulse,
  GraduationCap,
  Home,
  Utensils,
  Stethoscope,
  Briefcase,
  HelpCircle,
  Upload,
  X,
  FileVideo,
  ImageIcon,
  Video,
  AlertCircle,
} from 'lucide-react';
import SEO from '../../components/common/SEO';
import { useAnimations } from '../../hooks/useAnimations';
import { useCloudinary } from '../../hooks/useCloudinary';
import { submitAidApplication } from '../../lib/aidApplicationService';

const aidCategories = [
  {
    value: 'Food Relief',
    label: 'Food Relief',
    description: 'Monthly food packs or emergency meals',
    icon: Utensils,
    color: 'text-orange-600 bg-orange-50',
  },
  {
    value: 'Medical Assistance',
    label: 'Medical Assistance',
    description: 'Medical bills, medications, or surgeries',
    icon: Stethoscope,
    color: 'text-red-600 bg-red-50',
  },
  {
    value: 'Education Support',
    label: 'Education Support',
    description: 'School fees, materials, or scholarships',
    icon: GraduationCap,
    color: 'text-blue-600 bg-blue-50',
  },
  {
    value: 'Housing Support',
    label: 'Housing / Shelter',
    description: 'Rent assistance or housing repair',
    icon: Home,
    color: 'text-emerald-600 bg-emerald-50',
  },
  {
    value: 'Livelihood & Empowerment',
    label: 'Livelihood & Empowerment',
    description: 'Skills training, small business support',
    icon: Briefcase,
    color: 'text-purple-600 bg-purple-50',
  },
  {
    value: 'Emergency Relief',
    label: 'Emergency Relief',
    description: 'Urgent crisis or disaster response',
    icon: HeartPulse,
    color: 'text-rose-600 bg-rose-50',
  },
  {
    value: 'Other',
    label: 'Other / General Need',
    description: 'Any other form of support needed',
    icon: HelpCircle,
    color: 'text-gray-600 bg-gray-50',
  },
];

const RequestHelp: React.FC = () => {
  const { slideInLeft, fadeInUp, scaleIn } = useAnimations();
  const { uploadImage } = useCloudinary();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    aidCategory: '',
    householdSize: '',
    monthlyIncome: '',
    amountNeeded: '',
    description: '',
    situationDetails: '',
    referralSource: '',
    acceptedTerms: false,
  });
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const target = e.target;
    const value =
      target instanceof HTMLInputElement && target.type === 'checkbox'
        ? target.checked
        : target.value;

    setFormData((prev) => ({ ...prev, [target.name]: value }));
  };

  const selectCategory = (value: string) => {
    setFormData((prev) => ({ ...prev, aidCategory: value }));
  };

  const handlePhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (photoUrls.length + files.length > 5) {
      setError('You can upload a maximum of 5 photos.');
      return;
    }

    setUploadingPhotos(true);
    setError('');

    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      const result = await uploadImage(file);
      if (result) {
        newUrls.push(result.url);
      }
    }

    setPhotoUrls((prev) => [...prev, ...newUrls]);
    setUploadingPhotos(false);
    // Reset the input so user can upload more
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotoUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVideoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      setError('Video must be under 100MB. Please trim or compress your video.');
      return;
    }

    setUploadingVideo(true);
    setError('');

    const result = await uploadImage(file);
    if (result) {
      setVideoUrl(result.url);
    } else {
      setError('Video upload failed. Please try again.');
    }

    setUploadingVideo(false);
    e.target.value = '';
  };

  const canProceedStep1 =
    formData.fullName.trim() !== '' &&
    formData.phone.trim() !== '' &&
    formData.address.trim() !== '' &&
    formData.city.trim() !== '' &&
    formData.state.trim() !== '';

  const canProceedStep2 =
    formData.aidCategory !== '' &&
    formData.description.trim() !== '' &&
    formData.amountNeeded.trim() !== '';

  const goToNextStep = () => {
    setError('');
    if (step === 1 && !canProceedStep1) {
      setError('Please fill in all required personal details.');
      return;
    }
    if (step === 2 && !canProceedStep2) {
      setError(
        'Please select a category, describe your situation, and specify the amount needed.'
      );
      return;
    }
    setStep((prev) => prev + 1);
  };

  const goBack = () => {
    setError('');
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.acceptedTerms) {
      setError(
        'Please accept the terms to submit your application.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await submitAidApplication({
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        aidCategory: formData.aidCategory,
        householdSize: Number(formData.householdSize) || 1,
        monthlyIncome: formData.monthlyIncome,
        amountNeeded: formData.amountNeeded,
        description: formData.description,
        situationDetails: formData.situationDetails,
        photoUrls,
        videoUrl,
        referralSource: formData.referralSource,
      });
      setIsSuccess(true);
    } catch (err) {
      console.error('Error submitting aid application:', err);
      setError(
        'Failed to submit your application. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const BackButton = ({ onClick }: { onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 px-5 py-3 bg-gray-100 text-gray-700 rounded-full font-bold hover:bg-gray-200 transition-colors border border-gray-200"
    >
      <ChevronLeft size={18} /> Back
    </button>
  );

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <SEO
          title="Application Submitted"
          description="Your assistance application to Al-Ihsan Relief has been received."
        />
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md w-full border-t-4 border-gold-500"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="text-3xl font-heading font-bold text-primary-900 mb-4">
            Jazakallahu Khairan!
          </h2>
          <p className="text-gray-600 mb-3">
            Your request for assistance has been received. Our team
            will review your application and reach out to you In Shaa
            Allah.
          </p>
          <p className="text-sm text-gray-400 mb-8">
            Please allow 5-10 working days for processing. If
            urgent, contact us directly via phone or WhatsApp.
          </p>
          <button
            onClick={() => (window.location.href = '/')}
            className="w-full py-3 bg-primary-900 text-white rounded-full font-bold hover:bg-primary-800 transition-colors"
          >
            Return Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4">
      <SEO
        title="Request Assistance"
        description="Apply for help from Al-Ihsan Relief. We provide food relief, medical assistance, education support, housing aid, and livelihood empowerment for those in need."
      />
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <motion.div
            variants={slideInLeft}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-sm font-bold tracking-widest uppercase mb-4"
          >
            <HandHeart size={16} /> Request Help
          </motion.div>
          <motion.h1
            variants={slideInLeft}
            initial="hidden"
            animate="visible"
            className="text-4xl font-heading font-bold text-primary-900 mb-4"
          >
            Apply for Assistance
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="text-gray-600 max-w-xl mx-auto"
          >
            If you or your family are in need of support, please
            fill out this form. All applications are reviewed with
            compassion, confidentiality, and fairness.
          </motion.p>
        </div>

        {/* Progress Bar */}
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          className="flex justify-between mb-8 max-w-lg mx-auto relative"
        >
          <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 -z-10"></div>
          <div
            className="absolute top-5 left-0 h-1 bg-gold-500 -z-10 transition-all duration-500"
            style={{
              width:
                step === 1
                  ? '0%'
                  : step === 2
                    ? '33%'
                    : step === 3
                      ? '66%'
                      : '100%',
            }}
          ></div>
          {[
            { num: 1, label: 'Your Info' },
            { num: 2, label: 'Your Need' },
            { num: 3, label: 'Evidence' },
            { num: 4, label: 'Confirm' },
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                  step >= s.num
                    ? 'bg-gold-500 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {s.num}
              </div>
              <span
                className={`text-xs mt-1 font-medium ${
                  step >= s.num
                    ? 'text-gold-600'
                    : 'text-gray-400'
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100"
        >
          <AnimatePresence mode="wait">
            {/* STEP 1: Personal Details */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-bold text-primary-900 border-b border-gray-100 pb-4">
                  Personal Details
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    name="fullName"
                    id="aid-full-name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold-500 outline-none"
                    placeholder="e.g. Aisha Muhammad"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      name="phone"
                      id="aid-phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold-500 outline-none"
                      placeholder="080..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address{' '}
                      <span className="text-gray-400">
                        (optional)
                      </span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="aid-email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold-500 outline-none"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    name="address"
                    id="aid-address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold-500 outline-none"
                    placeholder="Residential address"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      name="city"
                      id="aid-city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold-500 outline-none"
                      placeholder="Lagos"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      name="state"
                      id="aid-state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold-500 outline-none"
                      placeholder="Oyo State"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={goToNextStep}
                    className="flex items-center gap-2 px-6 py-3 bg-primary-900 text-white rounded-full font-bold hover:bg-primary-800 transition-colors"
                  >
                    Next <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Aid Category & Need */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-bold text-primary-900 border-b border-gray-100 pb-4">
                  What kind of help do you need?
                </h3>

                {/* Category Selection Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {aidCategories.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected =
                      formData.aidCategory === cat.value;
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => selectCategory(cat.value)}
                        className={`p-4 rounded-xl border-2 text-left transition-all duration-200 group ${
                          isSelected
                            ? 'border-gold-500 bg-gold-50 shadow-md'
                            : 'border-gray-100 hover:border-gold-300 hover:shadow-sm bg-white'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 transition-colors ${
                            isSelected
                              ? 'bg-gold-500 text-white'
                              : cat.color
                          }`}
                        >
                          <Icon size={20} />
                        </div>
                        <p
                          className={`font-bold text-sm leading-tight ${
                            isSelected
                              ? 'text-gold-700'
                              : 'text-gray-800'
                          }`}
                        >
                          {cat.label}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 hidden md:block">
                          {cat.description}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How much do you need? (₦) <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    name="amountNeeded"
                    id="aid-amount-needed"
                    value={formData.amountNeeded}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold-500 outline-none"
                    placeholder="e.g. ₦150,000 for surgery, ₦50,000 for school fees"
                  />
                  <p className="text-xs text-gray-400 mt-1">Specify an approximate amount and what it's for.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Household Size
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      name="householdSize"
                      id="aid-household-size"
                      value={formData.householdSize}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold-500 outline-none"
                      placeholder="Number of people in household"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monthly Income (approximate)
                    </label>
                    <select
                      name="monthlyIncome"
                      id="aid-monthly-income"
                      value={formData.monthlyIncome}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold-500 outline-none bg-white"
                    >
                      <option value="">Select range</option>
                      <option value="None">No income</option>
                      <option value="Under ₦30,000">
                        Under ₦30,000
                      </option>
                      <option value="₦30,000 - ₦60,000">
                        ₦30,000 - ₦60,000
                      </option>
                      <option value="₦60,000 - ₦100,000">
                        ₦60,000 - ₦100,000
                      </option>
                      <option value="Above ₦100,000">
                        Above ₦100,000
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Describe your situation briefly{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    name="description"
                    id="aid-description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold-500 outline-none"
                    placeholder="Briefly summarise what you need and why."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full details of your situation
                  </label>
                  <textarea
                    name="situationDetails"
                    id="aid-situation-details"
                    value={formData.situationDetails}
                    onChange={handleInputChange}
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold-500 outline-none"
                    placeholder="Please provide full details: How long have you been in this situation? What have you tried so far? Who else is affected? Any relevant medical / financial / personal background. The more detail you share, the better we can understand and help."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How did you hear about Al-Ihsan?
                  </label>
                  <select
                    name="referralSource"
                    id="aid-referral-source"
                    value={formData.referralSource}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold-500 outline-none bg-white"
                  >
                    <option value="">Select option</option>
                    <option value="Social Media">
                      Social Media
                    </option>
                    <option value="Mosque / Community">
                      Mosque / Community
                    </option>
                    <option value="Friend / Family">
                      Friend / Family
                    </option>
                    <option value="Previous Beneficiary">
                      Previous Beneficiary
                    </option>
                    <option value="Website">Website</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <BackButton onClick={goBack} />
                  <button
                    type="button"
                    onClick={goToNextStep}
                    className="flex items-center gap-2 px-6 py-3 bg-primary-900 text-white rounded-full font-bold hover:bg-primary-800 transition-colors"
                  >
                    Next <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Photo & Video Evidence */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-bold text-primary-900 border-b border-gray-100 pb-4">
                  Upload Evidence (Photos & Video)
                </h3>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 flex items-start gap-3">
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold mb-1">Why do we need this?</p>
                    <p className="leading-relaxed">Uploading photos and a short video helps our team verify your situation and process your application faster. All media is kept strictly confidential and never shared publicly.</p>
                  </div>
                </div>

                {/* Photo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <ImageIcon size={16} /> Photos of your situation <span className="text-gray-400">(up to 5)</span>
                  </label>
                  <p className="text-xs text-gray-400 mb-3">Upload photos showing your situation — e.g. medical documents, damaged property, school admission letters, receipts, etc.</p>

                  {/* Photo Preview Grid */}
                  {photoUrls.length > 0 && (
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
                      {photoUrls.map((url, index) => (
                        <div key={index} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square bg-gray-50">
                          <img
                            src={url}
                            alt={`Evidence ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {photoUrls.length < 5 && (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 cursor-pointer relative transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploadingPhotos}
                      />
                      <Upload className={`mx-auto mb-2 ${uploadingPhotos ? 'text-gold-500 animate-pulse' : 'text-gray-400'}`} />
                      <p className="text-sm text-gray-500">
                        {uploadingPhotos
                          ? 'Uploading photos...'
                          : `Click to upload photos (${photoUrls.length}/5 uploaded)`}
                      </p>
                    </div>
                  )}
                </div>

                {/* Video Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Video size={16} /> Video of yourself <span className="text-red-500">*recommended</span>
                  </label>

                  <div className="bg-gold-50 border border-gold-200 rounded-xl p-4 text-sm text-gold-800 mb-4">
                    <p className="font-bold mb-1 flex items-center gap-2"><FileVideo size={16} /> Record a short video</p>
                    <p className="leading-relaxed">Please record a <strong>1-3 minute video</strong> of yourself explaining your situation, what you need, and how Al-Ihsan can help. Speak clearly and include any relevant details. Keep the video under 100MB.</p>
                  </div>

                  {videoUrl ? (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle size={20} className="text-green-600" />
                          </div>
                          <div>
                            <p className="font-bold text-green-700 text-sm">Video uploaded successfully</p>
                            <a href={videoUrl} target="_blank" rel="noreferrer" className="text-xs text-primary-600 hover:underline">Preview video</a>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setVideoUrl('')}
                          className="text-sm text-red-500 hover:text-red-700 font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 cursor-pointer relative transition-colors">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploadingVideo}
                      />
                      <FileVideo className={`mx-auto mb-2 ${uploadingVideo ? 'text-gold-500 animate-pulse' : 'text-gray-400'}`} size={32} />
                      <p className="text-sm text-gray-500">
                        {uploadingVideo
                          ? 'Uploading video... This may take a moment.'
                          : 'Click to upload your video (MP4, MOV — max 100MB)'}
                      </p>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <BackButton onClick={goBack} />
                  <button
                    type="button"
                    onClick={goToNextStep}
                    className="flex items-center gap-2 px-6 py-3 bg-primary-900 text-white rounded-full font-bold hover:bg-primary-800 transition-colors"
                  >
                    Next <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Review & Submit */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-bold text-primary-900 border-b border-gray-100 pb-4">
                  Review & Submit
                </h3>

                {/* Application Summary */}
                <div className="bg-gray-50 rounded-xl p-6 space-y-4 border border-gray-100">
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                    Application Summary
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Name</p>
                      <p className="font-medium text-primary-900">
                        {formData.fullName}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Phone</p>
                      <p className="font-medium text-primary-900">
                        {formData.phone}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Location</p>
                      <p className="font-medium text-primary-900">
                        {formData.city}, {formData.state}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">
                        Category of Need
                      </p>
                      <p className="font-medium text-gold-600">
                        {formData.aidCategory || 'Not selected'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Amount Needed</p>
                      <p className="font-bold text-primary-900">
                        {formData.amountNeeded || 'Not specified'}
                      </p>
                    </div>
                    {formData.householdSize && (
                      <div>
                        <p className="text-gray-400">
                          Household Size
                        </p>
                        <p className="font-medium text-primary-900">
                          {formData.householdSize} person
                          {Number(formData.householdSize) > 1
                            ? 's'
                            : ''}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="pt-2">
                    <p className="text-gray-400 text-sm">
                      Description
                    </p>
                    <p className="text-sm text-primary-900 mt-1 leading-relaxed">
                      {formData.description}
                    </p>
                  </div>
                  {formData.situationDetails && (
                    <div className="pt-2">
                      <p className="text-gray-400 text-sm">Full Details</p>
                      <p className="text-sm text-primary-900 mt-1 leading-relaxed whitespace-pre-line">
                        {formData.situationDetails}
                      </p>
                    </div>
                  )}
                  <div className="pt-2 flex gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Photos</p>
                      <p className="font-medium text-primary-900">{photoUrls.length} uploaded</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Video</p>
                      <p className="font-medium text-primary-900">{videoUrl ? 'Uploaded ✓' : 'None'}</p>
                    </div>
                  </div>
                </div>

                {/* Privacy & Terms */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="text-primary-700" />
                    <h4 className="text-lg font-bold text-primary-900">
                      Privacy & Confidentiality
                    </h4>
                  </div>
                  <div className="space-y-3 text-sm text-gray-700">
                    <p className="leading-relaxed">
                      Al-Ihsan Relief treats all applications with
                      strict confidentiality. Your personal
                      information, photos, and videos will only be
                      used for the purpose of assessing your
                      application.
                    </p>
                    <p className="leading-relaxed">
                      We do not share beneficiary information
                      publicly or with third parties without your
                      explicit consent. Our team follows Islamic
                      principles of discretion and dignity in all
                      interactions.
                    </p>
                    <p className="leading-relaxed text-gray-500">
                      Submitting this form does not guarantee
                      assistance. Applications are reviewed based on
                      need, available resources, and Shari'ah
                      guidelines. Our team may contact you for
                      additional verification.
                    </p>
                  </div>
                  <div className="pt-2">
                    <label className="flex items-start gap-3 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        name="acceptedTerms"
                        id="aid-accept-terms"
                        checked={formData.acceptedTerms}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                      <span>
                        I confirm that the information provided is
                        truthful and I consent to Al-Ihsan Relief
                        reviewing my application, photos, and video
                        for the purpose of providing assistance.
                      </span>
                    </label>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <BackButton onClick={goBack} />
                  <button
                    type="submit"
                    id="aid-submit-button"
                    disabled={isSubmitting || uploadingPhotos || uploadingVideo}
                    className="flex items-center gap-2 px-6 py-3 bg-gold-500 text-white rounded-full font-bold hover:bg-gold-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {isSubmitting
                      ? 'Submitting...'
                      : 'Submit Application'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.form>

        {/* Info card */}
        <div className="mt-8 bg-primary-900 text-white rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-3">
            <HandHeart className="text-gold-400" />
            <h3 className="text-xl font-bold">
              How the process works
            </h3>
          </div>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
              <div className="text-gold-400 font-bold mb-1">
                1. Apply
              </div>
              <p className="text-primary-100">
                Fill out this form with accurate details, upload evidence, and record a short video.
              </p>
            </div>
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
              <div className="text-gold-400 font-bold mb-1">
                2. Review
              </div>
              <p className="text-primary-100">
                Our team reviews applications, verifies details, and
                assesses needs with compassion.
              </p>
            </div>
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
              <div className="text-gold-400 font-bold mb-1">
                3. Support
              </div>
              <p className="text-primary-100">
                We reach out to approved applicants and coordinate
                the delivery of aid In Shaa Allah.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestHelp;
