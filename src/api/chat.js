import service from "@/utils/request";

export const fetchZhiPuAPI = async (message) => {
  let res = await fetch(
    `${import.meta.env.VITE_APP_API_BASE_URL}/fetchZhiPuAPI`,
    {
      method: "POST",
      body: JSON.stringify({
        message: message,
      }),
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
    }
  );
};
