export function formatMessageTime(date: string) {
  return new Date(date).toLocaleTimeString("de-de", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
