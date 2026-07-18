export function slugify(str) {
  return (str || "").toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
}

export function formatDate(dateString) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateString));
}
