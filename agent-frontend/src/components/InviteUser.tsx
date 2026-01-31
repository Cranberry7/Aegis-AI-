import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { API_ROUTES } from '@/constants/routes';
import { axiosBackendInstance } from '@/utils/axiosInstance';
import { useEffect, useState } from 'react';
import { showToast } from './ShowToast';
import { UserCredentials, userSchema } from '@/types/user';
import {
  ErrorMessages,
  RoleCodes,
  SuccessMessages,
  ToastVariants,
} from '@/enums/global.enum';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { useAuth } from '@/hooks/useAuth';
import { Plus } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

interface InviteUserProps {
  reloadKey: number;
  setReloadKey: React.Dispatch<React.SetStateAction<number>>;
}

export function InviteUser({ reloadKey, setReloadKey }: InviteUserProps) {
  const [role, setRole] = useState(RoleCodes.USER as string);
  const [organization, SetOrganization] = useState<string>('');
  const [organizations, setOrganizations] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UserCredentials>({
    resolver: zodResolver(userSchema),
  });

  const onSubmit = async (formData: UserCredentials) => {
    try {
      await axiosBackendInstance.post(API_ROUTES.INVITE, {
        userDetails: {
          ...formData,
          accountName: organization,
          role: role,
        },
      });
      showToast({
        message: SuccessMessages.INVITE_SENT_SUCCESSFULLY,
        variant: ToastVariants.SUCCESS,
      });
      reset();
      setOpen(false);
    } catch {
      showToast({
        message: ErrorMessages.FAILURE_INVITING_USER,
        variant: ToastVariants.ERROR,
      });
    } finally {
      setReloadKey(reloadKey + 1);
    }
  };

  const fetchOrganizations = async () => {
    const response = await axiosBackendInstance.get(API_ROUTES.ACCOUNT);
    const data = response.data.data;
    const names = data.map((item: any) => item.name);
    setOrganizations(names);
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" onClick={() => setOpen(true)}>
          <Plus strokeWidth={3} />
          <span className="font-bold text-[1rem]">Invite Users</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-100 mr-8 mt-5">
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <h4 className="font-medium leading-none text-center">
              Invite User
            </h4>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                {...register('name')}
                className={`col-span-2 h-8 ${
                  errors.name
                    ? 'border-destructive'
                    : 'border-input hover:border-primary/50'
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-sm text-destructive text-right mr-2">
                {errors.name.message}
              </p>
            )}

            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                {...register('email')}
                className={`col-span-2 h-8 ${
                  errors.email
                    ? 'border-destructive'
                    : 'border-input hover:border-primary/50'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive text-right mr-2">
                {errors.email.message}
              </p>
            )}

            {user.role?.code === RoleCodes.SUPERADMIN && (
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="organization">Organization</Label>
                <Select onValueChange={(value) => SetOrganization(value)}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select a Organization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {organizations.map((item, i) => (
                        <SelectItem key={i} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="role">Role</Label>
              <Select onValueChange={(value) => setRole(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {user.role?.code === RoleCodes.SUPERADMIN ? (
                      <>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="guest">Guest</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="guest">Guest</SelectItem>
                      </>
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                className={`col-span-2 h-8 ${
                  errors.password
                    ? 'border-destructive'
                    : 'border-input hover:border-primary/50'
                }`}
              />
            </div>
            {errors.password && (
              <p className="text-sm text-destructive text-right mr-2">
                {errors.password.message}
              </p>
            )}

            <div className="flex justify-center mt-4">
              <Button
                type="submit"
                className="cursor-pointer"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Inviting...' : 'Invite'}
              </Button>
            </div>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
