import { RoleManagement } from "@/components/admin/role-management";

export default function WholesalersPage() {
  return (
    <div className="p-8">
      <RoleManagement
        title="Wholesalers"
        description="Manage registered wholesalers in the supply chain"
        role="wholesaler"
      />
    </div>
  );
}
