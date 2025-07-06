"use client";
import { Fragment, ReactNode } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Button } from "@/components/ui/button";

interface ConfirmModalProps {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  message,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[80]" onClose={onCancel}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition-all ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="bg-background-primary-default p-6 space-y-4">
              <Dialog.Title className="body-01-regular text-text-primary-default text-center">
                {message}
              </Dialog.Title>
              <div className="flex justify-center gap-2">
                <Button variant="outline" size="md" onClick={onCancel}>
                  Cancelar
                </Button>
                <Button size="md" onClick={onConfirm}>
                  Salir
                </Button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
