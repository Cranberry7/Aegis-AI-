import React, { useState } from 'react';
import { DataTable } from '../components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { API_ROUTES } from '@/constants/routes';
import { InviteUser } from '../components/InviteUser';
import { convertToISTString } from '@/utils/global';
import { axiosBackendInstance } from '@/utils/axiosInstance';
import {
  ErrorMessages,
  RoleCodes,
  SuccessMessages,
  ToastVariants,
} from '@/enums/global.enum';
import { showToast } from '@/components/ShowToast';

const ManageUsers: React.FC = () => {
  const [reloadKey, setReloadKey] = useState(0);

  type userSchema = {
    id: string;
    name: string;
    email: string;
    role: Role;
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  type Role = {
    code: string;
  };

  const deleteUser = async (userIds: string[]) => {
    const promises = userIds.map((userId) =>
      axiosBackendInstance.delete(API_ROUTES.DELETE_USER(userId)),
    );

    try {
      await Promise.all(promises);
      showToast({
        message: SuccessMessages.USER_DELETED,
        variant: ToastVariants.SUCCESS,
      });
    } catch {
      showToast({
        message: ErrorMessages.DELETE_USER_FAILED,
        variant: ToastVariants.ERROR,
      });
    }
  };

  const columns: ColumnDef<userSchema>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue('name')}</div>
      ),
    },
    {
      accessorKey: 'email',
      header: () => {
        return (
          <div className="flex justify-center">
            <Button variant="ghost">Email</Button>
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase text-center">{row.getValue('email')}</div>
      ),
    },
    {
      accessorKey: 'role',
      header: () => {
        return (
          <div className="flex justify-center">
            <Button variant="ghost">Role</Button>
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="flex w-full justify-center gap-1">
          {(row.getValue('role') as Role).code === RoleCodes.ADMIN && (
            <Badge className="text-blue-500 bg-blue-100 shadow-md">ADMIN</Badge>
          )}

          {(row.getValue('role') as Role).code === RoleCodes.SUPERADMIN && (
            <Badge className="text-red-500 bg-red-100 shadow-md">
              SUPERADMIN
            </Badge>
          )}

          {(row.getValue('role') as Role).code === RoleCodes.USER && (
            <Badge className="text-green-500 bg-green-100 shadow-md">
              USER
            </Badge>
          )}

          {(row.getValue('role') as Role).code === RoleCodes.GUEST && (
            <Badge className="text-gray-500 bg-gray-100 shadow-md">GUEST</Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'isEmailVerified',
      header: () => {
        return (
          <div className="flex justify-center">
            <Button variant="ghost">Is Email Verified</Button>
          </div>
        );
      },
      cell: ({ row }) => (
        <div className="flex w-full justify-center gap-1">
          {row.getValue('isEmailVerified') ? (
            <Badge className="text-green-500 bg-green-100 shadow-md">
              VERIFIED
            </Badge>
          ) : (
            <Badge className="text-red-500 bg-red-100 shadow-md">
              NOT VERIFIED
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
        <div className="text-center">
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
        <div>{convertToISTString(row.getValue('updatedAt'))}</div>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-h-[calc(100vh-2rem)]">
      <div className="flex justify-between border-1 p-2">
        <div className="w-[140px]" />
        <h1 className="text-3xl font-bold">User Management</h1>
        <InviteUser reloadKey={reloadKey} setReloadKey={setReloadKey} />
      </div>
      <div className="flex justify-center h-[42vw] overflow-y-auto w-full pt-2 p-15">
        {DataTable(
          columns,
          API_ROUTES.USER.toString(),
          undefined,
          true,
          deleteUser,
          reloadKey,
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
