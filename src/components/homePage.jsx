import Hero from "./hero";
import {React, useState,useEffect} from "react";
import Features from "./features";
import ProductSection from "./productSection";
import AISection from "./AISection";
import "./home.css";

// Dữ liệu mẫu (Static Data)
const featuredProducts = [
  { id: 1, gender: "Unisex", category: "Áo thun", title: "Áo Thun Basic Premium", price: 299000, colors: ["#fff", "#000", "#4b5563"], image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500" },
  { id: 2, gender: "Unisex", category: "Quần jean", title: "Quần Jean Slim Fit", price: 599000, colors: ["#1e3a8a", "#60a5fa", "#000"], image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500" },
  { id: 3, gender: "Nam", category: "Áo hoodie", title: "Hoodie Streetwear", price: 699000, colors: ["#000", "#6b7280", "#78350f"], image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500" },
  { id: 4, gender: "Unisex", category: "Giày dép", title: "Giày Sneaker Trắng", price: 899000, colors: ["#fff", "#d1d5db", "#9ca3af"], image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=500" },
];

export default function HomePage() {
  return (
    <div className="home-container">
      <Hero />
      <Features />
      
      <ProductSection 
        title="Sản phẩm nổi bật" 
        subtitle="Những item được yêu thích nhất" 
        products={featuredProducts} 
      />

      <AISection />

      <ProductSection 
        title="Hàng mới về" 
        subtitle="Cập nhật xu hướng mới nhất" 
        products={featuredProducts} // Dùng tạm data cũ
      />
      
    </div>
  );
}