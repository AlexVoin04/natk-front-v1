export interface UserProfile {
  id: string;
  login: string;
  name: string;
  surname: string;
  patronymic: string | null;
  phoneNumber: string | null;
  roles: string[];
  joinDate: string;        // временно
  storageUsed: number;
  storageLimit: number;
}