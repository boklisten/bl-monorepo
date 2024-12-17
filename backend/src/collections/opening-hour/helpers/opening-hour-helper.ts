import { BlError, Branch, OpeningHour } from "@boklisten/bl-model";
import moment from "moment-timezone";

import { BlCollectionName } from "@/collections/bl-collection";
import { openingHourSchema } from "@/collections/opening-hour/opening-hour.schema";
import { BlDocumentStorage } from "@/storage/blDocumentStorage";

export class OpeningHourHelper {
  constructor(private openingHourStorage?: BlDocumentStorage<OpeningHour>) {
    this.openingHourStorage = this.openingHourStorage
      ? this.openingHourStorage
      : new BlDocumentStorage<OpeningHour>(
          BlCollectionName.OpeningHours,
          openingHourSchema,
        );
  }

  public async getNextAvailableOpeningHour(
    branch: Branch,
    after?: Date,
  ): Promise<OpeningHour> {
    if (!branch.openingHours || branch.openingHours.length <= 0) {
      throw new BlError("no opening hours found at branch");
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
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
      if (moment(openingHour.from).isAfter(moment())) {
        if (
          !firstAvailableOpeningHour ||
          moment(openingHour.from).isBefore(firstAvailableOpeningHour.from)
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
    }

    if (firstAvailableOpeningHour) {
      return firstAvailableOpeningHour;
    } else {
      throw new BlError("no opening hours are found to be valid");
    }
  }
}
