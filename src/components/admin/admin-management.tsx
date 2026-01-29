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

export function AdminManagement() {
  const [admins, setAdmins] = useState<string[]>([]);
  const [newAdminAddress, setNewAdminAddress] = useState("");
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
        setAdmins(adminsList || []);
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

      if (admins.includes(newAdminAddress)) {
        throw new Error("Admin already exists");
      }

      await addAdmin(newAdminAddress);
      
      // Refresh the admins list
      const updatedAdmins = await getAdmins();
      setAdmins(updatedAdmins || []);
      
      setSuccess("Admin added successfully!");
      setNewAdminAddress("");
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
      
      // Refresh the admins list
      const updatedAdmins = await getAdmins();
      setAdmins(updatedAdmins || []);
      
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
          {admins.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No admins found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Address</TableHead>
                    <TableHead>Full Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((admin) => (
                    <TableRow key={admin}>
                      <TableCell>
                        <Badge variant="secondary">{formatAddress(admin)}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{admin}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAdmin(admin)}
                          disabled={isLoading}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Admin</DialogTitle>
            <DialogDescription>
              Enter the Ethereum address of the user to promote to admin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
