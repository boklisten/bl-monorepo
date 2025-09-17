import dayjs from "dayjs";

export function isUnder18(birthday: Date) {
  return dayjs(birthday).isAfter(dayjs().subtract(18, "year"));
}
