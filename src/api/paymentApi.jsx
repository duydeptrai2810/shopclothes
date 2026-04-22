const API_URL = 'http://localhost:3000/api/payments';

export const paymentApi = {
    // 1. Khách hàng tạo mã giao dịch
    createIntent: async (token, orderId, paymentMethod) => {
        const response = await fetch(`${API_URL}/payments/create-intent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ orderId, paymentMethod })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Lỗi khi tạo phiên thanh toán');
        }
        return await response.json();
    },

    // 2. Giả lập Ngân hàng gọi Webhook (Dành cho lúc test)
    fireMockWebhook: async (transactionId, status = 'SUCCESS') => {
        const response = await fetch(`${API_URL}/payments/webhook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transactionId, status })
        });
        return await response.json();
    }
};