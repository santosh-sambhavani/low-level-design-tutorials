class IDGenerator {
    static generate() {
        return Math.random().toString(36).substr(2, 9);
    }
}

enum ProductCategory {
    Electronics = "Electronics",
    Clothing = "Clothing",
    Books = "Books",
    Groceries = "Groceries",
}

class Product {
    constructor(
        private id: string,
        private name: string,
        private amount: number,
        private category: ProductCategory,
    ) { }

    getId() {
        return this.id;
    }

    getName() {
        return this.name;
    }

    getAmount() {
        return this.amount;
    }

    getCategory() {
        return this.category;
    }

    setName(name: string) {
        this.name = name;
    }

    setAmount(amount: number) {
        this.amount = amount;
    }
}

class ProductManager {
    private products: Map<string, Product> = new Map<string, Product>();
    private static instance: ProductManager;

    static getInstance() {
        if (!ProductManager.instance) {
            ProductManager.instance = new ProductManager();
        }
        return ProductManager.instance;
    }

    addProduct(name: string, amount: number, category: ProductCategory) {
        const productId = IDGenerator.generate();
        const product = new Product(productId, name, amount, category);
        this.products.set(productId, product);
        return product;
    }

    removeProduct(productId: string) {
        this.products.delete(productId);
    }

    getProduct(productId: string): Product | undefined {
        return this.products.get(productId);
    }

    getAllProducts(): Product[] {
        return Array.from(this.products.values());
    }

    updateProduct(productId: string, name?: string, amount?: number) {
        const product = this.products.get(productId);
        if (product) {
            if (name !== undefined) {
                product.setName(name);
            }
            if (amount !== undefined) {
                product.setAmount(amount);
            }
        }
    }
}

class CartItem {
    private productManager = ProductManager.getInstance();
    constructor(private productId: string, private quantity: number) { }

    getPrice() {
        const product = this.productManager.getProduct(this.productId)!;
        return product.getAmount() * this.quantity;
    }

    increase(quantity: number) {
        this.quantity += quantity;
    }

    decrease(quantity: number) {
        this.quantity -= quantity;
    }

    getQuantity() {
        return this.quantity;
    }

    getProduct() {
        return this.productManager.getProduct(this.productId)!;
    }
}

class Cart {
    private itemsMapper: Map<string, CartItem> = new Map<string, CartItem>();
    private originalTotal: number = 0;
    private finalTotal: number = 0;
    private discount: number = 0;
    private isLoyaltyApplied: boolean = false;
    coupon: ICoupon | undefined;

    getOriginalTotal() {
        return this.originalTotal;
    }

    add(productId: string, quantity: number) {
        if (this.itemsMapper.has(productId)) {
            const existingItem = this.itemsMapper.get(productId)!;
            existingItem.increase(quantity);
        } else {
            const cartItem = new CartItem(productId, quantity);
            this.itemsMapper.set(productId, cartItem);
        }

        this.calculateTotal();
    }

    reduceProduct(productId: string, quantity: number) {
        if (this.itemsMapper.has(productId)) {
            const existingItem = this.itemsMapper.get(productId)!;
            existingItem.decrease(quantity);
            if (existingItem.getQuantity() <= 0) {
                this.itemsMapper.delete(productId);
            }
        }

        this.calculateTotal();
    }

    private changeFinalTotal() {
        this.finalTotal = this.originalTotal - this.discount;
    }

    calculateTotal() {
        // this will be DB call
        this.originalTotal = Array.from(this.itemsMapper.values()).reduce(
            (total, item) => total + item.getPrice(),
            0
        );

        this.changeFinalTotal();
    }

    applyDiscount(coupon: ICoupon) {
        const discount = coupon.applyDiscount(this);
        this.discount += discount;
        this.changeFinalTotal();
    }

    getDetails() {
        return {
            items: Array.from(this.itemsMapper.values()).map(item => ({
                quantity: item.getQuantity(),
                product: item.getProduct()
            })),
            originalTotal: this.originalTotal,
            discount: this.discount,
            total: this.finalTotal,
            isLoyaltyApplied: this.isLoyaltyApplied,
        }
    }
}

class CartManager {
    private static instance: CartManager;

    static getInstance() {
        if (!CartManager.instance) {
            CartManager.instance = new CartManager();
        }
        return CartManager.instance;
    }

    getAllApplicableCouponsForCart(cart: Cart) {
        const couponManager = CouponManager.getInstance();
        const allCoupons = couponManager.getCoupons();
        
        return allCoupons.filter(coupon => coupon.isApplicable(cart));
    }
}

// Strategy Interface
interface IDiscountStrategy {
    calculateDiscount(amount?: number): number;
}

// Flat discount: fixed value off
class FlatDiscount implements IDiscountStrategy {
    constructor(private discountAmount: number) { }

    calculateDiscount(): number {
        return this.discountAmount;
    }
}

// Percentage discount: e.g., 10% off
class PercentageDiscount implements IDiscountStrategy {
    constructor(private percentage: number) { }

    calculateDiscount(amount: number): number {
        return (this.percentage / 100) * amount;
    }
}

// Percentage with cap: e.g., 20% off up to 100 Rupees
class PercentageWithCapDiscount implements IDiscountStrategy {
    constructor(private percentage: number, private cap: number) { }

    calculateDiscount(amount: number): number {
        const percentageDiscount = (this.percentage / 100) * amount;
        return Math.min(percentageDiscount, this.cap);
    }
}

abstract class ICoupon {
    private next: ICoupon | null = null;
    constructor(
        public code: string,
        public isCombinable: boolean,
        public discountStrategy: IDiscountStrategy
    ) { }

    setNext(coupon: ICoupon) {
        this.next = coupon;
    }

    abstract isApplicable(cart: Cart): boolean

    getDiscount(cart: Cart): number {
        return this.discountStrategy.calculateDiscount(cart.getOriginalTotal());
    }

    applyDiscount(cart: Cart) {
        if (this.isApplicable(cart)) {
            return this.getDiscount(cart);
        } else {
            throw new Error('Coupon is not applicable');
        }
    }
}

class SeasonalCoupon extends ICoupon {
    constructor(
        code: string,
        isCombinable: boolean,
        discountStrategy: IDiscountStrategy,
        private startDate: Date,
        private endDate: Date,
        private productCategories: ProductCategory[]
    ) {
        super(code, isCombinable, discountStrategy);
    }

    isApplicable(cart: Cart): boolean {
        const today = new Date();
        return today >= this.startDate
            && today <= this.endDate
            && cart.getDetails().items.some(
                item => this.productCategories.includes(item.product.getCategory())
            );
    }
}

class ProductLevelDiscountCoupon extends ICoupon {
    constructor(
        code: string,
        isCombinable: boolean,
        discountStrategy: IDiscountStrategy,
        private productCategories: ProductCategory[]
    ) {
        super(code, isCombinable, discountStrategy);
    }

    isApplicable(cart: Cart): boolean {
        return cart.getDetails().items.some(item => {
            const product = item.product;
            return this.productCategories.includes(product.getCategory());
        });
    }
}

class LoyaltyDiscountCoupon extends ICoupon {
    constructor(
        code: string,
        isCombinable: boolean,
        discountStrategy: IDiscountStrategy,
    ) {
        super(code, isCombinable, discountStrategy);
    }

    isApplicable(cart: Cart): boolean {
        return cart.getDetails().isLoyaltyApplied;
    }
}

enum DiscountStrategyType {
    Flat,
    Percentage,
    PercentageWithCap,
}

enum CouponType {
    Seasonal,
    ProductLevelDiscount,
    LoyaltyDiscount,
}

interface IAdditionalData {
    startDate: Date,
    endDate: Date,
    productCategories: ProductCategory[],
    percentage: number,
    cap: number,
    discountAmount: number,
}

class DiscountStrategyTypeFactory {
    static create(
        discountStrategyType: DiscountStrategyType,
        options: {
            percentage: number,
            cap: number,
            discountAmount: number,
        }
    ): IDiscountStrategy {
        switch (discountStrategyType) {
            case DiscountStrategyType.Flat:
                return new FlatDiscount(options.discountAmount);
            case DiscountStrategyType.Percentage:
                return new PercentageDiscount(options.percentage);
            case DiscountStrategyType.PercentageWithCap:
                return new PercentageWithCapDiscount(options.percentage, options.cap);
            default:
                throw new Error('Unknown discount strategy type');
        }
    }
}

class CouponFactory {
    static create(
        code: string,
        isCombinable: boolean,
        discountStrategyType: DiscountStrategyType,
        couponType: CouponType,
        options: IAdditionalData
    ): ICoupon {
        const discountStrategy = DiscountStrategyTypeFactory.create(
            discountStrategyType,
            options
        );
        switch (couponType) {
            case CouponType.Seasonal:
                return new SeasonalCoupon(code, isCombinable, discountStrategy, options.startDate, options.endDate, options.productCategories);
            case CouponType.ProductLevelDiscount:
                return new ProductLevelDiscountCoupon(code, isCombinable, discountStrategy, options.productCategories);
            case CouponType.LoyaltyDiscount:
                return new LoyaltyDiscountCoupon(code, isCombinable, discountStrategy);
            default:
                throw new Error('Unknown coupon type');
        }
    }
}

class CouponManager {
    private static instance: CouponManager;
    private coupons: Map<string, ICoupon> = new Map();

    static getInstance() {
        if (!CouponManager.instance) {
            CouponManager.instance = new CouponManager();
        }
        return CouponManager.instance;
    }

    addCoupon(
        code: string,
        isCombinable: boolean,
        discountStrategyType: DiscountStrategyType,
        couponType: CouponType,
        additionalData: IAdditionalData
    ) {
        const coupon = CouponFactory.create(
            code,
            isCombinable,
            discountStrategyType,
            couponType,
            additionalData
        );
        this.coupons.set(code, coupon);
        return coupon;
    }

    getCoupons(): ICoupon[] {
        return Array.from(this.coupons.values());
    }
}

// Example Usage

console.log("============= Add Products ============= ");
const productManager = ProductManager.getInstance();
const product1 = productManager.addProduct('Laptop', 1000, ProductCategory.Electronics);
const product2 = productManager.addProduct('T-shirt', 20, ProductCategory.Clothing);
const product3 = productManager.addProduct('Book', 50, ProductCategory.Books);
console.log(JSON.stringify(productManager.getAllProducts(), null, 2));

console.log("============= Add Products to Cart ============= ");
const cart = new Cart();
cart.add(product1.getId(), 1);
cart.add(product2.getId(), 2);
cart.add(product3.getId(), 1);
console.log(cart.getDetails());

console.log("============= Add Coupons ============= ");
const couponManager = CouponManager.getInstance();
const additionalData: IAdditionalData = {
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-12-31'),
    productCategories: [ProductCategory.Electronics, ProductCategory.Clothing],
    percentage: 20,
    cap: 100,
    discountAmount: 50
};
const seasonalCoupon = couponManager.addCoupon(
    'SUMMER20',
    true,
    DiscountStrategyType.PercentageWithCap,
    CouponType.Seasonal,
    additionalData
);
console.log(couponManager.getCoupons());

console.log("============= Check Applicable Coupons ============= ");
const applicableCoupons = CartManager.getInstance().getAllApplicableCouponsForCart(cart);
console.log(applicableCoupons);

console.log("============= Apply Coupon ============= ");
cart.applyDiscount(seasonalCoupon);
console.log(JSON.stringify(cart.getDetails(), null, 2));