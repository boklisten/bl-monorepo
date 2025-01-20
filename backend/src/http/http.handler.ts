import { logger } from "@backend/logger/logger.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import { stringify } from "qs";
import request from "request";
import rp from "request-promise";

// fixme: request and request-promise is deprecated, rewrite to use fetch
function post(
  url: string,
  data: unknown,
  authorization?: string,
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const options = {
      url: url,
      json: data,
      headers: {},
    };

    if (authorization) {
      // @ts-expect-error fixme: auto ignored
      options["headers"]["Authorization"] = authorization;
    }

    logger.debug(`R-> POST ${url}`);
    request.post(options, (error, res, body) => {
      if (error) {
        logger.verbose(`<-R ERROR ${error}`);
        return reject(new BlError(`error on request to "${url}"`));
      }

      if (res && res.statusCode) {
        if (res.statusCode == 200 || res.statusCode === 201) {
          return resolve(body);
        }

        logger.verbose(`<-R ERROR ${error}`);

        return reject(
          new BlError(
            `the request to "${url}" responded with status ${res.statusCode}`,
          ).store("body", body),
        );
      }
    });
  });
}

function getWithQuery(
  url: string,
  queryString: string,
  headers?: object,
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const options = {
      uri: url + "?" + queryString,
      json: true,
      headers: headers,
    };

    logger.debug(`R-> GET ${options.uri}`);

    rp(options)
      .then((jsonResponse: unknown) => {
        resolve(jsonResponse);
      })
      .catch((error: unknown) => {
        logger.verbose(`<-R ERROR ${error}`);

        reject(
          new BlError("could not get page with query")
            .store("responseError", error)
            .store("uri", url + "?" + queryString),
        );
      });
  });
}

function get(url: string, authorization?: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const options = {
      uri: url,
      json: true,
      headers: {},
    };

    if (authorization) {
      // @ts-expect-error fixme: auto ignored
      options["headers"]["Authorization"] = authorization;
    }

    logger.debug(`R-> GET ${options.uri}`);

    rp(options)
      .then((jsonResponse: unknown) => {
        resolve(jsonResponse);
      })
      .catch((error: unknown) => {
        logger.verbose(`<-R ERROR ${error}`);

        reject(
          new BlError(`could not get the requested resource at "${url}"`).store(
            "error",
            error,
          ),
        );
      });
  });
}

function createQueryString(data: unknown): string {
  return stringify(data);
}

const HttpHandler = {
  post,
  getWithQuery,
  get,
  createQueryString,
};

export default HttpHandler;
