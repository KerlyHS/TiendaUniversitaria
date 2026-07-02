/**
 * Helper to resolve the correct price and unit for displaying products,
 * especially food products with base prices of $0.00 and variations.
 */
export const getProductDisplayPrice = (product) => {
  if (!product) return { precio: 0, unidad: null };

  const FOOD_CATEGORIES = ['AGRICOLA', 'HORTALIZAS', 'FRUTAS', 'CARNES', 'LACTEOS', 'BEBIDAS'];
  const hasVariations = product.variaciones && product.variaciones.length > 0;

  if (FOOD_CATEGORIES.includes(product.categoria) && hasVariations) {
    // 1. Prioridad: Buscar una variación de Kilo/Kg
    const kiloVar = product.variaciones.find(v => 
      v.nombre.toLowerCase().includes('kilo') || 
      v.nombre.toLowerCase().includes('kg')
    );
    if (kiloVar && kiloVar.precio_fijo) {
      return { precio: parseFloat(kiloVar.precio_fijo), unidad: 'Kg' };
    }

    // 2. Prioridad: Buscar una variación de Litro/L
    const litroVar = product.variaciones.find(v => 
      v.nombre.toLowerCase().includes('litro') || 
      v.nombre.toLowerCase() === '1l' ||
      v.nombre.toLowerCase().includes('1 l')
    );
    if (litroVar && litroVar.precio_fijo) {
      return { precio: parseFloat(litroVar.precio_fijo), unidad: 'L' };
    }

    // 3. Prioridad: Buscar una variación de Libra/Lb
    const libraVar = product.variaciones.find(v => 
      v.nombre.toLowerCase().includes('libra') || 
      v.nombre.toLowerCase().includes('lb')
    );
    if (libraVar && libraVar.precio_fijo) {
      return { precio: parseFloat(libraVar.precio_fijo), unidad: 'Lb' };
    }

    // 4. Fallback: Primera variación que tenga precio_fijo
    const validVar = product.variaciones.find(v => v.precio_fijo !== null && v.precio_fijo !== undefined);
    if (validVar) {
      let displayUnit = validVar.nombre;
      if (displayUnit.toLowerCase().includes('kilo')) displayUnit = 'Kg';
      else if (displayUnit.toLowerCase().includes('libra')) displayUnit = 'Lb';
      else if (displayUnit.toLowerCase().includes('litro')) displayUnit = 'L';
      else if (displayUnit.toLowerCase().includes('gramo')) displayUnit = 'g';
      else if (displayUnit.toLowerCase().includes('mililitro') || displayUnit.toLowerCase().includes('ml')) displayUnit = 'ml';
      
      return { precio: parseFloat(validVar.precio_fijo), unidad: displayUnit };
    }
  }

  // Fallback para otros productos/categorías sin variaciones o con precio base directo
  return { precio: parseFloat(product.precio || 0), unidad: null };
};
