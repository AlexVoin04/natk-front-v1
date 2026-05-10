import axios from 'axios';

const BASE_URL = import.meta.env.VITE_AUTH_BASE ?? '/auth';

export async function forgotPassword(email: string) {
  await axios.post(`${BASE_URL}/password/forgot`, { email });
}

export async function resetPassword(token: string, newPassword: string) {
  await axios.post(`${BASE_URL}/password/reset`, {
    token,
    newPassword,
  });
}
