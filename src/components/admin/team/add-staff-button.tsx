"use client";

import { AddButton } from "@/components/admin/common/add-button";
import { AddStaffDialog } from "./add-staff-dialog";

export function AddStaffButton() {
  return <AddButton label="Add staff" renderDialog={(open, onOpenChange) => <AddStaffDialog open={open} onOpenChange={onOpenChange} />} />;
}
