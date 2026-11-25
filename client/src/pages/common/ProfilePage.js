import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';
import {
  Save,
  Camera,
  Upload,
  User,
  Mail,
  Phone,
  Building,
  GraduationCap,
  Calendar,
  Layers,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
];

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Mechanical Engineering',
  'Electronics & Communication',
  'Electrical & Electronics',
  'Civil Engineering',
  'Biotechnology',
  'Business Administration',
  'Maintenance & Facilities',
  'Campus Operations',
];

const ProfilePage = () => {
  const { user, updateProfile, currentRole } = useAuth();
  const { complaints } = useComplaints();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [hostel, setHostel] = useState(user?.hostel || 'Hostel Block B - Room 314');
  const [division, setDivision] = useState(user?.division || 'A');
  const [department, setDepartment] = useState(
    user?.department || 'Computer Science & Engineering'
  );
  const [year, setYear] = useState(user?.year || '4th Year (Sem 7)');
  const [rollNo, setRollNo] = useState(user?.rollNo || user?.userId || 'CS2024-042');
  const [avatar, setAvatar] = useState(
    user?.avatar ||
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  );

  // Photo modal & live camera state
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [tempAvatar, setTempAvatar] = useState(avatar);
  const [isSaving, setIsSaving] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const userComplaints = complaints.filter(
    (c) =>
      c.student?.email === user?.email ||
      c.assignedStaff?.email === user?.email ||
      c.student?.id === user?.id
  );

  const startCamera = async () => {
    setCameraError('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      setIsCameraActive(true);
    } catch (err) {
      console.warn('Camera access failed:', err);
      setCameraError('Unable to access camera. Please allow permissions or upload an image file.');
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      if (!video.videoWidth || !video.videoHeight) {
        setCameraError('Camera is still starting. Please try again in a moment.');
        return;
      }
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setTempAvatar(dataUrl);
      stopCamera();
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  useEffect(() => {
    if (!isCameraActive || !videoRef.current || !streamRef.current) return undefined;

    const video = videoRef.current;
    video.srcObject = streamRef.current;
    video.play().catch((err) => {
      console.warn('Camera preview failed:', err);
      setCameraError('Unable to start the camera preview. Please check camera permissions and try again.');
      stopCamera();
    });

    return () => {
      video.srcObject = null;
    };
  }, [isCameraActive, stopCamera]);

  useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    },
    []
  );

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhoto = () => {
    setAvatar(tempAvatar);
    stopCamera();
    setIsPhotoModalOpen(false);
    toast.success('Profile photo updated');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        department: department.trim(),
        avatar,
        ...(currentRole === 'student'
          ? {
              hostel: hostel.trim(),
              division: division.trim(),
              year: year.trim(),
              rollNo: rollNo.trim(),
              userId: rollNo.trim(),
            }
          : {}),
      });
      toast.success('Profile updated successfully! ✅');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          User Profile & Settings
        </h1>
        <p className="text-xs text-slate-500">
          Manage your personal information and review campus activity.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-6">
        {/* Profile Picture & Header Banner */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100 text-center sm:text-left">
          {/* Profile Picture Setter */}
          <div className="relative group">
            <img
              src={avatar}
              alt={name}
              className="w-24 h-24 rounded-3xl object-cover ring-4 ring-brand-100 shadow-md group-hover:opacity-90 transition-opacity"
            />
            <button
              type="button"
              onClick={() => {
                setTempAvatar(avatar);
                setIsPhotoModalOpen(true);
              }}
              title="Profile photo options"
              className="absolute -bottom-1 -right-1 p-2 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/30 transition-transform hover:scale-110 flex items-center justify-center"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-black text-slate-900">{name || user?.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-brand-50 text-brand-700 border border-brand-200">
                {currentRole}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {user?.email} • {department}
            </p>
            {currentRole === 'student' && (
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                <span className="text-xs px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-mono font-bold border border-indigo-200">
                  Roll No: {rollNo}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold border border-slate-200">
                  Div: {division}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-lg bg-purple-50 text-purple-700 font-bold border border-purple-200">
                  {year}
                </span>
              </div>
            )}
          </div>

        </div>

        {/* Detailed Profile Edit Form */}
        <form onSubmit={handleSave} className="space-y-5 text-xs sm:text-sm">
          {/* Row 1: Display Name & Campus Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 text-xs">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Prachi Sharma"
                  className="w-full pl-10 pr-3 rounded-xl border-slate-200 text-xs py-2.5 focus:ring-brand-500 focus:border-brand-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5 text-xs">
                Campus Email (Read-only)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full pl-10 pr-3 rounded-xl border-slate-200 bg-slate-50 text-slate-500 text-xs py-2.5 cursor-not-allowed font-medium"
                />
              </div>
            </div>
          </div>

          {currentRole === 'student' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5 text-xs">
                  Roll Number / Student ID <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    required
                    placeholder="e.g. CS2024-042"
                    className="w-full pl-10 pr-3 rounded-xl border-slate-200 text-xs py-2.5 focus:ring-brand-500 focus:border-brand-500 font-mono font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5 text-xs">
                  Division / Section <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Layers className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    className="w-full pl-10 pr-3 rounded-xl border-slate-200 text-xs py-2.5 focus:ring-brand-500 focus:border-brand-500 font-medium"
                  >
                    <option value="A">Division A</option>
                    <option value="B">Division B</option>
                    <option value="C">Division C</option>
                    <option value="D">Division D</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5 text-xs">
                  Year of Study <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full pl-10 pr-3 rounded-xl border-slate-200 text-xs py-2.5 focus:ring-brand-500 focus:border-brand-500 font-medium"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year (Sem 7)">4th Year (Sem 7)</option>
                    <option value="4th Year (Sem 8)">4th Year (Sem 8)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Row 3: Department & Contact Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 text-xs">
                Department <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full pl-10 pr-3 rounded-xl border-slate-200 text-xs py-2.5 focus:ring-brand-500 focus:border-brand-500 font-medium"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5 text-xs">Contact Phone</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-3 rounded-xl border-slate-200 text-xs py-2.5 focus:ring-brand-500 focus:border-brand-500 font-medium"
                />
              </div>
            </div>
          </div>

          {currentRole === 'student' && (
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 text-xs">
                Hostel / Campus Accommodation Details
              </label>
              <input
                type="text"
                value={hostel}
                onChange={(e) => setHostel(e.target.value)}
                placeholder="e.g. Hostel Block B - Room 314"
                className="w-full rounded-xl border-slate-200 text-xs py-2.5 px-3.5 focus:ring-brand-500 focus:border-brand-500 font-medium"
              />
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-700 hover:to-accent-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all hover:scale-[1.01] disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Activity Overview */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-4">
        <h3 className="text-sm font-black text-slate-900">Activity Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500">Tickets Logged</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{userComplaints.length}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500">Verified Closed</span>
            <p className="text-2xl font-black text-emerald-600 mt-1">
              {userComplaints.filter((c) => c.status === 'Verified').length}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500">AI Used</span>
            <p className="text-2xl font-black text-brand-600 mt-1">
              {userComplaints.filter((c) => c.isAiDetected).length}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500">Member Status</span>
            <p className="text-2xl font-black text-teal-600 mt-1">Active</p>
          </div>
        </div>
      </div>

      {/* Profile Picture Setter Modal */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => {
              stopCamera();
              setIsPhotoModalOpen(false);
            }}
          />

          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <div
              className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full max-w-lg border border-slate-200/90 animate-in fade-in zoom-in-95 duration-150 p-6 space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-brand-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Profile Picture Setter
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setIsPhotoModalOpen(false);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <canvas ref={canvasRef} className="hidden" />

              {/* Current Selection Preview */}
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <img
                  src={tempAvatar}
                  alt="Avatar preview"
                  className="w-28 h-28 rounded-3xl object-cover ring-4 ring-brand-500/30 shadow-md"
                />
                <span className="text-xs font-semibold text-slate-600 mt-2">
                  Current Selection Preview
                </span>
              </div>

              {/* Live Camera Viewfinder if Active */}
              {isCameraActive ? (
                <div className="p-3 rounded-2xl bg-slate-900 text-white flex flex-col items-center space-y-3">
                  <div className="relative rounded-2xl overflow-hidden border-2 border-brand-500 bg-black max-w-[240px] w-full aspect-square flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition-all hover:scale-105"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Take Snapshot</span>
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {cameraError && (
                    <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                      {cameraError}
                    </p>
                  )}

                  {/* Actions: Live Photo or Upload */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-dashed border-brand-200 hover:border-brand-500 hover:bg-brand-50/50 text-brand-700 font-bold transition-all text-xs"
                    >
                      <Camera className="w-4 h-4 text-brand-600" />
                      <span>Take Live Photo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-dashed border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-slate-700 font-bold transition-all text-xs"
                    >
                      <Upload className="w-4 h-4 text-slate-500" />
                      <span>Upload File</span>
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Preset Avatars */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Or Choose a Campus Avatar Preset:
                    </label>
                    <div className="grid grid-cols-6 gap-2">
                      {PRESET_AVATARS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setTempAvatar(preset)}
                          className={`p-1 rounded-2xl border-2 transition-all hover:scale-105 ${
                            tempAvatar === preset
                              ? 'border-brand-600 ring-2 ring-brand-200 shadow-sm'
                              : 'border-transparent hover:border-slate-300'
                          }`}
                        >
                          <img
                            src={preset}
                            alt={`Preset ${idx + 1}`}
                            className="w-10 h-10 rounded-xl object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setIsPhotoModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePhoto}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20"
                >
                  Apply Photo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
