export type User = {
  id: number;
  name: string;
  username: string;
  email: string;
  firstname: string | null;
  lastname: string | null;
  role: string;
  city: string | null;
  address: string | null;
  phone: string | null;
  zip_code: string | null;
  blocked: number;
  email_verified_at: string | null;
  avatar: string | null;
  active: number;
  status: string | null;
  created_at: string;
  updated_at: string;
};

export type UserListData = {
  results: User[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export type UserListApiResponse = {
  errorCode: number | string;
  message: string;
  error: unknown | null;
  statusCode: number;
  data: UserListData | null;
};

export type ClassParticipant = {
  userId: number;
  name: string;
  progress: string;
  isCertificateEligible: boolean;
  totalScore: number;
};

export type ClassParticipantApiResponse = {
  success: boolean;
  message: string;
  data: ClassParticipant[];
  statusCode: number;
};

export type UserApiResponse =
  | UserListApiResponse
  | ClassParticipantApiResponse;
