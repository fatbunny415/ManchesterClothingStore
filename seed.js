const products = [
  { name: "Polo Básica", description: "Básica y elegante", price: 50000, stock: 2, category: "Superior", imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e32f85e98?auto=format&fit=crop&q=80&w=600", sizes: "S,M,L", colors: "Negro,Blanco", isActive: true },
  { name: "Gorra Gold", description: "Gorra premium dorada", price: 30000, stock: 10, category: "Accesorios", imageUrl: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=600", sizes: "L", colors: "Dorado,Negro", isActive: true },
  { name: "Chaqueta Invierno", description: "Abrigo grueso", price: 250000, stock: 5, category: "Superior", imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=600", sizes: "M,L,XL", colors: "Gris,Azul", isActive: true },
  { name: "Pantalón Casual", description: "Perfecto para el día", price: 120000, stock: 3, category: "Inferior", imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=600", sizes: "32,34,36", colors: "Azul,Negro", isActive: true }
];

async function seed() {
  for (const p of products) {
    console.log("Adding: " + p.name);
    try {
      const res = await fetch("http://localhost:5220/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p)
      });
      if (!res.ok) console.log("Failed: " + res.status);
    } catch (e) {
      console.log("Error: " + e.message);
    }
  }
}
seed();
