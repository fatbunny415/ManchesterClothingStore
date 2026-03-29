// Script de inicialización para MongoDB
// Para ejecutarlo desde la terminal:
// mongosh < mongo-seed.js

// 1. Usar o crear la base de datos
use ManchesterClothingDb;

print("Creando colecciones...");

// 2. Crear las colecciones (MongoDB las crea automáticamente al insertar, pero esto lo formaliza)
db.createCollection("Users");
db.createCollection("Categories");
db.createCollection("Products");
db.createCollection("Orders");
db.createCollection("Carts");
db.createCollection("CartItems");
db.createCollection("OrderItems");

print("Insertando datos iniciales (Seed)...");

// 3. Crear GUIDs / UUIDs (El driver de C# de tu proyecto usa Guids por defecto)
const catId1 = UUID();
const catId2 = UUID();

// Insertar algunas categorías
db.Categories.insertMany([
  {
    _id: catId1,
    Name: "Ropa de Hombre",
    Description: "Ropa elegante y casual para hombre",
    Products: []
  },
  {
    _id: catId2,
    Name: "Ropa de Mujer",
    Description: "Colección exclusiva para mujer",
    Products: []
  }
]);

// Insertar algunos productos
db.Products.insertMany([
  {
    _id: UUID(),
    Name: "Camiseta Básica M",
    Description: "Camiseta de algodón 100% color gris",
    Price: NumberDecimal("15.99"),
    StockQuantity: 100,
    CategoryId: catId1
  },
  {
    _id: UUID(),
    Name: "Pantalón Denim Ajustado",
    Description: "Jeans cómodos de uso diario",
    Price: NumberDecimal("45.50"),
    StockQuantity: 50,
    CategoryId: catId2
  }
]);

print("¡Base de datos 'ManchesterClothingDb' inicializada con éxito!");
