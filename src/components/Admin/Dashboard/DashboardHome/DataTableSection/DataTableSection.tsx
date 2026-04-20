import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronRight, X } from "lucide-react";
import Loader from "@/components/Common/Loader";
import type { CommentInterface, MessageInterface } from "../DashboardHome";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

interface DataTableSectionInterFace {
  label: string;
  description: string;
  cols: string[];
  data: CommentInterface[] | MessageInterface[];
  isLoading: boolean;
  isError: boolean;
  error?: string;
  viewAllPath?: string;
}

export default function DataTableSection({
  label,
  description,
  cols,
  data,
  isLoading,
  isError,
  error,
  viewAllPath
}: DataTableSectionInterFace) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{label}</h3>
          <p className="text-sm text-slate-500 mt-0.5">{description}</p>
        </div>
        {viewAllPath && (
          <button
            type="button"
            onClick={() => navigate(viewAllPath)}
            className="text-xs font-bold text-primary hover:text-emerald-700 flex items-center gap-1 transition-colors group"
          >
            {t('common.viewAll')}
            <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-x-auto [&>div]:h-full">
        <Table className="h-full">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {cols.map((col, index) => (
                <TableHead key={index} className="bg-transparent border-none py-4">{col}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="[&_tr:last-child]:border-0">
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={cols.length} className="text-center py-20">
                  <Loader />
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={cols.length} className="text-center py-20">
                  <p className="text-error-hover font-semibold">{error || t("common.failedToLoadData")}</p>
                </TableCell>
              </TableRow>
            ) : (!data || data.length === 0) ? (
              <TableRow>
                <TableCell colSpan={cols.length} className="text-center py-20 text-slate-500 italic">
                  {t("common.noRecordsFound")}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <DataRow key={item.id} item={item} />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function MessageModal({ item, onClose }: { item: CommentInterface | MessageInterface, onClose: () => void }) {
  const isComment = "comment" in item;
  const content = isComment ? (item as CommentInterface).comment : (item as MessageInterface).message;
  const name = isComment ? (item as CommentInterface).name : ((item as any).name || (item as any).username || (item as any).userName || "-");
  const email = "email" in item ? (item as MessageInterface).email : null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6" onClick={(e) => e.stopPropagation()}>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-lg max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex flex-col">
            <h2 className="text-base font-bold text-slate-900 truncate pr-4">{name}</h2>
            {email && <span className="text-xs text-slate-500 truncate">{email}</span>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors duration-200 shrink-0"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    </div>
  );
}

function DataRow({ item }: { item: CommentInterface | MessageInterface }) {
  const { t, i18n } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isComment = "comment" in item;
  const content = isComment ? (item as CommentInterface).comment : (item as MessageInterface).message;
  // Handle both possible structures for messages
  const name = isComment ? (item as CommentInterface).name : ((item as any).name || (item as any).username || (item as any).userName || "-");
  const email = "email" in item ? (item as MessageInterface).email : null;
  const dateStr = (item as any).createdDate || (item as any).date;
  const locale = i18n.language?.startsWith("ar") ? "ar-EG" : "en-US";
  const date = dateStr ? new Date(dateStr) : null;
  const formattedDate = date && !isNaN(date.getTime())
    ? date.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })
    : "-";

  const isLongContent = content && content.length > 50;

  return (
    <>
      <TableRow>
        <TableCell className="max-w-[200px] h-full">
          <div className="font-semibold text-slate-900 truncate" title={name}>{name}</div>
          {email && <div className="text-xs text-slate-500 truncate mt-0.5" title={email}>{email}</div>}
        </TableCell>
        <TableCell className="max-w-[300px]">
          <span className="text-slate-700">{isLongContent ? `${content.slice(0, 50)}... ` : content}</span>
          {isLongContent && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-primary font-medium hover:underline text-xs ltr:ml-1 rtl:mr-1"
            >
              {t('common.readMore', 'Read more')}
            </button>
          )}
        </TableCell>
        <TableCell className="whitespace-nowrap text-slate-400 text-xs font-medium">
          {formattedDate}
        </TableCell>
      </TableRow>
      {isModalOpen && <MessageModal item={item} onClose={() => setIsModalOpen(false)} />}
    </>
  );
}
