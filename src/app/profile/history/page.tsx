import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type UsageHistory = {
  items: Array<{
    billId: string;
    invoiceCode?: string;
    roomName: string;
    startTime?: string;
    endTime?: string;
    createdAt: string;
    totalAmount: number;
    paymentMethod?: string;
  }>;
  totalCount: number;
  totalAmount: number;
  page: number;
  limit: number;
};
const dateLabel = (value?: string) =>
  value
    ? new Date(value).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })
    : "—";

export default async function UsageHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const token = (await cookies()).get("access_token")?.value;
  if (!token) redirect("/login");
  const rawPage = Number((await searchParams).page || 1);
  const page =
    Number.isSafeInteger(rawPage) && rawPage > 0 && rawPage <= 100000
      ? rawPage
      : 1;
  const backend = (
    process.env.NEXT_PUBLIC_BACKEND_API_URL ||
    process.env.API_URL ||
    "http://localhost:4000"
  ).replace(/\/$/, "");
  let data: UsageHistory | null = null;
  let unauthorized = false;
  try {
    const res = await fetch(
      `${backend}/membership/me/history?page=${page}&limit=10`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      },
    );
    unauthorized = res.status === 401;
    if (res.ok) data = (await res.json()).result;
  } catch {
    // Keep account navigation available when the API is unavailable.
  }
  if (unauthorized) redirect("/login");

  return (
    <div className="mx-auto w-full max-w-lg space-y-4 pb-8">
      <Link
        href="/profile"
        className="inline-flex py-2 text-sm text-foreground/70"
      >
        ← Tài khoản
      </Link>
      <header className="glass-surface rounded-2xl p-4">
        <h1 className="text-xl font-bold">Lịch sử sử dụng</h1>
      </header>
      {!data ? (
        <section
          className="glass-surface space-y-3 rounded-2xl p-4"
          role="alert"
        >
          <p className="text-sm">
            Chưa tải được lịch sử, khách iu thử lại nhé.
          </p>
          <Link
            href={`/profile/history?page=${page}`}
            className="inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Thử lại
          </Link>
        </section>
      ) : !data.items.length ? (
        <p className="glass-surface rounded-2xl p-4 text-sm text-foreground/70">
          {page > 1
            ? "Không có phiên ở trang này."
            : "Khách iu chưa có phiên đã thanh toán."}
        </p>
      ) : (
        <div className="space-y-3">
          {data.items.map((item) => (
            <article
              key={item.billId}
              className="glass-surface space-y-2 rounded-2xl p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold">{item.roomName}</h2>
                <span className="font-semibold">
                  {item.totalAmount.toLocaleString("vi-VN")}đ
                </span>
              </div>
              <p className="text-xs text-foreground/65">
                {item.invoiceCode || "Hóa đơn"}
              </p>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-foreground/65">Bắt đầu</dt>
                  <dd>{dateLabel(item.startTime || item.createdAt)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-foreground/65">Kết thúc</dt>
                  <dd>{dateLabel(item.endTime)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-foreground/65">Thanh toán</dt>
                  <dd>
                    {item.paymentMethod === "cash"
                      ? "Tiền mặt"
                      : item.paymentMethod === "bank_transfer"
                        ? "Chuyển khoản"
                        : "—"}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      )}
      {data && (page > 1 || data.totalCount > data.limit) && (
        <nav
          aria-label="Phân trang lịch sử"
          className="flex items-center justify-between text-sm"
        >
          {page > 1 ? (
            <Link
              href={`/profile/history?page=${page - 1}`}
              className="glass-control rounded-xl px-4 py-2"
            >
              Trước
            </Link>
          ) : (
            <span />
          )}
          <span>Trang {page}</span>
          {page * data.limit < data.totalCount ? (
            <Link
              href={`/profile/history?page=${page + 1}`}
              className="glass-control rounded-xl px-4 py-2"
            >
              Sau
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
