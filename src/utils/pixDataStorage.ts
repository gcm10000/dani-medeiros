export const savePixData = (orderResponse: any) => {
  localStorage.setItem(`pixData_${orderResponse.orderId}`, JSON.stringify(orderResponse));
};

export const getPixData = (orderId: string) => {
  const data = localStorage.getItem(`pixData_${orderId}`);
  return data ? JSON.parse(data) : null;
};

export const getAllPixData = (): any[] => {
  const orders: any[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("pixData_")) {
      const data = localStorage.getItem(key);
      if (data) {
        orders.push(JSON.parse(data));
      }
    }
  }
  return orders;
};

export const removePixData = (orderId: string) => {
  localStorage.removeItem(`pixData_${orderId}`);
};


export const savePixDataRequest = (orderId: string, requestData: any) => {
  localStorage.setItem(`pixDataRequest_${orderId}`, JSON.stringify(requestData));
};

export const getPixDataRequest = (orderId: string) => {
  const data = localStorage.getItem(`pixDataRequest_${orderId}`);
  return data ? JSON.parse(data) : null;
};

export const removePixDataRequest = (orderId: string) => {
  localStorage.removeItem(`pixDataRequest_${orderId}`);
};


export const savePixDataResponse = (orderId: string, responseData: any) => {
  localStorage.setItem(`pixDataResponse_${orderId}`, JSON.stringify(responseData));
};

export const getPixDataResponse = (orderId: string) => {
  const data = localStorage.getItem(`pixDataResponse_${orderId}`);
  return data ? JSON.parse(data) : null;
};

export const removePixDataResponse = (orderId: string) => {
  localStorage.removeItem(`pixDataResponse_${orderId}`);
};
