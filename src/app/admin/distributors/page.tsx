import { RoleManagement } from "@/components/admin/role-management";

export default function DistributorsPage() {
  return (
    <div className="p-8">
      <RoleManagement
        title="Distributors"
        description="Manage registered distributors in the supply chain"
        role="distributor"
      />
    </div>
  );
}
