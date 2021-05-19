import moment from "moment-timezone";

export function CurrentDateTime() {
  return moment().tz(getCurrentTimeZone()).format();
}

export function getCurrentTimeZone() {
  let timeZone = moment.tz.guess();

  if (
    process.env.LEON_TIME_ZONE &&
    !!moment.tz.zone(process.env.LEON_TIME_ZONE)
  ) {
    timeZone = process.env.LEON_TIME_ZONE;
  }

  return timeZone;
}
