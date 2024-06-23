import axios from "axios";

const fetchApi = async (
  url,
  method,
  data,
  headers = { "Content-Type": "application/json" },
  credentials
) => {
  const axiosOptions = {
    url,
    method,
    headers: {
      ...headers
    },
    data: data ? JSON.stringify(data) : undefined,
    withCredentials: credentials
  };

  try {
    const response = await axios(axiosOptions);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return error?.response;
    }
    return error?.response;
  }
};

export async function get (url, headers, credentials = false) {
  return await fetchApi(url, "GET", undefined, headers, credentials);
}

export async function post (url, data, headers, credentials = false) {
  return await fetchApi(url, "POST", data, headers, credentials);
}

export async function put (url, data, headers, credentials = false) {
  return await fetchApi(url, "PUT", data, headers, credentials);
}

export async function del (url, data, headers, credentials = false) {
  return await fetchApi(url, "DELETE", data, headers, credentials);
}
