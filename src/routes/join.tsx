import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { eventsApi, registrationsApi } from "@/lib/api/services";
import type { CustomField, Interest, RegistrationInput } from "@/lib/api/types";
import { Container, PageHero } from "@/components/site/kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/join")({
  validateSearch: z.object({ event: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Join the CP Club � Marwadi University" },
      { name: "description", content: "Register for the Competitive Programming Club or an upcoming event." },
      { property: "og:title", content: "Join the Competitive Programming Club" },
      { property: "og:description", content: "Become a member of the CP Club, ICT Department, Marwadi University." },
    ],
  }),
  component: Join,
});

const INTERESTS: Interest[] = ["Competitive Programming", "Web Dev", "Game Dev / Unity", "Git / Open Source"];
const url = z.string().trim().url("Enter a full URL").max(200).optional().or(z.literal(""));

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(100),
  enrollment: z.string().trim().min(4, "Enter your enrollment number").max(30),
  department: z.string().min(1, "Select your department"),
  semester: z.string().min(1, "Select your semester"),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().regex(/^[+]?[0-9 ]{10,15}$/, "Enter a valid phone number"),
  leetcode: url, hackerrank: url, github: url, codeforces: url,
  interest: z.enum(INTERESTS as [Interest, ...Interest[]]),
  reason: z.string().trim().min(20, "Tell us a bit more (20+ characters)").max(1000),
});

const STEPS = [
  { t: "About you", f: ["name", "enrollment", "department", "semester"] },
  { t: "Contact", f: ["email", "phone"] },
  { t: "Coding profiles", f: ["leetcode", "hackerrank", "github", "codeforces"] },
  { t: "Motivation", f: ["interest", "reason"] },
] as const;

type Form = Omit<RegistrationInput, "eventId">;
const EMPTY: Form = { name: "", enrollment: "", department: "", semester: "", email: "", phone: "", leetcode: "", hackerrank: "", github: "", codeforces: "", interest: "Competitive Programming", reason: "" };

function Join() {
  const { event } = Route.useSearch();
  const { data: ev } = useQuery({ queryKey: ["events"], queryFn: () => eventsApi.list(), select: (l) => l.find((e) => e.id === event) });
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [customResponses, setCustomResponses] = useState<Record<string, string | boolean | number>>({});
  const [customErrors, setCustomErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  // Custom fields from the event (only when registering for a specific event)
  const customFields: CustomField[] = (ev?.customFields ?? []);
  // Steps: always show base 4 steps, plus a custom fields step if there are any
  const hasCustomStep = customFields.length > 0;
  const totalSteps = STEPS.length + (hasCustomStep ? 1 : 0);

  const set = (k: keyof Form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const validate = (fields: readonly string[]) => {
    const r = schema.safeParse(form);
    if (r.success) return true;
    const errs: Record<string, string> = {};
    r.error.issues.forEach((i) => {
      const k = String(i.path[0]);
      if (fields.includes(k) && !errs[k]) errs[k] = i.message;
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateCustom = () => {
    const errs: Record<string, string> = {};
    for (const f of customFields) {
      if (f.required) {
        const val = customResponses[f.id];
        if (val === undefined || val === "" || val === false) {
          errs[f.id] = `${f.label} is required`;
        }
      }
    }
    setCustomErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => {
    if (step < STEPS.length) {
      // Base form step
      if (validate(STEPS[step]!.f)) setStep((s) => s + 1);
    } else {
      // Custom fields step
      if (validateCustom()) setStep((s) => s + 1);
    }
  };

  const submit = async () => {
    // Validate all base fields
    if (!validate(STEPS.flatMap((s) => s.f))) return;
    // Validate custom fields if on last step
    if (hasCustomStep && !validateCustom()) return;
    setBusy(true);
    try {
      await registrationsApi.submit({ ...form, eventId: event, customResponses: Object.keys(customResponses).length > 0 ? customResponses : undefined });
      setDone(true);
      toast.success("Registration submitted!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const isLastStep = step === totalSteps - 1;

  return (
    <>
      <PageHero eyebrow="Join / Registration" title={ev ? <>Register for <span className="text-brand">{ev.title}</span></> : <>Join the <span className="text-brand">CP Club</span>.</>} sub="Takes about two minutes." />
      <Container className="max-w-3xl py-12">
        {done ? (
          <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
            <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
            <h2 className="mt-4 text-2xl font-bold text-navy">You're in the queue, {form.name.split(" ")[0]}!</h2>
            <p className="mt-2 text-muted-foreground">The core committee will review your registration and reach out at {form.email}.</p>
            <div className="mt-6 flex justify-center gap-3">
              <Link to="/events" className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground">Explore events</Link>
              <Link to="/monthly-contest" className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-navy">Monthly Contest</Link>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-10">
            {/* Step indicators */}
            <ol className="mb-8 grid gap-2" style={{ gridTemplateColumns: `repeat(${totalSteps}, 1fr)` }}>
              {[...STEPS.map((s) => s.t), ...(hasCustomStep ? ["Event Info"] : [])].map((label, i) => (
                <li key={label}>
                  <div className={cn("h-1.5 rounded-full", i <= step ? "bg-brand" : "bg-muted")} />
                  <p className={cn("mt-2 hidden text-xs sm:block", i === step ? "font-semibold text-navy" : "text-muted-foreground")}>{label}</p>
                </li>
              ))}
            </ol>

            <div className="grid gap-5 sm:grid-cols-2">
              {step === 0 && (
                <>
                  <Field label="Student Name" err={errors["name"]}><input className={inp} value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
                  <Field label="Enrollment Number" err={errors["enrollment"]}><input className={inp} value={form.enrollment} onChange={(e) => set("enrollment", e.target.value)} /></Field>
                  <Field label="Department" err={errors["department"]}>
                    <select className={inp} value={form.department} onChange={(e) => set("department", e.target.value)}>
                      <option value="">Select...</option>
                      {["ICT", "Computer Engineering", "Information Technology", "Other"].map((d) => <option key={d}>{d}</option>)}
                    </select>
                  </Field>
                  <Field label="Semester" err={errors["semester"]}>
                    <select className={inp} value={form.semester} onChange={(e) => set("semester", e.target.value)}>
                      <option value="">Select...</option>
                      {Array.from({ length: 8 }, (_, i) => <option key={i}>Semester {i + 1}</option>)}
                    </select>
                  </Field>
                </>
              )}
              {step === 1 && (
                <>
                  <Field label="Email Address" err={errors["email"]}><input type="email" className={inp} value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
                  <Field label="Phone / WhatsApp" err={errors["phone"]}><input className={inp} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 ..." /></Field>
                </>
              )}
              {step === 2 && (
                <>
                  {(["leetcode", "hackerrank", "github", "codeforces"] as const).map((k) => (
                    <Field key={k} label={`${k.charAt(0).toUpperCase() + k.slice(1)} URL (optional)`} err={errors[k]}>
                      <input className={inp} value={form[k]} onChange={(e) => set(k, e.target.value)} placeholder="https://" />
                    </Field>
                  ))}
                </>
              )}
              {step === 3 && (
                <>
                  <div className="sm:col-span-2">
                    <p className="mb-2 text-sm font-medium text-navy">Primary interest</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {INTERESTS.map((i) => (
                        <button type="button" key={i} onClick={() => set("interest", i)} className={cn("rounded-xl border px-4 py-3 text-left text-sm font-medium", form.interest === i ? "border-primary bg-cyan-soft text-navy" : "border-border text-muted-foreground")}>{i}</button>
                      ))}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <Field label="Why do you want to join the CP Club?" err={errors["reason"]}>
                      <textarea rows={5} className={inp} value={form.reason} onChange={(e) => set("reason", e.target.value)} />
                    </Field>
                  </div>
                </>
              )}

              {/* Custom fields step (step === STEPS.length) */}
              {hasCustomStep && step === STEPS.length && (
                <>
                  <div className="sm:col-span-2">
                    <p className="mb-4 text-sm font-medium text-navy">Additional information for {ev?.title}</p>
                  </div>
                  {customFields.map((cf) => (
                    <CustomFieldInput
                      key={cf.id}
                      field={cf}
                      value={customResponses[cf.id]}
                      error={customErrors[cf.id]}
                      onChange={(val) => {
                        setCustomResponses((r) => ({ ...r, [cf.id]: val }));
                        setCustomErrors((e) => ({ ...e, [cf.id]: "" }));
                      }}
                    />
                  ))}
                </>
              )}
            </div>

            <div className="mt-8 flex justify-between">
              <button disabled={step === 0} onClick={() => setStep((s) => s - 1)} className="rounded-full border border-border px-5 py-2.5 text-sm font-medium disabled:opacity-40">Back</button>
              {!isLastStep ? (
                <button onClick={next} className="rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-primary-foreground">Continue</button>
              ) : (
                <button onClick={submit} disabled={busy} className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">{busy ? "Submitting..." : "Submit registration"}</button>
              )}
            </div>
          </div>
        )}
      </Container>
    </>
  );
}

const inp = "w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-navy outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";
function Field({ label, err, children }: { label: string; err?: string | undefined; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-navy">{label}</span>
      {children}
      {err && <span className="mt-1 block text-xs text-destructive">{err}</span>}
    </label>
  );
}

// Renders a single custom field on the public registration form
function CustomFieldInput({
  field, value, error, onChange,
}: {
  field: CustomField;
  value: string | boolean | number | undefined;
  error?: string | undefined;
  onChange: (val: string | boolean | number) => void;
}) {
  const label = field.required ? `${field.label} *` : field.label;
  const colSpan = field.type === "textarea" ? "sm:col-span-2" : "";

  if (field.type === "checkbox") {
    return (
      <div className={cn("block", colSpan)}>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
          />
          <span className="text-sm font-medium text-navy">{label}</span>
        </label>
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className={cn("block", colSpan)}>
        <Field label={label} err={error}>
          <select className={inp} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>
            <option value="">Select...</option>
            {(field.options ?? []).map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </Field>
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className={cn("block", colSpan)}>
        <Field label={label} err={error}>
          <textarea
            rows={4}
            className={inp}
            placeholder={field.placeholder ?? ""}
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
          />
        </Field>
      </div>
    );
  }

  return (
    <div className={cn("block", colSpan)}>
      <Field label={label} err={error}>
        <input
          type={field.type === "number" ? "number" : "text"}
          className={inp}
          placeholder={field.placeholder ?? ""}
          value={String(value ?? "")}
          onChange={(e) => onChange(field.type === "number" ? Number(e.target.value) : e.target.value)}
        />
      </Field>
    </div>
  );
}
