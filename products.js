(function () {
  const blueprints = [
    { category: 'Fashion', names: ['Classic Hoodie','Oversized Tee','Relaxed Cargo Pants','Linen Shirt','Everyday Jogger','Minimal Crewneck','Streetwear Jacket','Cotton Shorts'], img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=85' },
    { category: 'Electronics', names: ['Wireless Headphone','Portable Speaker','Mechanical Keyboard','USB-C Hub','Smart Desk Lamp','Webcam Pro','Power Bank','Wireless Charger'], img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=85' },
    { category: 'Beauty', names: ['Hydrating Serum','Glow Cream','Daily Cleanser','Lip Tint','Vitamin Mist','Hair Repair Mask','Skin Essentials Set','Body Lotion'], img: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=700&q=85' },
    { category: 'Fitness', names: ['Performance Bottle','Yoga Mat Pro','Resistance Bands','Training Gloves','Gym Duffel','Running Belt','Smart Jump Rope','Recovery Roller'], img: 'https://images.unsplash.com/photo-1538805060514-97d07b3f0f1f?auto=format&fit=crop&w=700&q=85' },
    { category: 'Home Decor', names: ['Ceramic Vase','Soft Throw','Modern Table Lamp','Cushion Set','Wall Clock','Storage Basket','Fragrance Diffuser','Minimal Tray'], img: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=700&q=85' },
    { category: 'Accessories', names: ['Aviator Sunglasses','Leather Wallet','Crossbody Bag','Canvas Tote','Chain Bracelet','Travel Pouch','Minimal Cap','Classic Belt'], img: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=700&q=85' },
    { category: 'Footwear', names: ['Air Max 270','Cloud Runner','Retro Court Sneaker','Everyday Slip-On','Trail Runner','Street Low Top','Comfort Sandal','Urban Boot'], img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=85' },
    { category: 'Watches', names: ['Smart Watch Series 9','Classic Steel Watch','Minimal Leather Watch','Sport Digital Watch','Chronograph','Everyday Smart Band','Classic Gold Watch','Travel Timer'], img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=85' },
    { category: 'Bags', names: ['Weekender Bag','City Backpack','Laptop Briefcase','Mini Shoulder Bag','Travel Backpack','Studio Tote','Gym Bag','Camera Sling'], img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=85' },
    { category: 'Gadgets', names: ['Water Bottle','Smart Tracker','Mini Projector','Desk Fan','LED Light Bar','Bluetooth Tag','Portable Monitor','Digital Notepad'], img: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=700&q=85' }
  ];

  const adjectives = ['Nova','Prime','Essential','Ultra','Urban','Daily','Pro','Elite','Studio','Core','Fresh','Flex','Smart','Pure','Air','Edge','Luxe','Motion','Modern','Active'];
  const materials = ['Black','Stone','Ivory','Sand','Slate','Silver','Rose','Ocean','Forest','Cloud'];
  const products = [];
  let id = 1;
  outer: for (let round = 0; round < 40; round++) {
    for (const bp of blueprints) {
      const base = bp.names[round % bp.names.length];
      const adjective = adjectives[(round * 3 + id) % adjectives.length];
      const material = materials[(round + id) % materials.length];
      const price = Number((19 + ((id * 17) % 470) + (round % 4) * 3.5).toFixed(2));
      const discount = [0, 10, 15, 20, 25, 30, 35, 40, 50, 60, 70][(id * 7) % 11];
      const rating = Number((4 + ((id * 13) % 10) / 10).toFixed(1));
      const reviews = 20 + ((id * 29) % 940);
      const isNew = id <= 80;
      const isBest = id % 4 === 0 || id % 7 === 0;
      products.push({
        id,
        name: `${adjective} ${base} ${material}`,
        category: bp.category,
        price,
        discount,
        rating: Math.min(rating, 5),
        reviews,
        image: bp.img,
        images: [bp.img, bp.img, bp.img],
        badge: discount >= 50 ? 'Hot Deal' : (isNew ? 'New' : (isBest ? 'Bestseller' : '')),
        description: `A premium ${bp.category.toLowerCase()} pick designed for everyday use. Clean styling, dependable quality and excellent value from NovaTrend.`,
        isNew,
        isBest
      });
      id += 1;
      if (products.length >= 400) break outer;
    }
  }
  window.NOVATREND_PRODUCTS = products;
})();
