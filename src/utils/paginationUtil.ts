export const decodeGetQuery = (query: any) => {
  const page: number = Math.abs(parseInt(query.page as string, 10)) || 1;
  const size: number = Math.abs(parseInt(query.size as string, 10)) || 10;
  const search: string = query.search || "";
  const sortBy: string = query.sort || "id";
  const orderBy: string = query.order || "desc";

  return { page, size, search, sortBy, orderBy };
};

export const getPagination = ({
  page = 1,
  size = 10,
}: {
  page?: number;
  size?: number;
}): {
  limit: number;
  offset: number;
} => {
  const limit: number = Math.max(+size, 1);
  const offset: number = (Math.max(+page, 1) - 1) * limit;

  return { limit, offset };
};

export const getPagingData = ({
  paginatedData,
  page = 1,
  limit = 10,
}: {
  paginatedData: { count: number; rows: any[] };
  page?: number;
  limit?: number;
}): {
  totalItems: number;
  data: any[];
  totalPages: number;
  currentPage: number;
} => {
  const currentPage = Math.max(+page, 1); // Ensure page is at least 1
  const itemsPerPage = Math.max(+limit, 1); // Ensure limit is at least 1

  if (!paginatedData) {
    return {
      totalItems: 0,
      data: [],
      totalPages: 0,
      currentPage: 1,
    };
  }

  const { count: totalItems, rows: data } = paginatedData;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return {
    totalItems,
    data,
    totalPages,
    currentPage,
  };
};
