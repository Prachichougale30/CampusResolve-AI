import React, { useState } from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import Modal from '../../components/common/Modal';
import { CATEGORIES } from '../../data/mockData';
import {
  UserPlus,
  Search,
  Wrench,
  Star,
  UserCheck,
  UserX,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import FieldValidation from '../../components/common/FieldValidation';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
const isValidPhone = (phone) => /^\+?[\d\s()-]{7,20}$/.test(phone.trim());

const StaffManagementPage = () => {
  const { staffList, addStaffMember, toggleStaffStatus, deleteStaffMember } = useComplaints();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Electrical',
    specialization: '',
  });

  const filteredStaff = staffList.filter((s) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (selectedDept !== 'ALL' && s.department !== selectedDept) {
      return false;
    }
    return true;
  });

  const handleAddStaffSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Please enter the staff member's name");
      return;
    }
    if (!isValidEmail(formData.email)) {
      toast.error('Please enter a valid staff email address');
      return;
    }
    if (formData.phone.trim() && !isValidPhone(formData.phone)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    addStaffMember(formData);
    setFormData({
      name: '',
      email: '',
      phone: '',
      department: 'Electrical',
      specialization: '',
    });
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Campus Staff Management
          </h1>
          <p className="text-xs text-slate-500">
            Monitor technician availability, active task workloads, and department allocations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all hover:scale-105"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Staff</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search staff by name, email, department..."
            className="w-full pl-10 rounded-xl border-slate-200 text-xs py-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full sm:w-48 rounded-xl border-slate-200 text-xs py-2 focus:ring-brand-500 focus:border-brand-500 font-medium"
          >
            <option value="ALL">All Departments</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="overflow-hidden bg-white rounded-3xl border border-slate-200/80 shadow-soft">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4">Staff Name & Contact</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4 text-center">Active Complaints</th>
                <th className="px-6 py-4 text-center">Completed</th>
                <th className="px-6 py-4 text-center">Rating</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredStaff.map((staff) => (
                <tr key={staff.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Name */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <img
                        src={staff.avatar}
                        alt={staff.name}
                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-100"
                      />
                      <div>
                        <span className="font-bold text-slate-900 text-xs sm:text-sm block">
                          {staff.name}
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          {staff.email} • {staff.phone}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Department */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold text-slate-800">
                      {staff.department}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {staff.specialization || 'Maintenance'}
                    </span>
                  </td>

                  {/* Active Complaints */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        staff.activeComplaints >= 3
                          ? 'bg-amber-100 text-amber-800'
                          : staff.activeComplaints > 0
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Wrench className="w-3 h-3" />
                      {staff.activeComplaints}
                    </span>
                  </td>

                  {/* Completed Complaints */}
                  <td className="px-6 py-4 whitespace-nowrap text-center font-bold text-slate-800">
                    {staff.completedComplaints}
                  </td>

                  {/* Rating */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center gap-1 font-bold text-slate-700 text-xs">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      {staff.rating}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        staff.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {staff.status === 'active' ? 'Active' : 'On Leave'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => toggleStaffStatus(staff.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                        title={staff.status === 'active' ? 'Set as On Leave' : 'Set as Active'}
                      >
                        {staff.status === 'active' ? (
                          <UserX className="w-4 h-4 text-amber-500" />
                        ) : (
                          <UserCheck className="w-4 h-4 text-emerald-600" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteStaffMember(staff.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete staff"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Campus Staff Member"
        subtitle="Register campus technician or departmental maintenance supervisor"
      >
        <form onSubmit={handleAddStaffSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Anand S. Kulkarni"
              required
              className="w-full rounded-xl border-slate-200 text-xs py-2.5 focus:ring-brand-500 focus:border-brand-500"
            />
            <FieldValidation
              id="staff-name-validation"
              message={formData.name.trim() ? 'Name looks good' : ''}
              isValid
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Campus Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="anand.k@campus.edu"
              required
              className="w-full rounded-xl border-slate-200 text-xs py-2.5 focus:ring-brand-500 focus:border-brand-500"
            />
            <FieldValidation
              id="staff-email-validation"
              message={
                formData.email.trim()
                    ? isValidEmail(formData.email)
                    ? 'Email address looks valid'
                    : 'Enter a valid email address'
                  : ''
              }
                isValid={isValidEmail(formData.email)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98000 11223"
                className="w-full rounded-xl border-slate-200 text-xs py-2.5 focus:ring-brand-500 focus:border-brand-500"
              />
              <FieldValidation
                id="staff-phone-validation"
                message={
                  formData.phone.trim()
                    ? isValidPhone(formData.phone)
                      ? 'Phone number looks valid'
                      : 'Enter a valid phone number'
                    : ''
                }
                isValid={!formData.phone.trim() || isValidPhone(formData.phone)}
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full rounded-xl border-slate-200 text-xs py-2.5 focus:ring-brand-500 focus:border-brand-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Technical Specialization
            </label>
            <input
              type="text"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              placeholder="e.g. Three-phase motor maintenance & wiring"
              className="w-full rounded-xl border-slate-200 text-xs py-2.5 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-md shadow-brand-500/20"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Staff</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StaffManagementPage;
