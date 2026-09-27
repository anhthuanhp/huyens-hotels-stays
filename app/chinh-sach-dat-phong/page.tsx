
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Language = "vi" | "en";

type Policy = {
  title_vi: string;
  title_en: string;
  content_vi: string;
  content_en: string;
  status: boolean;
};

export default function BookingPolicyPage() {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === "undefined") {
      return "vi";
    }

    const savedLanguage = localStorage.getItem("huyen-language");

    return savedLanguage === "vi" || savedLanguage === "en"
      ? savedLanguage
      : "vi";
  });

  const [policy, setPolicy] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleLanguageChange = () => {
      const currentLanguage = localStorage.getItem("huyen-language");

      if (currentLanguage === "vi" || currentLanguage === "en") {
        setLanguage(currentLanguage);
      }
    };

    window.addEventListener("language-change", handleLanguageChange);

    return () => {
      window.removeEventListener("language-change", handleLanguageChange);
    };
  }, []);

  useEffect(() => {
    const loadPolicy = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("booking_policy")
        .select(
          "title_vi, title_en, content_vi, content_en, status"
        )
        .eq("status", true)
        .order("id", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error(error);
      }

      setPolicy(data);
      setLoading(false);
    };

    loadPolicy();
  }, []);

  const title =
    language === "vi" ? policy?.title_vi : policy?.title_en;

  const content =
    language === "vi" ? policy?.content_vi : policy?.content_en;

  return (
    <>
      <style jsx global>{`
        .policy-content {
          color: #334155;
          line-height: 1.8;
        }

        .policy-content p {
          margin: 0 0 1rem;
        }

        .policy-content h1 {
          margin: 1.75rem 0 1rem;
          font-size: 2rem;
          line-height: 1.25;
          font-weight: 700;
          color: #0f172a;
        }

        .policy-content h2 {
          margin: 1.5rem 0 0.75rem;
          font-size: 1.5rem;
          line-height: 1.3;
          font-weight: 700;
          color: #0f172a;
        }

        .policy-content h3 {
          margin: 1.25rem 0 0.5rem;
          font-size: 1.25rem;
          line-height: 1.4;
          font-weight: 600;
          color: #0f172a;
        }

        .policy-content ul {
          margin: 0 0 1rem;
          padding-left: 1.5rem;
          list-style: disc;
        }

        .policy-content ol {
          margin: 0 0 1rem;
          padding-left: 1.5rem;
          list-style: decimal;
        }

        .policy-content li {
          margin-bottom: 0.35rem;
        }

        .policy-content a {
          color: #0284c7;
          text-decoration: underline;
        }

        .policy-content blockquote {
          margin: 1rem 0;
          border-left: 4px solid #cbd5e1;
          padding-left: 1rem;
          color: #64748b;
        }

        .policy-content img {
          max-width: 100%;
          height: auto;
        }
      `}</style>

      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
          <Link
            href="/"
            className="mb-8 inline-flex text-sm font-medium text-sky-600 hover:text-sky-700"
          >
            &larr;{" "}
            {language === "vi"
              ? "Về trang chủ"
              : "Back to home"}
          </Link>

          {loading ? (
            <div className="py-20 text-center text-sm text-slate-500">
              {language === "vi" ? "Đang tải..." : "Loading..."}
            </div>
          ) : !policy ? (
            <div className="py-20 text-center text-slate-500">
              {language === "vi"
                ? "Chưa có nội dung chính sách."
                : "No policy content available."}
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                {title}
              </h1>

              <div
                className="policy-content mt-8"
                dangerouslySetInnerHTML={{
                  __html: content || "",
                }}
              />
            </>
          )}
        </div>
      </main>
    </>
  );
}
