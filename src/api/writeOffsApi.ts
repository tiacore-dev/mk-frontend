import { axiosInstance } from "../axiosConfig";

export interface IWriteOffResponse {
  total: number;
  data: IWriteOff[];
}
export interface IWriteOff {
  date: string;
  user: string;
  id: string;
  description: string;
}

export interface IWriteOffDetails {
  date: string;
  user: string;
  id: string;
  description?: string;
  products: IProductOff[];
}

export interface IProductOff {
  id: string;
  qt: string;
  date: string; // timestamp как строка
}

export const fetchWriteOffs = async (params: {
  limit: number;
  offset: number;
}) => {
  const url = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");

  const response = await axiosInstance.get(`${url}writeoffs/all`, {
    params,
    headers: {
      token: token,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const fetchWriteOffDetails = async (
  id: string
): Promise<IWriteOffDetails> => {
  const url = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");
  const response = await axiosInstance.get(`${url}writeoff/${id}/view`, {
    headers: {
      token: token,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export interface ICreateWriteOffsRequest {
  date: string; // Формат: "YYYY-MM-DDTHH:mm:ss"
  description: string;
  products: Array<{
    id: string;
    qt: number;
    date: string; // timestamp как строка
  }>;
}

export const createWriteOff = async (
  writeOffData: ICreateWriteOffsRequest
): Promise<{ success: boolean }> => {
  const url = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");

  const response = await axiosInstance.post(
    `${url}writeoff/add`,
    writeOffData,
    {
      headers: {
        token: token,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

export interface IWriteOffUpdateRequest {
  description?: string;
  products: Array<{
    id: string;
    qt: number;
    date?: string; // timestamp как строка
  }>;
}

export const updateWriteOff = async (
  id: string,
  writeOffData: IWriteOffUpdateRequest
): Promise<{ success: boolean }> => {
  const url = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");
  try {
    const response = await axiosInstance.patch(
      `${url}writeoff/${id}/edit`,
      writeOffData,
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
