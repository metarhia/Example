namespace api.example.add {
  type Code = 'EARGA' | 'EARGB';

  class CustomError extends DomainError {
    constructor(code?: Code);
    toJSON(): object;
  }
}
