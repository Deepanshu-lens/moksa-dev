/**
 * Convert a date-time string to a formatted date in a specified time zone.
 * @param dateTime - The date-time string in the format "YYYY-MM-DD HH:mm:ss".
 * @param timeZone - The IANA time zone string (e.g., "Asia/Kolkata").
 * @returns The formatted date and time string in the specified time zone or null if input is invalid.
 */

const DEFAULT_TIMEZONE = "America/New_York"
export function convertDateTimeToTimeZone(
    dateTime: string,
    timeZone: string = DEFAULT_TIMEZONE
  ): string | null {
    try {
      if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateTime)) {
        throw new Error("Invalid date-time format. Expected 'YYYY-MM-DD HH:mm:ss'.");
      }
      const isoDateTime = dateTime.replace(" ", "T");
      const date = new Date(isoDateTime + "Z");

      if (isNaN(date.getTime())) {
        throw new Error("Invalid date-time string.");
      }

      const options: Intl.DateTimeFormatOptions = {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };

      const formatter = new Intl.DateTimeFormat("en-US", options);
      return formatter.format(date);
    } catch (error) {
      console.error("Error converting date-time:", (error as Error).message);
      return null;
    }
  }
  
//   Example Usage
//   const dateTime = "2024-12-26 09:02:42";
//   const timeZone = "Asia/Kolkata";
//   const formattedDateTime = convertDateTimeToTimeZone(dateTime, timeZone);

  