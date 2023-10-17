namespace api.console.content {
  type Code = 'ENOTFOUND' | 'EPARSE';

  class CustomError extends DomainError {
    constructor(code?: Code);
    toJSON(): object;
  }
}
