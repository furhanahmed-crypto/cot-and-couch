"use client";

import { useState } from "react";
import { changeRoleAction, searchPeopleAction } from "@/app/admin/team/actions";
import { FormDialog } from "@/components/admin/common/form-dialog";
import { FormField } from "@/components/admin/common/form-field";
import { OptionSelect } from "@/components/admin/common/option-select";
import { CustomerSearch } from "@/components/admin/orders/customer-search";
import { STAFF_ROLE_HELP, USER_ROLE_LABELS } from "@/constants/users";
import { useActionToast } from "@/hooks/use-action-toast";
import type { CustomerMatch } from "@/types/admin-orders";

const ROLE_OPTIONS = (["team", "admin"] as const).map((role) => ({ value: role, label: USER_ROLE_LABELS[role] }));

/** Staff must sign up in the shop first; here an admin gives that account a staff role. */
export function AddStaffDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [person, setPerson] = useState<CustomerMatch | null>(null);
  const [role, setRole] = useState<"team" | "admin">("team");
  const [error, setError] = useState("");
  const { run, isPending } = useActionToast();

  function save() {
    if (!person) return setError("Search and pick a person first");
    run(
      () => changeRoleAction({ profileId: person.profileId, role }),
      { loading: "Adding staff…", success: `${person.name} is now ${USER_ROLE_LABELS[role]}`, error: "Could not add staff" },
      () => {
        setPerson(null);
        setError("");
        onOpenChange(false);
      },
    );
  }

  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title="Add staff" description="The person must have signed up in the shop already." submitLabel="Add staff" isPending={isPending} onSubmit={save}>
      {person ? (
        <div className="flex items-center justify-between rounded-md px-3 py-2 text-sm ring-1 ring-border/60">
          <span>
            <span className="font-medium">{person.name}</span>
            <span className="block text-xs text-muted-foreground">{person.email}</span>
          </span>
          <button type="button" className="text-xs text-muted-foreground hover:text-foreground" onClick={() => setPerson(null)}>Change</button>
        </div>
      ) : (
        <CustomerSearch search={searchPeopleAction} onPick={(match) => { setPerson(match); setError(""); }} />
      )}
      <FormField id="staff-role" label="Role" help={STAFF_ROLE_HELP[role]}>
        <OptionSelect id="staff-role" value={role} options={ROLE_OPTIONS} onChange={(value) => setRole(value as "team" | "admin")} />
      </FormField>
      {error ? <p role="alert" className="text-xs text-destructive">{error}</p> : null}
    </FormDialog>
  );
}
