// // src/api/balanceApi.ts
// import { axiosInstance } from "../axiosConfig";

// export interface IBalanceItem {
//   product: string;
//   date: string;
//   qt: number;
// }
// // const mockBalanceData: IBalanceItem[] = [
// //   {
// //     product: "qwe",
// //     date: "2025-05-05T00:00:00",
// //     qt: 46,
// //   },
// //   {
// //     product: "wer",
// //     date: "2025-05-06T00:00:00",
// //     qt: 12,
// //   },
// //   {
// //     product: "ert",
// //     date: "2025-05-07T00:00:00",
// //     qt: 89,
// //   },
// //   {
// //     product: "wer",
// //     date: "2025-05-05T00:00:00",
// //     qt: 10,
// //   },
// // ];
// // export const fetchBalance = async (): Promise<IBalanceItem[]> => {
// //   console.log("Using mock balance data");
// //   return mockBalanceData;
// // };
// export const fetchBalance = async (): Promise<IBalanceItem[]> => {
//   const url = process.env.REACT_APP_API_URL;
//   const token = localStorage.getItem("token");
//   const response = await axiosInstance.get<IBalanceItem[]>(
//     `${url}/balances/view`,
//     {
//       headers: {
//         token: token,
//         "Content-Type": "application/json",
//       },
//     }
//   );
//   return response.data;
// };

// export const changeBalance = async (
//   balanceData: IBalanceItem[]
// ): Promise<IBalanceItem[]> => {
//   const url = process.env.REACT_APP_API_URL;
//   const token = localStorage.getItem("token");
//   const response = await axiosInstance.patch<IBalanceItem[]>(
//     `${url}/balances/update`, // Обычно для обновления используется другой endpoint
//     balanceData, // Отправляем массив данных в теле запроса
//     {
//       headers: {
//         token: token,
//         "Content-Type": "application/json",
//       },
//     }
//   );
//   return response.data;
// };
// // export const changeBalance = async (
// //   balanceData: IBalanceItem[]
// // ): Promise<IBalanceItem[]> => {
// //   console.log("!!!!!!!!!!!!!!", balanceData);

// //   return balanceData;
// // };

// src/api/balanceApi.ts
import { axiosInstance } from "../axiosConfig";

export interface IBalanceItem {
  product: string;
  date: string;
  qt: number;
}
export interface ISoldItem {
  product: string;
  qt: number;
}
// Моковые данные для демонстрации
const mockBalanceData: IBalanceItem[] = [
  {
    product: "74c08d8a-1b34-11f0-a439-c71acea5f7ce",
    date: "2025-05-05T00:00:00",
    qt: 46,
  },
  {
    product: "74c08d8a-1b34-11f0-a439-c71acea5f7ce",
    date: "2025-05-06T00:00:00",
    qt: 6,
  },
  {
    product: "a8bf6a65-1b34-11f0-a439-c71acea5f7ce",
    date: "2025-05-06T00:00:00",
    qt: 12,
  },
  {
    product: "a8bf6a67-1b34-11f0-a439-c71acea5f7ce",
    date: "2025-05-07T00:00:00",
    qt: 89,
  },
  {
    product: "a8bf6a67-1b34-11f0-a439-c71acea5f7ce",
    date: "2025-05-06T00:00:00",
    qt: 9,
  },
  {
    product: "a8bf6a6a-1b34-11f0-a439-c71acea5f7ce",
    date: "2025-05-05T00:00:00",
    qt: 10,
  },
  {
    product: "a8bf6a6a-1b34-11f0-a439-c71acea5f7ce",
    date: "2025-05-06T00:00:00",
    qt: 17,
  },
  {
    product: "a8bf6a65-1b34-11f0-a439-c71acea5f7ce",
    date: "2025-05-05T00:00:00",
    qt: 10,
  },
];

const mockSoldData: ISoldItem[] = [
  {
    product: "74c08d8a-1b34-11f0-a439-c71acea5f7ce",
    qt: 6,
  },
  {
    product: "a8bf6a65-1b34-11f0-a439-c71acea5f7ce",
    qt: 2,
  },
  {
    product: "a8bf6a67-1b34-11f0-a439-c71acea5f7ce",
    qt: 0,
  },
  {
    product: "a8bf6a6a-1b34-11f0-a439-c71acea5f7ce",
    qt: 10,
  },
];

export const fetchSold = async (): Promise<ISoldItem[]> => {
  console.log("Using mock sold data");
  return new Promise((resolve) => {
    setTimeout(() => resolve([...mockSoldData]), 500); // Имитация задержки сети
  });
};

// Переменная для хранения моковых данных (имитация "сервера")
let mockData = [...mockBalanceData];

// Моковая функция для получения баланса
export const fetchBalance = async (): Promise<IBalanceItem[]> => {
  console.log("Using mock balance data");
  return new Promise((resolve) => {
    setTimeout(() => resolve([...mockData]), 500); // Имитация задержки сети
  });
};

// Моковая функция для изменения баланса
export const changeBalance = async (
  balanceData: IBalanceItem[]
): Promise<IBalanceItem[]> => {
  console.log("Updating mock balance data", balanceData);
  return new Promise((resolve) => {
    setTimeout(() => {
      // Обновляем моковые данные
      mockData = mockData.map((item) => {
        const updatedItem = balanceData.find(
          (updated) =>
            updated.product === item.product && updated.date === item.date
        );
        return updatedItem || item;
      });
      resolve([...mockData]);
    }, 500); // Имитация задержки сети
  });
};
