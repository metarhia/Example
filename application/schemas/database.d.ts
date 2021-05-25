interface Role {
  roleId: number;
  name: string;
}

interface Account {
  accountId: number;
  login: string;
  password: string;
}

interface Country {
  countryId: number;
  name: string;
}

interface City {
  cityId: number;
  name: string;
  countryId: number;
}

interface Session {
  sessionId: number;
  accountId: number;
  token: string;
  ip: string;
  data: string;
}
