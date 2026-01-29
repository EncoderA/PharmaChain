import { RoleManagement } from "@/components/admin/role-management";

export default function ManufacturersPage() {
  return (
    <div className="p-8">
      <RoleManagement
        title="Manufacturers"
        description="Manage registered manufacturers in the supply chain"
        role="manufacturer"
      />
    </div>
  );
}
