import './Pagination.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  hasNextPage,
  hasPrevPage,
}: PaginationProps) => {
  if (totalPages <= 1) {
    return null;
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Tüm sayfaları göster
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // İlk sayfa
      pages.push(1);

      // Başlangıç ellipsis
      if (currentPage > 3) {
        pages.push('...');
      }

      // Mevcut sayfa etrafındaki sayfalar
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Son ellipsis
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Son sayfa
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="pagination">
      <button
        className="pagination-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevPage}
        aria-label="Önceki sayfa"
      >
        ← Önceki
      </button>

      <div className="pagination-numbers">
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                ...
              </span>
            );
          }

          const pageNum = page as number;
          return (
            <button
              key={pageNum}
              className={`pagination-number ${
                pageNum === currentPage ? 'active' : ''
              }`}
              onClick={() => onPageChange(pageNum)}
              aria-label={`Sayfa ${pageNum}`}
              aria-current={pageNum === currentPage ? 'page' : undefined}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      <button
        className="pagination-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
        aria-label="Sonraki sayfa"
      >
        Sonraki →
      </button>
    </div>
  );
};

export default Pagination;

