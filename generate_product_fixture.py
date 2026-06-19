import csv
import json
import os
from datetime import datetime

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(PROJECT_ROOT, '..', 'affordable-gadgets-backend', '_data', 'products_without_blogs.csv')
OUTPUT_PATH = os.path.join(PROJECT_ROOT, 'product_fixture.json')

PRODUCT_TYPE_LABELS = {
    'PH': 'Phone',
    'LT': 'Laptop',
    'TB': 'Tablet/iPad',
    'AC': 'Accessory',
}

def make_model_series(product_name, brand, product_type):
    name_lower = product_name.lower()
    brand_lower = brand.lower()
    cleaned = name_lower.replace(brand_lower, '').strip()
    if cleaned.startswith('-'):
        cleaned = cleaned[1:].strip()
    cleaned = cleaned.split('-') if '-' in cleaned else [cleaned]
    parts = [p.strip().title() for p in cleaned if p.strip()]
    return ' '.join(parts) if parts else product_name

def make_meta_title(product_name, brand, product_type):
    type_label = PRODUCT_TYPE_LABELS.get(product_type, '')
    return f"{product_name} - {brand} - Affordable Gadgets"[:60]

def make_meta_description(product_name, brand, product_type):
    type_label = PRODUCT_TYPE_LABELS.get(product_type, '').lower()
    if product_type == 'AC':
        return f"Shop the {product_name} by {brand} at Affordable Gadgets. Best prices in Kenya. Fast shipping, genuine products."[:160]
    return f"Buy {product_name} by {brand} at Affordable Gadgets Kenya. Best price, genuine {type_label}, fast delivery, 1-year warranty."[:160]

def make_keywords(product_name, brand, product_type):
    type_label = PRODUCT_TYPE_LABELS.get(product_type, '').lower()
    words = set()
    for w in product_name.lower().split():
        clean = w.strip('(),-')
        if len(clean) > 1:
            words.add(clean)
    words.add(brand.lower())
    words.add(type_label.lower())
    words.add('affordable gadgets')
    return ', '.join(sorted(words))

def make_description(product_name, brand, product_type):
    type_label = PRODUCT_TYPE_LABELS.get(product_type, '').lower()
    if product_type == 'AC':
        return f"Genuine {product_name} by {brand}. High-quality accessory available at Affordable Gadgets Kenya."
    return f"{product_name} by {brand}. A high-quality {type_label} available at Affordable Gadgets Kenya. Features cutting-edge technology and exceptional performance."

def make_long_description(product_name, brand, model_series, product_type):
    type_label = PRODUCT_TYPE_LABELS.get(product_type, '').lower()
    if product_type == 'AC':
        return f"<h2>About the {product_name}</h2><p>The {product_name} by {brand} is a premium accessory designed to complement your devices. Built with quality materials and precision engineering, it delivers reliable performance and durability.</p><h3>Key Features</h3><ul><li>Genuine {brand} quality</li><li>Premium design and build</li><li>Designed for everyday use</li><li>Compatible with your devices</li></ul><h3>Why Buy from Affordable Gadgets?</h3><p>At Affordable Gadgets, we offer genuine products at competitive prices with fast delivery across Kenya. Shop with confidence knowing you're getting authentic {brand} products.</p>"
    return f"<h2>About the {product_name}</h2><p>The {product_name} by {brand} is a feature-packed {type_label} that delivers exceptional performance, stunning design, and cutting-edge technology. Whether you're working, studying, or enjoying entertainment, this device is built to exceed your expectations.</p><h3>Key Features</h3><ul><li>Genuine {brand} quality and reliability</li><li>Premium design with attention to detail</li><li>High-performance hardware</li><li>Excellent value for money</li></ul><h3>Why Buy from Affordable Gadgets?</h3><p>At Affordable Gadgets, we offer the best prices on genuine {brand} products in Kenya. Enjoy fast delivery, 1-year warranty, and exceptional customer service.</p>"

def make_highlights(product_name, brand, product_type):
    if product_type == 'AC':
        return [
            f"Genuine {brand} quality",
            f"Premium build and design",
            f"Easy to use and maintain",
            f"Compatible with your devices"
        ]
    return [
        f"Genuine {brand} product",
        f"High-performance hardware",
        f"Premium design and build quality",
        f"Excellent value for money",
        f"1-year warranty included"
    ]

def normalize_slug(slug):
    slug = slug.strip().lower()
    slug = slug.replace(' ', '-')
    slug = ''.join(c for c in slug if c.isalnum() or c == '-')
    while '--' in slug:
        slug = slug.replace('--', '-')
    return slug.strip('-')

def read_products_from_csv():
    products = []
    seen_slugs = set()
    with open(CSV_PATH, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            slug = normalize_slug(row.get('slug', ''))
            if slug and slug not in seen_slugs:
                seen_slugs.add(slug)
                products.append({
                    'slug': slug,
                    'product_name': row.get('product_name', '').strip(),
                    'brand': row.get('brand', '').strip(),
                    'product_type': row.get('product_type', '').strip().upper()[:2],
                })
    return products

def generate_fixture():
    products = read_products_from_csv()
    fixture = []

    for i, p in enumerate(products, start=1):
        pt = p['product_type'] if p['product_type'] in ('PH','LT','TB','AC') else 'AC'
        model_series = make_model_series(p['product_name'], p['brand'], pt)
        
        entry = {
            "model": "inventory.product",
            "pk": None,
            "fields": {
                "product_type": pt,
                "product_name": p['product_name'],
                "product_description": make_description(p['product_name'], p['brand'], pt),
                "brand": p['brand'],
                "model_series": model_series,
                "min_stock_threshold": 5,
                "reorder_point": 10,
                "is_discontinued": False,
                "meta_title": make_meta_title(p['product_name'], p['brand'], pt),
                "meta_description": make_meta_description(p['product_name'], p['brand'], pt),
                "slug": p['slug'],
                "keywords": make_keywords(p['product_name'], p['brand'], pt),
                "product_highlights": make_highlights(p['product_name'], p['brand'], pt),
                "long_description": make_long_description(p['product_name'], p['brand'], model_series, pt),
                "is_published": True,
                "product_video_url": "",
                "is_global": False,
                "tags": [],
                "brands": [],
            }
        }
        fixture.append(entry)

    return fixture

def main():
    fixture = generate_fixture()
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(fixture, f, indent=2, ensure_ascii=False)
    print(f"Generated fixture with {len(fixture)} products -> {OUTPUT_PATH}")

    # Also output a single sample product JSON for reference
    sample_path = os.path.join(PROJECT_ROOT, 'sample_product.json')
    if fixture:
            json.dump(sample, f, indent=2, ensure_ascii=False)
        print(f"Sample product JSON -> {sample_path}")

if __name__ == '__main__':
    main()
