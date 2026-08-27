import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { getProfile, updateProfile } from '../api/auth';
import { useApplicationHistory } from '../store/historyStore';
import { formatConfidence } from '../utils/formatters';
import { 
  User, Mail, Phone, Calendar, MapPin, Briefcase, 
  Edit2, Save, X, Loader2, AlertCircle, FileText, CreditCard, CheckCircle2, Sparkles, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { validateEmail } from '../utils/validators';

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [globalError, setGlobalError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('account'); // 'account', 'loans', 'cards'
  
  const { history, fetchHistory } = useApplicationHistory();

  const { register, handleSubmit, reset, formState: { errors }, setError } = useForm();

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const data = await getProfile();
      setProfileData(data);
      reset({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        phone_number: data.profile?.phone_number || '',
        date_of_birth: data.profile?.date_of_birth || '',
        gender: data.profile?.gender || '',
        occupation: data.profile?.occupation || '',
        city: data.profile?.city || '',
        state: data.profile?.state || ''
      });
    } catch (err) {
      setGlobalError('Failed to load profile data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchHistory();
  }, []);

  const onSave = async (formData) => {
    if (formData.email) {
      const emailValidation = validateEmail(formData.email);
      if (!emailValidation.isValid) {
        setError('email', { type: 'manual', message: emailValidation.error });
        setGlobalError('Please fix the errors below.');
        return;
      }
    }

    try {
      setIsSaving(true);
      setGlobalError('');
      setSaveSuccess(false);

      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email ? formData.email.trim().toLowerCase() : '',
        profile: {
          phone_number: formData.phone_number,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          occupation: formData.occupation,
          city: formData.city,
          state: formData.state
        }
      };

      const updated = await updateProfile(payload);
      setProfileData(updated);
      setIsEditing(false);
      setSaveSuccess(true);
      
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      if (err.response?.status === 400 && typeof err.response.data === 'object') {
        const errData = err.response.data;
        ['first_name', 'last_name', 'email'].forEach(field => {
          if (errData[field]) setError(field, { type: 'server', message: errData[field][0] });
        });
        if (errData.profile && typeof errData.profile === 'object') {
          Object.keys(errData.profile).forEach(field => {
            if (Array.isArray(errData.profile[field])) {
              setError(field, { type: 'server', message: errData.profile[field][0] });
            }
          });
        }
        setGlobalError('Please fix the errors below.');
      } else {
        setGlobalError('An unexpected error occurred while saving.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (first, last, username) => {
    if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
    if (username) return username.substring(0, 2).toUpperCase();
    return 'U';
  };

  const genderMap = { 'M': 'Male', 'F': 'Female', 'O': 'Other', 'N': 'Prefer not to say' };

  const loansHistory = history.filter(h => h.type === 'loan');
  const cardsHistory = history.filter(h => h.type === 'card');

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="mb-8">
        <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-primary dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-1 rounded-full border border-border-emerald mb-3">
          Account Settings
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-forest tracking-tight mb-2">My Profile</h1>
        <p className="text-text-secondary text-base">Manage your personal credentials, contact parameters, and evaluation history.</p>
      </div>

      <div className="flex border-b border-border-subtle mb-8 space-x-2 sm:space-x-4 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('account')}
          className={`pb-3.5 px-3 text-sm font-bold transition-all relative ${activeTab === 'account' ? 'text-primary dark:text-emerald-300' : 'text-text-secondary hover:text-forest dark:hover:text-white'}`}
        >
          Account Details
          {activeTab === 'account' && (
            <motion.div layoutId="profile-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary dark:bg-emerald-400" />
          )}
        </button>
        <button 
          onClick={() => setActiveTab('loans')}
          className={`pb-3.5 px-3 text-sm font-bold transition-all relative ${activeTab === 'loans' ? 'text-primary dark:text-emerald-300' : 'text-text-secondary hover:text-forest dark:hover:text-white'}`}
        >
          Loan History ({loansHistory.length})
          {activeTab === 'loans' && (
            <motion.div layoutId="profile-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary dark:bg-emerald-400" />
          )}
        </button>
        <button 
          onClick={() => setActiveTab('cards')}
          className={`pb-3.5 px-3 text-sm font-bold transition-all relative ${activeTab === 'cards' ? 'text-primary dark:text-emerald-300' : 'text-text-secondary hover:text-forest dark:hover:text-white'}`}
        >
          Card History ({cardsHistory.length})
          {activeTab === 'cards' && (
            <motion.div layoutId="profile-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary dark:bg-emerald-400" />
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'account' && (
          <motion.div 
            key="account"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-surface rounded-3xl border border-border-subtle shadow-sm overflow-hidden">
              
              {isLoading ? (
                <div className="p-12 flex flex-col items-center justify-center text-text-secondary">
                  <Loader2 size={32} className="animate-spin text-primary dark:text-emerald-400 mb-4" />
                  <p className="font-bold text-sm">Loading profile information...</p>
                </div>
              ) : profileData ? (
                <>
                  <div className="p-8 border-b border-border-subtle bg-gradient-to-r from-emerald-50/70 dark:from-emerald-950/40 via-surface-subtle to-surface flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-amber-500 text-white flex items-center justify-center text-2xl font-black shrink-0 shadow-md shadow-primary/20">
                        {getInitials(profileData.first_name, profileData.last_name, profileData.username)}
                      </div>
                      <div className="text-center md:text-left">
                        <h2 className="text-2xl font-extrabold text-forest mb-1">
                          {profileData.first_name || profileData.last_name ? `${profileData.first_name} ${profileData.last_name}` : profileData.username}
                        </h2>
                        <div className="flex items-center gap-1.5 text-text-secondary text-sm font-medium justify-center md:justify-start">
                          <Mail size={16} className="text-primary dark:text-emerald-400" />
                          {profileData.email}
                        </div>
                      </div>
                    </div>

                    {!isEditing ? (
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface border border-border-subtle text-forest dark:text-emerald-100 font-bold text-sm hover:border-border-emerald hover:text-primary dark:hover:text-emerald-400 transition-all shadow-xs cursor-pointer"
                      >
                        <Edit2 size={15} />
                        Edit Profile
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          setIsEditing(false);
                          reset();
                          setGlobalError('');
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface border border-border-subtle text-text-secondary font-bold text-sm hover:text-forest dark:hover:text-white transition-colors shadow-xs cursor-pointer"
                      >
                        <X size={16} />
                        Cancel
                      </button>
                    )}
                  </div>

                  <div className="p-8">
                    <AnimatePresence>
                      {globalError && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6">
                          <div className="flex items-center gap-3 p-4 bg-danger/10 text-danger text-sm font-medium rounded-xl border border-danger/20">
                            <AlertCircle size={18} /> {globalError}
                          </div>
                        </motion.div>
                      )}
                      {saveSuccess && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6">
                          <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-sm font-bold rounded-xl border border-emerald-200 dark:border-emerald-800/40">
                            <CheckCircle2 size={18} className="text-primary dark:text-emerald-400" /> Profile updated successfully!
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit(onSave)}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2">Username</label>
                          <input type="text" value={profileData.username} disabled className="w-full px-4 py-2.5 bg-surface-subtle border border-border-subtle rounded-xl text-text-secondary cursor-not-allowed text-sm font-medium" />
                          <p className="text-[11px] text-text-secondary mt-1">Username is fixed.</p>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2">Email Address</label>
                          <input type="email" {...register('email')} disabled={!isEditing} className={`w-full px-4 py-2.5 border rounded-xl text-sm font-medium transition-all text-forest ${isEditing ? 'bg-surface-subtle border-border-subtle focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none' : 'bg-surface-subtle/50 border-transparent text-text-secondary'}`} />
                          {errors.email && <p className="text-xs text-danger mt-1 font-semibold">{errors.email.message}</p>}
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2">First Name</label>
                          <input type="text" {...register('first_name')} disabled={!isEditing} className={`w-full px-4 py-2.5 border rounded-xl text-sm font-medium transition-all text-forest ${isEditing ? 'bg-surface-subtle border-border-subtle focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none' : 'bg-surface-subtle/50 border-transparent text-text-secondary'}`} />
                          {errors.first_name && <p className="text-xs text-danger mt-1 font-semibold">{errors.first_name.message}</p>}
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2">Last Name</label>
                          <input type="text" {...register('last_name')} disabled={!isEditing} className={`w-full px-4 py-2.5 border rounded-xl text-sm font-medium transition-all text-forest ${isEditing ? 'bg-surface-subtle border-border-subtle focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none' : 'bg-surface-subtle/50 border-transparent text-text-secondary'}`} />
                          {errors.last_name && <p className="text-xs text-danger mt-1 font-semibold">{errors.last_name.message}</p>}
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2 flex items-center gap-1.5"><Phone size={13}/> Phone Number</label>
                          <input type="text" {...register('phone_number')} disabled={!isEditing} className={`w-full px-4 py-2.5 border rounded-xl text-sm font-medium transition-all text-forest ${isEditing ? 'bg-surface-subtle border-border-subtle focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none' : 'bg-surface-subtle/50 border-transparent text-text-secondary'}`} />
                          {errors.phone_number && <p className="text-xs text-danger mt-1 font-semibold">{errors.phone_number.message}</p>}
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2 flex items-center gap-1.5"><Calendar size={13}/> Date of Birth</label>
                          {isEditing ? (
                            <input type="date" {...register('date_of_birth')} className="w-full px-4 py-2.5 border bg-surface-subtle border-border-subtle rounded-xl text-sm font-medium focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none text-forest" />
                          ) : (
                            <input type="text" value={profileData.profile?.date_of_birth || 'Not provided'} disabled className="w-full px-4 py-2.5 bg-surface-subtle/50 border-transparent rounded-xl text-text-secondary text-sm font-medium" />
                          )}
                          {errors.date_of_birth && <p className="text-xs text-danger mt-1 font-semibold">{errors.date_of_birth.message}</p>}
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2 flex items-center gap-1.5"><User size={13}/> Gender</label>
                          {isEditing ? (
                            <select {...register('gender')} className="w-full px-4 py-2.5 border bg-surface-subtle border-border-subtle rounded-xl text-sm font-medium focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none appearance-none text-forest">
                              <option value="">Select Gender</option>
                              <option value="M">Male</option>
                              <option value="F">Female</option>
                              <option value="O">Other</option>
                              <option value="N">Prefer not to say</option>
                            </select>
                          ) : (
                            <input type="text" value={genderMap[profileData.profile?.gender] || 'Not provided'} disabled className="w-full px-4 py-2.5 bg-surface-subtle/50 border-transparent rounded-xl text-text-secondary text-sm font-medium" />
                          )}
                          {errors.gender && <p className="text-xs text-danger mt-1 font-semibold">{errors.gender.message}</p>}
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2 flex items-center gap-1.5"><Briefcase size={13}/> Occupation</label>
                          <input type="text" {...register('occupation')} disabled={!isEditing} className={`w-full px-4 py-2.5 border rounded-xl text-sm font-medium transition-all text-forest ${isEditing ? 'bg-surface-subtle border-border-subtle focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none' : 'bg-surface-subtle/50 border-transparent text-text-secondary'}`} />
                          {errors.occupation && <p className="text-xs text-danger mt-1 font-semibold">{errors.occupation.message}</p>}
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2 flex items-center gap-1.5"><MapPin size={13}/> City</label>
                          <input type="text" {...register('city')} disabled={!isEditing} className={`w-full px-4 py-2.5 border rounded-xl text-sm font-medium transition-all text-forest ${isEditing ? 'bg-surface-subtle border-border-subtle focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none' : 'bg-surface-subtle/50 border-transparent text-text-secondary'}`} />
                          {errors.city && <p className="text-xs text-danger mt-1 font-semibold">{errors.city.message}</p>}
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2 flex items-center gap-1.5"><MapPin size={13}/> State</label>
                          <input type="text" {...register('state')} disabled={!isEditing} className={`w-full px-4 py-2.5 border rounded-xl text-sm font-medium transition-all text-forest ${isEditing ? 'bg-surface-subtle border-border-subtle focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none' : 'bg-surface-subtle/50 border-transparent text-text-secondary'}`} />
                          {errors.state && <p className="text-xs text-danger mt-1 font-semibold">{errors.state.message}</p>}
                        </div>
                      </div>

                      <AnimatePresence>
                        {isEditing && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginTop: 32 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            className="flex justify-end overflow-hidden"
                          >
                            <button
                              type="submit"
                              disabled={isSaving}
                              className="flex items-center gap-2 px-8 py-3 rounded-full bg-primary hover:bg-primary-dark text-white font-bold transition-all hover-lift shadow-md shadow-primary/20 disabled:opacity-70 cursor-pointer"
                            >
                              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                              {isSaving ? 'Saving Changes...' : 'Save Changes'}
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </form>
                  </div>
                </>
              ) : (
                <div className="p-12 text-center text-danger font-medium">Failed to load profile.</div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'loans' && (
          <motion.div 
            key="loans"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
          >
            <div className="bg-surface rounded-3xl border border-border-subtle shadow-sm overflow-hidden p-6 md:p-8">
              <h2 className="text-xl font-bold text-forest mb-6 flex items-center gap-2"><FileText size={20} className="text-primary dark:text-emerald-400" /> Loan Evaluation Records</h2>
              
              {loansHistory.length === 0 ? (
                <div className="text-center py-12 px-4 bg-surface-subtle rounded-3xl border border-dashed border-border-subtle">
                  <FileText size={48} className="mx-auto text-text-secondary/30 mb-4" />
                  <h3 className="text-lg font-bold text-forest mb-2">No loan evaluations yet</h3>
                  <p className="text-text-secondary mb-6 max-w-sm mx-auto text-sm">Check your home loan eligibility instantly using our AI prediction engine.</p>
                  <Link to="/dashboard/loan" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-bold text-sm shadow-sm hover-lift">Evaluate Now →</Link>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {loansHistory.map(app => {
                    const isApproved = app.result === 'Approved';
                    return (
                      <div key={app.id} className="p-5 rounded-2xl border border-border-subtle bg-surface-subtle/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-border-emerald transition-all">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">{new Date(app.date).toLocaleDateString()}</span>
                          </div>
                          <h4 className="font-bold text-forest text-sm sm:text-base">Home Loan Assessment</h4>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-[11px] text-text-secondary font-bold uppercase tracking-wider mb-0.5">Confidence</div>
                            <div className="font-bold text-forest text-sm">{formatConfidence(app.confidence)}%</div>
                          </div>
                          <div className={`px-4 py-1.5 rounded-full text-xs font-bold border ${isApproved ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40' : 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800/40'}`}>
                            {app.result}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'cards' && (
          <motion.div 
            key="cards"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
          >
            <div className="bg-surface rounded-3xl border border-border-subtle shadow-sm overflow-hidden p-6 md:p-8">
              <h2 className="text-xl font-bold text-forest mb-6 flex items-center gap-2"><CreditCard size={20} className="text-primary dark:text-emerald-400" /> Credit Card Checks</h2>
              
              {cardsHistory.length === 0 ? (
                <div className="text-center py-12 px-4 bg-surface-subtle rounded-3xl border border-dashed border-border-subtle">
                  <CreditCard size={48} className="mx-auto text-text-secondary/30 mb-4" />
                  <h3 className="text-lg font-bold text-forest mb-2">No card evaluations yet</h3>
                  <p className="text-text-secondary mb-6 max-w-sm mx-auto text-sm">Discover credit cards matching your income tier and spending preferences.</p>
                  <Link to="/dashboard/cards" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-bold text-sm shadow-sm hover-lift">Find Matching Cards →</Link>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {cardsHistory.map(app => {
                    const isApproved = app.result === 'Approved';
                    return (
                      <div key={app.id} className="p-5 rounded-2xl border border-border-subtle bg-surface-subtle/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-border-emerald transition-all">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">{new Date(app.date).toLocaleDateString()}</span>
                          </div>
                          <h4 className="font-bold text-forest text-sm sm:text-base">Credit Card Match</h4>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-[11px] text-text-secondary font-bold uppercase tracking-wider mb-0.5">Confidence</div>
                            <div className="font-bold text-forest text-sm">{formatConfidence(app.confidence)}%</div>
                          </div>
                          <div className={`px-4 py-1.5 rounded-full text-xs font-bold border ${isApproved ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40' : 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800/40'}`}>
                            {app.result}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;
