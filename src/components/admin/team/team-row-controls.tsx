"use client";

import { useState } from "react";
import { changeRoleAction } from "@/app/admin/team/actions";
import { OptionSelect } from "@/components/admin/common/option-select";
import { RowActions } from "@/components/admin/common/row-actions";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { STAFF_ROLE_HELP, USER_ROLE_LABELS, type UserRole } from "@/constants/users";
import { useActionToast } from "@/hooks/use-action-toast";
import type { StaffMember } from "@/types/admin-content";

const ROLE_OPTIONS = (["admin", "team"] as const).map((role) => ({ value: role, label: USER_ROLE_LABELS[role] }));

type TeamRowControlsProps = { member: StaffMember; isSelf: boolean };

/** Role select and "Remove access", both confirmed first. Your own row is read-only. */
export function TeamRowControls({ member, isSelf }: TeamRowControlsProps) {
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);
  const { run, isPending } = useActionToast();
  const name = member.name ?? member.email;

  function confirm() {
    if (!pendingRole) return;
    const isRemoval = pendingRole === "customer";
    run(
      () => changeRoleAction({ profileId: member.id, role: pendingRole }),
      { loading: "Saving…", success: isRemoval ? `${name} no longer has staff access` : `${name} is now ${USER_ROLE_LABELS[pendingRole]}`, error: "Could not change the role" },
      () => setPendingRole(null),
    );
  }

  if (isSelf) return <span className="text-sm text-muted-foreground">{USER_ROLE_LABELS[member.role]} (you)</span>;

  return (
    <div className="flex items-center justify-end gap-2">
      <div className="w-32">
        <OptionSelect id={`role-${member.id}`} value={member.role} options={ROLE_OPTIONS} disabled={isPending} onChange={(role) => setPendingRole(role as UserRole)} />
      </div>
      <RowActions label={name} actions={[{ label: "Remove access", isDestructive: true, onSelect: () => setPendingRole("customer") }]} />
      <ConfirmationModal
        open={pendingRole !== null}
        onOpenChange={(open) => (open ? null : setPendingRole(null))}
        title={pendingRole === "customer" ? `Remove ${name}'s staff access?` : `Make ${name} ${pendingRole ? USER_ROLE_LABELS[pendingRole] : ""}?`}
        description={pendingRole === "customer" ? "They keep their shop account but can no longer open the admin." : pendingRole === "admin" || pendingRole === "team" ? STAFF_ROLE_HELP[pendingRole] : ""}
        confirmLabel={pendingRole === "customer" ? "Remove access" : "Change role"}
        destructive={pendingRole === "customer"}
        pending={isPending}
        onConfirm={confirm}
      />
    </div>
  );
}
