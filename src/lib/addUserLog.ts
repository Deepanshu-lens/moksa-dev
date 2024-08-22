export function addUserLog(string: string) {
  fetch("/api/userLogs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      event: string,
    }),
  }).catch((error) => console.error("Error:", error));
}
