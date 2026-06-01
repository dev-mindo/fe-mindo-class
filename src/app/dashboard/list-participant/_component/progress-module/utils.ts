export const PARTICIPANT_PAGE_SIZE = 5;
export const DISCUSSION_PAGE_SIZE = 5;

export const getProgressValue = (progress: string) => {
  const value = Number(progress.replace("%", ""));
  return Number.isNaN(value) ? 0 : value;
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case "DONE":
      return "Sudah";
    case "NOT_TAKEN":
      return "Belum";
    default:
      return "Belum";
  }
};

export const isQuizModule = (type?: string) => type?.toUpperCase() === "QUIZ";

export const isDiscussionModule = (type?: string) =>
  type?.toUpperCase() === "DISCUSSION";

export const getPaginationPages = (currentPage: number, totalPage: number) => {
  const maxVisiblePage = 5;
  const halfVisiblePage = Math.floor(maxVisiblePage / 2);
  const startPage = Math.max(1, currentPage - halfVisiblePage);
  const endPage = Math.min(totalPage, startPage + maxVisiblePage - 1);
  const adjustedStartPage = Math.max(1, endPage - maxVisiblePage + 1);

  return Array.from(
    { length: endPage - adjustedStartPage + 1 },
    (_, index) => adjustedStartPage + index,
  );
};

export const formatDateTime = (value?: string) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
