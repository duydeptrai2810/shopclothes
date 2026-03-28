import { ArrowRight } from "lucide-react";

const ProductCard = ({ product }) => (
  <div className="product-card">
    <div className="product-img-wrapper">
      <span className="gender-badge">{product.gender}</span>
      <img src={product.image} alt={product.title} />
    </div>
    <div className="product-info">
      <div className="product-cat">{product.category}</div>
      <div className="product-title">{product.title}</div>
      <div className="product-price">{product.price.toLocaleString()} đ</div>
      <div className="color-swatches">
        {product.colors.map((c, i) => (
          <div key={i} className="swatch" style={{ backgroundColor: c }}></div>
        ))}
      </div>
    </div>
  </div>
);

export default function ProductSection({ title, subtitle, products }) {
  return (
    <section className="product-section">
      <div className="section-header">
        <div>
          <h2>{title}</h2>
          <p className="text-light">{subtitle}</p>
        </div>
        <div className="view-all">Xem tất cả <ArrowRight size={16} /></div>
      </div>
      <div className="product-grid">
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}