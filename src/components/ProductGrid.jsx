import React from "react";
import ProductCard from "./ProductCard";

/**
 * Renders the product grid. Uses the same container classes and data attributes
 * so existing CSS/JS (e.g. quick view) keep working.
 */
function ProductGrid({ products = [], totalPages = 18, addToCart }) {
  return (
    <div
      className="m-collection-products m:flex m:flex-wrap m-cols-4"
      data-total-pages={totalPages}
      data-product-container
    >
      {products.map((product) => (
        <ProductCard key={product.productId} product={product} onAddToCart={addToCart} />
      ))}
    </div>
  );
}

export default ProductGrid;
