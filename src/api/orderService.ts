import api from './axios';

export interface CreateOrderRequest {
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  _id: string;
}

export interface OrderAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Order {
  _id: string;
  userId: string | {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  items: OrderItem[];
  address: OrderAddress;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipments: unknown[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreateOrderResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: Order;
}

export interface GetOrdersResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    orders: Order[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface GetOrderResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: Order;
}

export interface CancelOrderResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: Order;
}

export const createOrder = async (orderData: CreateOrderRequest): Promise<CreateOrderResponse> => {
  const response = await api.post<CreateOrderResponse>('/orders', orderData);
  return response.data;
};

export const getMyOrders = async (page: number = 1, limit: number = 12): Promise<GetOrdersResponse> => {
  const response = await api.get<GetOrdersResponse>(`/orders/my?page=${page}&limit=${limit}`);
  return response.data;
};

export const getOrderById = async (orderId: string): Promise<GetOrderResponse> => {
  const response = await api.get<GetOrderResponse>(`/orders/${orderId}`);
  return response.data;
};

export const cancelOrder = async (orderId: string): Promise<CancelOrderResponse> => {
  const response = await api.patch<CancelOrderResponse>(`/orders/${orderId}/cancel`);
  return response.data;
}; 