import { supabase } from '../config/supabase';

// Helper to handle Supabase responses and throw errors if needed
const handleSupabaseResponse = (data, error) => {
  if (error) throw error;
  return { data };
};

const api = {
  // ── Auth (Handled directly in AuthContext now) ────────
  async register(name, email, password) {
    // Keeping signature for compatibility if needed
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw error;
    return { data };
  },

  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return { data };
  },

  // ── Session ─────────────────────────────
  async startSession() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('sessions')
      .insert({ user_id: user.id, status: 'active' })
      .select()
      .single();
    
    return handleSupabaseResponse(data, error);
  },

  async getSession(id) {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', id)
      .single();
    
    return handleSupabaseResponse(data, error);
  },

  // ── Products ────────────────────────────
  async getProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*');
    
    return handleSupabaseResponse(data, error);
  },

  async getProductByBarcode(code) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('barcode', code)
      .single();
    
    return handleSupabaseResponse(data, error);
  },

  // ── Cart ────────────────────────────────
  async addToCart(sessionId, barcode) {
    // 1. Get product by barcode
    const { data: product, error: pError } = await supabase
      .from('products')
      .select('*')
      .eq('barcode', barcode)
      .single();
    
    if (pError) throw new Error('Product not found');

    // 2. Check if item already in cart
    const { data: existingItem, error: eError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('session_id', sessionId)
      .eq('product_id', product.id)
      .single();

    let cartItemData;
    let cartItemError;

    if (existingItem) {
      // Update quantity
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + 1 })
        .eq('id', existingItem.id)
        .select()
        .single();
      cartItemData = data;
      cartItemError = error;
    } else {
      // Insert new item
      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          session_id: sessionId,
          product_id: product.id,
          quantity: 1,
          price_at_scan: product.price,
        })
        .select()
        .single();
      cartItemData = data;
      cartItemError = error;
    }

    if (cartItemError) throw cartItemError;

    // 3. Calculate new total
    const { data: cartItems, error: itemsError } = await supabase
      .from('cart_items')
      .select('quantity, price_at_scan')
      .eq('session_id', sessionId);

    if (itemsError) throw itemsError;

    const cartTotal = cartItems.reduce((acc, item) => acc + (item.quantity * item.price_at_scan), 0);

    // Return the structure expected by the app
    return {
      data: {
        success: true,
        product,
        cartTotal,
      },
    };
  },

  async getCart(sessionId) {
    const { data: items, error } = await supabase
      .from('cart_items')
      .select('*, products(*)')
      .eq('session_id', sessionId);
    
    if (error) throw error;

    const cartTotal = items.reduce((acc, item) => acc + (item.quantity * item.price_at_scan), 0);

    return {
      data: {
        items,
        cartTotal,
      },
    };
  },

  async removeFromCart(sessionId, productId) {
    // Find the item first to check quantity
    const { data: item, error: fError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('session_id', sessionId)
      .eq('product_id', productId)
      .single();

    if (fError) throw fError;

    if (item.quantity > 1) {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: item.quantity - 1 })
        .eq('id', item.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', item.id);
      if (error) throw error;
    }

    return { data: { success: true } };
  },

  async deleteFromCart(sessionId, productId) {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('session_id', sessionId)
      .eq('product_id', productId);
    
    if (error) throw error;
    return { data: { success: true } };
  },

  // ── Payment ─────────────────────────────
  async pay(sessionId, method = 'simulate') {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data: cartItems } = await supabase
      .from('cart_items')
      .select('quantity, price_at_scan')
      .eq('session_id', sessionId);
      
    const amount = cartItems.reduce((acc, item) => acc + (item.quantity * item.price_at_scan), 0);

    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        session_id: sessionId,
        user_id: user.id,
        amount,
        method,
        status: 'completed',
        paid_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    const qrToken = `PASS-${sessionId.substring(0, 8)}`;

    // Update session status
    await supabase
      .from('sessions')
      .update({ 
        status: 'completed', 
        completed_at: new Date().toISOString(), 
        total_amount: amount,
        qr_token: qrToken
      })
      .eq('id', sessionId);

    return {
      data: {
        qrToken,
        total: amount,
        payment: {
          transaction_id: payment.id
        }
      }
    };
  },

  async getHistory() {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('payments')
      .select('*, sessions(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { data };
  },

  // ── Exit ────────────────────────────────
  async verifyExit(qrToken) {
    // In a real app, this would verify the token.
    // For now, we simulate success if the token belongs to a completed session.
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('qr_token', qrToken)
      .single();
      
    if (error) throw error;
    
    if (data.status === 'completed') {
      await supabase
        .from('sessions')
        .update({ exit_verified: true })
        .eq('id', data.id);
        
      return { data: { success: true, message: 'Exit verified successfully' } };
    }
    
    throw new Error('Session not completed or invalid token');
  },
};

export default api;
