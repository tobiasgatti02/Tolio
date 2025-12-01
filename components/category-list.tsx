import { getCategoryIcon } from "@/lib/category-icons"
import { getCategories } from "@/lib/categories"
import Link from "next/link"

export default async function CategoryList() {
  const categories = await getCategories()
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/items?category=${category.nombre}&sort=relevance`}
          className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 group"
        >
          <div className="w-12 h-12 bg-emerald-100 group-hover:bg-emerald-200 rounded-full flex items-center justify-center mb-3 transition-colors">
            <div className="text-emerald-600 group-hover:text-emerald-700 transition-colors">
              {getCategoryIcon(category.nombre)}
            </div>
          </div>
          <span className="text-sm font-medium text-gray-800 text-center leading-tight">{category.nombre}</span>
        </Link>
      ))}
    </div>
  )
}
