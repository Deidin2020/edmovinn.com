import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { ArrowLeft, X, Plus, Minus, ShoppingCart } from "lucide-react";

const Cart = () => {
  const { items, removeFromCart, updateQuantity, getTotal, getTotalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-white border-b border-border px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium">Cart</span>
          </div>
        </div>

        {/* Empty Cart */}
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8">Browse our accommodations and add some rooms to your cart.</p>
          <Link to="/">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Browse Accommodations
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground font-medium">Cart ({getTotalItems()} items)</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Cart Table Header - Desktop */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-4 p-4 bg-secondary/10 rounded-t-lg border-b border-border">
          <div className="col-span-5 font-semibold text-foreground">Accommodation / Location</div>
          <div className="col-span-2 font-semibold text-foreground text-center">Price</div>
          <div className="col-span-2 font-semibold text-foreground text-center">Deposit</div>
          <div className="col-span-2 font-semibold text-foreground text-center">Quantity</div>
          <div className="col-span-1 font-semibold text-foreground text-center">Total</div>
        </div>

        {/* Cart Items */}
        <div className="bg-white rounded-b-lg border border-border">
          {items.map((item, index) => (
            <div key={item.id} className={`p-4 ${index !== items.length - 1 ? 'border-b border-border' : ''}`}>
              {/* Desktop Layout */}
              <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center">
                <div className="col-span-5 flex items-center gap-4">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.location}</p>
                  </div>
                </div>
                <div className="col-span-2 text-center font-medium">${item.price}</div>
                <div className="col-span-2 text-center font-medium">${item.deposit}</div>
                <div className="col-span-2 flex items-center justify-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 rounded-md border border-border bg-background hover:bg-secondary/50 flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-md border border-border bg-background hover:bg-secondary/50 flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="col-span-1 text-center font-bold text-lg">
                  ${(item.price + item.deposit) * item.quantity}
                </div>
              </div>

              {/* Mobile Layout */}
              <div className="lg:hidden">
                <div className="flex gap-4 mb-4">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
                        <p className="text-xs text-muted-foreground">{item.location}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Price: </span>
                        <span className="font-medium">${item.price}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Deposit: </span>
                        <span className="font-medium">${item.deposit}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-md border border-border bg-background hover:bg-secondary/50 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-md border border-border bg-background hover:bg-secondary/50 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="font-bold text-lg text-primary">
                    ${(item.price + item.deposit) * item.quantity}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="mt-8 bg-white rounded-lg border border-border p-6">
          <div className="flex justify-between items-center text-xl font-bold mb-4">
            <span>Total:</span>
            <span className="text-primary">${getTotal()}</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/" className="flex-1">
              <Button variant="outline" size="lg" className="w-full">
                Continue Shopping
              </Button>
            </Link>
            <Link to="/checkout" className="flex-1">
              <Button size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;