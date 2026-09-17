import PropTypes from "prop-types";
import { TbEye, TbPencil, TbTrash } from "react-icons/tb";

const btn =
  "rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 active:translate-y-[1px]";

export default function RowActions({
  onDetail,
  onEdit,
  onDelete,
  detailTitle = "Detail",
  editTitle = "Ubah",
  deleteTitle = "Hapus",
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      {onDetail && (
        <button type="button" title={detailTitle} aria-label={detailTitle} onClick={onDetail} className={btn}>
          <TbEye className="h-4 w-4" />
        </button>
      )}
      {onEdit && (
        <button type="button" title={editTitle} aria-label={editTitle} onClick={onEdit} className={btn}>
          <TbPencil className="h-4 w-4" />
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          title={deleteTitle}
          aria-label={deleteTitle}
          onClick={onDelete}
          className={`${btn} hover:bg-red-50 hover:text-red-600`}
        >
          <TbTrash className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

RowActions.propTypes = {
  onDetail: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  detailTitle: PropTypes.string,
  editTitle: PropTypes.string,
  deleteTitle: PropTypes.string,
};
