import { PageContext } from '../src/types/index';

declare global {
  namespace Express {
    export interface Response {
      context?: PageContext
    }
  }
}