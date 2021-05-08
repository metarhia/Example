interface SystemGroup {
  systemGroupId: number;
  name: string;
}

interface SystemUser {
  systemUserId: number;
  login: string;
  password: string;
}

interface SystemSession {
  systemSessionId: number;
  userId: number;
  token: string;
  ip: string;
  data: string;
}
