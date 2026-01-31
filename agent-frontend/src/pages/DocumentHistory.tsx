import { API_ROUTES } from '@/constants/routes';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { convertToISTString } from '@/utils/global';

import { axiosBackendInstance } from '@/utils/axiosInstance';
import {
  ErrorMessages,
  RoleCodes,
  SuccessMessages,
  ToastVariants,
} from '@/enums/global.enum';
import { showToast } from '@/components/ShowToast';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { DocumentStatus, FileType } from '@/constants/global';

type RowFormat = {
  id: string;
  fileName: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  account: Account;
};

type Account = {
  name: string;
};

const handleDelete = async (ids: string[]) => {
  const promises = ids.map((id) =>
    axiosBackendInstance.delete(API_ROUTES.DELETE_DOCUMENT(id)),
  );

  try {
    await Promise.all(promises);
    showToast({
      message: SuccessMessages.DOCUMENT_DELETED,
      variant: ToastVariants.SUCCESS,
    });
  } catch {
    showToast({
      message: ErrorMessages.DELETE_DOCUMENT_FAILED,
      variant: ToastVariants.ERROR,
    });
  }
};

const DocumentHistory: React.FC = () => {
  const { user } = useAuth();

  const columns: ColumnDef<RowFormat>[] = [
    {
      accessorKey: 'fileName',
      header: 'Name',
      cell: ({ row }) => <div>{row.getValue('fileName')}</div>,
    },
    {
      accessorKey: 'type',
      header: () => {
        return (
          <div className="flex justify-center">
            <Button variant="ghost">Type</Button>
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="flex w-full justify-center gap-1">
          {row.getValue('type') === FileType.URL && (
            <Badge className="text-blue-500 bg-blue-100 shadow-md">URL</Badge>
          )}

          {row.getValue('type') === FileType.FILE && (
            <Badge className="text-purple-500 bg-purple-100 shadow-md">
              FILE
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'account',
      header: () => {
        return (
          <div className="flex justify-center">
            <Button variant="ghost">Organization Name</Button>
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="capitalize text-center">
          {(row.getValue('account') as Account).name}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: () => {
        return (
          <div className="flex justify-center">
            <Button variant="ghost">Status</Button>
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="flex w-full justify-center gap-1">
          {row.getValue('status') === DocumentStatus.COMPLETED && (
            <Badge className="text-green-500 bg-green-100 shadow-md">
              COMPLETED
            </Badge>
          )}

          {row.getValue('status') === DocumentStatus.FAILED && (
            <Badge className="text-red-500 bg-red-100 shadow-md">FAILED</Badge>
          )}

          {row.getValue('status') === DocumentStatus.IN_PROGRESS && (
            <Badge className="text-orange-500 bg-orange-100 shadow-md">
              IN PROGRESS
            </Badge>
          )}

          {row.getValue('status') === DocumentStatus.NEW && (
            <Badge className="text-gray-500 bg-gray-100 shadow-md">NEW</Badge>
          )}

          {row.getValue('status') === DocumentStatus.UPLOADED && (
            <Badge className="text-blue-500 bg-blue-100 shadow-md">
              UPLOADED
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: () => {
        return (
          <div className="flex justify-center">
            <Button variant="ghost">Created At</Button>
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase text-center">
          {convertToISTString(row.getValue('createdAt'))}
        </div>
      ),
    },
    {
      accessorKey: 'updatedAt',
      header: () => {
        return (
          <div className="flex justify-center">
            <Button variant="ghost">Updated At</Button>
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase text-center">
          {convertToISTString(row.getValue('updatedAt'))}
        </div>
      ),
    },
  ];

  const filteredColumns = columns.filter(
    (col): col is ColumnDef<RowFormat> & { accessorKey: string } =>
      'accessorKey' in col && col.accessorKey !== 'account',
  );

  const requiredColumns =
    user.role?.code !== RoleCodes.SUPERADMIN ? filteredColumns : columns;

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-h-[calc(100vh-2rem)]">
      <h1 className="text-3xl border-1  text-center p-2">Document History</h1>
      <div className="flex justify-center w-full h-[42vw] overflow-y-auto pt-2 p-15 ">
        {DataTable<RowFormat>(
          requiredColumns,
          API_ROUTES.DOCUMENT.toString(),
          undefined,
          true,
          handleDelete,
        )}
      </div>
    </div>
  );
};

export default DocumentHistory;
