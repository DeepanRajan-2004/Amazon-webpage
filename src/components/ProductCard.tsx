import { Star, ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export const ProductCard = ({ product, onClick }: ProductCardProps) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product.id);
  };

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 overflow-hidden group"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-sm font-bold">
            -{discount}%
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="text-sm text-gray-600 mb-1">{product.brand}</div>
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
          {product.name}
        </h3>

        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1">
            <Star size={16} className="fill-orange-400 text-orange-400" />
            <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
          </div>
          <span className="text-sm text-gray-500">({product.review_count.toLocaleString()})</span>
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </span>
          {product.original_price && (
            <span className="text-sm text-gray-500 line-through">
              ${product.original_price.toFixed(2)}
            </span>
          )}
        </div>

        {product.stock > 0 ? (
          <button
            onClick={handleAddToCart}
            className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <ShoppingCart size={18} />
            Add to Cart
          </button>
        ) : (
          <div className="w-full bg-gray-300 text-gray-600 py-2 rounded-md text-center font-medium">
            Out of Stock
          </div>
        )}
      </div>
    </div>
  );
};
