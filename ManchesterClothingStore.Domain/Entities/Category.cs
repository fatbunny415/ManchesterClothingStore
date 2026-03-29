using System;
using System.Collections.Generic;

namespace ManchesterClothingStore.Domain.Entities;

public class Category
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    // Relación: 1 Categoría -> N Productos
    public List<Product> Products { get; set; } = new();
}
