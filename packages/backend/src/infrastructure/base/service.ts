import type { Logger } from '../../logging/index.js';

export abstract class BaseService {
  protected readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }
}
