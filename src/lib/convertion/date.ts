/**
 * Convert a date string (e.g., "26 Dec 2024") to the same format in a specified time zone.
 * @param date - The date string in the format "DD MMM YYYY".
 * @param timeZone - The IANA time zone string (e.g., "Asia/Kolkata").
 * @returns The converted date string in the format "DD MMM YYYY" or null if the input is invalid.
 */

const DEFAULT_TIMEZONE = "America/New_York"
export default function convertDateToTimeZone(
    date: string,
    timeZone: string= DEFAULT_TIMEZONE
  ): string | null {

    if (!/^\d{2} [A-Za-z]{3} \d{4}$/.test(date)) {
      console.error("Invalid date format. Expected 'DD MMM YYYY'.");
      return null;
    }

    const [day, month, year] = date.split(" ");

    const monthMap: { [key: string]: number } = {
      Jan: 0,
      Feb: 1,
      Mar: 2,
      Apr: 3,
      May: 4,
      Jun: 5,
      Jul: 6,
      Aug: 7,
      Sep: 8,
      Oct: 9,
      Nov: 10,
      Dec: 11,
    };

    const monthNumber = monthMap[month];
  
    if (monthNumber === undefined) {
      console.error("Invalid month name.");
      return null;
    }

    const parsedDate = new Date(Date.UTC(Number(year), monthNumber, Number(day)));
  
    if (isNaN(parsedDate.getTime())) {
      console.error("Invalid date string.");
      return null;
    }

    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    // Rearrange the formatted date to "DD MMM YYYY"
    const formattedDate = formatter.format(parsedDate);
    const [formattedMonth, formattedDay, formattedYear] = formattedDate.split(" ");
    const outputDate = `${formattedDay.replace(",", "")} ${formattedMonth} ${formattedYear}`;
  
    return outputDate;
  }

//   Example Usage
//   const date = "26 Dec 2024";
//   const timeZone = "Asia/Kolkata";
//   const convertedDate = convertDateToTimeZone(date, timeZone);

//   console.log(convertedDate); // Outputs: "26 Dec 2024"
