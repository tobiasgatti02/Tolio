import Link from "next/link"
import { Search, TrendingUp, Clock, Shield } from "lucide-react"
import FeaturedItems from "@/components/featured-items"
import HeroSearch from "@/components/hero-search"
import CategoryList from "@/components/category-list"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-emerald-600 to-teal-500 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Borrow What You Need, Lend What You Don't</h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Access thousands of tools and items in your community without the commitment of ownership.
          </p>

          <HeroSearch />

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
            <div className="flex flex-col items-center">
              <div className="bg-white/20 p-3 rounded-full mb-3">
                <Search className="h-6 w-6" />
              </div>
              <span className="text-sm">Find Anything</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white/20 p-3 rounded-full mb-3">
                <Clock className="h-6 w-6" />
              </div>
              <span className="text-sm">Flexible Duration</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white/20 p-3 rounded-full mb-3">
                <Shield className="h-6 w-6" />
              </div>
              <span className="text-sm">Secure Transactions</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white/20 p-3 rounded-full mb-3">
                <TrendingUp className="h-6 w-6" />
              </div>
              <span className="text-sm">Earn From Lending</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Browse by Category</h2>
          <CategoryList />
        </div>
      </section>

      {/* Featured Items Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Featured Items</h2>
            <Link href="/items" className="text-emerald-600 hover:text-emerald-700 font-medium">
              View all
            </Link>
          </div>
          <FeaturedItems />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-emerald-600 font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Find What You Need</h3>
              <p className="text-gray-600">
                Browse thousands of items available in your area. Use filters to find exactly what you're looking for.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-emerald-600 font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Request to Borrow</h3>
              <p className="text-gray-600">
                Select your dates and send a request to the owner. Communicate through our secure messaging system.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-emerald-600 font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Pick Up & Return</h3>
              <p className="text-gray-600">
                Meet the owner to pick up the item. Use it for your agreed duration and return it in the same condition.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-emerald-600">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Start?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Join thousands of users who are already saving money and reducing waste by borrowing instead of buying.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-white text-emerald-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium text-lg"
            >
              Sign Up Now
            </Link>
            <Link
              href="/items"
              className="bg-emerald-700 text-white hover:bg-emerald-800 px-6 py-3 rounded-lg font-medium text-lg"
            >
              Browse Items
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

