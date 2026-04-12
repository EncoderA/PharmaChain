"use client";

import { useState, useCallback } from "react";
import { Plus, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getErrorMessage } from "./types";
import type { Product } from "./types";

// ─── Validation Types ───────────────────────────────────────────────
interface FieldError {
  productCode?: string;
  name?: string;
  category?: string;
  batch?: string;
  stock?: string;
  manufacturingDate?: string;
  expiryDate?: string;
}

interface AddProductDialogProps {
  onAdd: (formData: FormData) => Promise<void>;
  /** Existing products list, used to check for duplicate product codes */
  existingProducts: Product[];
}

// ─── Validation Helpers ─────────────────────────────────────────────

function validateProductCode(value: string, existingProducts: Product[]): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return "Product code is required.";
  if (trimmed.length < 2) return "Product code must be at least 2 characters.";
  if (trimmed.length > 50) return "Product code must be at most 50 characters.";
  if (!/^[A-Za-z0-9\-_]+$/.test(trimmed)) {
    return "Product code can only contain letters, numbers, hyphens, and underscores.";
  }
  const duplicate = existingProducts.find(
    (p) => p.productCode.toLowerCase() === trimmed.toLowerCase()
  );
  if (duplicate) {
    return `Product code "${trimmed}" already exists.`;
  }
  return undefined;
}

function validateName(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return "Product name is required.";
  if (trimmed.length < 2) return "Product name must be at least 2 characters.";
  if (trimmed.length > 150) return "Product name must be at most 150 characters.";
  return undefined;
}

function validateCategory(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return "Category is required.";
  if (trimmed.length < 2) return "Category must be at least 2 characters.";
  if (trimmed.length > 100) return "Category must be at most 100 characters.";
  return undefined;
}

function validateBatch(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return "Batch number is required.";
  if (trimmed.length < 2) return "Batch number must be at least 2 characters.";
  if (trimmed.length > 50) return "Batch number must be at most 50 characters.";
  return undefined;
}

function validateStock(value: string): string | undefined {
  if (value === "" || value === undefined || value === null) return "Stock is required.";
  const num = parseInt(value);
  if (isNaN(num)) return "Stock must be a valid number.";
  if (num < 0) return "Stock cannot be negative.";
  if (num > 999999) return "Stock value seems unreasonably high.";
  return undefined;
}

function validateManufacturingDate(value: string): string | undefined {
  if (!value) return "Manufacturing date is required.";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "Invalid manufacturing date.";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) return "Manufacturing date must be today or a future date.";
  return undefined;
}

function validateExpiryDate(value: string, manufacturingDateStr: string): string | undefined {
  if (!value) return "Expiry date is required.";
  const expDate = new Date(value);
  if (isNaN(expDate.getTime())) return "Invalid expiry date.";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (expDate < tomorrow) return "Expiry date must be greater than today.";

  if (manufacturingDateStr) {
    const mfgDate = new Date(manufacturingDateStr);
    if (!isNaN(mfgDate.getTime()) && expDate <= mfgDate) {
      return "Expiry date must be after manufacturing date.";
    }
  }
  return undefined;
}

// ─── Full form validation ───────────────────────────────────────────

function validateForm(formData: FormData, existingProducts: Product[]): FieldError {
  const errors: FieldError = {};

  const productCode = (formData.get("productCode") as string) || "";
  const name = (formData.get("name") as string) || "";
  const category = (formData.get("category") as string) || "";
  const batch = (formData.get("batch") as string) || "";
  const stock = (formData.get("stock") as string) || "";
  const manufacturingDate = (formData.get("manufacturingDate") as string) || "";
  const expiryDate = (formData.get("expiryDate") as string) || "";

  errors.productCode = validateProductCode(productCode, existingProducts);
  errors.name = validateName(name);
  errors.category = validateCategory(category);
  errors.batch = validateBatch(batch);
  errors.stock = validateStock(stock);
  errors.manufacturingDate = validateManufacturingDate(manufacturingDate);
  errors.expiryDate = validateExpiryDate(expiryDate, manufacturingDate);

  return errors;
}

function hasErrors(errors: FieldError): boolean {
  return Object.values(errors).some((v) => v !== undefined);
}

// ─── Component ──────────────────────────────────────────────────────

export function AddProductDialog({ onAdd, existingProducts }: AddProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldError>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const resetState = useCallback(() => {
    setError(null);
    setFieldErrors({});
    setTouched({});
  }, []);

  // Real-time field validation on blur
  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));

      let fieldError: string | undefined;
      switch (name) {
        case "productCode":
          fieldError = validateProductCode(value, existingProducts);
          break;
        case "name":
          fieldError = validateName(value);
          break;
        case "category":
          fieldError = validateCategory(value);
          break;
        case "batch":
          fieldError = validateBatch(value);
          break;
        case "stock":
          fieldError = validateStock(value);
          break;
        case "manufacturingDate":
          fieldError = validateManufacturingDate(value);
          break;
        case "expiryDate": {
          const form = e.target.closest("form");
          const mfgDate = form ? (new FormData(form).get("manufacturingDate") as string) || "" : "";
          fieldError = validateExpiryDate(value, mfgDate);
          break;
        }
      }

      setFieldErrors((prev) => ({ ...prev, [name]: fieldError }));
    },
    [existingProducts]
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    // Run all validations
    const errors = validateForm(formData, existingProducts);
    setFieldErrors(errors);
    // Mark all fields as touched
    setTouched({
      productCode: true,
      name: true,
      category: true,
      batch: true,
      stock: true,
      manufacturingDate: true,
      expiryDate: true,
    });

    if (hasErrors(errors)) {
      return; // Don't proceed — show errors
    }

    setLoading(true);
    try {
      await onAdd(formData);
      setOpen(false);
      resetState();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Helper to show field-level error message
  const FieldErrorMsg = ({ field }: { field: keyof FieldError }) => {
    if (!touched[field] || !fieldErrors[field]) return null;
    return <p className="text-xs text-destructive mt-1">{fieldErrors[field]}</p>;
  };

  // Helper to get input border styling based on validation state
  const getFieldClass = (field: keyof FieldError) => {
    if (!touched[field]) return "";
    return fieldErrors[field]
      ? "border-destructive focus-visible:ring-destructive"
      : "border-green-500 focus-visible:ring-green-500";
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetState();
      }}
    >
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 rounded-lg">
          <Plus />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Fill in all the details of the new product. All fields are required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4" noValidate>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Product Code */}
          <div>
            <Label className="mb-1 block">
              Product Code <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                name="productCode"
                placeholder="e.g. PRD-005"
                className={getFieldClass("productCode")}
                onBlur={handleBlur}
                disabled={loading}
              />
              {touched.productCode && !fieldErrors.productCode && (
                <CheckCircle2 className="absolute right-3 top-2.5 h-4 w-4 text-green-500" />
              )}
            </div>
            <FieldErrorMsg field="productCode" />
          </div>

          {/* Product Name */}
          <div>
            <Label className="mb-1 block">
              Product Name <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                name="name"
                placeholder="Enter product name"
                className={getFieldClass("name")}
                onBlur={handleBlur}
                disabled={loading}
              />
              {touched.name && !fieldErrors.name && (
                <CheckCircle2 className="absolute right-3 top-2.5 h-4 w-4 text-green-500" />
              )}
            </div>
            <FieldErrorMsg field="name" />
          </div>

          {/* Category */}
          <div>
            <Label className="mb-1 block">
              Category <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                name="category"
                placeholder="e.g. Analgesic"
                className={getFieldClass("category")}
                onBlur={handleBlur}
                disabled={loading}
              />
              {touched.category && !fieldErrors.category && (
                <CheckCircle2 className="absolute right-3 top-2.5 h-4 w-4 text-green-500" />
              )}
            </div>
            <FieldErrorMsg field="category" />
          </div>

          {/* Batch Number */}
          <div>
            <Label className="mb-1 block">
              Batch Number <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                name="batch"
                placeholder="e.g. BATCH-A123"
                className={getFieldClass("batch")}
                onBlur={handleBlur}
                disabled={loading}
              />
              {touched.batch && !fieldErrors.batch && (
                <CheckCircle2 className="absolute right-3 top-2.5 h-4 w-4 text-green-500" />
              )}
            </div>
            <FieldErrorMsg field="batch" />
          </div>

          {/* Stock */}
          <div>
            <Label className="mb-1 block">
              Stock <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                name="stock"
                type="number"
                placeholder="0"
                defaultValue={0}
                min={0}
                className={getFieldClass("stock")}
                onBlur={handleBlur}
                disabled={loading}
              />
              {touched.stock && !fieldErrors.stock && (
                <CheckCircle2 className="absolute right-3 top-2.5 h-4 w-4 text-green-500" />
              )}
            </div>
            <FieldErrorMsg field="stock" />
          </div>

          {/* Manufacturing Date */}
          <div>
            <Label className="mb-1 block">
              Manufacturing Date <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                name="manufacturingDate"
                type="date"
                min={new Date().toISOString().split("T")[0]}
                className={getFieldClass("manufacturingDate")}
                onBlur={handleBlur}
                disabled={loading}
              />
              {touched.manufacturingDate && !fieldErrors.manufacturingDate && (
                <CheckCircle2 className="absolute right-3 top-2.5 h-4 w-4 text-green-500" />
              )}
            </div>
            <FieldErrorMsg field="manufacturingDate" />
          </div>

          {/* Expiry Date */}
          <div>
            <Label className="mb-1 block">
              Expiry Date <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                name="expiryDate"
                type="date"
                min={(() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split("T")[0]; })()}
                className={getFieldClass("expiryDate")}
                onBlur={handleBlur}
                disabled={loading}
              />
              {touched.expiryDate && !fieldErrors.expiryDate && (
                <CheckCircle2 className="absolute right-3 top-2.5 h-4 w-4 text-green-500" />
              )}
            </div>
            <FieldErrorMsg field="expiryDate" />
          </div>

          <p className="text-xs text-muted-foreground">
            This will register the drug on-chain via MetaMask and save it to the database.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                resetState();
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Registering on-chain...
                </>
              ) : (
                "Register Product"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
