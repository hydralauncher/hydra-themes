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

export interface ThemePaginationProps {
  pagination: PaginationSchema;
  onPageChange: (page: number) => void;
}

const getTotalPages = (total: number, perPage: number) => {
  return Math.ceil(total / perPage);
};

export function ThemePagination({
  pagination,
  onPageChange,
}: ThemePaginationProps) {
  const totalPages = getTotalPages(pagination.total, pagination.perPage);

  if (totalPages < 2) return null;

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange(pagination.page - 1)}
          />
        </PaginationItem>

        {pagination.page > 3 && (
          <>
            <PaginationItem>
              <PaginationLink onClick={() => onPageChange(1)}>1</PaginationLink>
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
                  isActive={pageNumber === pagination.page}
                  onClick={() => onPageChange(pageNumber)}
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
              <PaginationLink onClick={() => onPageChange(totalPages)}>
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          </>
        )}

        <PaginationItem>
          <PaginationNext onClick={() => onPageChange(pagination.page + 1)} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
