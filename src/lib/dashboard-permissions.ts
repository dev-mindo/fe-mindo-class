const LIMITED_CLASSROOM_ROLES = new Set(["PENGAJAR", "PIC"]);

const LIMITED_ROLE_PATHS = [
  "/dashboard/classroom",
  "/dashboard/list-participant",
  "/dashboard/discussion",
];

export const isLimitedClassroomRole = (role?: string | null) =>
  LIMITED_CLASSROOM_ROLES.has(role?.trim().toUpperCase() ?? "");

export const canManageClassroom = (role?: string | null) =>
  !isLimitedClassroomRole(role);

export const canAccessDashboardPath = (
  role: string | null | undefined,
  pathname: string
) => {
  if (!isLimitedClassroomRole(role)) {
    return true;
  }

  if (
    pathname === "/dashboard/classroom/add-classroom" ||
    pathname.startsWith("/dashboard/classroom/add-classroom/")
  ) {
    return false;
  }

  if (pathname === "/dashboard") {
    return true;
  }

  return LIMITED_ROLE_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
};
