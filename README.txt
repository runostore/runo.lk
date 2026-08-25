NOVATREND — FULL STATIC STORE DEMO

Included:
- index.html
- styles.css
- app.js
- products.js (generates exactly 400 demo products)
- Code.gs (Google Sheets + email backend)

MAIN FEATURES
- 400 product catalog generated in products.js
- Search, category filters, price filter, rating filter and sort
- Product quick view, product details, Add to Cart and Buy Now
- Cart drawer with quantity controls and coupon codes
- Checkout with name, email, phone, address line 1, optional address line 2
- Cash on Delivery available; Card marked Coming Soon
- Successful order + My Orders tab using localStorage
- Login/Register UI
- Demo admin login: admin@gmail.com / nethun123
- Profile icon + logout
- Reviews tab + review form
- Google Sheets order storage + email notification when Apps Script is deployed
- Responsive mobile layout

COUPONS
- NETHUN10 = 10% off
- SAVE10 = 10% off
- SAVE20 = 20% off
- NOVA30 = 30% off

GOOGLE SHEETS SETUP
1. Open the Google Sheet where orders should be stored.
2. Extensions -> Apps Script.
3. Replace the default code with Code.gs from this folder.
4. Save.
5. Deploy -> New deployment -> Web app.
6. Execute as: Me.
7. Who has access: Anyone.
8. Copy the generated /exec URL.
9. Replace SCRIPT_URL in app.js with that /exec URL.

The current URL supplied by the user does not expose a doGet function, so it will show "Script function not found: doGet" until the new Code.gs is deployed.

IMPORTANT PRODUCTION NOTE
The requested demo credentials are included in front-end JavaScript, which is not secure for a public production store. For a real launch, use Firebase Auth, Supabase Auth or a server-side authentication system and never ship admin passwords in browser code.
