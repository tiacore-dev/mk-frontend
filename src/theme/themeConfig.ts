import type { ThemeConfig } from "antd";

export const themeConfig: ThemeConfig = {
  token: {
    colorPrimary: "#005696",
    fontSize: 14,
    borderRadius: 8,
    padding: 16,
    margin: 16,
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    colorBgContainer: "#ffffff",
    colorBorder: "#e2e8f0",
    colorText: "#1e293b",
    colorTextSecondary: "#64748b",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  components: {
    Button: {
      borderRadius: 8,
      fontWeight: 500,
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
    },
    Card: {
      borderRadius: 12,
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    },
    Table: {
      borderRadius: 12,
      headerBg: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9ce 100%)",
    },
    Modal: {
      borderRadius: 16,
      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
    },
    Input: {
      borderRadius: 8,
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
    },
    Select: {
      borderRadius: 8,
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
    },
    DatePicker: {
      borderRadius: 8,
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
    },
  },
};
