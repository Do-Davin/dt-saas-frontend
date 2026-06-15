import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import type { ChangeEvent, DragEvent } from "react";
import {
  ImageIcon,
  StarIcon,
  Trash2Icon,
  ChevronUpIcon,
  ChevronDownIcon,
  UploadCloudIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ACCEPTED_IMAGE_INPUT_ATTR,
  MAX_STAGED_IMAGES,
  validateImageFile,
} from "../_utils/productImageValidation";

interface CreateProductImageFieldProps {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
  uploadingIndex?: number | null;
  failedIndices?: ReadonlySet<number>;
}

// Staged image picker used during product creation.
// Files are kept in memory only — no upload happens here. The parent submits
// the staged files after the product is created. First file becomes primary
// (backend assigns primary to the first successful upload when none exists).
export function CreateProductImageField({
  files,
  onChange,
  disabled = false,
  uploadingIndex = null,
  failedIndices,
}: CreateProductImageFieldProps) {
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [inputKey, setInputKey] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Object URLs are derived from files. Cleanup runs whenever the file set
  // changes — old URLs are revoked, new ones created.
  const previews = useMemo(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files],
  );

  useEffect(() => {
    return () => {
      for (const p of previews) URL.revokeObjectURL(p.url);
    };
  }, [previews]);

  const acceptFiles = useCallback(
    (incoming: File[]) => {
      setFileError(null);
      if (incoming.length === 0) return;

      const remaining = MAX_STAGED_IMAGES - files.length;
      if (remaining <= 0) {
        setFileError(`You can stage at most ${MAX_STAGED_IMAGES} images.`);
        return;
      }

      const accepted: File[] = [];
      let firstError: string | null = null;
      for (const file of incoming.slice(0, remaining)) {
        const err = validateImageFile(file);
        if (err) {
          if (!firstError) firstError = err;
          continue;
        }
        accepted.push(file);
      }
      if (incoming.length > remaining && !firstError) {
        firstError = `Only ${remaining} more image${remaining === 1 ? "" : "s"} can be added.`;
      }
      if (firstError) setFileError(firstError);
      if (accepted.length > 0) onChange([...files, ...accepted]);
      setInputKey((k) => k + 1);
    },
    [files, onChange],
  );

  function handleInput(e: ChangeEvent<HTMLInputElement>) {
    const list = e.target.files ? Array.from(e.target.files) : [];
    acceptFiles(list);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    const list = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
    acceptFiles(list);
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (disabled) return;
    setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function removeAt(index: number) {
    const next = files.slice();
    next.splice(index, 1);
    onChange(next);
  }

  function moveUp(index: number) {
    if (index === 0) return;
    const next = files.slice();
    [next[index - 1], next[index]] = [next[index]!, next[index - 1]!];
    onChange(next);
  }

  function moveDown(index: number) {
    if (index >= files.length - 1) return;
    const next = files.slice();
    [next[index], next[index + 1]] = [next[index + 1]!, next[index]!];
    onChange(next);
  }

  const canAddMore = files.length < MAX_STAGED_IMAGES;

  return (
    <div className={cn(disabled && "pointer-events-none opacity-60")}>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Product images
      </p>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-3 py-4 text-center transition-colors",
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-input bg-muted/30 hover:border-primary/40",
          !canAddMore && "opacity-60",
        )}
      >
        <ImageIcon className="size-6 text-muted-foreground" />
        <p className="text-xs font-semibold text-foreground">
          Drop images or
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || !canAddMore}
            className="ml-1 text-primary underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
          >
            browse
          </button>
        </p>
        <p className="text-[11px] text-muted-foreground">
          JPEG, PNG, WebP · up to {MAX_STAGED_IMAGES}
        </p>
        <input
          key={inputKey}
          ref={inputRef}
          type="file"
          accept={ACCEPTED_IMAGE_INPUT_ATTR}
          multiple
          onChange={handleInput}
          disabled={disabled || !canAddMore}
          className="sr-only"
        />
      </div>

      {fileError ? (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {fileError}
        </p>
      ) : null}

      {previews.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {previews.map((p, i) => {
            const isUploading = uploadingIndex === i;
            const hasFailed = failedIndices?.has(i) ?? false;
            return (
              <li
                key={`${p.file.name}-${i}`}
                className={cn(
                  "flex items-center gap-2 rounded-xl border bg-card p-2 text-xs",
                  hasFailed && "border-destructive/40 bg-destructive/5",
                  isUploading && "border-primary/60 bg-primary/5",
                )}
              >
                <img
                  src={p.url}
                  alt=""
                  className="size-10 shrink-0 rounded-md object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    {i === 0 ? (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                        <StarIcon className="size-2.5" />
                        Primary
                      </span>
                    ) : null}
                    <span className="truncate font-semibold text-foreground">
                      {p.file.name}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {(p.file.size / 1024).toFixed(0)} KB
                    {isUploading ? " · uploading…" : null}
                    {hasFailed ? " · failed" : null}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => moveUp(i)}
                    disabled={disabled || i === 0}
                    aria-label="Move up"
                    className="rounded-md p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ChevronUpIcon className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(i)}
                    disabled={disabled || i >= files.length - 1}
                    aria-label="Move down"
                    className="rounded-md p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ChevronDownIcon className="size-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  disabled={disabled}
                  aria-label={`Remove ${p.file.name}`}
                  className="shrink-0 rounded-md p-1 text-destructive hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2Icon className="size-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {uploadingIndex !== null && uploadingIndex >= 0 ? (
        <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-primary">
          <UploadCloudIcon className="size-3.5" />
          Uploading image {uploadingIndex + 1} of {files.length}…
        </p>
      ) : null}
    </div>
  );
}
