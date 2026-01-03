# Affordable Gadgets E-commerce Frontend

Next.js 14 e-commerce frontend for Affordable Gadgets brand.

## Features

- 🏠 Homepage with stories carousel, special offers, and featured products
- 📱 Product browsing with search and filters
- 🛒 Shopping cart functionality
- 💳 Checkout flow (creates Lead, not direct order)
- 🔍 Product comparison (up to 4 products)
- 🎯 Match score calculator
- 📱 Responsive design
- 🔍 SEO optimized

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create a `.env.local` file (already created with defaults):
```
NEXT_PUBLIC_BRAND_CODE=AFFORDABLE_GADGETS
NEXT_PUBLIC_BRAND_NAME=Affordable Gadgets
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/
  ├── layout.tsx          # Root layout with providers
  ├── page.tsx            # Homepage
  ├── products/           # Product pages
  ├── cart/               # Cart page
  ├── checkout/           # Checkout pages
  ├── compare/            # Product comparison
  └── match-score/        # Match score calculator

components/
  ├── Header.tsx
  ├── Footer.tsx
  ├── ProductCard.tsx
  ├── ProductGrid.tsx
  ├── StoriesCarousel.tsx
  └── ...

lib/
  ├── api/                # API client functions
  ├── hooks/              # React Query hooks
  ├── utils/              # Utility functions
  └── config/             # Configuration
```

## API Integration

The frontend connects to the Django backend API at `/api/v1/public/`. All requests automatically include the `X-Brand-Code` header based on the brand configuration.

## Key Features

### Stories Carousel
- Auto-advancing stories (default 5 seconds)
- Manual navigation
- Progress indicators
- Supports promotions, reviews, and videos

### Product Cards
- Product images with fallback
- Price ranges
- Stock availability
- Interest count indicators
- Hover effects

### Cart & Checkout
- Persistent cart (session-based)
- Customer recognition by phone
- Checkout creates Lead (not direct order)
- Success page with lead reference

### Comparison
- Compare up to 4 products side-by-side
- Key features comparison
- Easy add/remove

### Match Score
- Calculate product match based on criteria
- Price, specs, availability, rating
- Weighted scoring algorithm
- Top matches display

## SEO

- Meta tags for all pages
- Open Graph tags
- Structured data (ready for implementation)
- Semantic HTML
- URL slugs for products

## Customization

### Brand Configuration
Edit `lib/config/brand.ts` or environment variables to change brand settings.

### Styling
The project uses Tailwind CSS. Customize styles in:
- `app/globals.css` for global styles
- Component files for component-specific styles

### Design System
When design system is provided, update:
- Color scheme in Tailwind config
- Typography in `app/layout.tsx`
- Component styles

## Development

- TypeScript for type safety
- React Query for data fetching
- Next.js App Router
- Tailwind CSS for styling

## Production Build

```bash
npm run build
npm start
```

## Notes

- Cart uses session keys stored in localStorage
- Customer recognition is phone-based (no password)
- Checkout creates a Lead, salesperson will contact customer
- All API requests include brand header automatically
