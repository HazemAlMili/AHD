import { useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  CircleHelp,
  Filter,
  Home,
  Menu,
  MessageCircle,
  Minus,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

type Screen =
  | "landing"
  | "form-1"
  | "form-2"
  | "thank-you"
  | "home"
  | "catalogue"
  | "profile"
  | "help";

type FormData = {
  city: string;
  home: string;
  need: string;
  language: string;
  timing: string;
  name: string;
  phone: string;
  note: string;
};

type Worker = {
  id: number;
  name: string;
  origin: string;
  experience: string;
  languages: string[];
  skills: string[];
  availability: string;
  color: string;
  initials: string;
  story: string;
};

const WHATSAPP_NUMBER = "966550000000";
const workers: Worker[] = [
  {
    id: 1,
    name: "مريم أ.",
    origin: "الفلبين",
    experience: "خبرة في رعاية الأطفال",
    languages: ["العربية الأساسية", "الإنجليزية"],
    skills: ["رعاية الأطفال", "تنظيم المنزل", "الطبخ المنزلي"],
    availability: "متاحة للتواصل",
    color: "#E4CFC0",
    initials: "م",
    story: "هادئة ومنظمة، تهتم بروتين الأطفال والتفاصيل اليومية للمنزل.",
  },
  {
    id: 2,
    name: "روث ن.",
    origin: "أوغندا",
    experience: "خبرة في شؤون المنزل",
    languages: ["الإنجليزية", "السواحيلية"],
    skills: ["تنظيم المنزل", "الغسيل", "الطبخ المنزلي"],
    availability: "متاحة للتواصل",
    color: "#C8D7D0",
    initials: "ر",
    story: "عملية ومرتبة، تحب أن يكون لكل شيء مكان واضح وروتين مريح.",
  },
  {
    id: 3,
    name: "ليلي ب.",
    origin: "سريلانكا",
    experience: "خبرة مع كبار السن",
    languages: ["العربية الأساسية", "الإنجليزية"],
    skills: ["رعاية كبار السن", "تنظيم المنزل", "الطبخ المنزلي"],
    availability: "يمكن ترتيب التواصل",
    color: "#D9D2B9",
    initials: "ل",
    story: "صبورة ولطيفة، لديها اهتمام خاص بالرفقة اليومية والوجبات المنزلية.",
  },
  {
    id: 4,
    name: "غلاديس ك.",
    origin: "كينيا",
    experience: "خبرة في رعاية الأطفال",
    languages: ["الإنجليزية"],
    skills: ["رعاية الأطفال", "الغسيل", "تنظيم المنزل"],
    availability: "متاحة للتواصل",
    color: "#D7C7D1",
    initials: "غ",
    story: "مبتسمة وموثوقة في العمل اليومي، وتحب الأعمال المنظمة خطوة بخطوة.",
  },
];

const initialForm: FormData = {
  city: "",
  home: "",
  need: "",
  language: "",
  timing: "",
  name: "",
  phone: "",
  note: "",
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function whatsappUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-3" dir="rtl">
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-[13px] text-lg font-bold",
          light ? "bg-[#E9DAB4] text-[#174B45]" : "bg-[#174B45] text-[#F3E7C4]",
        )}
      >
        خ
      </div>
      <div className={cn("leading-none", light ? "text-[#F7F4ED]" : "text-[#174B45]")}>
        <div className="text-[19px] font-bold tracking-[-.04em]">خادمتي</div>
        <div className={cn("mt-1 text-[10px] tracking-[.2em]", light ? "text-[#B6C8C0]" : "text-[#6F7F78]")}>
          KHADAMATY
        </div>
      </div>
    </div>
  );
}

function IconButton({ label, children, onClick }: { label: string; children: ReactNode; onClick: () => void }) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D6D9D1] bg-[#FBFAF6] text-[#174B45] transition hover:border-[#174B45] hover:bg-[#EEF3ED]"
    >
      {children}
    </button>
  );
}

function Header({
  screen,
  navigate,
  menuOpen,
  setMenuOpen,
  dark = false,
}: {
  screen: Screen;
  navigate: (next: Screen) => void;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  dark?: boolean;
}) {
  const links: Array<[string, Screen]> = [
    ["الرئيسية", "home"],
    ["اكتشف الخيارات", "catalogue"],
    ["كيف نساعدك؟", "help"],
  ];
  return (
    <header className={cn("relative z-30 px-5 py-5 md:px-10", dark ? "text-[#F7F4ED]" : "text-[#174B45]")}>
      <div className="mx-auto flex max-w-[1240px] items-center justify-between">
        <button onClick={() => navigate(dark ? "landing" : "home")} aria-label="العودة للرئيسية">
          <Logo light={dark} />
        </button>
        <nav className={cn("hidden items-center gap-8 text-[14px] font-medium md:flex", dark ? "text-[#C8D5CF]" : "text-[#5A6C65]")}>
          {links.map(([label, target]) => (
            <button
              key={target}
              onClick={() => navigate(target)}
              className={cn(
                "relative py-2 transition hover:text-[#D6B56D]",
                screen === target && "text-[#D6B56D]",
              )}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("help")}
            className={cn(
              "hidden rounded-full px-5 py-2.5 text-[13px] font-bold transition md:block",
              dark ? "border border-[#77958A] text-[#F7F4ED] hover:bg-[#315D55]" : "bg-[#174B45] text-[#F7F4ED] hover:bg-[#0F3B36]",
            )}
          >
            أحتاج مساعدة
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={cn("flex h-10 w-10 items-center justify-center rounded-full md:hidden", dark ? "border border-[#77958A]" : "border border-[#D6D9D1]")}
            aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
          >
            {menuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="absolute left-5 right-5 top-[76px] rounded-2xl border border-[#D5DDD4] bg-[#FBFAF6] p-3 text-[#174B45] shadow-[0_18px_50px_rgba(22,54,46,.12)] md:hidden">
          {links.map(([label, target]) => (
            <button
              key={target}
              onClick={() => {
                navigate(target);
                setMenuOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-right text-sm hover:bg-[#EEF3ED]"
            >
              {label}
              <ChevronLeft size={16} />
            </button>
          ))}
          <button onClick={() => { navigate("help"); setMenuOpen(false); }} className="mt-1 w-full rounded-xl bg-[#174B45] px-4 py-3 text-right text-sm font-bold text-[#F7F4ED]">
            أحتاج مساعدة
          </button>
        </div>
      )}
    </header>
  );
}

function Pill({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-medium", dark ? "bg-[#2B625A] text-[#D8E7DD]" : "bg-[#E8EFE7] text-[#376057]")}>
      {children}
    </span>
  );
}

function Footer({ navigate }: { navigate: (next: Screen) => void }) {
  return (
    <footer className="border-t border-[#DCE0D8] bg-[#EEF1E9] px-5 py-10 text-[#174B45] md:px-10">
      <div className="mx-auto flex max-w-[1240px] flex-col justify-between gap-8 md:flex-row md:items-end">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-7 text-[#64756E]">نساعدك تبدأ بخطوة واضحة، وتكمل التفاصيل بالطريقة التي تناسبك.</p>
        </div>
        <div className="flex flex-wrap gap-x-7 gap-y-3 text-sm text-[#526660]">
          <button onClick={() => navigate("home")} className="hover:text-[#174B45]">الرئيسية</button>
          <button onClick={() => navigate("catalogue")} className="hover:text-[#174B45]">الخيارات</button>
          <button onClick={() => navigate("help")} className="hover:text-[#174B45]">الأسئلة الشائعة</button>
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-[1240px] border-t border-[#D6DDD5] pt-5 text-xs text-[#7A8983]">نموذج تعريفي تجريبي — الأسماء والبيانات للعرض فقط.</div>
    </footer>
  );
}

function Landing({ navigate }: { navigate: (next: Screen) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div dir="rtl" className="min-h-[100dvh] bg-[#174B45] text-[#F7F4ED]" style={{ fontFamily: "'Tajawal', 'Noto Sans Arabic', sans-serif" }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-24 top-12 h-72 w-72 rounded-full border border-[#64877A]/30" />
        <div className="absolute -left-10 top-28 h-52 w-52 rounded-full border border-[#64877A]/25" />
        <div className="absolute bottom-16 right-[-90px] h-72 w-72 rounded-full border border-[#64877A]/20" />
      </div>
      <Header screen="landing" navigate={navigate} menuOpen={menuOpen} setMenuOpen={setMenuOpen} dark />
      <main className="relative mx-auto max-w-[1240px] px-5 pb-14 pt-10 md:px-10 md:pb-24 md:pt-20">
        <div className="grid items-center gap-14 lg:grid-cols-[1.02fr_.98fr]">
          <section className="max-w-[660px]">
            <div className="mb-8 flex items-center gap-3 text-xs text-[#A9C0B5]">
              <span className="h-px w-10 bg-[#D6B56D]" />
              <span>نقل خدمات منزلية · خطوة هادئة نحو القرار المناسب</span>
            </div>
            <h1 className="max-w-[620px] text-[42px] font-bold leading-[1.25] tracking-[-.045em] md:text-[67px]">
              احتياج بيتك
              <br />
              <span className="text-[#E9DAB4]">له خيار مناسب.</span>
            </h1>
            <p className="mt-7 max-w-[530px] text-[16px] leading-8 text-[#C4D3CB] md:text-[18px]">
              إذا كنت تبحث عن نقل خدمات عاملة منزلية، صف لنا ما تحتاجه ونرتّب لك بداية واضحة لمراجعة الخيارات المناسبة. القرار لك، والتواصل يتم بالطريقة التي تريحك.
            </p>
            <button
              onClick={() => navigate("form-1")}
              className="mt-9 inline-flex items-center gap-3 rounded-full bg-[#E9DAB4] px-7 py-4 text-[15px] font-bold text-[#174B45] shadow-[0_10px_30px_rgba(0,0,0,.12)] transition hover:-translate-y-0.5 hover:bg-[#F1E3C1]"
            >
              ابدأ طلب المطابقة
              <ArrowLeft size={18} />
            </button>
            <div className="mt-12 flex flex-wrap gap-x-7 gap-y-3 text-xs text-[#ABC0B5]">
              <span className="flex items-center gap-2"><ShieldCheck size={15} className="text-[#E9DAB4]" /> معلوماتك تُستخدم لفهم احتياجك</span>
              <span className="flex items-center gap-2"><MessageCircle size={15} className="text-[#E9DAB4]" /> يمكنك إكمال الحديث عبر واتساب</span>
            </div>
          </section>
          <section className="relative lg:pr-10">
            <div className="relative mx-auto max-w-[470px] rounded-[32px] border border-[#6D9183]/50 bg-[#20564E] p-5 md:p-7">
              <div className="absolute -left-6 top-12 hidden rounded-2xl border border-[#6D9183]/50 bg-[#174B45] px-4 py-3 text-xs text-[#E1E9E1] shadow-lg md:block">
                <span className="mb-2 block text-[#A9C0B5]">نبدأ من</span>
                <strong className="text-sm text-[#E9DAB4]">احتياجك الفعلي</strong>
              </div>
              <div className="rounded-[24px] bg-[#F7F4ED] p-5 text-[#174B45] md:p-7">
                <div className="flex items-center justify-between border-b border-[#DCE1D8] pb-5">
                  <div>
                    <span className="text-[11px] text-[#7A8B83]">رحلة المطابقة</span>
                    <h2 className="mt-1 text-lg font-bold">من الاحتياج إلى القرار</h2>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E9DAB4] text-lg font-bold">خ</div>
                </div>
                <div className="space-y-0 pt-6">
                  {[
                    ["01", "احتياجك", "تفاصيل البيت وما يهمك"],
                    ["02", "الخيارات", "نراجع ما يناسب وصفك"],
                    ["03", "التفاصيل", "تواصل واضح ومباشر"],
                    ["04", "القرار", "تختار الخطوة التالية"],
                  ].map(([number, title, copy], index) => (
                    <div key={title} className="relative flex gap-4 pb-6 last:pb-0">
                      {index < 3 && <span className="absolute right-[15px] top-8 h-full w-px bg-[#DCE1D8]" />}
                      <span className={cn("relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold", index === 0 ? "bg-[#174B45] text-[#F7F4ED]" : "bg-[#E7EEE6] text-[#5F766D]")}>{number}</span>
                      <div><h3 className="text-sm font-bold">{title}</h3><p className="mt-1 text-xs text-[#778780]">{copy}</p></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between px-1 text-xs text-[#BBD0C4]">
                <span>تجربة مرتبة، بدون استعجال</span>
                <Sparkles size={15} className="text-[#E9DAB4]" />
              </div>
            </div>
          </section>
        </div>
        <div className="mt-20 grid gap-5 border-t border-[#4E766A] pt-8 md:grid-cols-3">
          {[
            ["لا نقرر عنك", "نرتب الصورة، وتبقى الخطوة الأخيرة بيدك."],
            ["نسمع التفاصيل", "الاختيار الأفضل يبدأ من يومك كما هو، لا من قائمة عامة."],
            ["تواصل على راحتك", "بعد الطلب، يمكنك متابعة الحديث عبر واتساب."],
          ].map(([title, copy]) => <div key={title}><h3 className="text-sm font-bold text-[#E9DAB4]">{title}</h3><p className="mt-2 text-sm leading-7 text-[#B5C9BF]">{copy}</p></div>)}
        </div>
      </main>
    </div>
  );
}

function Progress({ step }: { step: 1 | 2 }) {
  return (
    <div className="mb-9 flex items-center gap-3 text-xs">
      <span className="font-bold text-[#174B45]">طلب المطابقة</span>
      <div className="h-px w-10 bg-[#D2DCD3]" />
      {[1, 2].map((number) => <span key={number} className={cn("flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold", step >= number ? "bg-[#174B45] text-[#F7F4ED]" : "bg-[#E7EEE6] text-[#82918A]")}>{step > number ? <Check size={14} /> : number}</span>)}
    </div>
  );
}

function Choice({
  label,
  selected,
  onClick,
  detail,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  detail?: string;
}) {
  return (
    <button onClick={onClick} className={cn("flex w-full items-center justify-between rounded-2xl border p-4 text-right transition", selected ? "border-[#174B45] bg-[#EEF3ED] text-[#174B45]" : "border-[#D8DED7] bg-[#FBFAF6] text-[#49615A] hover:border-[#9EB2A7]")}>
      <span><span className="block text-sm font-bold">{label}</span>{detail && <span className="mt-1 block text-xs text-[#819089]">{detail}</span>}</span>
      <span className={cn("flex h-5 w-5 items-center justify-center rounded-full border", selected ? "border-[#174B45] bg-[#174B45] text-[#F7F4ED]" : "border-[#B8C5BD]")}>{selected && <Check size={12} />}</span>
    </button>
  );
}

function FormShell({ children, step, navigate }: { children: ReactNode; step: 1 | 2; navigate: (next: Screen) => void }) {
  return (
    <div dir="rtl" className="min-h-[100dvh] bg-[#F7F4ED] text-[#174B45]" style={{ fontFamily: "'Tajawal', 'Noto Sans Arabic', sans-serif" }}>
      <header className="border-b border-[#DDE2DA] bg-[#FBFAF6] px-5 py-4 md:px-10">
        <div className="mx-auto flex max-w-[760px] items-center justify-between">
          <button onClick={() => navigate("landing")}><Logo /></button>
          <button onClick={() => navigate("landing")} className="flex items-center gap-2 text-xs text-[#788982] hover:text-[#174B45]"><X size={15} /> خروج</button>
        </div>
      </header>
      <main className="mx-auto max-w-[760px] px-5 pb-24 pt-10 md:px-10 md:pt-16">
        <Progress step={step} />
        {children}
      </main>
    </div>
  );
}

function MatchForm({ step, form, setForm, navigate }: { step: 1 | 2; form: FormData; setForm: Dispatch<SetStateAction<FormData>>; navigate: (next: Screen) => void }) {
  const [error, setError] = useState("");
  const update = (key: keyof FormData, value: string) => setForm((current) => ({ ...current, [key]: value }));
  if (step === 1) {
    return (
      <FormShell step={1} navigate={navigate}>
        <div className="max-w-[620px]">
          <Pill>الخطوة الأولى من اثنتين</Pill>
          <h1 className="mt-5 text-3xl font-bold tracking-[-.04em] md:text-5xl">خلّنا نفهم يومك أكثر.</h1>
          <p className="mt-4 text-[15px] leading-8 text-[#6D7D75]">إجابات بسيطة تساعدنا نكوّن صورة أولية عن احتياج بيتك.</p>
          <div className="mt-9 space-y-7">
            <div><label className="mb-3 block text-sm font-bold">في أي مدينة سيكون العمل؟</label><div className="grid gap-3 sm:grid-cols-3">{["الرياض", "جدة", "مدينة أخرى"].map((city) => <Choice key={city} label={city} selected={form.city === city} onClick={() => update("city", city)} />)}</div></div>
            <div><label className="mb-3 block text-sm font-bold">ما طبيعة المنزل؟</label><div className="grid gap-3 sm:grid-cols-2">{[["أسرة صغيرة", "حتى 4 أفراد"], ["أسرة أكبر", "5 أفراد أو أكثر"], ["منزل مع أطفال", "رعاية وتنظيم يومي"], ["منزل مع كبير سن", "مساندة ورفقة يومية"]].map(([label, detail]) => <Choice key={label} label={label} detail={detail} selected={form.home === label} onClick={() => update("home", label)} />)}</div></div>
            <div><label className="mb-3 block text-sm font-bold">ما الأولوية الأهم لك؟</label><div className="grid gap-3 sm:grid-cols-3">{["رعاية الأطفال", "شؤون المنزل", "رعاية كبير سن"].map((need) => <Choice key={need} label={need} selected={form.need === need} onClick={() => update("need", need)} />)}</div></div>
          </div>
          {error && <p className="mt-5 rounded-xl bg-[#F6E8E2] px-4 py-3 text-sm text-[#9B5142]">{error}</p>}
          <div className="mt-9 flex items-center justify-between"><button onClick={() => navigate("landing")} className="text-sm font-bold text-[#71817A] hover:text-[#174B45]">رجوع</button><button onClick={() => { if (!form.city || !form.home || !form.need) { setError("اختر إجابة لكل سؤال قبل المتابعة."); return; } setError(""); navigate("form-2"); }} className="flex items-center gap-3 rounded-full bg-[#174B45] px-6 py-3.5 text-sm font-bold text-[#F7F4ED] hover:bg-[#0F3B36]">التالي <ArrowLeft size={17} /></button></div>
        </div>
      </FormShell>
    );
  }
  return (
    <FormShell step={2} navigate={navigate}>
      <div className="max-w-[620px]">
        <Pill>الخطوة الثانية من اثنتين</Pill>
        <h1 className="mt-5 text-3xl font-bold tracking-[-.04em] md:text-5xl">بقيت لمساتك الأخيرة.</h1>
        <p className="mt-4 text-[15px] leading-8 text-[#6D7D75]">اختر ما يهمك، واترك لنا طريقة مناسبة للعودة إليك.</p>
        <div className="mt-9 space-y-7">
          <div><label className="mb-3 block text-sm font-bold">هل تفضّل لغة معيّنة؟ <span className="font-normal text-[#94A09A]">(اختياري)</span></label><div className="grid gap-3 sm:grid-cols-3">{["العربية", "الإنجليزية", "لا يهم"].map((language) => <Choice key={language} label={language} selected={form.language === language} onClick={() => update("language", language)} />)}</div></div>
          <div><label className="mb-3 block text-sm font-bold">متى تفضّل البدء؟</label><div className="grid gap-3 sm:grid-cols-3">{["في أقرب وقت", "خلال شهر", "أستكشف فقط"].map((timing) => <Choice key={timing} label={timing} selected={form.timing === timing} onClick={() => update("timing", timing)} />)}</div></div>
          <div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-2 block text-sm font-bold">الاسم</span><input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="كيف نناديك؟" className="w-full rounded-2xl border border-[#D8DED7] bg-[#FBFAF6] px-4 py-3.5 text-sm outline-none placeholder:text-[#A0AAA4] focus:border-[#174B45]" /></label><label className="block"><span className="mb-2 block text-sm font-bold">رقم الجوال</span><input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="05XXXXXXXX" inputMode="tel" className="w-full rounded-2xl border border-[#D8DED7] bg-[#FBFAF6] px-4 py-3.5 text-sm outline-none placeholder:text-[#A0AAA4] focus:border-[#174B45]" /></label></div>
          <label className="block"><span className="mb-2 block text-sm font-bold">هل هناك شيء آخر تحب أن نعرفه؟ <span className="font-normal text-[#94A09A]">(اختياري)</span></span><textarea value={form.note} onChange={(e) => update("note", e.target.value)} placeholder="مثلاً: عدد الأطفال أو طبيعة الروتين اليومي" rows={4} className="w-full resize-none rounded-2xl border border-[#D8DED7] bg-[#FBFAF6] px-4 py-3.5 text-sm outline-none placeholder:text-[#A0AAA4] focus:border-[#174B45]" /></label>
        </div>
        {error && <p className="mt-5 rounded-xl bg-[#F6E8E2] px-4 py-3 text-sm text-[#9B5142]">{error}</p>}
        <div className="mt-9 flex items-center justify-between"><button onClick={() => navigate("form-1")} className="flex items-center gap-2 text-sm font-bold text-[#71817A] hover:text-[#174B45]"><ArrowRight size={16} /> السابق</button><button onClick={() => { if (!form.timing || !form.name.trim() || form.phone.trim().length < 8) { setError("أكمل وقت البدء والاسم ورقم جوال صحيح."); return; } setError(""); navigate("thank-you"); }} className="flex items-center gap-3 rounded-full bg-[#174B45] px-6 py-3.5 text-sm font-bold text-[#F7F4ED] hover:bg-[#0F3B36]">إرسال الطلب <ArrowLeft size={17} /></button></div>
      </div>
    </FormShell>
  );
}

function ThankYou({ form, navigate }: { form: FormData; navigate: (next: Screen) => void }) {
  const message = `مرحباً خادمتي، أرسلت طلب مطابقة جديداً. المدينة: ${form.city}، الأولوية: ${form.need}، وقت البدء: ${form.timing}. اسمي ${form.name}.`;
  return (
    <div dir="rtl" className="min-h-[100dvh] bg-[#F7F4ED] text-[#174B45]" style={{ fontFamily: "'Tajawal', 'Noto Sans Arabic', sans-serif" }}>
      <header className="border-b border-[#DDE2DA] bg-[#FBFAF6] px-5 py-4 md:px-10"><div className="mx-auto max-w-[760px]"><button onClick={() => navigate("home")}><Logo /></button></div></header>
      <main className="mx-auto max-w-[760px] px-5 pb-24 pt-16 text-center md:pt-24">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#DDEBDD] text-[#174B45]"><Check size={28} /></div>
        <Pill>تم استلام طلبك</Pill>
        <h1 className="mx-auto mt-5 max-w-[600px] text-4xl font-bold tracking-[-.04em] md:text-6xl">شكراً، {form.name || "لك"}.</h1>
        <p className="mx-auto mt-5 max-w-[500px] text-[15px] leading-8 text-[#6D7D75]">وصلتنا تفاصيل احتياجك. يمكنك الآن متابعة الحديث معنا على واتساب، أو العودة لاستكشاف المنصة.</p>
        <div className="mx-auto mt-9 max-w-[500px] rounded-3xl border border-[#D8DED7] bg-[#FBFAF6] p-5 text-right"><div className="flex items-center justify-between text-xs text-[#819089]"><span>ملخص الطلب</span><span>مطابقة منزلية</span></div><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><span className="block text-xs text-[#8A9891]">المدينة</span><strong className="mt-1 block">{form.city}</strong></div><div><span className="block text-xs text-[#8A9891]">الأولوية</span><strong className="mt-1 block">{form.need}</strong></div></div></div>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><a href={whatsappUrl(message)} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#174B45] px-6 py-3.5 text-sm font-bold text-[#F7F4ED] hover:bg-[#0F3B36]"><MessageCircle size={18} /> متابعة عبر واتساب</a><button onClick={() => navigate("home")} className="rounded-full border border-[#BCCBC0] px-6 py-3.5 text-sm font-bold text-[#174B45] hover:bg-[#EEF3ED]">العودة للموقع</button></div>
        <p className="mt-5 text-xs text-[#93A099]">الانتقال إلى واتساب اختياري — لن تحتاجه لإكمال استكشافك.</p>
      </main>
    </div>
  );
}

function HomePage({ navigate }: { navigate: (next: Screen) => void }) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const faqs = [["هل خادمتي منصة حجز بالساعة؟", "لا. خادمتي تساعدك على وصف احتياج بيتك واستكشاف خيارات مناسبة لخدمة منزلية مستمرة، ثم تتابع التفاصيل بالطريقة التي تختارها."], ["ماذا يحدث بعد إرسال طلب المطابقة؟", "نرتب طلبك ونساعدك على فهم الخيارات الأقرب لوصفك. يمكنك متابعة النقاش عبر واتساب عندما تكون مستعداً."], ["هل أستطيع البحث بنفسي؟", "نعم، يمكنك استكشاف الكتالوج والتعرّف على الملفات التعريفية، أو ترك التفاصيل لنا عبر نموذج ساعدني أجد عام."]];
  return (
    <div dir="rtl" className="min-h-[100dvh] bg-[#F7F4ED] text-[#174B45]" style={{ fontFamily: "'Tajawal', 'Noto Sans Arabic', sans-serif" }}>
      <Header screen="home" navigate={navigate} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main>
        <section className="mx-auto grid max-w-[1240px] items-center gap-10 px-5 pb-20 pt-10 md:px-10 md:pb-28 md:pt-20 lg:grid-cols-[1fr_.9fr]">
          <div><Pill>خادمتي — بداية أوضح</Pill><h1 className="mt-6 max-w-[620px] text-[42px] font-bold leading-[1.25] tracking-[-.05em] md:text-[67px]">لبيتِك تفاصيله.<br /><span className="text-[#AF8350]">نسمعها أولاً.</span></h1><p className="mt-6 max-w-[530px] text-[16px] leading-8 text-[#6D7D75]">تعرّف على خيارات خدمة منزلية تناسب احتياجك، أو دعنا نساعدك في ترتيب الصورة من البداية.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><button onClick={() => navigate("help")} className="rounded-full bg-[#174B45] px-6 py-3.5 text-sm font-bold text-[#F7F4ED] hover:bg-[#0F3B36]">ساعدني أجد خياراً</button><button onClick={() => navigate("catalogue")} className="rounded-full border border-[#BFCBC1] px-6 py-3.5 text-sm font-bold text-[#174B45] hover:bg-[#EEF3ED]">استكشف الخيارات <ArrowLeft className="mr-2 inline" size={16} /></button></div></div>
          <div className="relative min-h-[360px] overflow-hidden rounded-[34px] bg-[#DCE8DD] p-6 md:min-h-[480px]"><div className="absolute inset-0 opacity-50" style={{ backgroundImage: "radial-gradient(#8BAA9D 1px, transparent 1px)", backgroundSize: "20px 20px" }} /><div className="absolute -left-12 top-10 h-64 w-64 rounded-full border border-[#A5BCAF]" /><div className="absolute bottom-[-75px] right-[-50px] h-72 w-72 rounded-full border-[22px] border-[#D0DCCF]" /><div className="relative flex h-full min-h-[310px] flex-col justify-between"><div className="flex justify-between text-xs text-[#557168]"><span>01 / خادمتي</span><span>مساحتك للقرار</span></div><div className="self-end rounded-2xl border border-[#B5C9B8] bg-[#F7F4ED]/85 p-5 backdrop-blur-sm md:w-[280px]"><span className="text-xs text-[#7C9086]">فكرة المنصة</span><h2 className="mt-2 text-2xl font-bold leading-[1.4]">لا قائمة طويلة.<br />بل اختيار مفهوم.</h2><div className="mt-5 flex items-center gap-2 text-xs text-[#678076]"><span className="h-2 w-2 rounded-full bg-[#AF8350]" /> أنت تعرف احتياجك أكثر</div></div><div className="flex items-center gap-3 text-sm font-bold text-[#315D53]"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#174B45] text-[#F7F4ED]"><ArrowLeft size={16} /></span> ابدأ من المكان الذي يناسبك</div></div></div>
        </section>
        <section className="bg-[#174B45] px-5 py-16 text-[#F7F4ED] md:px-10 md:py-20"><div className="mx-auto max-w-[1240px]"><div className="grid gap-10 md:grid-cols-[.7fr_1.3fr] md:items-end"><div><span className="text-xs text-[#AEC4B8]">كيف تعمل خادمتي؟</span><h2 className="mt-4 text-3xl font-bold leading-[1.4] md:text-5xl">أربع محطات.<br />قرار أهدأ.</h2></div><p className="max-w-[430px] text-sm leading-8 text-[#B7CCC0]">لا نطلب منك أن تعرف كل شيء من أول لحظة. نبدأ بالأسئلة التي تساعدك، ونترك التفاصيل تتضح بالتدريج.</p></div><div className="mt-12 grid gap-4 md:grid-cols-4">{[["01", "احتياجك", "تصف لنا شكل يومك."], ["02", "الخيارات", "تتعرّف على ما قد يناسبك."], ["03", "التفاصيل", "تسأل وتوضح ما يهمك."], ["04", "القرار", "تختار خطوتك التالية." ]].map(([n, title, copy]) => <div key={n} className="border-t border-[#52766C] pt-5"><span className="text-xs text-[#E9DAB4]">{n}</span><h3 className="mt-9 text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-7 text-[#B7CCC0]">{copy}</p></div>)}</div></div></section>
        <section className="mx-auto max-w-[1240px] px-5 py-16 md:px-10 md:py-24"><div className="flex items-end justify-between gap-5"><div><span className="text-xs text-[#AF8350]">طرق البدء</span><h2 className="mt-3 text-3xl font-bold md:text-4xl">اختر مسارك.</h2></div><button onClick={() => navigate("help")} className="hidden text-sm font-bold text-[#174B45] md:block">كل طرق المساعدة <ArrowLeft className="mr-1 inline" size={15} /></button></div><div className="mt-9 grid gap-5 md:grid-cols-[1.25fr_.75fr]"><button onClick={() => navigate("help")} className="group rounded-[28px] bg-[#E5ECDD] p-6 text-right transition hover:bg-[#D9E5D9] md:p-8"><div className="flex items-start justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#174B45] text-[#F7F4ED]"><Sparkles size={21} /></span><ArrowLeft className="text-[#6D887C] transition group-hover:-translate-x-1" size={20} /></div><h3 className="mt-20 text-2xl font-bold">ساعدني أجد عام</h3><p className="mt-2 max-w-md text-sm leading-7 text-[#64776F]">لست متأكداً من الخيار؟ صف يومك وسنبدأ معك من الأساسيات.</p></button><button onClick={() => navigate("catalogue")} className="group rounded-[28px] border border-[#D4DDD4] bg-[#FBFAF6] p-6 text-right transition hover:border-[#9EB2A7] md:p-8"><div className="flex items-start justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E9DAB4] text-[#174B45]"><UsersRound size={21} /></span><ArrowLeft className="text-[#8A9A92] transition group-hover:-translate-x-1" size={20} /></div><h3 className="mt-20 text-2xl font-bold">استكشف الخيارات</h3><p className="mt-2 text-sm leading-7 text-[#64776F]">تصفح ملفات تعريفية مختصرة، وابدأ من الخيار الذي يلفت انتباهك.</p></button></div></section>
        <section className="bg-[#F0EBDD] px-5 py-16 md:px-10 md:py-20"><div className="mx-auto grid max-w-[900px] gap-10 md:grid-cols-[.8fr_1.2fr]"><div><span className="text-xs text-[#AF8350]">أسئلة قبل البداية</span><h2 className="mt-3 text-3xl font-bold">على بالك سؤال؟</h2></div><div>{faqs.map(([question, answer], index) => <div key={question} className="border-b border-[#D5CCB8]"><button onClick={() => setOpenFaq(openFaq === index ? null : index)} className="flex w-full items-center justify-between py-5 text-right text-sm font-bold"><span>{question}</span>{openFaq === index ? <Minus size={16} /> : <ChevronDown size={16} />}</button>{openFaq === index && <p className="pb-5 pl-6 text-sm leading-7 text-[#6D766C]">{answer}</p>}</div>)}</div></div></section>
      </main><Footer navigate={navigate} /><MobileCta navigate={navigate} />
    </div>
  );
}

function MobileCta({ navigate }: { navigate: (next: Screen) => void }) {
  return <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#D8DED7] bg-[#FBFAF6]/95 p-3 backdrop-blur-sm md:hidden"><button onClick={() => navigate("help")} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#174B45] py-3.5 text-sm font-bold text-[#F7F4ED]">ساعدني أجد خياراً <ArrowLeft size={16} /></button></div>;
}

function Catalogue({ navigate, selectWorker }: { navigate: (next: Screen) => void; selectWorker: (worker: Worker) => void }) {
  const [search, setSearch] = useState("");
  const [skill, setSkill] = useState("الكل");
  const [filters, setFilters] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const filtered = useMemo(() => workers.filter((worker) => {
    const matchesSearch = `${worker.name} ${worker.origin} ${worker.experience} ${worker.skills.join(" ")}`.toLowerCase().includes(search.toLowerCase());
    const matchesSkill = skill === "الكل" || worker.skills.includes(skill);
    return matchesSearch && matchesSkill;
  }), [search, skill]);
  return (
    <div dir="rtl" className="min-h-[100dvh] bg-[#F7F4ED] text-[#174B45]" style={{ fontFamily: "'Tajawal', 'Noto Sans Arabic', sans-serif" }}>
      <Header screen="catalogue" navigate={navigate} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main className="mx-auto max-w-[1240px] px-5 pb-24 pt-8 md:px-10 md:pt-14"><div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><Pill>ملفات تعريفية مختارة</Pill><h1 className="mt-5 text-4xl font-bold tracking-[-.05em] md:text-6xl">تعرّف على الخيارات.</h1><p className="mt-4 max-w-lg text-sm leading-7 text-[#6D7D75]">مساحة للتعرّف الأولي فقط. التفاصيل المناسبة لك تبدأ بالحوار.</p></div><button onClick={() => navigate("help")} className="hidden items-center gap-2 rounded-full border border-[#BFCBC1] px-5 py-3 text-sm font-bold md:flex">لا أعرف من أين أبدأ <ArrowLeft size={16} /></button></div>
        <div className="mt-10 flex flex-col gap-3 md:flex-row"><div className="relative flex-1"><Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[#82918A]" size={18} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحثي حسب الخبرة أو المهارة" className="w-full rounded-2xl border border-[#D4DDD4] bg-[#FBFAF6] py-4 pr-11 pl-4 text-sm outline-none focus:border-[#174B45]" /></div><button onClick={() => setFilters(!filters)} className="flex items-center justify-center gap-2 rounded-2xl border border-[#D4DDD4] bg-[#FBFAF6] px-5 py-4 text-sm font-bold"><Filter size={17} /> تصفية</button></div>
        {filters && <div className="mt-3 rounded-2xl border border-[#D4DDD4] bg-[#FBFAF6] p-4"><p className="mb-3 text-xs font-bold text-[#7B8D84]">المهارة الأساسية</p><div className="flex flex-wrap gap-2">{["الكل", "رعاية الأطفال", "شؤون المنزل", "تنظيم المنزل", "رعاية كبار السن"].map((item) => <button key={item} onClick={() => setSkill(item === "شؤون المنزل" ? "الطبخ المنزلي" : item)} className={cn("rounded-full px-4 py-2 text-xs font-bold", skill === item || (item === "شؤون المنزل" && skill === "الطبخ المنزلي") ? "bg-[#174B45] text-[#F7F4ED]" : "bg-[#E8EFE7] text-[#49615A]")}>{item}</button>)}</div></div>}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{filtered.map((worker) => <button key={worker.id} onClick={() => { selectWorker(worker); navigate("profile"); }} className="group overflow-hidden rounded-[26px] border border-[#D7DED5] bg-[#FBFAF6] text-right transition hover:-translate-y-1 hover:border-[#9FB4A7] hover:shadow-[0_16px_35px_rgba(25,62,52,.08)]"><div className="relative flex h-48 items-end justify-between overflow-hidden p-5" style={{ backgroundColor: worker.color }}><div className="absolute -left-7 -top-10 h-36 w-36 rounded-full border-[18px] border-white/20" /><div className="relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-[#FBFAF6] bg-[#174B45] text-3xl font-bold text-[#F3E7C4]">{worker.initials}</div><span className="relative rounded-full bg-[#F7F4ED]/80 px-3 py-1.5 text-[10px] font-bold text-[#426158]">{worker.availability}</span></div><div className="p-5"><div className="flex items-start justify-between gap-2"><div><h2 className="text-lg font-bold">{worker.name}</h2><p className="mt-1 text-xs text-[#83918B]">{worker.origin} · {worker.experience}</p></div><ChevronLeft size={17} className="mt-1 text-[#92A39B] transition group-hover:-translate-x-1" /></div><div className="mt-5 flex flex-wrap gap-1.5">{worker.skills.slice(0, 2).map((item) => <Pill key={item}>{item}</Pill>)}</div></div></button>)}</div>{filtered.length === 0 && <div className="mt-10 rounded-3xl border border-dashed border-[#BFCBC1] bg-[#FBFAF6] p-12 text-center"><Search className="mx-auto text-[#84978D]" size={26} /><h2 className="mt-4 font-bold">لم نجد تطابقاً بهذه الكلمات</h2><p className="mt-2 text-sm text-[#7A8A83]">جرّب كلمة أخرى، أو دعنا نساعدك من البداية.</p><button onClick={() => navigate("help")} className="mt-5 rounded-full bg-[#174B45] px-5 py-3 text-sm font-bold text-[#F7F4ED]">ساعدني أجد خياراً</button></div>}</main><MobileCta navigate={navigate} />
    </div>
  );
}

function Profile({ worker, navigate }: { worker: Worker; navigate: (next: Screen) => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const message = `مرحباً خادمتي، أرغب في الاستفسار عن ${worker.name}. اسمي ${name}. ${note}`;
  return (
    <div dir="rtl" className="min-h-[100dvh] bg-[#F7F4ED] text-[#174B45]" style={{ fontFamily: "'Tajawal', 'Noto Sans Arabic', sans-serif" }}>
      <Header screen="profile" navigate={navigate} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main className="mx-auto max-w-[1100px] px-5 pb-28 pt-7 md:px-10 md:pt-12"><button onClick={() => navigate("catalogue")} className="mb-8 flex items-center gap-2 text-sm font-bold text-[#71817A] hover:text-[#174B45]"><ArrowRight size={16} /> العودة للخيارات</button><div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr]"><section><div className="relative flex min-h-[430px] flex-col justify-between overflow-hidden rounded-[32px] p-7" style={{ backgroundColor: worker.color }}><div className="absolute -left-24 top-14 h-72 w-72 rounded-full border-[26px] border-white/20" /><div className="relative flex items-center justify-between text-xs text-[#557168]"><span>ملف تعريفي</span><span>خادمتي</span></div><div className="relative"><div className="mb-5 flex h-28 w-28 items-center justify-center rounded-full border-8 border-[#F7F4ED] bg-[#174B45] text-5xl font-bold text-[#F3E7C4]">{worker.initials}</div><h1 className="text-4xl font-bold">{worker.name}</h1><p className="mt-2 text-sm text-[#536B62]">{worker.origin} · {worker.experience}</p></div></div><div className="mt-4 flex flex-wrap gap-2">{worker.languages.map((item) => <Pill key={item}>{item}</Pill>)}</div></section><section className="rounded-[32px] border border-[#D7DED5] bg-[#FBFAF6] p-6 md:p-9"><Pill>تواصل باحترام ووضوح</Pill><h2 className="mt-5 text-3xl font-bold tracking-[-.04em]">هل تريد الاستفسار عن {worker.name}؟</h2><p className="mt-3 text-sm leading-7 text-[#718078]">{worker.story}</p><div className="mt-7"><h3 className="text-sm font-bold">مجالات الخبرة</h3><div className="mt-3 flex flex-wrap gap-2">{worker.skills.map((skill) => <span key={skill} className="rounded-full border border-[#CBD8CD] px-3 py-2 text-xs text-[#557168]">{skill}</span>)}</div></div><div className="my-7 h-px bg-[#DCE2D9]" /><div className="grid gap-4 sm:grid-cols-2"><label><span className="mb-2 block text-sm font-bold">الاسم</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder="كيف نناديك؟" className="w-full rounded-2xl border border-[#D8DED7] bg-[#F7F4ED] px-4 py-3.5 text-sm outline-none focus:border-[#174B45]" /></label><label><span className="mb-2 block text-sm font-bold">رقم الجوال</span><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05XXXXXXXX" inputMode="tel" className="w-full rounded-2xl border border-[#D8DED7] bg-[#F7F4ED] px-4 py-3.5 text-sm outline-none focus:border-[#174B45]" /></label></div><label className="mt-4 block"><span className="mb-2 block text-sm font-bold">ماذا تحب أن تعرف؟</span><textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="اكتب سؤالك أو احتياجك باختصار" rows={3} className="w-full resize-none rounded-2xl border border-[#D8DED7] bg-[#F7F4ED] px-4 py-3.5 text-sm outline-none focus:border-[#174B45]" /></label>{error && <p className="mt-4 rounded-xl bg-[#F6E8E2] px-4 py-3 text-sm text-[#9B5142]">{error}</p>}<a href={name.trim() && phone.trim().length >= 8 ? whatsappUrl(message) : undefined} target="_blank" rel="noreferrer" onClick={(event) => { if (!name.trim() || phone.trim().length < 8) { event.preventDefault(); setError("أكمل الاسم ورقم الجوال قبل المتابعة."); } }} className="mt-6 flex items-center justify-center gap-2 rounded-full bg-[#174B45] px-6 py-4 text-sm font-bold text-[#F7F4ED] hover:bg-[#0F3B36]"><MessageCircle size={18} /> أرسل طلباً عن هذا الخيار</a></section></div></main><MobileCta navigate={navigate} />
    </div>
  );
}

function HelpFlow({ navigate }: { navigate: (next: Screen) => void }) {
  const [need, setNeed] = useState("");
  const [city, setCity] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const message = `مرحباً خادمتي، أحتاج مساعدة في إيجاد خيار مناسب. المدينة: ${city}. الاحتياج: ${need}. اسمي: ${name}.`;
  if (sent) return <div dir="rtl" className="min-h-[100dvh] bg-[#F7F4ED] text-[#174B45]" style={{ fontFamily: "'Tajawal', 'Noto Sans Arabic', sans-serif" }}><Header screen="help" navigate={navigate} menuOpen={menuOpen} setMenuOpen={setMenuOpen} /><main className="mx-auto max-w-[650px] px-5 pb-24 pt-16 text-center md:pt-24"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#DDEBDD]"><Check size={28} /></div><h1 className="mt-6 text-4xl font-bold md:text-5xl">وصلنا ما تحتاجه.</h1><p className="mt-4 text-sm leading-8 text-[#6D7D75]">يمكنك الآن فتح واتساب برسالة مرتبة، أو العودة لتصفح الخيارات.</p><a href={whatsappUrl(message)} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#174B45] px-6 py-3.5 text-sm font-bold text-[#F7F4ED]"><MessageCircle size={18} /> متابعة عبر واتساب</a><button onClick={() => navigate("catalogue")} className="mr-3 rounded-full border border-[#BFCBC1] px-6 py-3.5 text-sm font-bold">استكشاف الخيارات</button></main></div>;
  return (
    <div dir="rtl" className="min-h-[100dvh] bg-[#F7F4ED] text-[#174B45]" style={{ fontFamily: "'Tajawal', 'Noto Sans Arabic', sans-serif" }}>
      <Header screen="help" navigate={navigate} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main className="mx-auto max-w-[980px] px-5 pb-28 pt-8 md:px-10 md:pt-14"><div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]"><section className="lg:pt-10"><Pill>نبدأ من سؤالك</Pill><h1 className="mt-5 text-4xl font-bold leading-[1.35] tracking-[-.05em] md:text-6xl">ساعدني أجد<br /><span className="text-[#AF8350]">خياراً مناسباً.</span></h1><p className="mt-5 max-w-sm text-sm leading-8 text-[#6D7D75]">لا تحتاج أن تعرف المسمى أو التفاصيل كلها. اكتب ما يشغل بالك، وسنرتب الخطوة التالية معك.</p><div className="mt-10 hidden rounded-3xl bg-[#E5ECDD] p-6 lg:block"><CircleHelp className="text-[#174B45]" size={23} /><p className="mt-5 text-sm font-bold leading-7">كلما شاركتنا صورة أوضح عن يومك، كان الحوار التالي أكثر فائدة.</p></div></section><section className="rounded-[30px] border border-[#D7DED5] bg-[#FBFAF6] p-6 md:p-9"><h2 className="text-2xl font-bold">ما الذي تبحث عنه؟</h2><p className="mt-2 text-sm text-[#7A8982]">اختر الأقرب، ويمكنك التوضيح لاحقاً.</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{["رعاية أطفال", "تنظيم وشؤون منزل", "رعاية كبير سن", "لست متأكداً بعد"].map((item) => <Choice key={item} label={item} selected={need === item} onClick={() => setNeed(item)} />)}</div><label className="mt-7 block"><span className="mb-2 block text-sm font-bold">المدينة</span><div className="relative"><Home className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8B9A92]" size={17} /><input value={city} onChange={(e) => setCity(e.target.value)} placeholder="مثلاً: الرياض" className="w-full rounded-2xl border border-[#D8DED7] bg-[#F7F4ED] px-4 py-3.5 pr-11 text-sm outline-none focus:border-[#174B45]" /></div></label><div className="mt-4 grid gap-4 sm:grid-cols-2"><label><span className="mb-2 block text-sm font-bold">الاسم</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder="كيف نناديك؟" className="w-full rounded-2xl border border-[#D8DED7] bg-[#F7F4ED] px-4 py-3.5 text-sm outline-none focus:border-[#174B45]" /></label><label><span className="mb-2 block text-sm font-bold">رقم الجوال</span><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05XXXXXXXX" inputMode="tel" className="w-full rounded-2xl border border-[#D8DED7] bg-[#F7F4ED] px-4 py-3.5 text-sm outline-none focus:border-[#174B45]" /></label></div>{error && <p className="mt-4 rounded-xl bg-[#F6E8E2] px-4 py-3 text-sm text-[#9B5142]">{error}</p>}<button onClick={() => { if (!need || !city.trim() || !name.trim() || phone.trim().length < 8) { setError("أكمل الاختيار والمدينة والبيانات الأساسية."); return; } setError(""); setSent(true); }} className="mt-7 flex w-full items-center justify-center gap-3 rounded-full bg-[#174B45] px-6 py-4 text-sm font-bold text-[#F7F4ED] hover:bg-[#0F3B36]">رتّب لي البداية <ArrowLeft size={17} /></button><p className="mt-4 text-center text-xs text-[#92A098]">لن يتم التواصل معك إلا بالطريقة التي تختارها.</p></section></div></main><MobileCta navigate={navigate} />
    </div>
  );
}

export function KhadematyPrototype() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [form, setForm] = useState<FormData>(initialForm);
  const [selectedWorker, setSelectedWorker] = useState<Worker>(workers[0]);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = (next: Screen) => {
    setMenuOpen(false);
    setScreen(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  if (screen === "landing") return <Landing navigate={navigate} />;
  if (screen === "form-1") return <MatchForm step={1} form={form} setForm={setForm} navigate={navigate} />;
  if (screen === "form-2") return <MatchForm step={2} form={form} setForm={setForm} navigate={navigate} />;
  if (screen === "thank-you") return <ThankYou form={form} navigate={navigate} />;
  if (screen === "catalogue") return <Catalogue navigate={navigate} selectWorker={setSelectedWorker} />;
  if (screen === "profile") return <Profile worker={selectedWorker} navigate={navigate} />;
  if (screen === "help") return <HelpFlow navigate={navigate} />;
  return <HomePage navigate={navigate} />;
}