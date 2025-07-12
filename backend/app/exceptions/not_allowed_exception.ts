import { Exception } from "@adonisjs/core/exceptions";

/*
|--------------------------------------------------------------------------
| Exception
|--------------------------------------------------------------------------
|
| The Exception class imported from `@adonisjs/core` allows defining
| a status code and error code for every exception.
|
| @example
| new NotAllowedException('message', 500, 'E_RUNTIME_EXCEPTION')
|
*/
export default class NotAllowedException extends Exception {
  constructor(message = "You do not have permission to perform this action.") {
    super(message, { status: 403, code: "E_NOT_ALLOWED_EXCEPTION" });
  }
}
