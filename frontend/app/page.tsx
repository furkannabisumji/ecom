import ProductList from '@/app/compoments/products'

  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}products`)
  const data = await response.json()
const HomePage: React.FC = () => {
  return (
    <main className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Our Products</h1>
      <ProductList products={data.message}/>
    </main>
  )
}

export default HomePage
