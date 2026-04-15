import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { 
  Trash2, 
  Pencil, 
  Plus, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  Shield, 
  CheckCircle2, 
  Loader2,
  ChevronRight,
  Fingerprint,
  UserCheck,
  Lock
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { rolesApi } from "@/api";
import { Link } from "react-router-dom";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { useToast } from "@/components/Toast/ToastContainer";
import ConfirmDialog from "@/components/ConfirmDialog/ConfirmDialog";

export default function Roles() {
  const { t } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(15);
  const [searchPhrase, setSearchPhrase] = useState("");
  const [roleToDelete, setRoleToDelete] = useState<{ id: string; name: string } | null>(null);

  // Fetch roles using React Query
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["roles", pageNumber, pageSize, searchPhrase],
    queryFn: () => rolesApi.getAll({ pageNumber, pageSize, searchPhrase }),
  });

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: (roleId: string) => rolesApi.delete(roleId),
    onSuccess: async () => {
      toast.success(t("roles.deleteSuccess", "Role deleted successfully"));
      await queryClient.invalidateQueries({ queryKey: ["roles"] });
      setRoleToDelete(null);
    },
    onError: (err) => {
      if (axios.isAxiosError(err)) {
        const responseData = err.response?.data;
        const status = err.response?.status;
        
        if (status === 404) {
          queryClient.invalidateQueries({ queryKey: ["roles"] });
          setRoleToDelete(null);
        } else {
          toast.error(responseData?.title || responseData?.message || "Failed to delete role");
        }
      } else {
        toast.error("An unexpected error occurred");
      }
    },
  });

  const handleDeleteRole = (roleId: string, roleName: string) => {
    setRoleToDelete({ id: roleId, name: roleName });
  };

  const confirmDelete = () => {
    if (roleToDelete) {
      deleteRoleMutation.mutate(roleToDelete.id);
    }
  };

  // Format permission name for display
  const formatPermission = (permission: string) => {
    return permission.replace(/([A-Z])/g, " $1").trim();
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
      <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
        {/* Header - Premium Alignment */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <ShieldCheck size={16} />
               </div>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Security Protocol</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              {t('roles.rolesAndPermissions')}
            </h1>
            <p className="text-sm text-slate-500 mt-2 font-medium max-w-xl">
              Define and enforce system-wide access control policies with discrete permission tokens and tiered authorization nodes.
            </p>
          </div>
          <Link 
            to="/admin/add-role" 
            className="inline-flex items-center justify-center px-6 py-3.5 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-slate-200 hover:bg-primary hover:shadow-primary/20 transition-all duration-300 gap-3 group active:scale-95"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            {t('roles.addRole')}
          </Link>
        </div>

        {/* Filters Card - Premium Redesign */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-8 mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 pointer-events-none opacity-50" />
          
          <div className="relative group max-w-2xl">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder={t('roles.searchRoles')}
              value={searchPhrase}
              onChange={(e) => setSearchPhrase(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all overflow-hidden"
            />
          </div>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center bg-white rounded-[2rem] border border-slate-200 shadow-sm animate-pulse">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Hydrating ACL Index...</p>
          </div>
        ) : isError ? (
          <div className="p-16 bg-rose-50 border border-rose-100 rounded-[2rem] text-center">
             <div className="w-16 h-16 bg-rose-100/50 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500 shadow-sm">
                <ShieldAlert size={32} />
             </div>
             <h3 className="text-xl font-black text-rose-900 mb-2 uppercase tracking-tight">Security Handshake Failure</h3>
             <p className="text-sm text-rose-600/80 max-w-md mx-auto font-medium">
               {axios.isAxiosError(error) && error.response?.status === 403 
                 ? t('roles.accessDenied')
                 : t('roles.errorLoadingRoles')}
             </p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-200">
                    <TableHead className="py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorization Node</TableHead>
                    <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Permissions Tier</TableHead>
                    <TableHead className="text-right px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Registry</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="py-24 text-center">
                         <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                               <Lock size={24} />
                            </div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Vortex: No roles detected</p>
                         </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.items.map((role) => (
                      <TableRow key={role.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0">
                        <TableCell className="px-8 py-6">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                 <Fingerprint size={20} />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-black text-slate-900 group-hover:text-primary transition-colors text-sm uppercase tracking-tight leading-none mb-1.5">{role.name}</span>
                                <div className="flex items-center gap-2">
                                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Access Level: Tier {role.id.slice(-1).toUpperCase()}</span>
                                   {role.isDefault && (
                                     <Badge variant="info" className="text-[8px] font-black py-0 px-1.5 uppercase bg-blue-50 text-blue-600 border-blue-100 rounded-md">
                                       System Root
                                     </Badge>
                                   )}
                                </div>
                              </div>
                           </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2 max-w-2xl py-2">
                            {role.allPermissions ? (
                              <Badge variant="success" className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                                <UserCheck size={14} className="mr-1.5 opacity-70" />
                                {t('roles.allPermissions')} (Global Access)
                              </Badge>
                            ) : (
                              role.permissions.map((permission, index) => (
                                <Badge key={index} variant="info" className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight border-none hover:bg-slate-200 transition-colors">
                                  {formatPermission(permission)}
                                </Badge>
                              ))
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-8">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/admin/edit-role/${role.id}`}
                              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all border border-transparent hover:border-primary/20"
                              title={t('common.edit')}
                            >
                              <Pencil className="w-4 h-4" />
                            </Link>
                            {!role.isDefault && (
                              <button
                                onClick={() => handleDeleteRole(role.id, role.name)}
                                disabled={deleteRoleMutation.isPending}
                                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100 disabled:opacity-50"
                                title="Purge Role Record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="pt-6">
              <Pagination
                pageNumber={data?.pageNumber || 1}
                totalPages={data?.totalPages || 1}
                itemsFrom={data?.itemsFrom}
                itemsTo={data?.itemsTo}
                totalCount={data?.totalCount}
                onPageChange={setPageNumber}
              />
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!roleToDelete}
        title={`Terminate Policy: ${roleToDelete?.name}`}
        message={`Critical: Permanently purging this authorization node will revoke access for all associated system agents. This action is irreversible.`}
        confirmText={deleteRoleMutation.isPending ? "Purging Node..." : "Confirm Purge"}
        cancelText={t("common.cancel")}
        onConfirm={confirmDelete}
        onCancel={() => setRoleToDelete(null)}
        type="danger"
      />
    </div>
  );
}
