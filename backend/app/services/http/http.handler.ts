import logger from "@adonisjs/core/services/logger";
import request from "request";
import rp from "request-promise";

import { BlError } from "#shared/bl-error/bl-error";

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
        logger.info(`<-R ERROR ${error}`);
        return reject(new BlError(`error on request to "${url}"`));
      }

      if (res && res.statusCode) {
        if (res.statusCode == 200 || res.statusCode === 201) {
          return resolve(body);
        }

        logger.info(`<-R ERROR ${error}`);

        return reject(
          new BlError(
            `the request to "${url}" responded with status ${res.statusCode}`,
          ).store("body", body),
        );
      }
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
        logger.info(`<-R ERROR ${error}`);

        reject(
          new BlError(`could not get the requested resource at "${url}"`).store(
            "error",
            error,
          ),
        );
      });
  });
}

const HttpHandler = {
  post,
  get,
};

export default HttpHandler;
