import * as React from 'react';
import { Dialog, DialogContent, DialogOverlay } from '@radix-ui/react-dialog';

export function Modal({ open, onOpenChange, children }: any) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogOverlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
            {children}
        </Dialog>
    );
}

export function ModalContent({ children }: any) {
    return (
        <DialogContent className="fixed left-1/2 top-1/2 w-[90%] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-lg focus:outline-none">
            {children}
        </DialogContent>
    );
}
