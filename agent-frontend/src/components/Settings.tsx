import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useStore } from '@/store/global';

export const Settings: React.FC = () => {
  const showSettings = useStore((state) => state.showSettings);
  const setShowSettings = useStore((state) => state.setShowSettings);

  return (
    <Dialog open={showSettings} onOpenChange={setShowSettings}>
      <DialogContent className="!max-w-[90vw] lg:!max-w-[50vw]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="flex h-[50vh] w-full">
          <Command className="w-1/4 h-full -ml-2 pr-2 rounded-none border-r">
            <CommandInput placeholder="Search" />
            <CommandList>
              <CommandItem>General</CommandItem>
            </CommandList>
          </Command>

          <div className="flex flex-1 items-center justify-center">
            <h1 className="text-center">This is Settings Page</h1>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
