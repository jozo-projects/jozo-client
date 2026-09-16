"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Facebook, Copy, Mail, Link } from "lucide-react";
import { ZaloIcon, TelegramIcon, WhatsAppIcon } from "./share-icons";

interface ShareBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  shareData: {
    title: string;
    text: string;
    url?: string;
  };
}

interface ShareOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
}

export const ShareBottomSheet = ({
  isOpen,
  onClose,
  shareData,
}: ShareBottomSheetProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const shareOptions: ShareOption[] = [
    {
      id: "messenger",
      name: "Messenger",
      icon: <MessageCircle className="w-6 h-6" />,
      color: "bg-blue-500",
      action: () => shareToMessenger(),
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: <Facebook className="w-6 h-6" />,
      color: "bg-blue-600",
      action: () => shareToFacebook(),
    },
    {
      id: "zalo",
      name: "Zalo",
      icon: <ZaloIcon className="w-6 h-6" />,
      color: "bg-blue-400",
      action: () => shareToZalo(),
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      icon: <WhatsAppIcon className="w-6 h-6" />,
      color: "bg-green-500",
      action: () => shareToWhatsApp(),
    },
    {
      id: "telegram",
      name: "Telegram",
      icon: <TelegramIcon className="w-6 h-6" />,
      color: "bg-blue-500",
      action: () => shareToTelegram(),
    },
    {
      id: "copy",
      name: "Sao chép",
      icon: <Copy className="w-6 h-6" />,
      color: "bg-primary/60",
      action: () => copyToClipboard(),
    },
    {
      id: "email",
      name: "Email",
      icon: <Mail className="w-6 h-6" />,
      color: "bg-red-500",
      action: () => shareToEmail(),
    },
    {
      id: "link",
      name: "Chia sẻ link",
      icon: <Link className="w-6 h-6" />,
      color: "bg-purple-500",
      action: () => shareLink(),
    },
  ];

  const shareToMessenger = () => {
    const url = `https://www.facebook.com/dialog/send?app_id=YOUR_APP_ID&link=${encodeURIComponent(
      shareData.url || window.location.href
    )}&redirect_uri=${encodeURIComponent(window.location.href)}`;
    window.open(url, "_blank");
    onClose();
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      shareData.url || window.location.href
    )}`;
    window.open(url, "_blank");
    onClose();
  };

  const shareToZalo = () => {
    const url = `https://zalo.me/share?url=${encodeURIComponent(
      shareData.url || window.location.href
    )}&title=${encodeURIComponent(shareData.title)}&desc=${encodeURIComponent(
      shareData.text
    )}`;
    window.open(url, "_blank");
    onClose();
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareData.text);
      alert("Đã sao chép vào clipboard!");
    } catch (error) {
      console.error("Lỗi khi sao chép:", error);
    }
    onClose();
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(`${shareData.title}\n\n${shareData.text}`);
    const url = `https://wa.me/?text=${text}`;
    window.open(url, "_blank");
    onClose();
  };

  const shareToTelegram = () => {
    const text = encodeURIComponent(`${shareData.title}\n\n${shareData.text}`);
    const url = `https://t.me/share/url?url=${encodeURIComponent(
      shareData.url || window.location.href
    )}&text=${text}`;
    window.open(url, "_blank");
    onClose();
  };

  const shareToEmail = () => {
    const subject = encodeURIComponent(shareData.title);
    const body = encodeURIComponent(shareData.text);
    const url = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = url;
    onClose();
  };

  const shareLink = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: shareData.title,
          text: shareData.text,
          url: shareData.url || window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(
          shareData.url || window.location.href
        );
        alert("Đã sao chép link vào clipboard!");
      }
    } catch (error) {
      console.error("Lỗi khi chia sẻ:", error);
    }
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-primary/50 transition-opacity duration-300 ${
          isOpen ? "opacity-50" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        className={`glass-overlay relative w-full rounded-t-3xl transform transition-transform duration-300 ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Handle */}
        <div className="flex justify-center pt-4 pb-2">
          <div className="w-12 h-1 bg-primary/25 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-center px-6 pb-4">
          <h3 className="text-lg font-semibold text-foreground">Chia sẻ</h3>
        </div>

        {/* Share Options */}
        <div className="px-6 pb-8">
          <div className="grid grid-cols-4 gap-3">
            {shareOptions.map((option) => (
              <button
                key={option.id}
                onClick={option.action}
                className="flex flex-col items-center p-3 hover:bg-primary/6 rounded-xl transition-colors"
              >
                <div
                  className={`w-10 h-10 ${option.color} rounded-full flex items-center justify-center text-white mb-2`}
                >
                  {option.icon}
                </div>
                <span className="text-xs font-medium text-primary/80 text-center">
                  {option.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
