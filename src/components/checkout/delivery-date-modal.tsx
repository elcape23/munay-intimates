"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface DeliveryDateModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (dateLabel: string, timeLabel: string) => void;
}

export function DeliveryDateModal({
  open,
  onClose,
  onConfirm,
}: DeliveryDateModalProps) {
  const dates = useMemo(() => {
    return Array.from({ length: 4 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i + 1);
      const formattedDate = date
        .toLocaleDateString("es-AR", {
          day: "2-digit",
          month: "short",
        })
        .replace(".", "");
      const label =
        i === 0
          ? "Mañana"
          : date
              .toLocaleDateString("es-AR", { weekday: "short" })
              .replace(/^./, (c) => c.toUpperCase());
      return { formattedDate, label };
    });
  }, []);

  const [selectedDate, setSelectedDate] = useState(0);
  const [timeRange, setTimeRange] = useState("10hs a 13hs");

  const handleConfirm = () => {
    onConfirm(dates[selectedDate].label, timeRange);
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        open ? "" : "pointer-events-none"
      }`}
    >
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          open ? "opacity-50" : "opacity-0"
        }`}
      />
      <div
        className={`relative w-full max-w-sm bg-background-primary-default p-6 pt-5 pb-10 border-t border-t-border-primary-default space-y-6 transition-transform duration-300 transform ${
          open ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <div className="flex justify-end">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <XMarkIcon className="h-6 w-6" />
          </Button>
        </div>
        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="body-01-regular">Fecha de envío</h2>
            <div className="inline-grid grid-cols-3 gap-4">
              {" "}
              {dates.map((d, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedDate(i)}
                  className={`body-02-semibold flex flex-col items-center justify-between space-y-1 border w-[80px] h-[88px] p-2 text-left ${
                    selectedDate === i
                      ? "ring-2 ring-border-primary-default"
                      : "border-border-primary-default"
                  }`}
                >
                  <p className="body-01-semibold">{d.formattedDate}</p>
                  <p className="body-02-regular text-text-secondary-default capitalize">
                    {d.label}
                  </p>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="body-01-regular">Rango horario de envío</h2>
            <RadioGroup
              value={timeRange}
              onValueChange={setTimeRange}
              className="gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="10hs a 13hs" id="time-morning" />
                <label htmlFor="time-morning" className="body-02-regular">
                  10hs a 13hs
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="17hs a 20hs" id="time-evening" />
                <label htmlFor="time-evening" className="body-02-regular">
                  17hs a 20hs
                </label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <Button onClick={handleConfirm} size="lg" className="w-full">
          Confirmar
        </Button>
      </div>
    </div>
  );
}
