import * as React from "react"
import { TriangleAlertIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type AlertDialogVariant = "default" | "destructive"

interface AlertDialogProps {

  open: boolean

  onOpenChange: (open: boolean) => void


  title: string

  description?: React.ReactNode

  /** Confirm button label. @default "Confirm" */
  confirmLabel?: string
  /** Cancel button label.  @default "Cancel" */
  cancelLabel?: string
  variant?: AlertDialogVariant
  showIcon?: boolean
  onConfirm?: () => void
  className?: string
}

const VARIANT_BUTTON: Record<AlertDialogVariant, "default" | "destructive"> = {
  default: "default",
  destructive: "destructive",
}

function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  showIcon = true,
  onConfirm,
  className,
}: AlertDialogProps) {
  const isDestructive = variant === "destructive"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn("sm:max-w-md", className)}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isDestructive && showIcon && (
              <span
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive"
                aria-hidden
              >
                <TriangleAlertIcon className="size-4" />
              </span>
            )}
            {title}
          </DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-2">
          <DialogClose asChild>
            <Button variant="outline">{cancelLabel}</Button>
          </DialogClose>
          <Button
            variant={VARIANT_BUTTON[variant]}
            onClick={() => {
              onConfirm?.()
              onOpenChange(false)
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { AlertDialog }
export type { AlertDialogProps, AlertDialogVariant }
