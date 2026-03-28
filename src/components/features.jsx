import { Truck, RefreshCcw, ShieldCheck } from "lucide-react";

export default function Features() {
  const items = [
    { icon: <Truck />, title: "Miễn phí vận chuyển", desc: "Đơn hàng trên 500.000đ" },
    { icon: <RefreshCcw />, title: "Đổi trả dễ dàng", desc: "Trong vòng 30 ngày" },
    { icon: <ShieldCheck />, title: "Thanh toán an toàn", desc: "Bảo mật 100%" }
  ];

  return (
    <section className="features">
      {items.map((item, idx) => (
        <div key={idx} className="feature-item">
          <div className="feature-icon">{item.icon}</div>
          <div className="feature-text">
            <h4>{item.title}</h4>
            <p>{item.desc}</p>
          </div>
        </div>
      ))}
    </section>
  );
}