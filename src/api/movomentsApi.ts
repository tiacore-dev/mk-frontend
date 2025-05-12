import { axiosInstance } from "../axiosConfig";

export interface IMovementsResponse {
  total: number;
  data: IMovement[];
}
export interface IMovement {
  sender: string;
  date: string; //ts
  user: string;
  status: string;
  order: string;
  id: string;
}

export interface IMovementDetails {
  id: string;
  sender: string;
  date: string;
  order: string;
  user: string;
  status: string;
  products: IProduct[];
}

export interface IProduct {
  id: string;
  qt: string;
  batch?: string;
}

export const fetchMovoments = async (params: {
  limit: number;
  offset: number;
}): Promise<IMovementsResponse> => {
  const url = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");

  const response = await axiosInstance.get(`${url}movements/all'`, {
    params,
    headers: {
      token: token,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const fetchMovementDetails = async (
  id: string
): Promise<IMovementDetails> => {
  const url = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");
  const response = await axiosInstance.get(`${url}movement/${id}/view`, {
    headers: {
      token: token,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export interface IAcceptMovementRequest {
  comment?: string;
}

export const acceptMovement = async (
  id: string,
  comment?: string
): Promise<{ success: boolean }> => {
  const url = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");

  const requestData: IAcceptMovementRequest = {};
  if (comment) {
    requestData.comment = comment;
  }

  try {
    const response = await axiosInstance.post(
      `${url}movement/${id}/accept`,
      requestData,
      {
        headers: {
          token: token,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
