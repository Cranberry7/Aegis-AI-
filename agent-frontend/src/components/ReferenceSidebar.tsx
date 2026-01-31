import { ExternalLink, XIcon } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from './theme-provider';
import { useSidebar } from './ui/sidebar';
import { useStore } from '@/store/global';
import { Fragment } from 'react';
import { ResizableHandle, ResizablePanel } from './ui/resizable';

export default function ReferenceSidebar() {
  const { theme } = useTheme();
  const { setOpen: setSidebarOpen } = useSidebar();

  const referenceUrl = useStore((state) => state.referenceUrl);
  const setReferenceUrl = useStore((state) => state.setReferenceUrl);

  function closeReference() {
    setReferenceUrl(null);
    setSidebarOpen(true);
  }

  function openReferenceInNewTab() {
    if (referenceUrl) {
      window.open(referenceUrl, '_blank');
    }
  }

  if (referenceUrl) {
    return (
      <Fragment>
        <ResizableHandle withHandle />
        <ResizablePanel minSize={20} defaultSize={40}>
          <div className="border-l flex flex-col h-full">
            <div className="m-2 ml-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Reference</h2>
              <div>
                <Button
                  variant="ghost"
                  onClick={openReferenceInNewTab}
                  title="Open in new tab"
                >
                  <ExternalLink strokeWidth={2} />
                </Button>
                <Button
                  variant="ghost"
                  onClick={closeReference}
                  title="Close reference"
                >
                  <XIcon strokeWidth={2} />
                </Button>
              </div>
            </div>
            <iframe
              className="border flex-1 w-full "
              src={`${referenceUrl}&theme=${theme}`}
            ></iframe>
          </div>
        </ResizablePanel>
      </Fragment>
    );
  } else {
    return <></>;
  }
}
