"use client";

import { useState } from "react";
import { cancelBooking } from "@/app/actions/booking";
import { useRouter } from "next/navigation";

export default function CancelButton({ bookingId, clientId }: { bookingId: string, clientId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCancel = async () => {
    if (!confirm("Вы уверены, что хотите отменить эту запись?")) return;
    setLoading(true);
    try {
      await cancelBooking(bookingId, clientId);
      router.refresh();
    } catch (err) {
      alert("Ошибка при отмене");
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleCancel}
      disabled={loading}
      className="px-5 py-2.5 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-colors text-sm"
    >
      {loading ? "Отмена..." : "Отменить визит"}
    </button>
  );
}
