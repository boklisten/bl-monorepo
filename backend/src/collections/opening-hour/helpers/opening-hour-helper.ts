import { OpeningHourModel } from "@backend/collections/opening-hour/opening-hour.model";
import { BlDocumentStorage } from "@backend/storage/blDocumentStorage";
import { BlError } from "@shared/bl-error/bl-error";
import { Branch } from "@shared/branch/branch";
import { OpeningHour } from "@shared/opening-hour/opening-hour";
import moment from "moment-timezone";

export class OpeningHourHelper {
  constructor(private openingHourStorage?: BlDocumentStorage<OpeningHour>) {
    this.openingHourStorage = this.openingHourStorage
      ? this.openingHourStorage
      : new BlDocumentStorage(OpeningHourModel);
  }

  public async getNextAvailableOpeningHour(
    branch: Branch,
    after?: Date,
  ): Promise<OpeningHour> {
    if (!branch.openingHours || branch.openingHours.length <= 0) {
      throw new BlError("no opening hours found at branch");
    }

    // @ts-expect-error fixme: auto ignored
    const openingHours = await this.openingHourStorage.getMany(
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
