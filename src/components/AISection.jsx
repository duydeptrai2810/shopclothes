import { Sparkles, ArrowRight } from "lucide-react";

export default function AISection() {
  return (
    <section className="ai-cta">
      <div className="ai-cta-icon">
        <Sparkles size={48} />
      </div>
      <h2>Để AI giúp bạn chọn đồ</h2>
      <p>Hệ thống AI thông minh phân tích sở thích của bạn và đề xuất những sản phẩm phù hợp nhất. Tiết kiệm thời gian, tìm được phong cách hoàn hảo.</p>
      <button className="btn-white" style={{ margin: '0 auto' }}>Khám phá ngay <ArrowRight size={18} /></button>
    </section>
  );
}