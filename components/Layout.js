import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useSound from "../hooks/useSound";
import BrandLogo from "./BrandLogo";

const navItems = [
  { href: "/", label: "Home", icon: "M3 13h8V3H3v10Zm10 8h8V3h-8v18ZM3 21h8v-6H3v6Z" },
  { href: "/submit", label: "Reports", icon: "M6 2h9l5 5v15H6V2Zm8 1.5V8h4.5" },
  { href: "/matches", label: "Leads", icon: "M4 7h16M4 12h16M4 17h10" },
  { href: "/review", label: "Review", icon: "M9 12l2 2 4-5M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" },
  { href: "/about", label: "AI & Safety", icon: "M12 3l2.2 5.3L20 9l-4.4 3.7L17 19l-5-3.3L7 19l1.4-6.3L4 9l5.8-.7L12 3Z" },
  { href: "/settings", label: "Settings", icon: "M12 8a4 4 0 100 8 4 4 0 000-8Zm8.5 4a8.5 8.5 0 01-.2 1.8l2.2 1.7-2 3.5-2.6-1a8 8 0 01-3.1 1.8L14.5 22h-5l-.4-2.2A8 8 0 016 18l-2.6 1-2-3.5 2.2-1.7A8.5 8.5 0 013.5 12c0-.6.1-1.2.2-1.8L1.5 8.5l2-3.5 2.6 1a8 8 0 013.1-1.8L9.5 2h5l.4 2.2A8 8 0 0118 6l2.6-1 2 3.5-2.2 1.7c.1.6.2 1.2.2 1.8Z" }
];

export default function Layout({ children, title = "ReuniteAI" }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const playSound = useSound();

  useEffect(() => {
    function start() {
      setTransitioning(true);
    }
    function done() {
      window.setTimeout(() => setTransitioning(false), 180);
    }
    router.events.on("routeChangeStart", start);
    router.events.on("routeChangeComplete", done);
    router.events.on("routeChangeError", done);
    return () => {
      router.events.off("routeChangeStart", start);
      router.events.off("routeChangeComplete", done);
      router.events.off("routeChangeError", done);
    };
  }, [router.events]);

  return (
    <>
      <Head>
        <title>{`${title} | ReuniteAI`}</title>
        <meta
          name="description"
          content="Restricted disaster reunification case desk with explainable possible leads."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href="/brand/logo-mark.png" />
      </Head>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-slate-950 focus:px-4 focus:py-2 focus:text-red-100 focus:shadow-calm"
      >
        Skip to main content
      </a>

      {transitioning ? (
        <div className="fixed left-0 top-0 z-[1000] h-0.5 w-full overflow-hidden bg-transparent" aria-hidden="true">
          <div className="h-full w-40 bg-red-600 shadow-[0_0_24px_rgba(239,35,60,0.55)]" style={{ animation: "bar-load 0.8s ease-in-out infinite" }} />
        </div>
      ) : null}

      <div className="app-surface min-h-screen min-w-0 max-w-full text-slate-100 lg:grid lg:grid-cols-[204px_minmax(0,1fr)]">
        <aside className="hidden border-r border-white/[0.075] bg-black/35 text-white shadow-[inset_-1px_0_0_rgba(255,255,255,0.035),18px_0_70px_rgba(0,0,0,0.25)] backdrop-blur-2xl lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
          <div className="px-4 pb-4 pt-5">
            <Link href="/" className="block no-underline" aria-label="ReuniteAI home" onClick={() => playSound("click")}>
              <BrandLogo
                className="h-12 max-w-[168px] object-contain object-left"
                fallbackClassName="text-sm font-bold text-slate-50"
              />
              <span className="mt-1.5 block text-[10px] font-semibold uppercase tracking-normal text-slate-600">
                Case Desk
              </span>
            </Link>
          </div>
          <nav className="grid gap-1 px-2" aria-label="Main">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={isActive(router.pathname, item.href)}
                onNavigate={() => playSound("click")}
              />
            ))}
          </nav>
          <div className="mt-auto grid gap-1 px-4 py-4 text-[11px] font-medium text-slate-600">
            <span>Restricted demo</span>
            <span>No auto-contact</span>
          </div>
        </aside>

        <div className="min-w-0 max-w-full overflow-x-hidden">
          <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-black/35 shadow-[0_14px_42px_rgba(0,0,0,0.22)] backdrop-blur-2xl">
            <div className="relative flex h-14 items-center justify-between gap-4 px-4 sm:px-5 lg:px-6">
              <div className="desktop-top-glow" />
              <div className="min-w-0">
                <div className="flex items-center gap-3 lg:hidden">
                  <Link href="/" className="no-underline" onClick={() => playSound("click")}>
                    <BrandLogo
                      className="h-7 max-w-[132px] object-contain object-left"
                      fallbackClassName="text-sm font-bold text-slate-50"
                    />
                  </Link>
                  <button
                    type="button"
                    className="btn-secondary min-h-9 px-3 py-1 text-xs"
                    onClick={() => {
                      playSound("click");
                      setOpen((value) => !value);
                    }}
                    aria-expanded={open}
                    aria-controls="site-navigation"
                  >
                    {open ? "Close" : "Menu"}
                  </button>
                </div>
                <p className="hidden text-sm font-semibold text-slate-300 lg:block">{title}</p>
              </div>
              <div className="hidden items-center gap-3 rounded-full border border-white/[0.06] bg-white/[0.035] px-3 py-1.5 text-[11px] font-medium text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:flex">
                <span>Demo</span>
                <span className="h-1 w-1 rounded-full bg-red-500/70" aria-hidden="true" />
                <span>Restricted</span>
              </div>
            </div>
            {open ? (
              <nav
                id="site-navigation"
                className="grid gap-2 border-t border-white/[0.06] bg-black/55 px-4 py-3 backdrop-blur-2xl lg:hidden"
                aria-label="Mobile"
              >
                {navItems.map((item) => (
                  <MobileNavLink
                    key={item.href}
                    item={item}
                    active={isActive(router.pathname, item.href)}
                    onClick={() => {
                      playSound("click");
                      setOpen(false);
                    }}
                  />
                ))}
              </nav>
            ) : null}
          </header>

          <main id="main-content" className="page-shell page-motion" key={router.pathname}>
            {children}
          </main>
        </div>
      </div>
    </>
  );
}

function NavLink({ item, active, onNavigate }) {
  const activeClass = "border-white/[0.08] bg-white/[0.075] text-white shadow-[inset_3px_0_0_rgba(239,35,60,0.95),inset_0_1px_0_rgba(255,255,255,0.10),0_14px_34px_rgba(0,0,0,0.24)] backdrop-blur-xl";

  return (
    <Link
      href={item.href}
      className={[
        "group relative flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium no-underline transition-all duration-200 ease-out",
        active ? activeClass : "border-transparent text-slate-500 hover:border-white/[0.06] hover:bg-white/[0.045] hover:text-slate-200 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
      ].join(" ")}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
    >
      <Icon path={item.icon} active={active} />
      <span>{item.label}</span>
    </Link>
  );
}

function MobileNavLink({ item, active, onClick }) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={[
        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium no-underline transition",
        active
          ? "bg-red-500/[0.1] text-red-100"
          : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-100"
      ].join(" ")}
      aria-current={active ? "page" : undefined}
    >
      <Icon path={item.icon} active={active} />
      {item.label}
    </Link>
  );
}

function Icon({ path, active = false }) {
  return (
    <svg
      className={["h-4 w-4 flex-none", active ? "drop-shadow-[0_0_8px_rgba(239,35,60,0.42)]" : ""].join(" ")}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path d={path} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function isActive(pathname, href) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}
