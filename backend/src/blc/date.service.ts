import moment from "moment-timezone";

type MomentLocation = "Europe/Oslo" | string;
/*
 * DateService is a wrapper around momentjs to have a
 * single place for localization of time zones
 */
export class DateService {
  private defaultLocation: MomentLocation;
  constructor() {
    this.defaultLocation = "Europe/London";
    moment.tz.setDefault(this.defaultLocation);
  }

  public utcToLocalTimeString(
    utcDate: Date | string,
    location: MomentLocation,
  ): string {
    return moment.tz(utcDate, location).format("YYYY-MM-DDTHH:mm:ss.SSSZ");
  }

  public toPrintFormat(date: Date | string, location: MomentLocation): string {
    return moment.tz(date, location).format("DD.MM.YY");
  }

  public toEndOfDay(date: Date | string, location: MomentLocation): Date {
    return moment.tz(date, location).endOf("day").toDate();
  }

  public startOfDay(date: Date | string, location?: MomentLocation): Date {
    return moment
      .tz(date, location ? location : this.defaultLocation)
      .startOf("day")
      .toDate();
  }

  public format(
    date: Date | string,
    location: MomentLocation,
    format: string,
  ): string {
    return moment.tz(date, location).format(format);
  }

  public between(
    date: Date,
    from: Date,
    to: Date,
    location: MomentLocation,
  ): boolean {
    return moment.tz(date, location).isBetween(from, to);
  }

  public betweenHours(
    date: Date,
    fromHour: number,
    toHour: number,
    location: MomentLocation,
  ): boolean {
    const from = moment.tz(location).hour(fromHour).minute(0).second(0);
    const to = moment.tz(location).hour(toHour).minute(0).second(0);

    return this.between(date, from.toDate(), to.toDate(), location);
  }

  public isOver18(birthday: Date | string): boolean {
    const eightTeenYearsAgo = moment().subtract(18, "years");
    return moment(birthday).isSameOrBefore(eightTeenYearsAgo, "day");
  }

  public toDate(dateString: string, format: string, location: MomentLocation) {
    return moment.tz(dateString, format, location).toDate();
  }
}

export const dateService = new DateService();
