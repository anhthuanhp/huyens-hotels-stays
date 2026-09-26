
"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

type AdminDashboardLayoutProps = {
  children: ReactNode;
};

const menuItems = [
  {
    href: "/admin",
    label: "Tổng quan",
  },
  {
    href: "/admin/thong-ke",
    label: "Thống kê truy cập",
  },
  {
    href: "/admin/dat-phong",
    label: "Đặt phòng",
  },
  {
    href: "/admin/lien-he",
    label: "Tin nhắn khách hàng",
  },
  {
    href: "/admin/phong",
    label: "Quản lý phòng",
  },
  {
    href: "/admin/hinh-anh",
    label: "Quản lý hình ảnh",
  },
  {
    href: "/admin/khach-san",
    label: "Quản lý khách sạn",
  },
  {
    href: "/admin/tien-nghi",
    label: "Quản lý tiện nghi",
  },
  {
    href: "/admin/chinh-sach",
    label: "Quản lý chính sách",
  },
  {
    href: "/admin/dich-vu",
    label: "Quản lý dịch vụ",
  },
  {
    href: "/admin/uu-dai",
    label: "Quản lý ưu đãi",
  },
  {
    href: "/admin/trai-nghiem",
    label: "Hình ảnh hoạt động",
  },
  {
    href: "/admin/blog",
    label: "Viết Blog",
  },
];

export default function AdminDashboardLayout({
  children,
}: AdminDashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error || !data.session) {
        router.replace("/admin/login");
        return;
      }

      setEmail(data.session.user.email ?? "");
      setChecking(false);
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/admin/login");
        return;
      }

      setEmail(session.user.email ?? "");
      setChecking(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  };

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-sm text-slate-500">
          Đang kiểm tra quyền truy cập...
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="text-xl font-semibold tracking-tight text-slate-900">
            Huyen&apos;s
          </div>

          <div className="mt-1 text-xs text-slate-500">
            Hotels &amp; Stays
          </div>

          <div className="mt-3 inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
            ADMIN
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-xl px-4 py-3 text-sm transition ${
                    active
                      ? "bg-slate-900 font-medium text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="mb-3 truncate text-xs text-slate-500">
            {email}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-8">
          <div>
            <div className="text-sm font-semibold text-slate-900">
              Huyen&apos;s Hotels &amp; Stays
            </div>

            <div className="text-xs text-slate-500">
              Hệ thống quản trị
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 lg:hidden"
          >
            Đăng xuất
          </button>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
