"use client";

import {
  jozoServices,
  jozoServicesFaq,
  jozoVenue,
  type JozoService,
  type JozoServiceId,
} from "@/data/services";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Dices,
  Gamepad2,
  MapPin,
  Mic2,
  MonitorPlay,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const serviceIcons: Record<JozoServiceId, typeof Mic2> = {
  "music-box": Mic2,
  netflix: MonitorPlay,
  "nintendo-switch": Gamepad2,
  "board-game": Dices,
};

const serviceAccent: Record<
  JozoServiceId,
  { ring: string; glow: string; badge: string; gradient: string }
> = {
  "music-box": {
    ring: "group-hover:ring-white/30",
    glow: "from-red-500/20 via-rose-400/10 to-transparent",
    badge: "bg-white/15 text-white ring-white/20",
    gradient: "from-[#1a0a0c] via-[#2a1018] to-[#0f1118]",
  },
  netflix: {
    ring: "group-hover:ring-rose-200/80",
    glow: "from-rose-600/25 via-red-500/10 to-transparent",
    badge: "bg-rose-50 text-rose-950 ring-rose-100",
    gradient: "from-[#1a080c] via-[#2a0c14] to-[#0b0c12]",
  },
  "nintendo-switch": {
    ring: "group-hover:ring-violet-200/80",
    glow: "from-violet-500/20 via-indigo-400/10 to-transparent",
    badge: "bg-violet-50 text-violet-900 ring-violet-100",
    gradient: "from-[#0f1020] via-[#151530] to-[#0b0c12]",
  },
  "board-game": {
    ring: "group-hover:ring-amber-200/80",
    glow: "from-amber-500/20 via-orange-400/10 to-transparent",
    badge: "bg-amber-50 text-amber-950 ring-amber-100",
    gradient: "from-[#14110a] via-[#1f180d] to-[#0b0c12]",
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

function ServiceCard({
  service,
  index,
  reducedMotion,
}: {
  service: JozoService;
  index: number;
  reducedMotion: boolean;
}) {
  const Icon = serviceIcons[service.id];
  const accent = serviceAccent[service.id];
  const isFeatured = service.id === "music-box";

  return (
    <motion.article
      id={service.id}
      initial={reducedMotion ? false : "hidden"}
      whileInView={reducedMotion ? undefined : "visible"}
      viewport={{ once: true, margin: "-60px" }}
      variants={fadeUp}
      transition={{
        duration: 0.55,
        delay: index * 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0f1118] text-white shadow-xl ${
        isFeatured ? "md:col-span-2 md:row-span-1" : ""
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent.gradient} opacity-90`}
      />
      <div
        className={`pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br ${accent.glow} blur-2xl transition-transform duration-700 group-hover:scale-125`}
      />

      <div className="relative flex h-full flex-col p-6 sm:p-7">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div
            className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${accent.badge} shadow-sm transition-transform duration-300 group-hover:-translate-y-0.5`}
          >
            <Icon className="h-6 w-6" aria-hidden />
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/70">
            0{index + 1}
          </span>
        </div>

        <h2 className="text-2xl font-bold tracking-tight">{service.title}</h2>
        <p className="mt-1 text-sm font-medium text-white/65">
          {service.tagline}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-white/78 sm:text-[15px]">
          {service.summary}
        </p>

        <ul className="mt-5 space-y-2.5">
          {service.highlights.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2.5 text-sm text-white/72"
            >
              <Sparkles
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/45"
                aria-hidden
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 pt-2">
          <Link
            href={service.bookingHref}
            className={`inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/25 hover:bg-white/15 hover:-translate-y-0.5 ring-1 ring-transparent ${accent.ring}`}
          >
            {service.bookingLabel}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

function FaqItem({
  question,
  answer,
  index,
  reducedMotion,
}: {
  question: string;
  answer: string;
  index: number;
  reducedMotion: boolean;
}) {
  const [open, setOpen] = useState(index === 0);

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 16 }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      className="glass-surface overflow-hidden rounded-2xl"
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-foreground transition-colors hover:bg-white/5"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-foreground sm:text-base">
          {question}
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="glass-control flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-lg leading-none text-foreground"
          aria-hidden
        >
          +
        </motion.span>
      </button>
      <motion.div
        initial={false}
        animate={{
          height: open ? "auto" : 0,
          opacity: open ? 1 : 0,
        }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden"
      >
        <p className="px-5 pb-4 text-sm leading-relaxed text-foreground/80">
          {answer}
        </p>
      </motion.div>
    </motion.div>
  );
}

export default function AboutServicesPage() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="pb-12 sm:pb-16">
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, x: -12 }}
        animate={reducedMotion ? undefined : { opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Link
          href="/"
          className="back-link"
        >
          <ArrowLeft aria-hidden />
          Quay lại trang chủ
        </Link>
      </motion.div>

      {/* Hero */}
      <section className="relative mb-10 overflow-hidden rounded-3xl border border-primary/15 bg-[#0b0c12] text-white shadow-2xl sm:mb-14">
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            className="absolute -left-16 top-8 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(220,38,38,0.35),transparent_70%)] blur-2xl"
            animate={
              reducedMotion
                ? undefined
                : { x: [0, 18, 0], y: [0, -12, 0], scale: [1, 1.08, 1] }
            }
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -right-10 bottom-0 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.22),transparent_70%)] blur-2xl"
            animate={
              reducedMotion
                ? undefined
                : { x: [0, -14, 0], y: [0, 10, 0], scale: [1, 1.05, 1] }
            }
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="relative px-6 py-10 sm:px-10 sm:py-14 md:py-16">
          <motion.div
            initial={reducedMotion ? false : "hidden"}
            animate={reducedMotion ? undefined : "visible"}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } },
            }}
            className="mx-auto max-w-3xl text-center"
          >
            <motion.span
              variants={fadeUp}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/75 backdrop-blur-sm"
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Box riêng tư all-in-one
            </motion.span>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="mt-5 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-5xl"
            >
              {jozoVenue.name}
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="mt-3 text-base text-white/70 sm:text-lg"
            >
              {jozoVenue.headline}
            </motion.p>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-white/62 sm:text-base"
            >
              {jozoVenue.intro}
            </motion.p>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 flex flex-wrap items-center justify-center gap-3"
            >
              <Link
                href="/#booking"
                className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_0_28px_rgba(220,38,38,0.35)] transition-transform hover:-translate-y-0.5 hover:bg-brand-hover"
              >
                Đặt phòng ngay
              </Link>
              <a
                href="https://maps.app.goo.gl/EY3WPsWzYbkaFQkZA"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/8 px-4 py-3 text-sm font-semibold text-white/90 backdrop-blur-sm transition-colors hover:bg-white/12"
              >
                <MapPin className="h-4 w-4" aria-hidden />
                {jozoVenue.address}
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <div className="glass-surface space-y-10 rounded-2xl p-5 sm:space-y-12 sm:p-8">
        {/* Services bento */}
        <section aria-labelledby="services-heading">
          <div className="mb-6 sm:mb-8">
            <h2
              id="services-heading"
              className="text-2xl font-bold text-foreground sm:text-3xl"
            >
              All-in-one tại JOZO
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-foreground/80 sm:text-base">
              Music box riêng tư, Netflix, Nintendo Switch và board game —
              all-in-one tại một chỗ. Theo dõi thời gian, thành viên, order trên
              tablet. Giá luôn minh bạch — không thuế, không phí dịch vụ.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 md:gap-5">
            {jozoServices.map((service, index) => (
              <ServiceCard
                key={service.id}
                service={service}
                index={index}
                reducedMotion={Boolean(reducedMotion)}
              />
            ))}
          </div>
        </section>

        {/* FAQ — SEO + UX */}
        <section aria-labelledby="faq-heading">
          <h2
            id="faq-heading"
            className="text-xl font-bold text-foreground sm:text-2xl"
          >
            Câu hỏi thường gặp
          </h2>
          <p className="mt-2 text-sm text-foreground/80">
            Thông tin nhanh về box riêng tư, giá minh bạch và dịch vụ tại JOZO
            Biên Hòa.
          </p>
          <div className="mt-5 space-y-3">
            {jozoServicesFaq.map((item, index) => (
              <FaqItem
                key={item.question}
                question={item.question}
                answer={item.answer}
                index={index}
                reducedMotion={Boolean(reducedMotion)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
