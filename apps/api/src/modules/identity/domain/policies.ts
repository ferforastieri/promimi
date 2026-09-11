export const MINIMUM_PASSWORD_LENGTH = 10;
export const isStaffRole = (role: "ADMIN" | "EDITOR" | "VISITOR") => role === "ADMIN" || role === "EDITOR";
