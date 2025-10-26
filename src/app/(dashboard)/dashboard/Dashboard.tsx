"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckIcon, Plus, PlusIcon, QrCode, ShoppingCart, Verified, WarehouseIcon } from "lucide-react";
import Calendar27 from "./BarChart";

export default function SupplyChainDashboard() {
  const stats = [
    { label: "Total Products", value: "1,250", change: "+12%" },
    { label: "Transactions Processed", value: "5,800", change: "+8%" },
    { label: "Active Supply Chains", value: "15", change: "+5%" },
  ];

  const activities = [
    {
      icon: <PlusIcon />,
      title: "Product Added",
      detail: "Product ID: 12345",
      color: "bg-primary/20 text-primary",
    },
    {
      icon: <ShoppingCart />, 
      title: "Shipped from Warehouse",
      detail: "Tracking ID: ABCDE",
      color: "bg-primary/20 text-primary",
    },
    {
      icon: <WarehouseIcon />,
      title: "Received at Dist. Center",
      detail: "Received at 10:00 AM",
      color: "bg-primary/20 text-primary",
    },
    {
      icon: <CheckIcon />,
      title: "Quality Check Passed",
      detail: "Passed at 2:00 PM",
      color: "bg-primary/20 text-primary",
    },
    {
      icon: <CheckIcon />,
      title: "Delivered to Retailer",
      detail: "Delivered at 5:00 PM",
      color: "bg-primary/20 text-primary",
      isLast: true,
    },
  ];

  return (
    <div className="flex-1 bg-background min-h-screen">
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4 flex-wrap">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 rounded-lg">
                <Plus />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Fill in the details of the new product.
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4 mt-4">
                <div>
                  <Label className="mb-1 block">Product Name</Label>
                  <Input placeholder="Enter product name" />
                </div>
                <div>
                  <Label className="mb-1 block">Batch Number</Label>
                  <Input placeholder="Enter batch number" />
                </div>
                <div>
                  <Label className="mb-1 block">Manufacturer</Label>
                  <Input placeholder="Enter manufacturer name" />
                </div>
                <div className="flex justify-end">
                  <Button type="submit">Save Product</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="secondary"
                className="flex items-center gap-2 rounded-lg"
              >
                <QrCode />
                Track Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Track Product</DialogTitle>
                <DialogDescription>
                  Enter the product or tracking ID to view its journey.
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4 mt-4">
                <div>
                  <Label className="mb-1 block">Tracking ID</Label>
                  <Input placeholder="Enter tracking ID" />
                </div>
                <div className="flex justify-end">
                  <Button type="submit">Track</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="secondary"
                className="flex items-center gap-2 rounded-lg"
              >
                <Verified />
                Verify Authenticity
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Verify Product Authenticity</DialogTitle>
                <DialogDescription>
                  Enter the product’s unique ID or scan its QR code to verify.
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-5 mt-5">
                <div>
                  <Label className="mb-1 block">Product ID</Label>
                  <Input placeholder="Enter product ID" />
                </div>
                <div className="flex justify-end">
                  <Button type="submit">Verify</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-card p-6 rounded-xl border border-border"
            >
              <p className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {stat.value}
              </p>
              <p className="text-sm font-medium text-green-500 mt-1">
                {stat.change}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Calendar27 />
          </div>

          <div className="bg-card p-6 rounded-xl border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Supply Chain Activity
            </h3>
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full ${activity.color} flex items-center justify-center`}
                    >
                      <span className="material-symbols-outlined text-base">
                        {activity.icon}
                      </span>
                    </div>
                    {!activity.isLast && (
                      <div className="w-px flex-1 bg-border" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
