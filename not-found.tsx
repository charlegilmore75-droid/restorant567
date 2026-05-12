import Link from "next/link";
import { ChefHat } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen restaurant-gradient flex items-center justify-center p-4">
      <div className="text-center text-white animate-fade-in">
        <div className="w-20 h-20 bg-restaurant-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <ChefHat className="w-10 h-10 text-restaurant-gold" />
        </div>
        <h1 className="text-8xl font-bold text-restaurant-gold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
          404
        </h1>
        <h2 className="text-2xl font-bold mb-3">Page Not Found</h2>
        <p className="text-white/60 mb-8">The page you're looking for doesn't exist.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-restaurant-gold text-white px-8 py-3 rounded-full font-semibold hover:bg-restaurant-gold/90 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
