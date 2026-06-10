import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ApiError } from "@/lib/api/client";
import { useProductImages } from "../_hooks/useProductImages";
import {
  uploadProductImage,
  deleteProductImage,
  setProductImagePrimary,
} from "../_api/productImages";
import type { ProductImage } from "../_api/productImages";

const ACCEPTED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ACCEPTED_ATTR = "image/jpeg,image/png,image/webp";

type UploadStatus =
  | { status: "idle" }
  | { status: "uploading" }
  | { status: "error"; message: string };

interface ProductImageManagerProps {
  businessId: string;
  productId: string;
}

export function ProductImageManager({
  businessId,
  productId,
}: ProductImageManagerProps) {
  const { state, refetch } = useProductImages(businessId, productId);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    status: "idle",
  });

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setFileError(null);
    setUploadStatus({ status: "idle" });
    if (!file) {
      setSelectedFile(null);
      return;
    }
    if (!ACCEPTED_MIME_TYPES.has(file.type)) {
      setFileError("File must be a JPEG, PNG, or WebP image.");
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  }

  async function handleUpload() {
    if (!selectedFile) return;
    setUploadStatus({ status: "uploading" });
    try {
      await uploadProductImage(businessId, productId, selectedFile);
      setSelectedFile(null);
      setFileInputKey((k) => k + 1);
      setUploadStatus({ status: "idle" });
      refetch();
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Something went wrong while uploading the image.";
      setUploadStatus({ status: "error", message });
    }
  }

  async function handleSetPrimary(imageId: string) {
    setSettingPrimaryId(imageId);
    try {
      await setProductImagePrimary(businessId, productId, imageId);
      refetch();
    } catch {
      // Silently refetch so UI stays consistent; errors surface via stale state
    } finally {
      setSettingPrimaryId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDeleteId) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteProductImage(businessId, productId, pendingDeleteId);
      setPendingDeleteId(null);
      refetch();
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Something went wrong while deleting the image.";
      setDeleteError(message);
    } finally {
      setIsDeleting(false);
    }
  }

  const isUploading = uploadStatus.status === "uploading";

  const pendingDeleteImage =
    state.status === "ready"
      ? (state.images.find((img) => img.id === pendingDeleteId) ?? null)
      : null;

  return (
    <>
      <section aria-labelledby="images-heading" className="max-w-lg">
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h3
            id="images-heading"
            className="text-sm font-medium text-foreground"
          >
            Images
          </h3>

          {deleteError ? (
            <div
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            >
              {deleteError}
            </div>
          ) : null}

          {state.status === "loading" ? (
            <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading images…
            </div>
          ) : state.status === "error" ? (
            <div
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            >
              {state.message}
            </div>
          ) : state.images.length === 0 ? (
            <p className="py-2 text-sm text-muted-foreground">No images yet.</p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {state.images.map((img) => (
                <ImageCard
                  key={img.id}
                  image={img}
                  isSettingPrimary={settingPrimaryId === img.id}
                  onSetPrimary={() => void handleSetPrimary(img.id)}
                  onDelete={() => {
                    setDeleteError(null);
                    setPendingDeleteId(img.id);
                  }}
                />
              ))}
            </ul>
          )}

          {/* Upload */}
          <div className="space-y-2 border-t pt-4">
            <label
              htmlFor="image-upload"
              className="block text-sm font-medium text-foreground"
            >
              Add image
            </label>
            <div className="flex items-center gap-2">
              <input
                key={fileInputKey}
                id="image-upload"
                type="file"
                accept={ACCEPTED_ATTR}
                onChange={handleFileSelect}
                disabled={isUploading}
                className="flex-1 text-sm text-foreground file:mr-3 file:rounded-md file:border file:border-input file:bg-transparent file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground hover:file:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button
                type="button"
                size="sm"
                disabled={!selectedFile || isUploading}
                onClick={() => void handleUpload()}
              >
                {isUploading ? "Uploading…" : "Upload"}
              </Button>
            </div>
            {fileError ? (
              <p className="text-xs text-destructive">{fileError}</p>
            ) : null}
            {uploadStatus.status === "error" ? (
              <p role="alert" className="text-xs text-destructive">
                {uploadStatus.message}
              </p>
            ) : null}
            <p className="text-xs text-muted-foreground">
              Accepted formats: JPEG, PNG, WebP
            </p>
          </div>
        </div>
      </section>

      <AlertDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this image?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDeleteImage?.isPrimary
                ? "This is the primary image. Deleting it cannot be undone."
                : "This image will be permanently deleted. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={() => void handleConfirmDelete()}
            >
              {isDeleting ? "Deleting…" : "Delete image"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface ImageCardProps {
  image: ProductImage;
  isSettingPrimary: boolean;
  onSetPrimary: () => void;
  onDelete: () => void;
}

function ImageCard({
  image,
  isSettingPrimary,
  onSetPrimary,
  onDelete,
}: ImageCardProps) {
  return (
    <li className="group relative flex flex-col overflow-hidden rounded-md border bg-card">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={image.url}
          alt={image.alt ?? ""}
          className="h-full w-full object-cover"
        />
        {image.isPrimary ? (
          <span className="absolute left-1.5 top-1.5 rounded bg-primary px-1.5 py-0.5 text-xs font-medium text-primary-foreground">
            Primary
          </span>
        ) : null}
      </div>
      <div className="flex items-center justify-between gap-1 p-1.5">
        {!image.isPrimary ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 flex-1 px-2 text-xs"
            disabled={isSettingPrimary}
            onClick={onSetPrimary}
          >
            {isSettingPrimary ? "Setting…" : "Set primary"}
          </Button>
        ) : (
          <span className="flex-1" />
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          Delete
        </Button>
      </div>
    </li>
  );
}
