import { getCategories } from "@/app/api/categorias/route"
import Link from "next/link"

export default async function CategoryList() {
  const categories = await getCategories()
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/items?category=${category.name}&sort=relevance`}
          className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
            {category.svg ? (
              <div dangerouslySetInnerHTML={{ __html: category.svg }} />
            ) : null}
          </div>
          <span className="text-sm font-medium text-gray-800">{category.name}</span>
        </Link>
      ))}
    </div>
  )
}