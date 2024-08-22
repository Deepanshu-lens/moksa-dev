import type { RequestEvent, RequestHandler } from "./$types";
import { parse, format, subHours } from "date-fns";

export const POST: RequestHandler = async ({
  locals,
  request,
}: RequestEvent) => {
  try {
    const { cameraId, date, startTime, endTime } = await request.json();
    if (!cameraId) {
      return new Response(JSON.stringify({ error: "camera is required" }), {
        status: 400,
      });
    }

    // Helper function to format date and time
    function formatDate(dateString: string, timeString: string) {
      const combinedDateTime = `${dateString} ${timeString}`;
      const dateTime = parse(combinedDateTime, "d MMMM yyyy HH:mm", new Date());
      if (isNaN(dateTime.getTime())) {
        throw new Error("Invalid date or time value");
      }
      return dateTime.toISOString();
    }

    // Parse and format the input date and times
    const formattedStartDate = formatDate(date, startTime);
    const formattedEndDate = endTime ? formatDate(date, endTime) : null;

    // Fetch all playback data for the specified camera and date
    const playbackData = await locals.pb?.collection("playback").getFullList({
      filter: `camera~"${cameraId}"`,
      expand: 'camera'
    });
console.log(playbackData)
    if (!playbackData) {
      return new Response(
        JSON.stringify({
          error: "No data found for the provided camera and date",
        }),
        { status: 404 },
      );
    }

    // Filter data based on the provided startTime and the presence of endTime in the record
    const filteredData = playbackData.filter((record) => {
      const recordStartDate = new Date(record.startTime);
      const recordEndDate = new Date(record.endTime || record.startTime); // Use startTime if endTime is not available

      // Check if the record is within the start and end time range
      if (record.endTime) {
          return (
              recordStartDate >= new Date(formattedStartDate) &&
          recordEndDate <= new Date(formattedEndDate || record.endTime)
        );
      } else {
        // Check if the record starts after the specified start time
        return recordStartDate >= new Date(formattedStartDate);
      }
    });
    console.log(filteredData)
    
    // Add duration to the response if endTime is not provided in the record
    filteredData.forEach((record) => {
      if (!record.endTime) {
        record.duration =
          (new Date(record.startTime).getTime() -
            new Date(formattedStartDate).getTime()) /
          1000; // Duration in seconds
      }
    });

    return new Response(JSON.stringify({ playback_data: filteredData }), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
};