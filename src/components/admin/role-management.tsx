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

interface EntityDetails {
  address: string;
  companyName: string;
  licenseNumber: string;
  registrationId: string;
  contactPerson: string;
  phoneNumber: string;
  facilityAddress: string;
  email: string;
  joinedDate: string;
}

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
  const [entities, setEntities] = useState<EntityDetails[]>([]);
  const [newAddress, setNewAddress] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  // Additional pharmaceutical fields (UI only, dummy data)
  const [companyName, setCompanyName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [registrationId, setRegistrationId] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [facilityAddress, setFacilityAddress] = useState("");
  const [Email, setEmail] = useState("");
  
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
        
        // Create dummy pharmaceutical data paired with wallet addresses
        const dummyEntities: EntityDetails[] = (addressesList || []).map((address, index) => {
          const manufacturerDummies = [
            { companyName: "Acme Pharma Ltd", licenseNumber: "MFG-12345", registrationId: "REG-MFG-9876", contactPerson: "Dr. Rahul More", phoneNumber: "+91-555-0100", facilityAddress: "123 Pharma Park, Nashik City", email: "Pharma@gmail.com" },
            { companyName: "HealthCare Solutions", licenseNumber: "MFG-45678", registrationId: "REG-MFG-1234", contactPerson: "Dr. Sarah Chavan", phoneNumber: "+91-555-0105", facilityAddress: "456 Medical Lane, HealthCity", email: "HealthCare@gmail.com" },
            { companyName: "BioPharma Inc", licenseNumber: "MFG-78901", registrationId: "REG-MFG-5678", contactPerson: "Dr. Mohan Chen", phoneNumber: "+91-555-0110", facilityAddress: "789 BioTech Ave, ScienceCity", email: "BioPharma@gmail.com" },
          ];
          const distributorDummies = [
            { companyName: "DistribCo Logistics", licenseNumber: "DST-54321", registrationId: "REG-DST-3344", contactPerson: "Jayesh Patel", phoneNumber: "+1-555-0200", facilityAddress: "45 Distribution Ave, ShipTown", email: "Jane@gmail.com" },
            { companyName: "Global Med Distributors", licenseNumber: "DST-87654", registrationId: "REG-DST-5566", contactPerson: "Tom Johnson", phoneNumber: "+91-555-0205", facilityAddress: "321 Logistics Blvd, TradeHub", email: "GlobalMed@gmail.com" },
            { companyName: "FastTrack Pharma Dist", licenseNumber: "DST-11223", registrationId: "REG-DST-7788", contactPerson: "Rakesh Jain", phoneNumber: "+1-555-0210", facilityAddress: "654 Supply Rd, DeliveryCity", email: "FastTrack@gmail.com" },
          ];
          const wholesalerDummies = [
            { companyName: "Wholesale Medicines Inc", licenseNumber: "WHL-67890", registrationId: "REG-WHL-5566", contactPerson: "Alice Brown", phoneNumber: "+91-555-0300", facilityAddress: "9 Warehouse Rd, SupplyCity", email: "AlicePharma@gmail.com" },
            { companyName: "MediSupply Wholesale", licenseNumber: "WHL-34567", registrationId: "REG-WHL-9012", contactPerson: "Rohit Sharma", phoneNumber: "+91-555-0305", facilityAddress: "147 Bulk Store Ave, WholesaleZone", email: "MediSupply@gmail.com" },
            { companyName: "PharmaHub Wholesale", licenseNumber: "WHL-90123", registrationId: "REG-WHL-3456", contactPerson: "Jayesh Datir", phoneNumber: "+1-555-0310", facilityAddress: "258 Distribution Center, MassCity", email: "PharmaHub@gmail.com" },
          ];
          
          let dummyArray = manufacturerDummies;
          if (role === "distributor") dummyArray = distributorDummies;
          if (role === "wholesaler") dummyArray = wholesalerDummies;
          
          const dummy = dummyArray[index % dummyArray.length];
          const joinedDate = new Date().toLocaleDateString("en-GB");
          return {
            address,
            ...dummy,
            joinedDate,
          };
        });
        
        setEntities(dummyEntities);
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
      
      // Add entity details to the list
      const joinedDate = new Date().toLocaleDateString("en-GB");
      const newEntity: EntityDetails = {
        address: newAddress,
        companyName,
        licenseNumber,
        registrationId,
        contactPerson,
        phoneNumber,
        facilityAddress,
        email: Email,
        joinedDate,
      };
      setEntities([...entities, newEntity]);
      
      setSuccess(`${role} added successfully!`);
      setNewAddress("");
      setCompanyName("");
      setLicenseNumber("");
      setRegistrationId("");
      setContactPerson("");
      setPhoneNumber("");
      setFacilityAddress("");
      setEmail("");
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
      setEntities(entities.filter((entity) => entity.address !== address));
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeClass = () => {
    if (role === "manufacturer") return "bg-blue-100 text-blue-800 border-blue-200";
    if (role === "distributor") return "bg-green-100 text-green-800 border-green-200";
    return "bg-purple-100 text-purple-800 border-purple-200";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-gray-500 mt-2">{description}</p>
        </div>
        <Button onClick={() => {
          // Prefill dummy data for the dialog based on role, keep wallet address untouched
          if (role === "manufacturer") {
            setCompanyName("Acme Pharma Ltd");
            setLicenseNumber("MFG-12345");
            setRegistrationId("REG-MFG-9876");
            setContactPerson("Dr. John Doe");
            setPhoneNumber("+1-555-0100");
            setFacilityAddress("123 Pharma Park, MedCity");
            setEmail("Pharma@gmail.com");
          } else if (role === "distributor") {
            setCompanyName("DistribCo Logistics");
            setLicenseNumber("DST-54321");
            setRegistrationId("REG-DST-3344");
            setContactPerson("Jane Smith");
            setPhoneNumber("+1-555-0200");
            setFacilityAddress("45 Distribution Ave, ShipTown");
            setEmail("Jane@gmail.com");
          } else if (role === "wholesaler") {
            setCompanyName("Wholesale Medicines Inc");
            setLicenseNumber("WHL-67890");
            setRegistrationId("REG-WHL-5566");
            setContactPerson("Alice Brown");
            setPhoneNumber("+1-555-0300");
            setFacilityAddress("9 Warehouse Rd, SupplyCity");
            setEmail("AlicePharma@gmail.com");
          }
          setIsDialogOpen(true);
        }} className="gap-2">
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
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contact</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Facility Address</TableHead>
                    <TableHead>License No.</TableHead>
                    <TableHead>Joined Date</TableHead>
                    <TableHead>Wallet Address</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entities.length > 0 ? entities.map((entity) => (
                    <TableRow key={entity.address}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">{getInitials(entity.contactPerson)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">{entity.contactPerson}</div>
                            <div className="text-xs text-muted-foreground">{entity.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{entity.companyName}</TableCell>
                      <TableCell className="text-sm">{entity.phoneNumber}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{entity.facilityAddress}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">{entity.licenseNumber}</code>
                      </TableCell>
                      <TableCell className="text-sm">{entity.joinedDate}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono text-xs">{formatAddress(entity.address)}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(entity.address)}
                          disabled={isLoading}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) : addresses.map((address) => (
                    <TableRow key={address}>
                      <TableCell colSpan={9} className="text-center text-gray-500">No detailed information available for {formatAddress(address)}</TableCell>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <label htmlFor="companyName" className="text-sm font-medium">Company / Facility Name</label>
                <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <label htmlFor="licenseNumber" className="text-sm font-medium">License / ID No.</label>
                <Input id="licenseNumber" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <label htmlFor="registrationId" className="text-sm font-medium">Reg. / Tax ID</label>
                <Input id="registrationId" value={registrationId} onChange={(e) => setRegistrationId(e.target.value)} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <label htmlFor="contactPerson" className="text-sm font-medium">Contact Person</label>
                <Input id="contactPerson" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <label htmlFor="phoneNumber" className="text-sm font-medium">Phone Number</label>
                <Input id="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <label htmlFor="Email" className="text-sm font-medium">Email</label>
                <Input id="Email" type="email" value={Email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="facilityAddress" className="text-sm font-medium">Facility Address</label>
                <Input id="facilityAddress" value={facilityAddress} onChange={(e) => setFacilityAddress(e.target.value)} disabled={isLoading} />
              </div>
              
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
