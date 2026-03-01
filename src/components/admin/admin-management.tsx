"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, Trash2, Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSupplyChainContract } from "@/hooks/use-supply-chain-contract";

interface AdminRecord {
  address: string;
  name: string;
  email: string;
  organization: string;
  department: string;
  phone: string;
  idNumber: string;
  dateAdded: string;
}

export function AdminManagement() {
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [newAdminAddress, setNewAdminAddress] = useState("");
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [organization, setOrganization] = useState("");
  const [phone, setPhone] = useState("");
  const [IDNumber, setIDNumber] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { addAdmin, removeAdmin, getAdmins, isLoading: hookLoading, error: hookError } = useSupplyChainContract();

  // Fetch admins on component mount
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const adminsList = await getAdmins();
        const adminRecords: AdminRecord[] = (adminsList || []).map((address: string) => ({
          address,
          name: "Dr. Admin User",
          email: "admin@pharma.com",
          organization: "Pharma Corp Ltd.",
          department: "Supply Chain Management",
          phone: "9876543210",
          idNumber: "PH-2026-" + Math.random().toString().slice(2, 7),
          dateAdded: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-GB")
        }));
        setAdmins(adminRecords);
      } catch (err) {
        console.error("Failed to fetch admins:", err);
      }
    };
    fetchAdmins();
  }, [getAdmins]);

  const handleAddAdmin = async () => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      if (!newAdminAddress || !/^0x[a-fA-F0-9]{40}$/.test(newAdminAddress)) {
        throw new Error("Invalid Ethereum address format");
      }

      if (!adminName || !email || !department || !organization || !phone || !IDNumber) {
        throw new Error("All fields are required");
      }

      const adminExists = admins.some(admin => admin.address === newAdminAddress);
      if (adminExists) {
        throw new Error("Admin already exists");
      }

      await addAdmin(newAdminAddress);
      
      const newAdmin: AdminRecord = {
        address: newAdminAddress,
        name: adminName,
        email: email,
        organization: organization,
        department: department,
        phone: phone,
        idNumber: IDNumber,
        dateAdded: new Date().toLocaleDateString("en-GB")
      };
      setAdmins([...admins, newAdmin]);
      
      setSuccess("Admin added successfully!");
      setNewAdminAddress("");
      setAdminName("");
      setEmail("");
      setDepartment("");
      setOrganization("");
      setPhone("");
      setIDNumber("");
      setIsDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add admin");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAdmin = async (address: string) => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      await removeAdmin(address);
      
      setAdmins(admins.filter(admin => admin.address !== address));
      
      setSuccess("Admin removed successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove admin");
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const getInitials = (name: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const getDepartmentBadgeClass = (dept: string) => {
    // simple color mapping for departments
    if (!dept) return "";
    if (/supply/i.test(dept)) return "bg-blue-50 text-blue-700";
    if (/quality|qa/i.test(dept)) return "bg-amber-50 text-amber-700";
    return "bg-muted/10 text-muted-foreground";
  };

  const getStatusBadgeClass = () => {
    return "bg-green-100 text-green-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Management</h1>
          <p className="text-gray-500 mt-2">Manage admin roles and permissions</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Admin
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Active Admins</CardTitle>
          <CardDescription>Total: {admins.length} admins</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead>ID Number</TableHead>
                  <TableHead>Wallet Address</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No admins found
                    </TableCell>
                  </TableRow>
                ) : (
                  admins.map((admin) => (
                    <TableRow key={admin.address}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">{getInitials(admin.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">{admin.name}</div>
                            <div className="text-xs text-muted-foreground">{admin.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getDepartmentBadgeClass(admin.department)}>
                          {admin.department}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{admin.organization}</TableCell>
                      <TableCell className="text-sm">+91 {admin.phone}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeClass()}>
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{admin.dateAdded}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">{admin.idNumber}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono text-xs">{formatAddress(admin.address)}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAdmin(admin.address)}
                          disabled={isLoading}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Admin</DialogTitle>
            <DialogDescription>
              Enter the details of the user to promote to admin in the pharmaceutical supply chain
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Admin Name
              </label>
              <Input
                id="name"
                placeholder="Dr. John Doe"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@pharma.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="organization" className="text-sm font-medium">
                Organization/Company Name
              </label>
              <Input
                id="organization"
                placeholder="Pharma Corp Ltd."
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="department" className="text-sm font-medium">
                Department/Role
              </label>
              <Input
                id="department"
                placeholder="Supply Chain Director, Compliance Officer etc."
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Phone Number
              </label>
              <Input
                id="phone"
                placeholder="+91 0123456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="ID" className="text-sm font-medium">
                ID Number
              </label>
              <Input
                id="ID"
                placeholder="PH-2026-00001"
                value={IDNumber}
                onChange={(e) => setIDNumber(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="address" className="text-sm font-medium">
                Wallet Address
              </label>
              <Input
                id="address"
                placeholder="0x..."
                value={newAdminAddress}
                onChange={(e) => setNewAdminAddress(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleAddAdmin} disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
