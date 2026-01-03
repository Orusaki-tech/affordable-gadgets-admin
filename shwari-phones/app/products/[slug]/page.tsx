import { Metadata } from 'next';
import { ProductDetail } from '@/components/ProductDetail';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  // TODO: Fetch product data for metadata
  return {
    title: 'Product Details',
    description: 'View product details, specifications, and reviews',
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-8">
        <ProductDetail slug={slug} />
      </main>
      <Footer />
    </div>
  );
}

