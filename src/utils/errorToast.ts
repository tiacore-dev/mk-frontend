import type { AxiosError } from "axios";
import React, { type CSSProperties, type ReactElement } from "react";

const titleStyle: CSSProperties = {
  color: "#1f2937",
  fontSize: 14,
  fontWeight: 600,
  lineHeight: 1.3,
};

const descriptionStyle: CSSProperties = {
  color: "#6b7280",
  fontSize: 13,
  lineHeight: 1.35,
  marginTop: 2,
};

const getResponseBodyText = (error: AxiosError): string | undefined => {
  const data = error.response?.data;

  if (typeof data === "string") {
    const text = data.trim();
    return text || undefined;
  }

  if (data && typeof data === "object" && "message" in data) {
    const message = (data as { message?: unknown }).message;

    if (typeof message === "string") {
      const text = message.trim();
      return text || undefined;
    }
  }

  return undefined;
};

export const formatErrorToastMessage = (
  defaultMessage: string,
  error: AxiosError
): ReactElement => {
  const responseBodyText = getResponseBodyText(error);

  if (!responseBodyText) {
    return React.createElement("span", { style: titleStyle }, defaultMessage);
  }

  return React.createElement(
    "div",
    null,
    React.createElement("div", { style: titleStyle }, defaultMessage),
    React.createElement("div", { style: descriptionStyle }, responseBodyText)
  );
};
