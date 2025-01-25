import { BlError } from "@shared/bl-error/bl-error.js";
import { Branch } from "@shared/branch/branch.js";
import { OpeningHour } from "@shared/opening-hour/opening-hour.js";
import moment from "moment-timezone";

import { BlStorage } from "#services/storage/bl-storage";

export class OpeningHourHelper {
  public async getNextAvailableOpeningHour(
    branch: Branch,
    after?: Date,
  ): Promise<OpeningHour> {
    if (!branch.openingHours || branch.openingHours.length <= 0) {
      throw new BlError("no opening hours found at branch");
    }
    const openingHours = await BlStorage.OpeningHours.getMany(
      branch.openingHours,
    );

    return this.getFirstAvailableOpeningHour(openingHours, after);
  }

  private getFirstAvailableOpeningHour(
    openingHours: OpeningHour[],
    after?: Date,
  ): OpeningHour {
    let firstAvailableOpeningHour;

    for (const openingHour of openingHours) {
      if (
        moment(openingHour.from).isAfter(moment()) &&
        (!firstAvailableOpeningHour ||
          moment(openingHour.from).isBefore(firstAvailableOpeningHour.from))
      ) {
        if (after) {
          if (moment(openingHour.from).isAfter(after)) {
            firstAvailableOpeningHour = openingHour;
          }
        } else {
          firstAvailableOpeningHour = openingHour;
        }
      }
    }

    if (firstAvailableOpeningHour) {
      return firstAvailableOpeningHour;
    } else {
      throw new BlError("no opening hours are found to be valid");
    }
  }
}
