import { Product } from '@/types'
import Image from 'next/image'
import Link from 'next/link'
import { FC } from 'react'


const ProductCard: FC<{ product: Product }> = ({ product }) => {
  return (
    <div className="border rounded-lg shadow-md p-4 max-w-sm">
      <Image
        src={process.env.BUCKET+product.image}
        alt={product.title}
        width={400}
        height={200}
      />
      <div className="mt-4">
        <Link href={`/${product.slug}`}><h2 className="text-lg text-teal-400 font-bold">{product.title}</h2></Link>
        <p className="text-gray-500">{product.description}</p>
        <p className="mt-2 text-xl font-semibold text-blue-600">₹{product.price}</p>
      </div>
      <button className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
        Add to Cart
      </button>
    </div>
  )
}

export default ProductCard
