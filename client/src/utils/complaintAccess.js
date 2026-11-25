export const isAssignedToStaff = (complaint, user) => {
  if (!user || !complaint?.assignedStaff) return false;
  const staffEmail = complaint.assignedStaff.email?.toLowerCase();
  const userEmail = user.email?.toLowerCase();
  return Boolean(
    (staffEmail && userEmail === staffEmail) ||
      (user.id && complaint.assignedStaff.id === user.id)
  );
};

export const isOwnedByStudent = (complaint, user) => {
  if (!user || !complaint?.student) return false;
  const studentEmail = complaint.student.email?.toLowerCase();
  const userEmail = user.email?.toLowerCase();
  return Boolean(
    (studentEmail && userEmail === studentEmail) ||
      (user.id && complaint.student.id === user.id)
  );
};
