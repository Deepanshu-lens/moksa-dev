export const ssr = false;
// import { promises as fs } from "fs";
// import path from "path";
// import { exec } from "child_process";
// import { promisify } from "util";

// const execAsync = promisify(exec);

// // Function to check if a file has valid streams using ffprobe
// async function hasValidStreams(filePath: string): Promise<boolean> {
//   try {
//     const { stdout } = await execAsync(
//       `ffprobe -v error -show_entries stream=codec_type -of default=noprint_wrappers=1:nokey=1 "${filePath}"`,
//     );
//     // If stdout is not empty, there are streams present
//     return stdout.trim().length > 0;
//   } catch (error) {
//     console.log(`Error probing file: ${filePath}`, error);
//     return false; // Assume not convertible if an error occurs
//   }
// }

// export const load = async () => {
//   try {
//     const playbackDir = path.resolve("static", "Playback");
//     const files = await fs.readdir(playbackDir);

//     // Create a set of existing .webm filenames without the extension for quick lookup
//     const webmFileNamesWithoutExtension = new Set(
//       files
//         .filter((file) => file.endsWith(".webm"))
//         .map((file) => file.replace(".webm", "")),
//     );

//     // Filter .ts files that have 9 underscores and do not have a corresponding .webm file
//     const tsFilesToProbe = files.filter((file) => {
//       const baseName = file.replace(".ts", "");
//       return (
//         (file.match(/_/g) || []).length === 9 &&
//         file.endsWith(".ts") &&
//         !webmFileNamesWithoutExtension.has(baseName)
//       );
//     });

//     // Filter and convert files asynchronously
//     const conversionPromises = tsFilesToProbe.map(async (file) => {
//       const filePath = path.join(playbackDir, file);
//       if (await hasValidStreams(filePath)) {
//         const outputFilePath = filePath.replace(".ts", ".webm");
//         await execAsync(
//           `ffmpeg -i "${filePath}" -c:v libvpx-vp9 -c:a libopus "${outputFilePath}"`,
//         );
//         return outputFilePath; // Return the path of the successfully converted file
//       }
//       return null; // Return null for files that are not convertible
//     });

//     // Wait for all conversions to complete
//     const convertedFiles = (await Promise.all(conversionPromises)).filter(
//       (filePath) => filePath !== null,
//     );

//     // Assuming you want to list the converted files
//     const updatedWebmFiles = convertedFiles.filter((file) =>
//       file.endsWith(".webm"),
//     );

//     const webmFiles = files.filter((file) => file.endsWith(".webm"));
//     return {
//       webmFiles,
//     };
//   } catch (error) {
//     console.error("Error during file conversion or listing:", error);
//     return {
//       webmFiles: [],
//       error: "Failed to convert files or retrieve the list of converted files.",
//     };
//   }
// };
