import { Sparkles, ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <div className="ai-badge">
          <Sparkles size={16} /> Công nghệ AI đề xuất thông minh
        </div>
        <h1>Thời Trang Hiện Đại<br />Cho Mọi Cá Tính</h1>
        <p>Khám phá bộ sưu tập đa dạng với phong cách trẻ trung, hiện đại. Hệ thống AI giúp bạn tìm được trang phục hoàn hảo.</p>
        <div className="hero-btns">
          <button className="btn-white">Mua sắm ngay <ArrowRight size={18} /></button>
          <button className="btn-outline"><Sparkles size={18} /> Gợi ý AI</button>
        </div>
      </div>

      <div className="wave-container">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 80C1200 80 1320 70 1380 65L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
}