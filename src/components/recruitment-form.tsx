"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formCardClassName } from "@/components/ui/form-card";
import Input from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateSelect } from "@/components/ui/date-select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { RecruitmentSuccessModal } from "@/components/recruitment-success-modal";
import { toast } from "@/hooks/use-toast";
import {
  type RecruitmentFormData,
  recruitmentSchema,
} from "@/schemas/recruitment.schema";
import { GENDERS, POSITIONS, WORK_SHIFTS } from "@/lib/recruitment-utils";
import type {
  CurrentStatus,
  Gender,
  Position,
  WorkShift,
} from "@/types/recruitment";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";

function parseDdMmYyyy(value: string): Date | undefined {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return undefined;
  const [d, m, y] = value.split("/").map(Number);
  const date = new Date(y, m - 1, d);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return undefined;
  }
  return date;
}

const STATUS_OPTIONS: { value: CurrentStatus; label: string }[] = [
  { value: "student", label: "Sinh viên / đang học" },
  { value: "working", label: "Đang đi làm" },
  { value: "other", label: "Khác" },
];

export function RecruitmentForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLockedRef = useRef(false);
  const [isClient, setIsClient] = useState(false);
  const [defaultBirthDate, setDefaultBirthDate] = useState<Date | null>(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successApplicantName, setSuccessApplicantName] = useState("");

  useEffect(() => {
    setIsClient(true);
    const date = new Date();
    date.setFullYear(date.getFullYear() - 21);
    setDefaultBirthDate(date);
  }, []);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    trigger,
    formState: { errors },
  } = useForm<RecruitmentFormData>({
    resolver: zodResolver(recruitmentSchema),
    defaultValues: {
      fullName: "",
      birthDate: "",
      gender: "",
      phone: "",
      email: "",
      socialMedia: "",
      currentStatus: "",
      otherStatus: "",
      position: [],
      workShifts: [],
      note: "",
    },
  });

  useEffect(() => {
    if (!isClient || !defaultBirthDate) return;
    const raw = getValues("birthDate");
    if (!raw?.trim()) {
      setValue("birthDate", format(defaultBirthDate, "dd/MM/yyyy"), {
        shouldValidate: true,
      });
    }
  }, [isClient, defaultBirthDate, getValues, setValue]);

  const currentStatus = watch("currentStatus");
  const selectedPositions = watch("position") ?? [];
  const selectedShifts = watch("workShifts") ?? [];
  const workShiftKeys = Object.keys(WORK_SHIFTS) as WorkShift[];
  const allWorkShiftsSelected =
    workShiftKeys.length > 0 &&
    workShiftKeys.every((k) => selectedShifts.includes(k));

  const toggleInArray = (
    field: "position" | "workShifts",
    value: string,
    current: string[],
  ) => {
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setValue(field, next, { shouldValidate: true });
  };

  const onSubmit = async (data: RecruitmentFormData) => {
    if (submitLockedRef.current) return;
    submitLockedRef.current = true;
    setIsSubmitting(true);
    try {
      const { email, note, ...rest } = data;
      const payload = {
        ...rest,
        email: email?.trim() || null,
        note: (note ?? "").trim(),
      };

      const response = await fetch("/api/recruitment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        const msg =
          typeof result.error === "string"
            ? result.error
            : "Không thể gửi đơn. Vui lòng kiểm tra lại thông tin.";
        throw new Error(msg);
      }

      const submittedName = data.fullName.trim();
      setSuccessApplicantName(submittedName);
      setSuccessModalOpen(true);

      setValue("fullName", "");
      setValue(
        "birthDate",
        defaultBirthDate ? format(defaultBirthDate, "dd/MM/yyyy") : "",
      );
      setValue("gender", "");
      setValue("phone", "");
      setValue("email", "");
      setValue("socialMedia", "");
      setValue("currentStatus", "");
      setValue("otherStatus", "");
      setValue("position", []);
      setValue("workShifts", []);
      setValue("note", "");
    } catch (e) {
      toast({
        title: "Gửi đơn không thành công",
        description: e instanceof Error ? e.message : "Đã có lỗi xảy ra.",
        variant: "destructive",
      });
    } finally {
      submitLockedRef.current = false;
      setIsSubmitting(false);
    }
  };

  const closeSuccessModal = useCallback(() => {
    setSuccessModalOpen(false);
    setSuccessApplicantName("");
  }, []);

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={formCardClassName}
        noValidate
        aria-busy={isSubmitting}
      >
        <h3 className="card-title mb-2">
          Đơn ứng tuyển
        </h3>
        <p className="body-copy mb-6">
          Vui lòng điền đầy đủ thông tin. Dữ liệu chỉ dùng cho mục đích tuyển
          dụng và được bảo mật theo chính sách của Jozo.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Input
              label="Họ và tên"
              required
              autoComplete="name"
              {...register("fullName")}
              error={errors.fullName?.message}
            />
          </div>

          <div className="mb-4">
            <Controller
              control={control}
              name="birthDate"
              render={({ field }) =>
                isClient && defaultBirthDate ? (
                  <DateSelect
                    value={parseDdMmYyyy(field.value) ?? defaultBirthDate}
                    onChange={(d) => {
                      field.onChange(format(d, "dd/MM/yyyy"));
                      void trigger("birthDate");
                    }}
                    error={errors.birthDate?.message}
                    label="Ngày sinh"
                    required
                  />
                ) : (
                  <div className="w-full rounded-xl border border-border bg-muted px-3 py-2.5 text-sm text-muted-foreground">
                    Đang tải...
                  </div>
                )
              }
            />
          </div>

          <Input
            label="Số điện thoại"
            required
            placeholder="0912345678"
            {...register("phone")}
            error={errors.phone?.message}
          />

          <div className="md:col-span-2">
            <Label className="mb-2 block text-foreground">
              Giới tính <span className="text-red-600">*</span>
            </Label>
            <RadioGroup
              value={watch("gender")}
              onValueChange={(v) =>
                setValue("gender", v as Gender, { shouldValidate: true })
              }
              className="flex flex-wrap gap-4"
            >
              {(Object.keys(GENDERS) as Gender[]).map((key) => (
                <div key={key} className="flex items-center gap-2">
                  <RadioGroupItem value={key} id={`gender-${key}`} />
                  <Label
                    htmlFor={`gender-${key}`}
                    className="cursor-pointer font-normal text-foreground/80"
                  >
                    {GENDERS[key]}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {errors.gender?.message ? (
              <p className="mt-1 text-sm text-red-600">
                {errors.gender.message}
              </p>
            ) : null}
          </div>

          <Input
            label="Email (không bắt buộc)"
            type="email"
            autoComplete="email"
            {...register("email")}
            error={errors.email?.message}
          />

          <div className="md:col-span-2">
            <Input
              label="Facebook / Zalo (đường link hoặc tên hiển thị)"
              required
              {...register("socialMedia")}
              error={errors.socialMedia?.message}
            />
          </div>

          <div className="md:col-span-2">
            <Label className="mb-2 block text-foreground">
              Tình trạng hiện tại <span className="text-red-600">*</span>
            </Label>
            <RadioGroup
              value={currentStatus}
              onValueChange={(v) =>
                setValue("currentStatus", v as CurrentStatus, {
                  shouldValidate: true,
                })
              }
              className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-6"
            >
              {STATUS_OPTIONS.map((opt) => (
                <div key={opt.value} className="flex items-center gap-2">
                  <RadioGroupItem
                    value={opt.value}
                    id={`status-${opt.value}`}
                  />
                  <Label
                    htmlFor={`status-${opt.value}`}
                    className="cursor-pointer font-normal text-foreground/80"
                  >
                    {opt.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {errors.currentStatus?.message ? (
              <p className="mt-1 text-sm text-red-600">
                {errors.currentStatus.message}
              </p>
            ) : null}
          </div>

          {currentStatus === "other" ? (
            <div className="md:col-span-2">
              <Input
                label="Mô tả ngắn gọn"
                required
                {...register("otherStatus")}
                error={errors.otherStatus?.message}
              />
            </div>
          ) : null}

          <div className="md:col-span-2">
            <Label className="mb-2 block text-foreground">
              Vị trí mong muốn <span className="text-red-600">*</span> (có thể
              chọn nhiều vị trí)
            </Label>
            <div className="space-y-2">
              {(Object.keys(POSITIONS) as Position[]).map((key) => (
                <div key={key} className="flex items-center gap-2">
                  <Checkbox
                    id={`pos-${key}`}
                    checked={selectedPositions.includes(key)}
                    onCheckedChange={() =>
                      toggleInArray("position", key, selectedPositions)
                    }
                  />
                  <Label
                    htmlFor={`pos-${key}`}
                    className="cursor-pointer font-normal text-foreground/80"
                  >
                    {POSITIONS[key]}
                  </Label>
                </div>
              ))}
            </div>
            {errors.position?.message ? (
              <p className="mt-1 text-sm text-red-600">
                {errors.position.message}
              </p>
            ) : null}
          </div>

          <div className="md:col-span-2">
            <Label className="mb-2 block text-foreground">
              Ca làm có thể nhận <span className="text-red-600">*</span>
            </Label>
            <div className="space-y-2">
              {workShiftKeys.map((key) => (
                <div key={key} className="flex items-center gap-2">
                  <Checkbox
                    id={`shift-${key}`}
                    checked={selectedShifts.includes(key)}
                    onCheckedChange={() =>
                      toggleInArray("workShifts", key, selectedShifts)
                    }
                  />
                  <Label
                    htmlFor={`shift-${key}`}
                    className="cursor-pointer font-normal text-foreground/80"
                  >
                    {WORK_SHIFTS[key]}
                  </Label>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="shift-all-three"
                  checked={allWorkShiftsSelected}
                  onCheckedChange={(checked) => {
                    if (checked === true) {
                      setValue(
                        "workShifts",
                        [...new Set([...selectedShifts, ...workShiftKeys])],
                        { shouldValidate: true },
                      );
                    } else {
                      setValue(
                        "workShifts",
                        selectedShifts.filter(
                          (s) => !workShiftKeys.includes(s as WorkShift),
                        ),
                        { shouldValidate: true },
                      );
                    }
                  }}
                />
                <Label
                  htmlFor="shift-all-three"
                  className="cursor-pointer font-normal text-primary/80"
                >
                  Cả 3 ca
                </Label>
              </div>
            </div>
            {errors.workShifts?.message ? (
              <p className="mt-1 text-sm text-red-600">
                {errors.workShifts.message}
              </p>
            ) : null}
          </div>

          <div className="md:col-span-2">
            <Label
              htmlFor="recruitment-note"
              className="mb-2 block text-foreground"
            >
              Ghi chú thêm{" "}
              <span className="font-normal text-primary/55">
                (không bắt buộc)
              </span>
            </Label>
            <textarea
              id="recruitment-note"
              rows={4}
              placeholder=""
              className="w-full resize-y rounded-xl glass-control px-3 py-2.5 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-foreground/50 focus:border-primary/25 focus:ring-2 focus:ring-primary/15"
              {...register("note")}
              aria-invalid={errors.note ? true : undefined}
            />
            {errors.note?.message ? (
              <p className="mt-1 text-sm text-red-600">{errors.note.message}</p>
            ) : null}
          </div>
        </div>

        <div className="mt-8 flex justify-end border-t border-primary/10 pt-6">
          <Button
            type="submit"
            disabled={isSubmitting}
            aria-disabled={isSubmitting}
            size="lg"
          >
            {isSubmitting ? "Đang gửi…" : "Gửi đơn ứng tuyển"}
          </Button>
        </div>
      </form>
      <RecruitmentSuccessModal
        isOpen={successModalOpen}
        applicantName={successApplicantName}
        onClose={closeSuccessModal}
      />
    </>
  );
}
