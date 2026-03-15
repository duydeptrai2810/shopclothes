# E-Commerce API Specification

This document details the API endpoints exactly matched against the required modules from Phase 3. 
The design assumes standard RESTful principles with JSON payloads. Authentication relies on JWT (JSON Web Tokens) via the `Authorization: Bearer <token>` header.

## 3.1 Module Authentication & Users Profile (5 APIs)
> Handles user registration, login algorithms, and profile management for customers.

1. `POST /api/auth/register` - Create a new user account.
2. `POST /api/auth/login` - Authenticate user credentials and return a JWT token.
3. `POST /api/auth/logout` - Invalidate the current token/session.
4. `GET /api/users/profile` - Retrieve the currently authenticated user's profile information.
5. `PUT /api/users/profile` - Update profile details (Name, Phone, Address, Avatar).

## 3.2 Module Catalog: Categories, Brands & Styles (4 APIs)
> Public endpoints to fetch the product taxonomy and categorizations.

1. `GET /api/catalog/categories` - Fetch all active categories (hierarchical structure).
2. `GET /api/catalog/brands` - Fetch all active brands.
3. `GET /api/catalog/styles` - Fetch all styles/collections.
4. `GET /api/catalog/{type}/{id}` - Fetch details of a specific category, brand, or style (where `{type}` is `categories`, `brands`, or `styles`).

## 3.3 Module Products & AI Recommendations (5 APIs)
> Core product listing, viewing, and intelligent discovery endpoints.

1. `GET /api/products` - List products with extensive filtering (filtering by category, brand, style, price range, sorting, pagination).
2. `GET /api/products/{id}` - Fetch complete details of a single product, including its variants (sizes/colors/SKUs).
3. `GET /api/products/search` - Keyword-based search algorithm for finding products.
4. `GET /api/recommendations/related/{productId}` - Fetch a list of recommended products related to the specified product.
5. `GET /api/recommendations/personalized` - Fetch AI-driven tailored product recommendations for the authenticated user.

## 3.4 Module Cart & Cart Items (5 APIs)
> Handles the shopping cart sessions for customers.

1. `GET /api/cart` - Retrieve the current active shopping cart for the user.
2. `POST /api/cart/items` - Add a specific product variant to the cart.
3. `PUT /api/cart/items/{itemId}` - Modify the quantity of a specific item in the cart.
4. `DELETE /api/cart/items/{itemId}` - Remove an item entirely from the cart.
5. `DELETE /api/cart` - Empty the entire shopping cart.

## 3.5 Module Orders & Checkout (4 APIs)
> Process orders from carts to confirmed purchases.

1. `POST /api/checkout/preview` - Preview the final order details (calculates shipping, taxes, and applies discounts/promotions).
2. `POST /api/orders` - Confirm and place the new order based on the current cart.
3. `GET /api/orders` - List the authenticated user's order history.
4. `GET /api/orders/{id}` - Fetch detailed information about a specific order, including tracking status.

## 3.6 Module Payments (3 APIs)
> Integration with payment gateways (e.g., Stripe, PayPal, VNPay).

1. `POST /api/payments/intent` - Create a payment session/intent and return the client secret to the frontend.
2. `POST /api/payments/webhook` - Unified webhook endpoint to receive asynchronous payment state confirmations from providers.
3. `POST /api/payments/refund` - Request a refund for a previously successful transaction.

## 3.7 Module Reviews (3 APIs)
> Customer feedback and rating system.

1. `GET /api/products/{productId}/reviews` - Retrieve paginated reviews and aggregate ratings for a product.
2. `POST /api/products/{productId}/reviews` - Submit a new review for a purchased product.
3. `PUT /api/reviews/{id}` - Edit or soft-delete (hide) a user's own review.

---

## Admin Modules (Requires Admin Role Authorization)

### 3.8 Module Admin: Products & Variants Management (7 APIs)
> Extensive control over the catalog inventory.

1. `GET /api/admin/products` - List all products, including inactive ones, for the admin view.
2. `POST /api/admin/products` - Create a new base product.
3. `PUT /api/admin/products/{id}` - Update a base product's information.
4. `DELETE /api/admin/products/{id}` - Deactivate or soft-delete a product.
5. `POST /api/admin/products/{id}/variants` - Add a new spec/variant (Color/Size/SKU) to an existing product.
6. `PUT /api/admin/variants/{variantId}` - Update variant details (Stock levels, pricing overwrites).
7. `DELETE /api/admin/variants/{variantId}` - Remove a specific variant.

### 3.9 Module Admin: Categories & Brands Config (4 APIs)
> Taxonomy management.

1. `POST /api/admin/catalog/categories` - Create a new category.
2. `PUT /api/admin/catalog/categories/{id}` - Update an existing category (or change its parent).
3. `POST /api/admin/catalog/brands` - Create a new brand.
4. `PUT /api/admin/catalog/brands/{id}` - Update an existing brand.

### 3.10 Module Admin: Orders & Users Management (4 APIs)
> Oversight of customer activities and fulfillment.

1. `GET /api/admin/orders` - List all system orders across all users with advanced status filtering.
2. `PUT /api/admin/orders/{id}/status` - Update an order's lifecycle status (e.g., Pending -> Processing -> Shipped -> Delivered).
3. `GET /api/admin/users` - Interrogate the complete user database.
4. `PUT /api/admin/users/{id}/role` - Modify a user's privileges (e.g., Ban/Suspend, promote to Admin).

### 3.11 Module Admin: Dashboard & Statistics (2 APIs)
> High-level analytics and operational alerts.

1. `GET /api/admin/stats/sales` - Aggregate revenue, completed order counts, and sales trends over standard timeframes (Daily/Weekly/Monthly).
2. `GET /api/admin/stats/inventory` - Retrieve low-stock threshold alerts and best-performing product metrics.
