import { SEDbQuery } from "#services/query/se.db-query";
import { BlStorage } from "#services/storage/bl-storage";
import { User } from "#services/types/user";
import { BlError } from "#shared/bl-error/bl-error";

const UserHandler = {
  getByUsername(username: string): Promise<User> {
    return new Promise((resolve, reject) => {
      if (!username)
        return reject(new BlError("username is empty or undefined"));

      const databaseQuery = new SEDbQuery();
      databaseQuery.stringFilters = [
        { fieldName: "username", value: username },
      ];

      BlStorage.Users.getByQuery(databaseQuery).then(
        ([user]) => {
          if (!user) {
            reject(
              new BlError(
                'could not find user with username "' + username + '"',
              ).code(702),
            );
            return;
          }
          resolve(user);
        },
        (error: BlError) => {
          reject(
            new BlError('could not find user with username "' + username + '"')
              .add(error)
              .code(702),
          );
        },
      );
    });
  },
  valid(username: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.getByUsername(username)
        .then(() => {
          resolve();
        })
        .catch((getUserError: BlError) => {
          reject(getUserError);
        });
    });
  },
};
export default UserHandler;
