// src/api/authApi.ts
import { axiosInstance } from "../axiosConfig";
import { ILoginRequest, ILoginResponse } from "../pages/loginPage/authTypes";

export const loginUser = async (
  data: ILoginRequest
): Promise<ILoginResponse> => {
  const url = process.env.REACT_APP_API_URL;
  if (!url) {
    throw new Error("REACT_APP_API_URL is not defined");
  }

  const response = await axiosInstance.post<ILoginResponse>(
    `${url}/auth/login`,
    data
  );
  return response.data;
};
