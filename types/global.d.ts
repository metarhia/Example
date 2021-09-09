/* This import should not be removed. We need to reference impress explicitly
 * so that tsc correctly resolved global variables.
 * For some odd reason using typeRoots results in an array of errors.
 * The problem should have been fixed by having an index file but no luck.
 * PR with the correct fix would be greatly appreciated. */
import * as _impress from 'impress';

import * as _metasql from 'metasql';
import { Database } from 'metasql';

declare global {
  namespace metarhia {
    const metasql: typeof _metasql;
  }

  namespace api {}

  namespace lib {}

  namespace domain {}

  namespace db {
    const pg: Database;
  }
}
