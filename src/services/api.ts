import axios from "axios";

export const api = axios.create({
  baseURL: "http://172.21.32.106:4000/api/",
});
