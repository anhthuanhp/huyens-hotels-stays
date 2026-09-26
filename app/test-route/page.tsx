export default function TestRoutePage() {
return (
<main className="min-h-screen bg-yellow-200 p-10">
<h1 className="text-4xl font-bold text-red-600">
TEST ROUTE HOẠT ĐỘNG
</h1>

  <p className="mt-4 text-xl">
    Nếu thấy dòng này thì Next.js đang đọc đúng file test.
  </p>

  <a
    href="/"
    className="mt-8 inline-block rounded-lg bg-blue-600 px-6 py-3 font-bold text-white"
  >
    TEST → Về Home
  </a>
</main>

);
}