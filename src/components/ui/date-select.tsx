"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUpIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { getDaysInMonth } from "@/lib/date-utils";

const POPOVER_ESTIMATED_HEIGHT = 280;

interface DateSelectProps {
  value: Date | undefined;
  onChange: (date: Date) => void;
  error?: string;
  label?: string;
  required?: boolean;
}

export function DateSelect({
  value,
  onChange,
  error,
  label = "Ngày sinh",
  required = false,
}: DateSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dayRef = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [popoverPosition, setPopoverPosition] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
    placement: "top" | "bottom";
  } | null>(null);

  const updatePopoverPosition = useCallback(() => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const placement =
      spaceBelow < POPOVER_ESTIMATED_HEIGHT && spaceAbove > spaceBelow
        ? "top"
        : "bottom";

    setPopoverPosition({
      left: rect.left,
      width: rect.width,
      placement,
      ...(placement === "bottom"
        ? { top: rect.bottom + 4 }
        : { bottom: window.innerHeight - rect.top + 4 }),
    });
  }, []);

  // Initialize client-side state
  useEffect(() => {
    setIsClient(true);
  }, []);

  const currentYear = isClient ? new Date().getFullYear() : 2024;
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const selectedDate = useMemo(() => {
    if (isClient) {
      return value || new Date();
    }
    return value || new Date(2024, 0, 1); // Default date for SSR
  }, [value, isClient]);

  const days = Array.from(
    { length: getDaysInMonth(selectedDate.getFullYear(), selectedDate.getMonth() + 1) },
    (_, i) => i + 1,
  );

  const scrollToCenter = (element: HTMLElement, container: HTMLElement) => {
    const elementRect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const scrollOffset =
      elementRect.top +
      elementRect.height / 2 -
      (containerRect.top + containerRect.height / 2);

    container.scrollBy({
      top: scrollOffset,
      behavior: "smooth",
    });
  };

  const handleSelect = (type: "day" | "month" | "year", val: number) => {
    if (!isClient) return;

    const year = type === "year" ? val : selectedDate.getFullYear();
    const month = type === "month" ? val : selectedDate.getMonth() + 1;
    const day = type === "day"
      ? val
      : Math.min(selectedDate.getDate(), getDaysInMonth(year, month));
    const newDate = new Date(selectedDate);
    newDate.setFullYear(year, month - 1, day);
    onChange(newDate);

    // Scroll to center after selection
    setTimeout(() => {
      const selectedElement = document.querySelector(`[data-${type}="${val}"]`);
      const containerRef =
        type === "day" ? dayRef : type === "month" ? monthRef : yearRef;

      if (selectedElement && containerRef.current) {
        scrollToCenter(selectedElement as HTMLElement, containerRef.current);
      }
    }, 0);
  };

  // Initial scroll to selected values when opened
  useEffect(() => {
    if (isOpen && isClient) {
      setTimeout(() => {
        const containers = {
          day: { ref: dayRef.current, value: selectedDate.getDate() },
          month: { ref: monthRef.current, value: selectedDate.getMonth() + 1 },
          year: { ref: yearRef.current, value: selectedDate.getFullYear() },
        };

        Object.entries(containers).forEach(([type, { ref, value }]) => {
          const selectedElement = document.querySelector(
            `[data-${type}="${value}"]`
          );
          if (selectedElement && ref) {
            scrollToCenter(selectedElement as HTMLElement, ref);
          }
        });
      }, 0);
    }
  }, [isOpen, selectedDate, isClient]);

  useEffect(() => {
    if (!isOpen || !isClient) return;

    window.addEventListener("resize", updatePopoverPosition);
    window.addEventListener("scroll", updatePopoverPosition, true);

    return () => {
      window.removeEventListener("resize", updatePopoverPosition);
      window.removeEventListener("scroll", updatePopoverPosition, true);
    };
  }, [isOpen, isClient, updatePopoverPosition]);

  const handleToggle = () => {
    if (!isOpen) {
      updatePopoverPosition();
    }
    setIsOpen((open) => !open);
  };

  // Click outside handler
  useEffect(() => {
    if (!isClient) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        popoverRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, isClient]);

  return (
    <div className="relative">
      <label className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-1 text-red-400">*</span>}
      </label>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className={cn(
          "glass-control flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-foreground",
          "focus:outline-none focus:ring-2 focus:ring-primary/30",
          error && "border-red-500"
        )}
      >
        <span>
          {isClient
            ? selectedDate.toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            : "Đang tải..."}
        </span>
        {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </button>

      {isClient &&
        createPortal(
          <AnimatePresence>
            {isOpen && popoverPosition && (
              <motion.div
                ref={popoverRef}
                initial={{
                  opacity: 0,
                  y: popoverPosition.placement === "bottom" ? -10 : 10,
                }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  y: popoverPosition.placement === "bottom" ? -10 : 10,
                }}
                style={{
                  position: "fixed",
                  top: popoverPosition.top,
                  bottom: popoverPosition.bottom,
                  left: popoverPosition.left,
                  width: popoverPosition.width,
                }}
                className="z-[9998] glass-overlay rounded-md text-foreground"
              >
                <div className="grid grid-cols-3 p-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground/70">
                      Ngày
                    </label>
                    <div
                      ref={dayRef}
                      className="max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-black/20"
                    >
                      {days.map((day) => (
                        <motion.button
                          key={day}
                          data-day={day}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelect("day", day)}
                          className={cn(
                            "w-full rounded-md px-2 py-1 text-sm text-foreground",
                            isClient && selectedDate.getDate() === day
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-primary/5"
                          )}
                        >
                          {day}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground/70">
                      Tháng
                    </label>
                    <div
                      ref={monthRef}
                      className="max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-black/20"
                    >
                      {months.map((month) => (
                        <motion.button
                          key={month}
                          data-month={month}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelect("month", month)}
                          className={cn(
                            "w-full rounded-md px-2 py-1 text-sm text-foreground",
                            isClient && selectedDate.getMonth() + 1 === month
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-primary/5"
                          )}
                        >
                          {month}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground/70">
                      Năm
                    </label>
                    <div
                      ref={yearRef}
                      className="max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-black/20"
                    >
                      {years.map((year) => (
                        <motion.button
                          key={year}
                          data-year={year}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelect("year", year)}
                          className={cn(
                            "w-full rounded-md px-2 py-1 text-sm text-foreground",
                            isClient && selectedDate.getFullYear() === year
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-primary/5"
                          )}
                        >
                          {year}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-2 border-t border-primary/10">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-brand-hover animate-buttonheartbeat transition-colors"
                  >
                    OK
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
