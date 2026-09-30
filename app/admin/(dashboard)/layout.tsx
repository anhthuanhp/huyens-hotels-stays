
"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

type AdminDashboardLayoutProps = {
  children: ReactNode;
};

const menuItems = [
  { href: "/admin/thong-ke", label: "Thống kê truy cập" },
  { href: "/admin/dat-phong", label: "Đặt phòng" },
  { href: "/admin/lien-he", label: "Tin nhắn khách hàng" },
  { href: "/admin/danh-gia", label: "Đánh giá khách hàng" },
  { href: "/admin/phong", label: "Quản lý phòng" },
  { href: "/admin/hinh-anh", label: "Hình ảnh" },
  { href: "/admin/khach-san", label: "Quản lý khách sạn" },
  { href: "/admin/tien-nghi", label: "Quản lý tiện nghi" },
  { href: "/admin/chinh-sach", label: "Quản lý chính sách" },
  { href: "/admin/trai-nghiem", label: "Hình ảnh hoạt động" },
  { href: "/admin/viet-blog", label: "Viết Blog" },
];

export default function AdminDashboardLayout({
  children,
}: AdminDashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      if (error || !data.session) {
        router.replace("/admin/login");
        return;
      }

      setEmail(data.session.user.email ?? null);
      setCheckingAuth(false);
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) {
        return;
      }

      if (!session) {
        router.replace("/admin/login");
        return;
      }

      setEmail(session.user.email ?? null);
      setCheckingAuth(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  };

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100">
        <div className="text-sm text-neutral-500">
          Đang kiểm tra đăng nhập...
        </div>
      </div>
    );
  }

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="flex min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-neutral-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="border-b border-neutral-200 px-6 py-5">
              <Link
                href="/admin/hinh-anh"
                className="block"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="text-lg font-bold tracking-[0.18em] text-neutral-900">
                  HUYEN’S
                </div>
                <div className="mt-0.5 text-xs text-neutral-500">
                  Hotels & Stays
                </div>
              </Link>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <div className="space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block rounded-xl px-4 py-3 text-sm font-medium transition ${
                      isActive(item.href)
                        ? "bg-neutral-900 text-white"
                        : "text-neutral-700 hover:bg-neutral-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>

            <div className="border-t border-neutral-200 p-4">
              <div className="mb-3 truncate px-2 text-xs text-neutral-500">
                {email}
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </aside>

        {mobileMenuOpen && (
          <button
            type="button"
            aria-label="Đóng menu"
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700 lg:hidden"
              >
                Menu
              </button>

              <div className="hidden text-sm font-medium text-neutral-800 lg:block">
                Quản trị Huyen’s Hotels & Stays
              </div>

              <Link
                href="/"
                target="_blank"
                className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
              >
                Xem website
              </Link>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
