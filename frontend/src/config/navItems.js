import {
  FiHome,
  FiUsers,
  FiBook,
  FiAward,
  FiCalendar,
  FiSettings,
  FiFileText,
  FiUser,
} from "react-icons/fi";

// Single source of truth for navigation items used by Header and Sidebar
export const navItems = [
  {
    name: "Dashboard",
    href: "/app/dashboard",
    icon: FiHome,
    roles: ["Admin", "User"],
  },
  {
    name: "My Students",
    href: "/app/students",
    icon: FiUsers,
    roles: ["Admin", "User"],
  },
  {
    name: "My Classes",
    href: "/app/classes",
    icon: FiBook,
    roles: ["Admin", "User"],
  },
  {
    name: "Subjects",
    href: "/app/subjects",
    icon: FiBook,
    roles: ["Admin", "User"],
  },
  {
    name: "Grades",
    href: "/app/grades",
    icon: FiAward,
    roles: ["Admin", "User"],
  },
  {
    name: "Attendance",
    href: "/app/attendance",
    icon: FiCalendar,
    roles: ["Admin", "User"],
  },
  {
    name: "User Management",
    href: "/app/users",
    icon: FiUser,
    roles: ["Admin"],
  },
  {
    name: "Reports",
    href: "/app/reports",
    icon: FiFileText,
    roles: ["Admin", "User"],
  },
  {
    name: "Settings",
    href: "/app/settings",
    icon: FiSettings,
    roles: ["Admin", "User"],
  },
];

export default navItems;
