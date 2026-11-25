import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { INITIAL_COMPLAINTS, MOCK_STAFF } from '../data/mockData';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const ComplaintContext = createContext();

const STORAGE_KEY = 'campusresolve_complaints_v1';
const STAFF_STORAGE_KEY = 'campusresolve_staff_v1';
const normalizeComplaint = (complaint) => ({
  ...complaint,
  id: complaint.ticketId || complaint.id || complaint._id,
});

export const ComplaintProvider = ({ children }) => {
  const { user, currentRole, isAuthenticated } = useAuth();
  const [complaints, setComplaints] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse complaints from storage', e);
      }
    }
    return INITIAL_COMPLAINTS;
  });

  const [staffList, setStaffList] = useState(() => {
    const saved = localStorage.getItem(STAFF_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse staff from storage', e);
      }
    }
    return MOCK_STAFF;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(staffList));
  }, [staffList]);

  const refreshComplaints = useCallback(async () => {
    try {
      const response = await api.get('/complaints');
      if (response.data?.success && Array.isArray(response.data.data)) {
        setComplaints(response.data.data.map(normalizeComplaint));
      }
    } catch (error) {
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        console.warn('Unable to refresh complaints from the server:', error.message);
      }
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user?.email) return undefined;
    refreshComplaints();
    const handleComplaintUpdated = () => refreshComplaints();
    window.addEventListener('campusresolve:complaint-updated', handleComplaintUpdated);
    return () => window.removeEventListener('campusresolve:complaint-updated', handleComplaintUpdated);
  }, [isAuthenticated, user?.email, currentRole, refreshComplaints]);

  useEffect(() => {
    if (!isAuthenticated || currentRole !== 'admin') return undefined;
    let active = true;
    api.get('/complaints/staff')
      .then((response) => {
        if (active && response.data?.success && Array.isArray(response.data.data)) {
          setStaffList(response.data.data);
        }
      })
      .catch((error) => {
        if (active && error.response?.status !== 401 && error.response?.status !== 403) {
          console.warn('Unable to load staff directory from the server:', error.message);
        }
      });
    return () => {
      active = false;
    };
  }, [isAuthenticated, currentRole]);

  // Create new complaint
  const addComplaint = async (newComplaintData) => {
    const nextIdNumber = 1040 + complaints.length + 1;
    const newId = `CR-${nextIdNumber}`;
    const now = new Date().toISOString();

    let createdTicket = {
      id: newId,
      ticketId: newId,
      title: newComplaintData.title || 'Untitled Complaint',
      description: newComplaintData.description || '',
      location: newComplaintData.location || 'Campus Premises',
      category: newComplaintData.category || 'Other',
      isAiDetected: newComplaintData.isAiDetected !== false,
      status: 'Pending Review',
      priority: newComplaintData.priority || 'Medium',
      student: newComplaintData.student,
      assignedStaff: null,
      createdAt: now,
      updatedAt: now,
      imageUrl: newComplaintData.imageUrl || null,
      timeline: [
        {
          stage: 'Pending Review',
          timestamp: now,
          note: `Complaint submitted by ${newComplaintData.student?.name || 'Student'} and is waiting for admin review${newComplaintData.isAiDetected ? ' after AI categorization' : ''}`,
          completed: true,
        },
        { stage: 'Assigned', timestamp: null, note: 'Awaiting administrator approval', completed: false },
        { stage: 'In Progress', timestamp: null, note: 'Pending', completed: false },
        { stage: 'Resolved', timestamp: null, note: 'Pending', completed: false },
        { stage: 'Verified', timestamp: null, note: 'Pending', completed: false },
      ],
      remarks: [],
      feedback: null,
    };
    let submissionWarning = '';

    // Attempt backend save to MongoDB
    try {
      const res = await api.post('/complaints', {
        title: createdTicket.title,
        description: createdTicket.description,
        location: createdTicket.location,
        category: createdTicket.category,
        isAiDetected: createdTicket.isAiDetected,
        priority: createdTicket.priority,
        student: createdTicket.student,
        imageUrl: createdTicket.imageUrl,
      });

      if (res.data?.success && res.data?.data) {
        createdTicket = normalizeComplaint(res.data.data);
        submissionWarning = res.data.warning || '';
      }
    } catch (err) {
      if (err.response) {
        throw new Error(
          err.response.status === 401
            ? 'Your session expired. Please sign in again to submit this complaint.'
            : err.response.data?.message || 'The server rejected this complaint.'
        );
      }
      console.warn('Backend complaint sync fallback to local storage:', err.message);
    }

    setComplaints((prev) => [createdTicket, ...prev]);
    if (submissionWarning) {
      toast.error(submissionWarning);
    } else {
      toast.success(`Complaint #${createdTicket.id || newId} created successfully!`, {
        icon: '✅',
        duration: 4000,
      });
    }
    return createdTicket;
  };

  // Assign staff (Admin feature)
  const assignStaff = async (complaintId, staffId, adminNote = '') => {
    const staffMember = staffList.find((s) => s.id === staffId);
    if (!staffMember) {
      toast.error('Selected staff member not found');
      return false;
    }

    const now = new Date().toISOString();
    let assignedComplaint;
    let notificationWarning = '';

    try {
      const response = await api.patch(`/complaints/${complaintId}/assign`, {
        staffEmail: staffMember.email,
        note: adminNote,
      });
      if (response.data?.success && response.data.data) {
        assignedComplaint = normalizeComplaint(response.data.data);
        notificationWarning = response.data.warning || '';
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data?.message || 'Unable to assign this complaint.');
        return false;
      }
      console.warn('Backend assignment unavailable; applying assignment in demo mode:', error.message);
    }

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          if (c.status !== 'Pending') {
            toast.error('This complaint must be approved before it can be assigned.');
            return c;
          }
          const updatedTimeline = c.timeline.map((step) => {
            if (step.stage === 'Assigned') {
              return {
                stage: 'Assigned',
                timestamp: now,
                note: `Assigned to ${staffMember.name} (${staffMember.department})${adminNote ? ` - Note: "${adminNote}"` : ''}`,
                completed: true,
              };
            }
            return step;
          });

          const initialRemarks = [...(c.remarks || [])];
          if (adminNote) {
            initialRemarks.push({
              id: `REM-${Date.now()}`,
              author: 'Campus Administrator',
              authorRole: 'Admin',
              text: `Assignment instruction: ${adminNote}`,
              timestamp: now,
            });
          }

          return assignedComplaint || {
            ...c,
            status: 'Assigned',
            assignedStaff: staffMember,
            updatedAt: now,
            timeline: updatedTimeline,
            remarks: initialRemarks,
          };
        }
        return c;
      })
    );

    // Increment active workload for staff
    setStaffList((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, activeComplaints: s.activeComplaints + 1 } : s))
    );

    if (notificationWarning) {
      toast.error(notificationWarning);
    } else {
      toast.success(`Assigned #${complaintId} to ${staffMember.name}`);
    }
    return true;
  };

  const reviewComplaint = async (complaintId, decision, note = '') => {
    const now = new Date().toISOString();
    let reviewedComplaint;
    let notificationWarning = '';
    try {
      const response = await api.patch(`/complaints/${complaintId}/review`, { decision, note });
      if (response.data?.success && response.data.data) {
        reviewedComplaint = normalizeComplaint(response.data.data);
        notificationWarning = response.data.warning || '';
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data?.message || 'Unable to review this complaint.');
        return false;
      }
      console.warn('Backend review unavailable; applying the decision in demo mode:', error.message);
    }

    const nextStatus = decision === 'approve' ? 'Pending' : 'Rejected';
    setComplaints((previous) =>
      previous.map((complaint) => {
        if (complaint.id !== complaintId) return complaint;
        if (complaint.status !== 'Pending Review') {
          toast.error('This complaint has already been reviewed.');
          return complaint;
        }
        const timeline = (complaint.timeline || []).map((stage) =>
          stage.stage === 'Pending Review'
            ? {
                ...stage,
                timestamp: now,
                note: `${decision === 'approve' ? 'Approved' : 'Rejected'} by administrator${note ? `: ${note}` : ''}`,
                completed: true,
              }
            : stage
        );
        return reviewedComplaint || {
          ...complaint,
          status: nextStatus,
          reviewNote: note,
          reviewedAt: now,
          timeline,
          updatedAt: now,
        };
      })
    );
    if (notificationWarning) {
      toast.error(notificationWarning);
    } else {
      toast.success(decision === 'approve' ? 'Complaint approved for assignment.' : 'Complaint rejected.');
    }
    return true;
  };

  // Staff starts work
  const startWork = (complaintId) => {
    const now = new Date().toISOString();

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          const updatedTimeline = c.timeline.map((step) => {
            if (step.stage === 'In Progress') {
              return {
                stage: 'In Progress',
                timestamp: now,
                note: `${c.assignedStaff?.name || 'Staff'} commenced resolution on-site`,
                completed: true,
              };
            }
            return step;
          });

          return {
            ...c,
            status: 'In Progress',
            updatedAt: now,
            timeline: updatedTimeline,
          };
        }
        return c;
      })
    );

    toast.success(`Ticket #${complaintId} marked In Progress`);
  };

  // Add staff remark
  const addRemark = (complaintId, text, authorName, authorRole = 'Staff') => {
    const now = new Date().toISOString();
    const newRemark = {
      id: `REM-${Date.now()}`,
      author: authorName,
      authorRole,
      text,
      timestamp: now,
    };

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          return {
            ...c,
            updatedAt: now,
            remarks: [...(c.remarks || []), newRemark],
          };
        }
        return c;
      })
    );

    toast.success('Remark added to timeline');
  };

  // Staff marks resolved
  const markResolved = (complaintId, resolutionNote = '') => {
    const now = new Date().toISOString();

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          const updatedTimeline = c.timeline.map((step) => {
            if (step.stage === 'In Progress' && !step.completed) {
              return { ...step, completed: true, timestamp: step.timestamp || now };
            }
            if (step.stage === 'Resolved') {
              return {
                stage: 'Resolved',
                timestamp: now,
                note: resolutionNote || 'Issue resolved by staff. Awaiting student verification.',
                completed: true,
              };
            }
            return step;
          });

          const updatedRemarks = [...(c.remarks || [])];
          if (resolutionNote) {
            updatedRemarks.push({
              id: `REM-${Date.now()}`,
              author: c.assignedStaff?.name || 'Staff',
              authorRole: 'Staff',
              text: `Resolution Summary: ${resolutionNote}`,
              timestamp: now,
            });
          }

          return {
            ...c,
            status: 'Resolved',
            updatedAt: now,
            timeline: updatedTimeline,
            remarks: updatedRemarks,
          };
        }
        return c;
      })
    );

    // Decrement staff active complaints and increment completed
    setStaffList((prev) =>
      prev.map((s) => {
        const matchingComplaint = complaints.find((c) => c.id === complaintId);
        if (matchingComplaint && matchingComplaint.assignedStaff?.id === s.id) {
          return {
            ...s,
            activeComplaints: Math.max(0, s.activeComplaints - 1),
            completedComplaints: s.completedComplaints + 1,
          };
        }
        return s;
      })
    );

    toast.success(`Complaint #${complaintId} marked as Resolved!`);
  };

  // Student verifies resolution & submits feedback
  const verifyResolution = (complaintId, rating, comment = '') => {
    const now = new Date().toISOString();

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          const updatedTimeline = c.timeline.map((step) => {
            if (step.stage === 'Verified') {
              return {
                stage: 'Verified',
                timestamp: now,
                note: `Resolution verified with ${rating}-star rating by ${c.student?.name || 'Student'}: "${comment || 'Verified and confirmed fixed'}"`,
                completed: true,
              };
            }
            return step;
          });

          return {
            ...c,
            status: 'Verified',
            updatedAt: now,
            timeline: updatedTimeline,
            feedback: {
              rating,
              comment,
              verifiedAt: now,
            },
          };
        }
        return c;
      })
    );

    toast.success('Thank you! Resolution verified and feedback recorded.');
  };

  // Staff CRUD for Admin
  const addStaffMember = (staffData) => {
    const newStaff = {
      id: `STAFF-${200 + staffList.length + 1}`,
      name: staffData.name,
      email: staffData.email,
      phone: staffData.phone || '+91 98000 00000',
      department: staffData.department || 'Electrical',
      specialization: staffData.specialization || 'General Campus Technician',
      activeComplaints: 0,
      completedComplaints: 0,
      rating: 5.0,
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };

    setStaffList((prev) => [newStaff, ...prev]);
    toast.success(`Added ${newStaff.name} to ${newStaff.department} department`);
    return newStaff;
  };

  const toggleStaffStatus = (staffId) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, status: s.status === 'active' ? 'on_leave' : 'active' } : s))
    );
    toast.success('Staff availability updated');
  };

  const deleteStaffMember = (staffId) => {
    setStaffList((prev) => prev.filter((s) => s.id !== staffId));
    toast.success('Staff member removed');
  };

  // Reset demo data helper
  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STAFF_STORAGE_KEY);
    setComplaints(INITIAL_COMPLAINTS);
    setStaffList(MOCK_STAFF);
    toast.success('Demo data restored to default initial state');
  };

  const getComplaintById = (id) => {
    return complaints.find((c) => c.id === id);
  };

  return (
    <ComplaintContext.Provider
      value={{
        complaints,
        staffList,
        addComplaint,
        reviewComplaint,
        assignStaff,
        startWork,
        addRemark,
        markResolved,
        verifyResolution,
        addStaffMember,
        toggleStaffStatus,
        deleteStaffMember,
        resetDemoData,
        getComplaintById,
      }}
    >
      {children}
    </ComplaintContext.Provider>
  );
};

export const useComplaints = () => {
  const context = useContext(ComplaintContext);
  if (!context) {
    throw new Error('useComplaints must be used within a ComplaintProvider');
  }
  return context;
};
