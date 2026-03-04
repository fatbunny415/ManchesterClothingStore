import api from "./api"

export const loginRequest = async (credentials) => {
  const response = await api.post("/Auth/login", credentials)
  return response.data
}