import * as _metasql from 'metasql';

declare global {
  namespace metarhia {
    const metasql: typeof _metasql;
  }

  namespace api {}

  namespace lib {}

  namespace domain {}
}
