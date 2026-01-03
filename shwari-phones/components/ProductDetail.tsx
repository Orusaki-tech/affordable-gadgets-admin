'use client';

import { useProductBySlug, useProductUnits } from '@/lib/hooks/useProducts';
import { usePromotion } from '@/lib/hooks/usePromotions';
import { useCart } from '@/lib/hooks/useCart';
import { useProductAccessories } from '@/lib/hooks/useAccessories';
import { useCompare } from '@/lib/hooks/useCompare';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils/format';
import { useState, useEffect, useMemo } from 'react';
import { ReviewsSection } from './ReviewsSection';
import { ProductRecommendations } from './ProductRecommendations';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getPlaceholderProductImage, getPlaceholderUnitImage, getPlaceholderVideoUrl, convertToYouTubeEmbed } from '@/lib/utils/placeholders';

interface ProductDetailProps {
  slug: string;
}

type TabType = 'overview' | 'specs' | 'reviews' | 'videos';

interface UnitCardProps {
  unit: any;
  isSelected: boolean;
  onSelect: (unitId: number) => void;
  promotionPrice: number | null;
  onColorSelect: (color: string | null) => void;
}

function UnitCard({ unit, isSelected, onSelect, promotionPrice, onColorSelect }: UnitCardProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const unitImages = unit.images || [];
  const primaryImage = unitImages.find((img: any) => img.is_primary) || unitImages[0];
  const displayImage = unitImages[imageIndex] || primaryImage;
  const imageUrl = displayImage?.image_url || null;
  
  const handleImageClick = (index: number, img: any) => {
    setImageIndex(index);
    // Auto-select color if image has associated color
    if (img.color_name) {
      onColorSelect(img.color_name);
    }
  };

  return (
    <div
      onClick={() => onSelect(unit.id)}
      className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
        isSelected
          ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200'
          : 'border-gray-200 hover:border-blue-300 bg-white'
      }`}
    >
      {/* Unit Info - Compact */}
      <div>
        <div className="flex items-center justify-between mb-2">
          {promotionPrice ? (
            <div>
              <p className="text-lg font-bold text-red-600">{formatPrice(promotionPrice)}</p>
              <p className="text-xs text-gray-400 line-through">{formatPrice(unit.selling_price)}</p>
            </div>
          ) : (
            <p className="text-lg font-bold text-gray-900">{formatPrice(unit.selling_price)}</p>
          )}
          {isSelected && (
            <span className="text-blue-600 font-semibold text-xs bg-blue-100 px-2 py-0.5 rounded">
              ✓ Selected
            </span>
          )}
        </div>

        {/* Specs Badges - Only Condition and Grade (differentiating factors) */}
        <div className="flex flex-wrap gap-1.5 text-xs">
          <span className="bg-gray-100 px-2 py-0.5 rounded">{unit.condition === 'N' ? 'New' : unit.condition === 'R' ? 'Refurbished' : unit.condition === 'P' ? 'Pre-owned' : unit.condition}</span>
          {unit.grade && <span className="bg-gray-100 px-2 py-0.5 rounded">Grade {unit.grade}</span>}
        </div>
      </div>
    </div>
  );
}

export function ProductDetail({ slug }: ProductDetailProps) {
  const searchParams = useSearchParams();
  const promotionId = searchParams.get('promotion');
  
  const { data: product, isLoading: productLoading, error: productError } = useProductBySlug(slug);
  const { data: units, isLoading: unitsLoading } = useProductUnits(product?.id || 0);
  const { data: accessories } = useProductAccessories(product?.id || 0);
  const { data: promotion } = usePromotion(promotionId ? parseInt(promotionId) : 0);
  const { addToCart } = useCart();
  const { addProduct: addToCompare, removeProduct: removeFromCompare, isInCompare, canAddMore } = useCompare();
  const router = useRouter();
  
  const [selectedUnit, setSelectedUnit] = useState<number | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Product images - include product primary image and all unit images
  const productImages = useMemo(() => {
    const images: string[] = [];
    
    // Add product primary image first (or placeholder)
    if (product?.primary_image) {
      images.push(product.primary_image);
    } else if (product) {
      images.push(getPlaceholderProductImage(product.product_name));
    }
    
    // Add all unique unit images (for color selection)
    if (units && units.length > 0) {
      const unitImageUrls = new Set<string>();
      units.forEach((unit: any) => {
        if (unit.images && unit.images.length > 0) {
          unit.images.forEach((img: any) => {
            if (img.image_url && !unitImageUrls.has(img.image_url)) {
              unitImageUrls.add(img.image_url);
              images.push(img.image_url);
            }
          });
        } else if (unit.color_name) {
          // Add placeholder for units without images
          const placeholderUrl = getPlaceholderUnitImage(unit.color_name);
          if (!unitImageUrls.has(placeholderUrl)) {
            unitImageUrls.add(placeholderUrl);
            images.push(placeholderUrl);
          }
        }
      });
    }
    
    // If no images at all, add at least one placeholder
    if (images.length === 0 && product) {
      images.push(getPlaceholderProductImage(product.product_name));
    }
    
    return images;
  }, [product?.primary_image, product, units]);

  // Track recently viewed products
  useEffect(() => {
    if (product?.id) {
      const recentlyViewed = JSON.parse(
        localStorage.getItem('recentlyViewed') || '[]'
      ) as number[];
      const updated = [product.id, ...recentlyViewed.filter((id) => id !== product.id)].slice(0, 10);
      localStorage.setItem('recentlyViewed', JSON.stringify(updated));
    }
  }, [product?.id]);

  // isInCompare is now managed by useCompare hook

  // Auto-select unit if only one is available
  useEffect(() => {
    if (units && units.length === 1 && !selectedUnit) {
      setSelectedUnit(units[0].id);
    }
  }, [units, selectedUnit]);

  // Group units by variants
  const groupedUnits = useMemo(() => {
    if (!units) return null;
    
    const groups: Record<string, typeof units> = {};
    units.forEach(unit => {
      const key = `${unit.storage_gb || 'N/A'}-${unit.ram_gb || 'N/A'}-${unit.color_name || 'N/A'}-${unit.condition}-${unit.grade || 'N/A'}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(unit);
    });
    
    return groups;
  }, [units]);

  // Get unique variants
  const uniqueStorage = useMemo(() => {
    if (!units) return [];
    return Array.from(new Set(units.map(u => u.storage_gb).filter(Boolean))).sort((a, b) => (a || 0) - (b || 0));
  }, [units]);

  const uniqueRAM = useMemo(() => {
    if (!units) return [];
    return Array.from(new Set(units.map(u => u.ram_gb).filter(Boolean))).sort((a, b) => (a || 0) - (b || 0));
  }, [units]);

  const uniqueColors = useMemo(() => {
    if (!units) return [];
    return Array.from(new Set(units.map(u => u.color_name).filter(Boolean)));
  }, [units]);

  const uniqueConditions = useMemo(() => {
    if (!units) return [];
    return Array.from(new Set(units.map(u => u.condition)));
  }, [units]);

  const uniqueGrades = useMemo(() => {
    if (!units) return [];
    return Array.from(new Set(units.map(u => u.grade).filter(Boolean)));
  }, [units]);

  const uniqueBattery = useMemo(() => {
    if (!units) return [];
    return Array.from(new Set(units.map(u => u.battery_mah).filter(Boolean))).sort((a, b) => (a || 0) - (b || 0));
  }, [units]);

  // Filter units based on selected variants
  const [selectedStorage, setSelectedStorage] = useState<number | null>(null);
  const [selectedRAM, setSelectedRAM] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedBattery, setSelectedBattery] = useState<number | null>(null);

  const filteredUnits = useMemo(() => {
    if (!units) return [];
    return units.filter(unit => {
      if (selectedStorage && unit.storage_gb !== selectedStorage) return false;
      if (selectedRAM && unit.ram_gb !== selectedRAM) return false;
      if (selectedColor && unit.color_name !== selectedColor) return false;
      if (selectedCondition && unit.condition !== selectedCondition) return false;
      if (selectedGrade && unit.grade !== selectedGrade) return false;
      if (selectedBattery && unit.battery_mah !== selectedBattery) return false;
      return true;
    });
  }, [units, selectedStorage, selectedRAM, selectedColor, selectedCondition, selectedGrade, selectedBattery]);

  // Auto-select from filtered units when Storage and Color are selected
  useEffect(() => {
    if (filteredUnits.length > 0) {
    if (filteredUnits.length === 1 && !selectedUnit) {
        // Auto-select if only one unit matches
      setSelectedUnit(filteredUnits[0].id);
      } else if (selectedStorage && selectedColor && !selectedUnit) {
        // Auto-select first available unit when both Storage and Color are selected
        setSelectedUnit(filteredUnits[0].id);
      } else if (selectedUnit) {
        // Check if currently selected unit is still available
      const stillAvailable = filteredUnits.some(u => u.id === selectedUnit);
        if (!stillAvailable && filteredUnits.length > 0) {
        setSelectedUnit(filteredUnits[0].id);
      }
    }
    } else if (selectedUnit) {
      // Clear selection if no units match
      setSelectedUnit(null);
    }
  }, [filteredUnits, selectedUnit, selectedStorage, selectedColor]);

  const handleAddToCart = async () => {
    if (!selectedUnit) {
      alert('Please select a variant');
      return;
    }
    
    setIsAddingToCart(true);
    try {
      // Get promotion info if eligible
      const promoId = isEligibleForPromotion && promotion ? promotion.id : undefined;
      const promoPrice = isEligibleForPromotion && promotionUnitPrice !== null 
        ? promotionUnitPrice 
        : selectedUnitData?.selling_price;
      
      await addToCart(
        selectedUnit, 
        quantity,
        promoId,
        promoPrice
      );
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error: any) {
      console.error('Add to cart error:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to add to cart';
      alert(`Failed to add to cart: ${errorMessage}`);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddAccessoryVariantToCart = async (
    accessory: typeof accessories[0],
    variant: typeof accessories[0]['accessory_color_variants'][0]
  ) => {
    if (!variant.units || variant.units.length === 0) {
      alert('No units available for this color variant');
      return;
    }
    
    // Use the first available unit (or could let user select)
    const unit = variant.units[0];
    
    setIsAddingToCart(true);
    try {
      await addToCart(
        unit.unit_id,
        accessory.required_quantity,
        undefined, // No promotion for accessories (or could add later)
        unit.price
      );
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error: any) {
      console.error('Add accessory to cart error:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to add to cart';
      alert(`Failed to add to cart: ${errorMessage}`);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleCompare = () => {
    if (!product?.id) return;
    
    if (isInCompare(product.id)) {
      removeFromCompare(product.id);
    } else {
      if (!canAddMore) {
        alert('You can compare up to 4 products. Please remove one first.');
        return;
      }
      addToCompare(product.id);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.product_name,
          text: `Check out ${product?.product_name} on Affordable Gadgets`,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const selectedUnitData = units?.find(u => u.id === selectedUnit);

  // Get main display image - show selected unit's image if available, otherwise product image
  const mainDisplayImage = useMemo(() => {
    if (selectedUnitData?.images && selectedUnitData.images.length > 0) {
      const primaryImg = selectedUnitData.images.find((img: any) => img.is_primary);
      return primaryImg?.image_url || selectedUnitData.images[0]?.image_url || productImages[selectedImageIndex] || product?.primary_image || (product ? getPlaceholderProductImage(product.product_name) : '');
    }
    return productImages[selectedImageIndex] || product?.primary_image || (product ? getPlaceholderProductImage(product.product_name) : '');
  }, [selectedUnitData, productImages, selectedImageIndex, product?.primary_image, product]);

  // Calculate promotion prices
  const calculatePromotionPrice = useMemo(() => {
    return (originalPrice: number): number => {
      if (!promotion) return originalPrice;
      
      if (promotion.discount_percentage) {
        const discount = (originalPrice * Number(promotion.discount_percentage)) / 100;
        return originalPrice - discount;
      } else if (promotion.discount_amount) {
        return Math.max(0, originalPrice - Number(promotion.discount_amount));
      }
      
      return originalPrice;
    };
  }, [promotion]);

  // Check if product is eligible for promotion
  const isEligibleForPromotion = useMemo(() => {
    if (!promotion || !product) return false;
    
    // Check if promotion is currently active
    const now = new Date();
    const startDate = new Date(promotion.start_date);
    const endDate = new Date(promotion.end_date);
    
    if (!promotion.is_currently_active || now < startDate || now > endDate) {
      return false;
    }
    
    // Check if product is in promotion's products list
    if (promotion.products && promotion.products.length > 0) {
      return promotion.products.includes(product.id);
    }
    
    // Check if product type matches
    if (promotion.product_types && product.product_type === promotion.product_types) {
      return true;
    }
    
    return false;
  }, [promotion, product]);

  // Calculate min/max prices with promotion
  const promotionMinPrice = useMemo(() => {
    if (!isEligibleForPromotion || !product?.min_price) return null;
    return calculatePromotionPrice(product.min_price);
  }, [isEligibleForPromotion, product?.min_price, calculatePromotionPrice]);

  const promotionMaxPrice = useMemo(() => {
    if (!isEligibleForPromotion || !product?.max_price) return null;
    return calculatePromotionPrice(product.max_price);
  }, [isEligibleForPromotion, product?.max_price, calculatePromotionPrice]);

  const promotionUnitPrice = useMemo(() => {
    if (!isEligibleForPromotion || !selectedUnitData) return null;
    return calculatePromotionPrice(selectedUnitData.selling_price);
  }, [isEligibleForPromotion, selectedUnitData, calculatePromotionPrice]);

  if (productLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading product details...</p>
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="text-gray-600 mb-4">
          {productError instanceof Error ? productError.message : 'The product you\'re looking for doesn\'t exist or has been removed.'}
        </p>
        <Link href="/products" className="text-blue-600 hover:text-blue-700 underline">
          Browse all products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      {/* Breadcrumb */}
      <nav className="mb-2 text-xs text-gray-600">
        <ol className="flex items-center gap-1.5 flex-wrap">
          <li><Link href="/" className="hover:text-blue-600 transition-colors">Home</Link></li>
          <li className="text-gray-400">/</li>
          <li><Link href="/products" className="hover:text-blue-600 transition-colors">Products</Link></li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-900 font-medium truncate max-w-xs sm:max-w-none">{product.product_name}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Left Column - Images */}
        <div className="space-y-2">
          {/* Main Image */}
          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 max-h-[400px]">
              <Image
              src={mainDisplayImage || getPlaceholderProductImage(product.product_name)}
                alt={product.product_name}
                fill
                className="object-cover"
                priority
              unoptimized={!mainDisplayImage || mainDisplayImage.includes('localhost') || mainDisplayImage.includes('placehold.co')}
            />
          </div>

          {/* Thumbnail Gallery */}
          {productImages.length > 1 && (
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
              {productImages.map((img, index) => {
                // Try to find a unit with this image to get color info
                const unitWithImage = units?.find((u: any) => 
                  u.images?.some((imgObj: any) => imgObj.image_url === img)
                );
                const imageColor = unitWithImage?.color_name || null;
                
                return (
                <button
                  key={index}
                    onClick={() => {
                      setSelectedImageIndex(index);
                      // Auto-select color if image is associated with a color
                      if (imageColor) {
                        setSelectedColor(imageColor);
                      }
                    }}
                  className={`relative w-16 h-16 rounded overflow-hidden border flex-shrink-0 transition-all ${
                    selectedImageIndex === index
                      ? 'border-blue-600 ring-1 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                    title={imageColor ? `Color: ${imageColor}` : undefined}
                >
                  <Image
                    src={img}
                      alt={`${product.product_name} view ${index + 1}${imageColor ? ` - ${imageColor}` : ''}`}
                    fill
                    className="object-cover"
                    unoptimized={img.includes('localhost') || img.includes('placehold.co')}
                  />
                    {imageColor && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-1 py-0.5 text-center truncate">
                        {imageColor}
                      </div>
                    )}
                </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column - Product Info */}
        <div className="space-y-3">
          {/* Title & Brand */}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-0.5 leading-tight">
              {product.product_name}
              {selectedUnitData && selectedUnitData.storage_gb && (
                <span className="text-lg sm:text-xl text-gray-600 font-normal"> - {selectedUnitData.storage_gb}GB -</span>
              )}
            </h1>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">{product.brand}</span> {product.model_series && <span className="text-gray-500">• {product.model_series}</span>}
            </p>
          </div>

          {/* Promotion Banner */}
          {isEligibleForPromotion && promotion && (
            <div className="p-2 bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 border border-red-300 rounded">
              <div className="flex items-start gap-1.5">
                <span className="text-base flex-shrink-0">🎉</span>
                <div className="flex-1">
                  <h3 className="font-bold text-sm text-red-700 mb-0.5">{promotion.title}</h3>
                  {promotion.discount_display && (
                    <p className="text-red-600 font-bold text-xs mb-0.5">{promotion.discount_display}</p>
                  )}
                  {promotion.description && (
                    <p className="text-[10px] text-gray-700 leading-tight">{promotion.description}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Price - Single Price Display */}
              <div>
            {selectedUnitData ? (
              <div>
                {isEligibleForPromotion && promotionUnitPrice !== null ? (
                  <div>
                    <p className="text-2xl font-bold text-red-600 mb-0.5">
                      {formatPrice(promotionUnitPrice)}
                    </p>
                    <p className="text-sm text-gray-400 line-through">
                      {formatPrice(selectedUnitData.selling_price)}
                    </p>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(selectedUnitData.selling_price)}
                  </p>
                )}
              </div>
            ) : product.min_price !== null && product.max_price !== null ? (
              <div>
                {isEligibleForPromotion && promotionMinPrice !== null && promotionMaxPrice !== null ? (
                  <div>
                    <p className="text-2xl font-bold text-red-600 mb-0.5">
                      {promotionMinPrice === promotionMaxPrice
                        ? formatPrice(promotionMinPrice)
                        : `${formatPrice(promotionMinPrice)} - ${formatPrice(promotionMaxPrice)}`}
                    </p>
                    <p className="text-sm text-gray-400 line-through">
                  {product.min_price === product.max_price
                    ? formatPrice(product.min_price)
                    : `${formatPrice(product.min_price)} - ${formatPrice(product.max_price)}`}
                </p>
              </div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    {product.min_price === product.max_price
                      ? formatPrice(product.min_price)
                      : `${formatPrice(product.min_price)} - ${formatPrice(product.max_price)}`}
                </p>
              )}
            </div>
            ) : null}
          </div>

          {/* Product Condition Badge */}
          {selectedUnitData && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded border border-green-200">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
                <span className="font-semibold text-xs">
                  Verified {selectedUnitData.condition === 'N' ? 'New' : 
                           selectedUnitData.condition === 'R' ? 'Refurbished' : 
                           selectedUnitData.condition === 'P' ? 'Pre-owned' : 
                           selectedUnitData.condition === 'D' ? 'Defective' : 
                           selectedUnitData.condition}
              </span>
              </div>
              <span className="text-[10px] text-gray-600">Quality assured product</span>
            </div>
          )}

          {/* Variant Selectors - Storage and Color Only */}
          {unitsLoading ? (
            <div className="text-center py-2 text-gray-600">
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <p className="mt-1 text-xs">Loading variants...</p>
            </div>
          ) : units && units.length > 0 ? (
            <div className="space-y-2">
              {/* Label above storage and color options */}
              {(uniqueStorage.length > 0 || uniqueColors.length > 0) && (
                <p className="text-[10px] text-gray-500 mb-2">Select storage and color to see price and checkout</p>
              )}
              {/* Storage Options */}
              {uniqueStorage.length > 0 && (
                <div>
                  <label className="block text-[10px] font-semibold text-gray-700 mb-1">Storage</label>
                  <div className="flex flex-wrap gap-1.5">
                    {uniqueStorage.map((storage) => (
                      <button
                        key={storage}
                        onClick={() => {
                          setSelectedStorage(selectedStorage === storage ? null : storage);
                          setSelectedUnit(null);
                        }}
                        className={`px-3 py-1.5 rounded font-semibold text-xs transition-all ${
                          selectedStorage === storage
                            ? 'bg-blue-600 text-white ring-1 ring-blue-200'
                            : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                        }`}
                      >
                        {storage}GB
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Options */}
              {uniqueColors.length > 0 && (
                <div>
                  <label className="block text-[10px] font-semibold text-gray-700 mb-1">Color</label>
                  <div className="flex flex-wrap gap-1.5">
                    {uniqueColors.map((color) => {
                      // Check if this color has units available with current storage filter
                      const availableForColor = units?.filter((u: any) => {
                        if (selectedStorage && u.storage_gb !== selectedStorage) return false;
                        return u.color_name === color;
                      }) || [];
                      const hasAvailableUnits = availableForColor.length > 0;
                      return (
                      <button
                        key={color}
                        onClick={() => {
                          setSelectedColor(selectedColor === color ? null : color);
                          setSelectedUnit(null);
                        }}
                          disabled={!hasAvailableUnits}
                          className={`px-3 py-1.5 rounded font-semibold text-xs transition-all ${
                          selectedColor === color
                              ? 'bg-blue-600 text-white ring-1 ring-blue-200'
                              : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                          } ${!hasAvailableUnits ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {color}
                      </button>
                      );
                    })}
                  </div>
                </div>
              )}
                  </div>
          ) : null}

          {/* Comes With Section */}
          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-gray-700">Comes with</p>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>6 months warranty</span>
                  </div>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
                <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span>Affordable shipping</span>
                </div>
                            </div>
                            </div>

          {/* Add to Cart Button - Prominent */}
          {product.available_units_count > 0 && (
            <div className="space-y-1.5">
              {showSuccessMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-2 py-1 rounded flex items-center gap-1.5 text-xs">
                  <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">Added to cart successfully!</span>
                </div>
              )}

              <button
                onClick={handleAddToCart}
                disabled={!selectedUnit || isAddingToCart}
                className="w-full bg-blue-600 text-white px-3 py-2 rounded font-bold text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all shadow-md"
              >
                {isAddingToCart ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </span>
                ) : selectedUnit ? (
                  'Add to cart'
                ) : (
                  'Select a Variant First'
                )}
              </button>
            </div>
          )}

          {/* View All Available Units - Collapsible */}
          {filteredUnits.length > 0 && (
            <div className="border-t border-gray-200 pt-1">
              <details className="group">
                <summary className="cursor-pointer text-[10px] font-semibold text-gray-700 hover:text-blue-600 transition-colors flex items-center justify-between py-0.5">
                  <span>View All Available Units ({filteredUnits.length})</span>
                  <svg className="w-3 h-3 transform transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-1">
                  {filteredUnits.map((unit) => {
                    const unitPromotionPrice = isEligibleForPromotion && promotion && unit.selling_price
                      ? calculatePromotionPrice(unit.selling_price)
                      : null;
                    
                    return <UnitCard
                      key={unit.id}
                      unit={unit}
                      isSelected={selectedUnit === unit.id}
                      onSelect={setSelectedUnit}
                      promotionPrice={unitPromotionPrice}
                      onColorSelect={setSelectedColor}
                    />;
                  })}
        </div>
              </details>
            </div>
          )}

          {filteredUnits.length === 0 && units && units.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <p className="text-orange-600 font-medium bg-orange-50 p-4 rounded-lg border border-orange-200">
                No units match the selected criteria. Please adjust your selection.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-3">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-2">
          <nav className="flex gap-1 overflow-x-auto scrollbar-hide pb-0.5">
            {[
              { id: 'overview' as TabType, label: 'Overview' },
              { id: 'specs' as TabType, label: 'Specifications' },
              { id: 'reviews' as TabType, label: 'Reviews' },
              { id: 'videos' as TabType, label: 'Videos' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 font-semibold text-xs border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50 rounded-t'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[150px]">
          {activeTab === 'overview' && (
            <div className="space-y-3">
              {/* Product Highlights */}
              {product.product_highlights && Array.isArray(product.product_highlights) && product.product_highlights.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold mb-1.5">Key Features</h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {product.product_highlights.map((highlight: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                        <svg className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tags */}
              {product.tags && Array.isArray(product.tags) && product.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold mb-1.5">Tags</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {product.tags.map((tag: string, idx: number) => (
                      <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Description */}
              {product.product_description && (
                <div>
                  <h3 className="text-sm font-bold mb-1.5">Description</h3>
                  <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{product.product_description}</p>
                </div>
              )}

              {/* Long Description */}
              {product.long_description && (
                <div>
                  <h3 className="text-sm font-bold mb-1.5">Detailed Description</h3>
                  <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{product.long_description}</p>
                </div>
              )}
              
              {selectedUnitData && (
                <div>
                  <h3 className="text-sm font-bold mb-2">Selected Variant Details</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {selectedUnitData.storage_gb && (
                      <div className="p-2 bg-gray-50 rounded">
                        <p className="text-[10px] text-gray-600 mb-0.5">Storage</p>
                        <p className="text-xs font-bold">{selectedUnitData.storage_gb}GB</p>
                      </div>
                    )}
                    {selectedUnitData.ram_gb && (
                      <div className="p-2 bg-gray-50 rounded">
                        <p className="text-[10px] text-gray-600 mb-0.5">RAM</p>
                        <p className="text-xs font-bold">{selectedUnitData.ram_gb}GB</p>
                      </div>
                    )}
                    {selectedUnitData.battery_mah && (
                      <div className="p-2 bg-gray-50 rounded">
                        <p className="text-[10px] text-gray-600 mb-0.5">Battery</p>
                        <p className="text-xs font-bold">{selectedUnitData.battery_mah}mAh</p>
                      </div>
                    )}
                    {selectedUnitData.color_name && (
                      <div className="p-2 bg-gray-50 rounded">
                        <p className="text-[10px] text-gray-600 mb-0.5">Color</p>
                        <p className="text-xs font-bold">{selectedUnitData.color_name}</p>
                      </div>
                    )}
                    <div className="p-2 bg-gray-50 rounded">
                      <p className="text-[10px] text-gray-600 mb-0.5">Condition</p>
                      <p className="text-xs font-bold">{selectedUnitData.condition}</p>
                    </div>
                    {selectedUnitData.grade && (
                      <div className="p-2 bg-gray-50 rounded">
                        <p className="text-[10px] text-gray-600 mb-0.5">Grade</p>
                        <p className="text-xs font-bold">{selectedUnitData.grade}</p>
                      </div>
                    )}
                    <div className="p-2 bg-gray-50 rounded">
                      <p className="text-[10px] text-gray-600 mb-0.5">Price</p>
                      <p className="text-xs font-bold">{formatPrice(selectedUnitData.selling_price)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'specs' && (
            <div>
              <h3 className="text-2xl font-bold mb-6">Specifications</h3>
              {selectedUnitData ? (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <tbody className="divide-y divide-gray-200">
                      {selectedUnitData.storage_gb && (
                        <tr className="bg-gray-50">
                          <td className="px-6 py-4 font-semibold text-gray-900">Storage</td>
                          <td className="px-6 py-4 text-gray-700">{selectedUnitData.storage_gb}GB</td>
                        </tr>
                      )}
                      {selectedUnitData.ram_gb && (
                        <tr>
                          <td className="px-6 py-4 font-semibold text-gray-900">RAM</td>
                          <td className="px-6 py-4 text-gray-700">{selectedUnitData.ram_gb}GB</td>
                        </tr>
                      )}
                      {selectedUnitData.battery_mah && (
                        <tr className="bg-gray-50">
                          <td className="px-6 py-4 font-semibold text-gray-900">Battery Capacity</td>
                          <td className="px-6 py-4 text-gray-700">{selectedUnitData.battery_mah}mAh</td>
                        </tr>
                      )}
                      {selectedUnitData.processor_details && (
                        <tr>
                          <td className="px-6 py-4 font-semibold text-gray-900">Processor</td>
                          <td className="px-6 py-4 text-gray-700">{selectedUnitData.processor_details}</td>
                        </tr>
                      )}
                      {selectedUnitData.color_name && (
                        <tr className={selectedUnitData.processor_details ? 'bg-gray-50' : ''}>
                          <td className="px-6 py-4 font-semibold text-gray-900">Color</td>
                          <td className="px-6 py-4 text-gray-700">{selectedUnitData.color_name}</td>
                        </tr>
                      )}
                      <tr className={selectedUnitData.color_name && !selectedUnitData.processor_details ? '' : selectedUnitData.color_name ? '' : 'bg-gray-50'}>
                        <td className="px-6 py-4 font-semibold text-gray-900">Condition</td>
                        <td className="px-6 py-4 text-gray-700">
                          {selectedUnitData.condition === 'N' ? 'New' : 
                           selectedUnitData.condition === 'R' ? 'Refurbished' : 
                           selectedUnitData.condition === 'P' ? 'Pre-owned' : 
                           selectedUnitData.condition}
                        </td>
                      </tr>
                      {selectedUnitData.grade && (
                        <tr className={selectedUnitData.color_name && selectedUnitData.processor_details ? 'bg-gray-50' : !selectedUnitData.color_name ? 'bg-gray-50' : ''}>
                          <td className="px-6 py-4 font-semibold text-gray-900">Grade</td>
                          <td className="px-6 py-4 text-gray-700">Grade {selectedUnitData.grade}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <p className="text-gray-600 text-center">Please select a variant to view specifications</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <ReviewsSection productId={product.id} />
            </div>
          )}

          {activeTab === 'videos' && (
            <div>
              <h3 className="text-2xl font-bold mb-6">Product Videos</h3>
                <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                  <iframe
                    src={convertToYouTubeEmbed(product.product_video_url || getPlaceholderVideoUrl(product.product_name))}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              {!product.product_video_url && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Note:</span> This is a placeholder video. The actual product video will be available soon.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recommended Accessories */}
      {accessories && accessories.length > 0 && (
        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-8">Recommended Accessories</h2>
          <div className="space-y-8">
            {accessories.map((accessory) => (
              <div
                key={accessory.id}
                className="border-2 border-gray-200 rounded-xl overflow-hidden"
              >
                {/* Accessory Header - Clickable */}
                <Link href={`/products/${accessory.accessory_slug}`}>
                  <div className="p-6 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex items-start gap-4">
                      {/* Accessory Image */}
                      <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={accessory.accessory_primary_image || getPlaceholderProductImage(accessory.accessory_name)}
                          alt={accessory.accessory_name}
                          fill
                          className="object-cover"
                          sizes="96px"
                          unoptimized={process.env.NODE_ENV === 'development'}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (!target.src.includes('placehold.co')) {
                              target.src = getPlaceholderProductImage(accessory.accessory_name);
                            }
                          }}
                        />
                      </div>
                      
                      {/* Accessory Info */}
                      <div className="flex-1">
                        <h3 className="font-bold text-xl mb-2 hover:text-blue-600 transition-colors">
                          {accessory.accessory_name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Compatible with: {accessory.main_product_name}
                        </p>
                        {accessory.accessory_price_range && (
                          <p className="text-sm font-semibold text-gray-800">
                            {accessory.accessory_price_range.min === accessory.accessory_price_range.max
                              ? formatPrice(accessory.accessory_price_range.min)
                              : `${formatPrice(accessory.accessory_price_range.min)} - ${formatPrice(accessory.accessory_price_range.max)}`
                            }
                          </p>
                        )}
                        <p className="text-xs text-blue-600 mt-2 font-medium">
                          View Details →
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
                
                {/* Color Variants */}
                {accessory.accessory_color_variants && accessory.accessory_color_variants.length > 0 && (
                  <div className="p-6">
                    <h4 className="font-semibold mb-4">Available Colors:</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {accessory.accessory_color_variants.map((variant) => (
                        <div
                          key={variant.color_id || 'universal'}
                          className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-colors relative"
                        >
                          {/* Clickable area - links to accessory page */}
                          <Link 
                            href={`/products/${accessory.accessory_slug}`}
                            className="block mb-2"
                          >
                            {/* Color Swatch and Name */}
                            <div className="flex items-center gap-2 mb-2">
                              {variant.hex_code && (
                                <div
                                  className="w-6 h-6 rounded-full border-2 border-gray-300"
                                  style={{ backgroundColor: variant.hex_code }}
                                />
                              )}
                              <span className="font-medium text-sm hover:text-blue-600 transition-colors">
                                {variant.color_name}
                              </span>
                            </div>
                            
                            {/* Variant Image */}
                            <div className="relative w-full h-32 bg-gray-100 rounded mb-2 overflow-hidden cursor-pointer">
                              <Image
                                src={
                                  variant.units[0]?.image_url || 
                                  accessory.accessory_primary_image || 
                                  getPlaceholderProductImage(accessory.accessory_name)
                                }
                                alt={`${accessory.accessory_name} - ${variant.color_name}`}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 50vw, 25vw"
                                unoptimized={process.env.NODE_ENV === 'development'}
                                onError={(e) => {
                                  // Fallback to placeholder if image fails to load
                                  const target = e.target as HTMLImageElement;
                                  if (target.src !== getPlaceholderProductImage(accessory.accessory_name)) {
                                    target.src = getPlaceholderProductImage(accessory.accessory_name);
                                  }
                                }}
                              />
                            </div>
                            
                            {/* Price */}
                            <p className="text-sm font-semibold text-gray-800 mb-2">
                              {variant.min_price === variant.max_price
                                ? formatPrice(variant.min_price)
                                : `${formatPrice(variant.min_price)} - ${formatPrice(variant.max_price)}`
                              }
                            </p>
                            
                            {/* Stock Info */}
                            <p className="text-xs text-gray-600 mb-2">
                              {variant.total_quantity} in stock
                            </p>
                          </Link>
                          
                          {/* Add to Cart Button - stops event propagation */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleAddAccessoryVariantToCart(accessory, variant);
                            }}
                            className="w-full px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                          >
                            Add to Cart
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Recommendations */}
      <div className="mt-16">
        <ProductRecommendations productId={product.id} />
      </div>
    </div>
  );
}
