"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { roleLabel } from "@/lib/auth/session";
import { Icon } from "@/components/ui/icon";

const navItems: Array<{ href: string; label: string; icon: React.ComponentProps<typeof Icon>["name"] }> = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/employees", label: "Employees", icon: "users" },
  { href: "/teams", label: "Teams", icon: "team" },
  { href: "/locations", label: "Locations", icon: "pin" },
  { href: "/challenge-cycles", label: "Challenge cycles", icon: "calendar" },
  { href: "/challenges", label: "Challenges & Activities", icon: "layers" },
  { href: "/submissions", label: "Submissions", icon: "shield" },
  { href: "/guard-points", label: "Guard points", icon: "coins" },
  { href: "/progress", label: "Progress", icon: "chart" },
  { href: "/leaderboard", label: "Leaderboard", icon: "trophy" },
  { href: "/notifications", label: "Notifications", icon: "bell" },
  { href: "/management", label: "Management dashboard", icon: "lock" },
];

export default function CrmLayout({ children }: { children: ReactNode }) {
  const { user, logout, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, router, user]);

  if (!ready) {
    return <div className="min-h-screen bg-[var(--cream)]" />;
  }

  return (
    <div className="min-h-screen bg-[var(--cream)] text-[var(--text)]">
      <div className="grid grid-cols-[248px_1fr] min-h-screen">
        <aside className="bg-[#5A0C2D] text-white px-5 py-5">
          <div className="flex items-center gap-3 mb-7">
            <div className="w-11 h-11 rounded-[16px] bg-white/10 grid place-items-center text-[#F0C4A0]">
              <Icon name="shield" size={20} />
            </div>
            <div>
              <div className="font-bold">ABRE Guard</div>
              <div className="text-xs opacity-70">Admin portal</div>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map(item => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "flex items-center gap-3 px-3 py-3 rounded-full font-semibold text-sm",
                    active ? "bg-white text-[#5A0C2D]" : "text-white/85 hover:bg-white/10",
                  ].join(" ")}>
                  <Icon name={item.icon} size={18} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-7 pt-5 border-t border-white/15">
            <Link href="/profile" className="block hover:opacity-90">
              <div className="text-sm font-semibold">{user?.name}</div>
              <div className="text-xs opacity-70">{user ? roleLabel(user.role) : ""}</div>
            </Link>
            <button
              type="button"
              className="mt-3 text-xs font-semibold text-white/80 hover:text-white"
              onClick={async () => {
                await logout();
                router.replace("/login");
              }}>
              Sign out
            </button>
          </div>
        </aside>

        <div className="flex flex-col min-w-0">
          <header className="h-16 bg-[var(--cream)] flex items-center justify-end px-8 gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/notifications"
                className="w-10 h-10 rounded-full bg-white border border-[var(--border)] grid place-items-center hover:bg-[var(--cream-muted)]">
                <Icon name="bell" size={18} />
              </Link>
              <UserMenu />
            </div>
          </header>

          <main className="flex-1 px-8 py-6 overflow-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const onSignOut = async () => {
    setOpen(false);
    await logout();
    router.replace("/login");
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-10 h-10 rounded-full bg-[var(--primary-muted)] border border-[var(--border)] grid place-items-center text-[var(--primary)] hover:bg-white"
        aria-label="Open profile menu">
        <Icon name="user" size={16} />
      </button>
      {open ? (
        <div className="absolute right-0 mt-2 w-56 rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-2 shadow-[0_12px_40px_rgba(0,0,0,0.12)] z-50">
          <div className="px-3 py-2">
            <div className="text-sm font-semibold">{user?.name}</div>
            <div className="text-xs text-[var(--text-secondary)]">{user ? roleLabel(user.role) : ""}</div>
          </div>
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="block rounded-[10px] px-3 py-2 text-sm font-semibold hover:bg-[var(--cream-muted)]">
            View profile
          </Link>
          <button
            type="button"
            onClick={onSignOut}
            className="w-full text-left rounded-[10px] px-3 py-2 text-sm font-semibold text-[var(--danger)] hover:bg-[var(--cream-muted)]">
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}

