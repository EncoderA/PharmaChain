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

interface RoleManagementProps {
  title: string;
  description: string;
  role: "manufacturer" | "distributor" | "wholesaler";
  onAddAddress?: (address: string) => Promise<void>;
  onRemoveAddress?: (address: string) => Promise<void>;
}

export function RoleManagement({
  title,
  description,
  role,
}: RoleManagementProps) {
  const [addresses, setAddresses] = useState<string[]>([]);
  const [newAddress, setNewAddress] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const {
    addManufacturer,
    removeManufacturer,
    getManufacturers,
    addDistributor,
    removeDistributor,
    getDistributors,
    addWholesaler,
    removeWholesaler,
    getWholesalers,
  } = useSupplyChainContract();

  // Fetch addresses based on role on mount
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        let addressesList: string[] = [];
        
        if (role === "manufacturer") {
          addressesList = await getManufacturers();
        } else if (role === "distributor") {
          addressesList = await getDistributors();
        } else if (role === "wholesaler") {
          addressesList = await getWholesalers();
        }
        
        setAddresses(addressesList || []);
      } catch (err) {
        console.error(`Failed to fetch ${role}s:`, err);
      }
    };
    
    fetchAddresses();
  }, [role, getManufacturers, getDistributors, getWholesalers]);

  const handleAdd = async () => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      if (!newAddress || !/^0x[a-fA-F0-9]{40}$/.test(newAddress)) {
        throw new Error("Invalid Ethereum address format");
      }

      if (addresses.includes(newAddress)) {
        throw new Error(`${role} already exists`);
      }

      // Call appropriate contract function based on role
      if (role === "manufacturer") {
        await addManufacturer(newAddress);
      } else if (role === "distributor") {
        await addDistributor(newAddress);
      } else if (role === "wholesaler") {
        await addWholesaler(newAddress);
      }

      // Refresh the list
      let updatedList: string[] = [];
      if (role === "manufacturer") {
        updatedList = await getManufacturers();
      } else if (role === "distributor") {
        updatedList = await getDistributors();
      } else if (role === "wholesaler") {
        updatedList = await getWholesalers();
      }
      
      setAddresses(updatedList || []);
      setSuccess(`${role} added successfully!`);
      setNewAddress("");
      setIsDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to add ${role}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (address: string) => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      // Call appropriate contract function based on role
      if (role === "manufacturer") {
        await removeManufacturer(address);
      } else if (role === "distributor") {
        await removeDistributor(address);
      } else if (role === "wholesaler") {
        await removeWholesaler(address);
      }

      // Refresh the list
      let updatedList: string[] = [];
      if (role === "manufacturer") {
        updatedList = await getManufacturers();
      } else if (role === "distributor") {
        updatedList = await getDistributors();
      } else if (role === "wholesaler") {
        updatedList = await getWholesalers();
      }
      
      setAddresses(updatedList || []);
      setSuccess(`${role} removed successfully!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to remove ${role}`);
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
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-gray-500 mt-2">{description}</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add {title.slice(0, -1)}
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
          <CardTitle>Active {title}</CardTitle>
          <CardDescription>Total: {addresses.length} {title.toLowerCase()}</CardDescription>
        </CardHeader>
        <CardContent>
          {addresses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No {title.toLowerCase()} found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Short Address</TableHead>
                    <TableHead>Full Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {addresses.map((address) => (
                    <TableRow key={address}>
                      <TableCell>
                        <Badge variant="secondary">{formatAddress(address)}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{address}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(address)}
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
            <DialogTitle>Add New {title.slice(0, -1)}</DialogTitle>
            <DialogDescription>
              Enter the Ethereum address of the user to add as {title.toLowerCase()}
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
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
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
            <Button onClick={handleAdd} disabled={isLoading}>
              {isLoading ? "Adding..." : `Add ${title.slice(0, -1)}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
