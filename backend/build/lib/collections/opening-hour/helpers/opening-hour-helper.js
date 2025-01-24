import { BlStorage } from "@backend/lib/storage/bl-storage.js";
import { BlError } from "@shared/bl-error/bl-error.js";
import moment from "moment-timezone";
export class OpeningHourHelper {
    async getNextAvailableOpeningHour(branch, after) {
        if (!branch.openingHours || branch.openingHours.length <= 0) {
            throw new BlError("no opening hours found at branch");
        }
        const openingHours = await BlStorage.OpeningHours.getMany(branch.openingHours);
        return this.getFirstAvailableOpeningHour(openingHours, after);
    }
    getFirstAvailableOpeningHour(openingHours, after) {
        let firstAvailableOpeningHour;
        for (const openingHour of openingHours) {
            if (moment(openingHour.from).isAfter(moment()) &&
                (!firstAvailableOpeningHour ||
                    moment(openingHour.from).isBefore(firstAvailableOpeningHour.from))) {
                if (after) {
                    if (moment(openingHour.from).isAfter(after)) {
                        firstAvailableOpeningHour = openingHour;
                    }
                }
                else {
                    firstAvailableOpeningHour = openingHour;
                }
            }
        }
        if (firstAvailableOpeningHour) {
            return firstAvailableOpeningHour;
        }
        else {
            throw new BlError("no opening hours are found to be valid");
        }
    }
}
