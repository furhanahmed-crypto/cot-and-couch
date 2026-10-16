import { DEMO } from "@/constants/brand";
import { STORAGE_KEYS } from "@/constants/routes";
import type { CustomerSession, StaffSession } from "@/types";
import { readJson, removeKey, writeJson } from "./storage";

export function getCustomerSession(): CustomerSession | null {
  return readJson<CustomerSession | null>(STORAGE_KEYS.customerSession, null);
}

export function setCustomerSession(session: CustomerSession) {
  writeJson(STORAGE_KEYS.customerSession, session);
}

export function clearCustomerSession() {
  removeKey(STORAGE_KEYS.customerSession);
}

export function getStaffSession(): StaffSession | null {
  return readJson<StaffSession | null>(STORAGE_KEYS.staffSession, null);
}

export function setStaffSession(session: StaffSession) {
  writeJson(STORAGE_KEYS.staffSession, session);
}

export function clearStaffSession() {
  removeKey(STORAGE_KEYS.staffSession);
}

/** Mock OTP — accepts DEMO.customerOtp or any 6 digits in prototype. */
export function verifyMockOtp(otp: string): boolean {
  return /^\d{6}$/.test(otp);
}

export function mockStaffLogin(
  mobile: string,
  password: string,
): StaffSession | null {
  if (mobile === DEMO.adminMobile && password === DEMO.adminPassword) {
    return {
      id: "staff-admin",
      name: "Owner Admin",
      mobile,
      role: "admin",
    };
  }
  if (mobile === DEMO.teamMobile && password === DEMO.teamPassword) {
    return {
      id: "staff-ravi",
      name: "Ravi Kumar",
      mobile,
      role: "team",
    };
  }
  return null;
}
