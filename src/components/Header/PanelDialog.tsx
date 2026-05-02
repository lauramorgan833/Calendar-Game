import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LucideIcon } from 'lucide-react';

interface PanelDialogProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

const SCROLL_AREA_CLASS = 'max-h-[calc(85vh-120px)] overflow-y-auto';

export function PanelDialog({
  isOpen,
  onClose,
  title,
  description,
  icon: Icon,
  children,
  className,
}: PanelDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5" />}
            {title}
          </DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <ScrollArea className={SCROLL_AREA_CLASS}>
          {children}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
