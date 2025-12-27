// Helper function to format product name with options
export function formatProductName(product?: {
    speed?: string;
    tvType?: string;
    tvDevice?: string;
    wifiRouter?: boolean;
    monthlyPrice?: number;
    cashBenefit?: number;
}): string {
    if (!product) return '-';
    
    const parts: string[] = [];
    
    // Base product (speed)
    if (product.speed) {
        parts.push(product.speed);
    }
    
    // TV package
    if (product.tvType && product.tvType !== '선택안함') {
        parts.push(product.tvType);
        if (product.tvDevice && product.tvDevice !== '선택안함') {
            parts.push(product.tvDevice);
        }
    }
    
    // WiFi router
    if (product.wifiRouter) {
        parts.push('WiFi 공유기');
    }
    
    return parts.length > 0 ? parts.join(' + ') : '-';
}
