import { useId, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

function dateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function localToday() {
  return dateKey(new Date());
}

function fromKey(value: string) {
  return new Date(value + "T00:00:00");
}

export function nextBookingDay(value: string) {
  const date = fromKey(value);
  date.setDate(date.getDate() + 1);
  return dateKey(date);
}

type BookingDateFieldProps = {
  label: string;
  value: string;
  min: string;
  onChange: (value: string) => void;
  isVi: boolean;
  compact?: boolean;
};

export default function BookingDateField({
  label, value, min, onChange, isVi, compact,
}: BookingDateFieldProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => fromKey(min));
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const first = new Date(year, monthIndex, 1);
  const days = new Date(year, monthIndex + 1, 0).getDate();
  const offset = (first.getDay() + 6) % 7;
  const locale = isVi ? "vi-VN" : "en-GB";
  const heading = first.toLocaleDateString(locale, { month: "long", year: "numeric" });

  return (
    <div
      className="relative min-w-0"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.preventDefault();
          document.getElementById(id)?.focus();
          setOpen(false);
        }
      }}
    >
      <button
        id={id}
        type="button"
        aria-expanded={open}
        aria-controls={open ? id + "-calendar" : undefined}
        className={compact
          ? "flex min-h-12 w-full items-center gap-2 rounded-lg border border-[#e2e5e2] px-3 text-left lg:rounded-none lg:border-0 lg:border-r lg:px-0 lg:pr-3"
          : "flex min-h-12 w-full items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 text-left"}
        onClick={() => {
          if (!open) setMonth(fromKey(value >= min ? value : min));
          setOpen(!open);
        }}
      >
        <CalendarDays size={20} className="shrink-0" aria-hidden="true" />
        <span>
          <span className="block text-xs font-medium text-neutral-600">{label}</span>
          <span className="block text-sm font-semibold text-slate-900">
            {value ? value.split("-").reverse().join("/") : "dd/mm/yyyy"}
          </span>
        </span>
      </button>
      {open && (
        <div
          id={id + "-calendar"}
          role="group"
          aria-label={label}
          className="relative z-30 mt-1 w-full rounded-xl border border-neutral-200 bg-white shadow-lg sm:absolute sm:w-[22rem] sm:max-w-[calc(100vw-2rem)]"
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="grid size-12 place-items-center disabled:opacity-30"
              aria-label={isVi ? "Tháng trước" : "Previous month"}
              disabled={dateKey(new Date(year, monthIndex, 0)) < min}
              onClick={() => setMonth(new Date(year, monthIndex - 1, 1))}
            >
              <ChevronLeft size={18} />
            </button>
            <span aria-live="polite" className="text-center text-sm font-semibold">{heading}</span>
            <button
              type="button"
              className="grid size-12 place-items-center"
              aria-label={isVi ? "Tháng sau" : "Next month"}
              onClick={() => setMonth(new Date(year, monthIndex + 1, 1))}
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="grid grid-cols-7 text-center">
            {(isVi ? ["T2", "T3", "T4", "T5", "T6", "T7", "CN"] : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]).map((day) => (
              <span key={day} className="pb-1 text-xs text-neutral-600">{day}</span>
            ))}
            {Array.from({ length: offset }, (_, index) => <span key={index} />)}
            {Array.from({ length: days }, (_, index) => {
              const date = new Date(year, monthIndex, index + 1);
              const key = dateKey(date);
              return (
                <button
                  key={key}
                  type="button"
                  data-date={key}
                  aria-label={date.toLocaleDateString(locale, { dateStyle: "full" })}
                  aria-pressed={key === value}
                  disabled={key < min}
                  className="!min-w-0 rounded-md py-2 text-sm hover:bg-slate-100 disabled:text-neutral-400 aria-pressed:bg-slate-900 aria-pressed:text-white"
                  onClick={() => {
                    onChange(key);
                    document.getElementById(id)?.focus();
                    setOpen(false);
                  }}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
