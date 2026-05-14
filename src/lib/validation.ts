export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export const TASK_STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const USER_ROLES = ["ADMIN", "MEMBER"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export function requireString(value: unknown, field: string): string {
  if (typeof value !== "string") {
    throw new ApiError(`${field} is required`);
  }
  const trimmed = value.trim();
  if (!trimmed) {
    throw new ApiError(`${field} is required`);
  }
  return trimmed;
}

export function optionalString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export function requireEnum<T extends readonly string[]>(
  value: unknown,
  allowed: T,
  field: string
): T[number] {
  if (typeof value !== "string") {
    throw new ApiError(`${field} is required`);
  }
  if (!allowed.includes(value)) {
    throw new ApiError(`${field} must be one of: ${allowed.join(", ")}`);
  }
  return value;
}

export function parseOptionalDate(value: unknown, field: string): Date | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" && !(value instanceof Date)) {
    throw new ApiError(`${field} must be a valid date`);
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new ApiError(`${field} must be a valid date`);
  }
  return date;
}

export function asStringId(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new ApiError(`${field} is required`);
  }
  return value.trim();
}
