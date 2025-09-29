import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const UserPagination = ({ pagination, onPageChange, styles }) => {
  return (
    <div className={styles.pagination}>
      <button
        disabled={pagination.page === 1}
        onClick={() => onPageChange(pagination.page - 1)}
        className={styles.paginationButton}
      >
        <FiChevronLeft /> Anterior
      </button>

      <span className={styles.pageInfo}>
        Página {pagination.page} de{" "}
        {Math.ceil(pagination.total / pagination.limit)}
      </span>

      <button
        disabled={
          pagination.page >= Math.ceil(pagination.total / pagination.limit)
        }
        onClick={() => onPageChange(pagination.page + 1)}
        className={styles.paginationButton}
      >
        Siguiente <FiChevronRight />
      </button>
    </div>
  );
};

export default UserPagination;