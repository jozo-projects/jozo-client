"use client";

import { JozoLoaderWithText } from "@/components/ui/jozo-loader";
import { useToast } from "@/hooks/use-toast";
import { addSongToQueue, removeSongFromQueue } from "@/lib/api-utils";
import { Booking, QueueSong } from "@/types/booking.d";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface VideoItem {
  video_id: string;
  title: string;
  duration: number;
  url: string;
  thumbnail: string;
  author: string;
  booking_id?: string;
}

interface VideoData {
  videos: VideoItem[];
  total: number;
  query: string;
  booking_id?: string;
  error?: string;
}

interface SearchSongsClientProps {
  roomScheduleId?: string;
  initialBookingDetails?: Booking | null;
}

async function searchYouTube(
  query: string,
  roomScheduleId?: string,
): Promise<VideoData> {
  const searchQuery = query.trim();

  const url = roomScheduleId
    ? `/api/search-videos?query=${encodeURIComponent(
        searchQuery,
      )}&booking=${encodeURIComponent(roomScheduleId)}`
    : `/api/search-videos?query=${encodeURIComponent(searchQuery)}`;

  const res = await fetch(url);
  const data = await res.json();
  return data;
}

// Không cần fetchBookingDetails nữa vì SSR sẽ handle việc lấy dữ liệu

export default function SearchSongsClient({
  roomScheduleId,
  initialBookingDetails,
}: SearchSongsClientProps) {
  const { toast } = useToast();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [bookingDetails, setBookingDetails] = useState<Booking | null>(
    initialBookingDetails || null,
  );
  const [loadingBooking, setLoadingBooking] = useState(false);
  const [addingToQueue, setAddingToQueue] = useState<string | null>(null);
  const [queueSongs, setQueueSongs] = useState<QueueSong[]>(
    initialBookingDetails?.queueSongs || [],
  );
  const [showQueueModal, setShowQueueModal] = useState(false);

  // Sync state khi initialBookingDetails thay đổi từ SSR
  useEffect(() => {
    if (initialBookingDetails) {
      setBookingDetails(initialBookingDetails);
      setQueueSongs(initialBookingDetails.queueSongs || []);
    }
  }, [initialBookingDetails]);

  // Function để refresh booking details và queue songs
  const refreshBookingDetails = useCallback(async () => {
    if (!roomScheduleId) return;

    setLoadingBooking(true);
    try {
      // Force refresh SSR data - SSR sẽ tự động fetch dữ liệu mới từ cache
      router.refresh();

      // SSR sẽ re-render component với dữ liệu mới từ getBookingDetails()
      // Không cần fetch client-side vì SSR đã handle
    } catch (error) {
      console.error("Error refreshing booking details:", error);
    } finally {
      setLoadingBooking(false);
    }
  }, [roomScheduleId, router]);

  // Debounce effect để delay việc tìm kiếm
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 700);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Hàm tìm kiếm được debounce
  const performSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) return;

      setLoading(true);
      setError(null);

      try {
        const result = await searchYouTube(query, roomScheduleId || undefined);
        setData(result);
      } catch {
        setError("Có lỗi xảy ra khi tìm kiếm video");
      } finally {
        setLoading(false);
      }
    },
    [roomScheduleId],
  );

  // Effect để thực hiện tìm kiếm khi debouncedQuery thay đổi
  useEffect(() => {
    if (debouncedQuery.trim()) {
      performSearch(debouncedQuery);
    }
  }, [debouncedQuery, performSearch]);

  // Effect để đóng modal khi nhấn ESC
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showQueueModal) {
        setShowQueueModal(false);
      }
    };

    if (showQueueModal) {
      document.addEventListener("keydown", handleEscKey);
      // Ngăn scroll body khi modal mở
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
      document.body.style.overflow = "unset";
    };
  }, [showQueueModal]);

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-6">Tìm kiếm video</h1>

      {roomScheduleId && (
        <div className="glass-surface mb-6 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 rounded-full p-2">
              <svg
                className="w-5 h-5 text-primary"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              {loadingBooking ? (
                <div className="flex items-center gap-2">
                  <JozoLoaderWithText
                    text="Đang tải thông tin booking..."
                    size="sm"
                    className="text-sm"
                  />
                </div>
              ) : bookingDetails ? (
                <div>
                  <p className="text-sm text-primary/70">Thông tin đặt box:</p>
                  <p className="text-lg font-bold text-primary">
                    {bookingDetails.customerName}
                  </p>
                  <p className="text-sm text-primary/70">
                    Mã: #{bookingDetails.bookingCode}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-primary/70">Mã đặt box:</p>
                  <p className="text-lg font-bold text-primary font-mono tracking-wider">
                    #{roomScheduleId.slice(0, 6).toUpperCase()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Form tìm kiếm */}
      <div className="mb-8">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nhập tên bài, ca sĩ hoặc lời nhạc"
              className="w-full px-4 py-3 pr-12 border border-primary/18 rounded-lg focus:ring-2 focus:ring-primary outline-none focus:border-transparent text-lg text-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-primary/50 hover:text-primary/70 transition-colors duration-200"
                type="button"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Lỗi:</p>
          <p>{error}</p>
        </div>
      ) : loading ? (
        <div className="glass-surface rounded-2xl p-6 text-center">
          <JozoLoaderWithText
            text="Đang tìm kiếm video..."
            size="lg"
            className="text-lg"
          />
        </div>
      ) : data?.error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Lỗi:</p>
          <p>{data.error}</p>
        </div>
      ) : data ? (
        <div className="space-y-6">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {data.videos.map((video) => (
              <div
                key={video.video_id}
                className="glass-surface overflow-hidden rounded-2xl transition-transform duration-300 hover:-translate-y-0.5"
              >
                <div className="relative">
                  <Image
                    src={video.thumbnail}
                    alt={video.title}
                    width={400}
                    height={192}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-primary/80 text-primary-foreground px-2 py-1 rounded text-sm">
                    {Math.floor(video.duration / 60)}:
                    {(video.duration % 60).toString().padStart(2, "0")}
                  </div>
                </div>

                <div className="p-4">
                  <h3
                    className="font-semibold text-lg mb-2 text-foreground overflow-hidden"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {video.title}
                  </h3>

                  <div className="space-y-2 text-sm text-primary/70 mb-4">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                      <span className="font-medium">{video.author}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        if (!roomScheduleId) {
                          toast({
                            variant: "destructive",
                            title: "Lỗi",
                            description:
                              "Không có thông tin booking để thêm video",
                          });
                          return;
                        }

                        setAddingToQueue(video.video_id);
                        const result = await addSongToQueue(roomScheduleId, {
                          video_id: video.video_id,
                          title: video.title,
                          thumbnail: video.thumbnail,
                          author: video.author,
                          duration: video.duration,
                        });

                        if (result.success) {
                          toast({
                            title: "Thành công!",
                            description: `Đã thêm "${video.title}" vào danh sách phát!`,
                          });
                          // Refresh danh sách video sau khi thêm thành công
                          refreshBookingDetails();
                        } else {
                          toast({
                            variant: "destructive",
                            title: "Lỗi",
                            description:
                              result.message ||
                              "Có lỗi xảy ra khi thêm video vào danh sách phát",
                          });
                        }

                        setAddingToQueue(null);
                      }}
                      disabled={
                        !roomScheduleId || addingToQueue === video.video_id
                      }
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-brand-hover transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addingToQueue === video.video_id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                          Đang thêm...
                        </>
                      ) : (
                        <span className="flex items-center justify-center gap-1 whitespace-nowrap">
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                          </svg>
                          Thêm video
                        </span>
                      )}
                    </button>
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors duration-200"
                    >
                      Xem Video
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Floating Button */}
      {roomScheduleId && (
        <button
          onClick={() => setShowQueueModal(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 z-50 flex items-center justify-center"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 10h16M4 14h16M4 18h16"
            />
          </svg>
          {queueSongs.length > 0 && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {queueSongs.length}
            </div>
          )}
        </button>
      )}

      {/* Modal */}
      {showQueueModal && (
        <div
          className="fixed inset-0 bg-primary/40 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowQueueModal(false);
            }
          }}
        >
          <div className="glass-overlay flex max-h-[80vh] w-full max-w-2xl flex-col rounded-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-primary/12">
              <div className="flex items-center gap-3">
                <div className="bg-primary/15 rounded-full p-2">
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    Danh sách phát
                  </h2>
                  <p className="text-sm text-primary/70">
                    {queueSongs.length} video đã được thêm
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowQueueModal(false)}
                className="p-2 text-primary/50 hover:text-primary/70 hover:bg-primary/8 rounded-lg transition-colors duration-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {queueSongs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-24 h-24 bg-primary/8 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-12 h-12 text-primary/50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-primary/80 mb-2">
                    Danh sách phát trống
                  </h3>
                  <p className="text-sm text-primary/55 max-w-sm">
                    Hãy tìm kiếm và thêm những bài nhạc yêu thích vào danh sách
                    phát của bạn!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {queueSongs.map((song, index) => (
                    <div
                      key={`${song.video_id}-${index}`}
                      className="flex items-center gap-2 p-3 bg-primary/6 rounded-lg hover:bg-primary/8 transition-colors duration-200"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-primary/15 rounded flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">
                            {index + 1}
                          </span>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        <Image
                          src={song.thumbnail}
                          alt={song.title}
                          width={60}
                          height={45}
                          className="w-15 h-11 object-cover rounded"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3
                          className="font-semibold text-foreground text-sm leading-tight"
                          title={song.title}
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {song.title}
                        </h3>
                        <p className="text-primary/70 text-xs truncate">
                          {song.author}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-primary/55">
                            {Math.floor(song.duration / 60)}:
                            {(song.duration % 60).toString().padStart(2, "0")}
                          </span>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        <button
                          onClick={async () => {
                            if (!roomScheduleId) {
                              toast({
                                variant: "destructive",
                                title: "Lỗi",
                                description:
                                  "Không có thông tin booking để xóa video",
                              });
                              return;
                            }

                            const result = await removeSongFromQueue(
                              roomScheduleId,
                              index,
                            );

                            if (result.success) {
                              toast({
                                title: "Thành công!",
                                description: `Đã xóa "${song.title}" khỏi danh sách phát!`,
                              });
                              // Refresh danh sách video sau khi xóa thành công
                              refreshBookingDetails();
                            } else {
                              toast({
                                variant: "destructive",
                                title: "Lỗi",
                                description:
                                  result.message ||
                                  "Có lỗi xảy ra khi xóa video khỏi danh sách phát",
                              });
                            }
                          }}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors duration-200"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer - Ghi chú */}
            <div className="border-t border-primary/12 p-4 bg-blue-50">
              <div className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-xs text-blue-800 leading-relaxed">
                    <span className="font-semibold">Tiết kiệm thời gian:</span>{" "}
                    Thêm sẵn nhiều bài nhạc vào danh sách để không phải tìm kiếm
                    mỗi lần hết bài.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
