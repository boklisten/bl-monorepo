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
| new UnauthorizedException('message', 500, 'E_RUNTIME_EXCEPTION')
|
*/
export default class UnauthorizedException extends Exception {
  constructor(message = "You're not authorized to perform this action.") {
    super(message, { status: 401, code: "E_UNAUTHORIZED" });
  }
}
