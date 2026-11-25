import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useComplaints } from '../../context/ComplaintContext';
import { CATEGORIES } from '../../data/mockData';
import { UserCheck, Wrench } from 'lucide-react';
import FieldValidation from '../common/FieldValidation';

const AssignModal = ({ isOpen, onClose, complaint }) => {
  const { staffList, assignStaff } = useComplaints();
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (complaint) {
      setSelectedDept(complaint.category || 'Electrical');
      // Find default staff in that department
      const matchingStaff = staffList.filter((s) => s.department === complaint.category);
      if (matchingStaff.length > 0) {
        setSelectedStaffId(matchingStaff[0].id);
      } else {
        setSelectedStaffId(staffList[0]?.id || '');
      }
      setAdminNote('');
    }
  }, [complaint, staffList]);

  if (!complaint) return null;

  const filteredStaff = staffList.filter((s) =>
    selectedDept ? s.department === selectedDept || selectedDept === 'Other' : true
  );

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedStaffId) return;

    setIsSubmitting(true);
    try {
      const success = await assignStaff(complaint.id, selectedStaffId, adminNote);
      if (success) onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Assign Staff: #${complaint.id}`}
      subtitle="Dispatch ticket to the relevant campus maintenance department technician"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleAssign} className="space-y-4 text-xs">
        {/* Complaint Info Preview Box */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 text-sm">{complaint.title}</span>
            <span className="px-2 py-0.5 rounded-full font-semibold bg-brand-50 text-brand-700 border border-brand-200">
              {complaint.category}
            </span>
          </div>
          <p className="text-slate-500 leading-relaxed line-clamp-2">
            {complaint.description}
          </p>
          <div className="pt-1 flex items-center justify-between text-slate-400 text-[11px]">
            <span>📍 {complaint.location}</span>
            <span>Student: {complaint.student?.name}</span>
          </div>
        </div>

        {/* Select Department */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">
            Responsible Department / Category
          </label>
          <select
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              const staffInDept = staffList.filter((s) => s.department === e.target.value);
              setSelectedStaffId(staffInDept[0]?.id || '');
            }}
            className="w-full rounded-xl border-slate-200 text-xs focus:ring-brand-500 focus:border-brand-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} Department
              </option>
            ))}
          </select>
        </div>

        {/* Select Staff Member with Workload */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">
            Select Staff Member & Check Workload
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {filteredStaff.length === 0 ? (
              <div className="p-4 text-center text-slate-400 bg-slate-50 rounded-xl">
                No active staff available in this department. Choose another category or add staff.
              </div>
            ) : (
              filteredStaff.map((staff) => {
                const isSelected = selectedStaffId === staff.id;
                const isBusy = staff.activeComplaints >= 3;

                return (
                  <div
                    key={staff.id}
                    onClick={() => setSelectedStaffId(staff.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-200'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={staff.avatar}
                        alt={staff.name}
                        className="w-9 h-9 rounded-lg object-cover ring-1 ring-slate-200"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{staff.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                            {staff.specialization || staff.department}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span>⭐ {staff.rating}</span>
                          <span>•</span>
                          <span>{staff.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isBusy
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        <Wrench className="w-2.5 h-2.5" />
                        {staff.activeComplaints} active task{staff.activeComplaints !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <FieldValidation
            id="assign-staff-validation"
            message={
              selectedStaffId
                ? `Ready to assign to ${staffList.find((staff) => staff.id === selectedStaffId)?.name || 'selected staff'}`
                : 'Select a staff member to assign this complaint'
            }
            isValid={Boolean(selectedStaffId)}
          />
        </div>

        {/* Admin Instructions / Note */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">
            Admin Instructions / Internal Note (Optional)
          </label>
          <textarea
            rows={2}
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            placeholder="e.g. Please check capacitor first, priority for lecture hall schedule."
            className="w-full rounded-xl border-slate-200 text-xs focus:ring-brand-500 focus:border-brand-500"
          />
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!selectedStaffId || isSubmitting}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-md shadow-brand-500/20 disabled:opacity-50 transition-all"
          >
            <UserCheck className="w-4 h-4" />
            <span>Assign Complaint</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AssignModal;
