import { extractQueueSongs } from "@/lib/queue-songs";
import { QueueSong } from "@/types/booking.d";

/**
 * Utility function để lấy API URL từ environment variables
 * Fallback về localhost:4000 cho development
 */
export const getApiUrl = (): string => {
  return process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:4000";
};

/**
 * Tạo full API endpoint URL
 */
export const createApiEndpoint = (endpoint: string): string => {
  const baseUrl = getApiUrl();
  return `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
};

/**
 * Cancel booking API call
 */
export const cancelBooking = async (
  bookingId: string,
  phone: string
): Promise<{
  success: boolean;
  message?: string;
  bookingId?: string;
}> => {
  try {
    const apiUrl = createApiEndpoint(`/bookings/${bookingId}/cancel`);

    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone }),
    });

    const result = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: result.message,
        bookingId: result.bookingId,
      };
    } else {
      return {
        success: false,
        message: result.message || "Có lỗi xảy ra khi hủy booking",
      };
    }
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return {
      success: false,
      message: "Có lỗi xảy ra khi hủy booking. Vui lòng thử lại sau.",
    };
  }
};

export const addSongToQueue = async (
  bookingId: string,
  video: {
    video_id: string;
    title: string;
    thumbnail: string;
    author: string;
    duration: number;
  }
): Promise<{
  success: boolean;
  message?: string;
  queueSongs?: QueueSong[];
}> => {
  // Sử dụng Next.js API route để có cache revalidation
  const apiUrl = `/api/bookings/${bookingId}/queue-songs`;

  // Format dữ liệu theo yêu cầu mới với position mặc định là "top"
  const requestData = {
    video_id: video.video_id,
    title: video.title,
    thumbnail: video.thumbnail,
    author: video.author,
    duration: video.duration,
    position: "top",
  };

  const response = await fetch(apiUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  });
  const result = await response.json();
  return {
    ...result,
    queueSongs: extractQueueSongs(result),
  };
};

export interface ResetPasswordRequestBody {
  forgot_password_token: string;
  password: string;
  confirm_password: string;
}

export const forgotPassword = async (
  email: string,
): Promise<{
  success: boolean;
  message?: string;
}> => {
  try {
    const apiUrl = createApiEndpoint("/users/forgot-password");

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: result.message || "Đã gửi email đặt lại mật khẩu",
      };
    }

    return {
      success: false,
      message: result.message || "Có lỗi xảy ra khi gửi email đặt lại mật khẩu",
    };
  } catch (error) {
    console.error("Error requesting forgot password:", error);
    return {
      success: false,
      message: "Có lỗi xảy ra khi gửi email đặt lại mật khẩu. Vui lòng thử lại sau.",
    };
  }
};

export const resetPassword = async (
  data: ResetPasswordRequestBody
): Promise<{
  success: boolean;
  message?: string;
}> => {
  try {
    const apiUrl = createApiEndpoint("/users/reset-password");

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: result.message || "Đặt lại mật khẩu thành công",
      };
    }

    return {
      success: false,
      message: result.message || "Có lỗi xảy ra khi đặt lại mật khẩu",
    };
  } catch (error) {
    console.error("Error resetting password:", error);
    return {
      success: false,
      message: "Có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng thử lại sau.",
    };
  }
};

export const fetchQueueSongs = async (
  bookingId: string,
): Promise<QueueSong[]> => {
  const response = await fetch(`/api/bookings/${bookingId}/queue-songs`, {
    cache: "no-store",
  });
  const result = await response.json();
  return extractQueueSongs(result);
};

export const removeSongFromQueue = async (
  bookingId: string,
  index: number
): Promise<{
  success: boolean;
  message?: string;
  queueSongs?: QueueSong[];
}> => {
  try {
    // Sử dụng Next.js API route để có cache revalidation
    const apiUrl = `/api/bookings/${bookingId}/queue-songs/${index}`;

    const response = await fetch(apiUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const result = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: result.message || "Đã xóa bài khỏi danh sách phát",
        queueSongs: extractQueueSongs(result),
      };
    } else {
      return {
        success: false,
        message: result.message || "Có lỗi xảy ra khi xóa bài",
      };
    }
  } catch (error) {
    console.error("Error removing song from queue:", error);
    return {
      success: false,
      message: "Có lỗi xảy ra khi xóa bài. Vui lòng thử lại sau.",
    };
  }
};
