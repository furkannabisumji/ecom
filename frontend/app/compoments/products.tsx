import ProductCard from './productcard'
import { Product } from '@/types'

const ProductList: React.FC<{ products: Product[] }> = ({ products }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
    {products.map((product) => (
      <ProductCard key={product.id} product={product} />
    ))}
  </div>
)

export default ProductList
