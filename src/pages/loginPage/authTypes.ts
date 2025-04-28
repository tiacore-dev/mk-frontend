// src/types/authTypes.ts
export interface ILoginRequest {
  username: string;
  password: string;
}

export interface ILoginResponse {
  fullName: string;
  username: string;
  token: string;
}

export type ApiError = {
  response?: {
    data: {
      message: string;
    };
  };
};
