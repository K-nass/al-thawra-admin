import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react";
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

      <div className="flex-1 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {cols.map((col, index) => (
                <TableHead key={index} className="bg-transparent border-none py-4">{col}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
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

function DataRow({ item }: { item: CommentInterface | MessageInterface }) {
  const { t, i18n } = useTranslation();
  const isComment = "comment" in item;
  const content = isComment ? (item as CommentInterface).comment : (item as MessageInterface).message;
  // Handle both possible structures for messages
  const name = isComment ? (item as CommentInterface).name : ((item as any).username || (item as any).userName || "-");
  const email = "email" in item ? (item as MessageInterface).email : null;
  const date = item.date;
  const locale = i18n.language?.startsWith("ar") ? "ar-EG" : "en-US";

  return (
    <TableRow>
      <TableCell className="font-semibold text-slate-900">{name}</TableCell>
      {email && <TableCell className="text-slate-500">{email}</TableCell>}
      <TableCell className="max-w-[300px] truncate" title={content}>{content}</TableCell>
      <TableCell className="whitespace-nowrap text-slate-400 text-xs font-medium">
        {new Date(date).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}
      </TableCell>
    </TableRow>
  );
}
