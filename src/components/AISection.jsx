import { Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AISection() {
  // THÊM DÒNG NÀY VÀO ĐÂY
  const navigate = useNavigate();

  return (
    <section className="ai-cta">
      <div className="ai-cta-icon">
        <Sparkles size={48} />
      </div>
      <h2>Để AI giúp bạn chọn đồ</h2>
      <p>
        Hệ thống AI thông minh phân tích sở thích của bạn và đề xuất những sản phẩm phù hợp nhất. 
        Tiết kiệm thời gian, tìm được phong cách hoàn hảo.
      </p>
      
      <button 
        className="btn-white"  
        style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto' }} 
        onClick={() => navigate('/ai-suggest')} // Bây giờ biến navigate đã tồn tại
      >
        Khám phá ngay <ArrowRight size={18} />
      </button>
    </section>
  );
}