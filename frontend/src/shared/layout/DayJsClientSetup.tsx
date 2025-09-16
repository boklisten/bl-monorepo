"use client";
import "dayjs/locale/nb";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);
dayjs.locale("nb");

export default function DayJsClientSetup() {
  return null;
}
