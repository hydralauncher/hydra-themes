import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import type { PaginationSchema } from "@/lib/schemas/pagination";

const getTotalPages = (total: number, perPage: number) => {
  return Math.ceil(total / perPage);
};

export const ThemePagination = ({
  pagination,
}: {
  pagination: PaginationSchema;
}) => {
  const totalPages = getTotalPages(pagination.total, pagination.perPage);

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>

        {pagination.page > 3 && (
          <>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          </>
        )}

        {Array.from({ length: 4 }).map((_, i) => {
          const pageNumber = pagination.page - 1 + i;
          if (pageNumber > 0 && pageNumber <= totalPages) {
            return (
              <PaginationItem key={pageNumber}>
                <PaginationLink
                  href="#"
                  isActive={pageNumber === pagination.page}
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            );
          }
        })}

        {pagination.page < totalPages - 3 && (
          <>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">{totalPages}</PaginationLink>
            </PaginationItem>
          </>
        )}

        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
