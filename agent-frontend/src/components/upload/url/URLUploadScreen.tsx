import { useState } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { showToast } from '../../ShowToast';
import {
  ErrorMessages,
  SuccessMessages,
  ToastVariants,
} from '@/enums/global.enum';

interface URLUploadScreenProps {
  onBack: () => void;
  onSubmit: (urls: string[]) => Promise<void>;
}

const URLUploadScreen: React.FC<URLUploadScreenProps> = ({
  onBack,
  onSubmit,
}) => {
  const [urls, setUrls] = useState<string[]>([]);
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleUrlAdd = async () => {
    if (currentUrl.trim()) {
      // Split by multiple possible separators (commas, spaces, newlines)
      const urlList = currentUrl
        .split(/[\n,\s]+/) // Split by newlines, commas, or whitespace
        .map((url) => url.trim())
        .filter((url) => url.length > 0); // Remove empty strings

      // Add each unique URL
      urlList.forEach((url) => {
        if (!urls.includes(url)) {
          setUrls((prevUrls) => [...prevUrls, url]);
        }
      });

      setCurrentUrl('');
    }
  };

  const handleUrlRemove = (urlToRemove: string) => {
    setUrls(urls.filter((url) => url !== urlToRemove));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    if (urls.length === 0) {
      showToast({
        message: ErrorMessages.AT_LEAST_ONE_URL,
        variant: ToastVariants.ERROR,
      });
      setSubmitting(false);
      return;
    }

    try {
      await onSubmit(urls);
      showToast({
        message: SuccessMessages.URL_SUBMITTED,
        variant: ToastVariants.SUCCESS,
      });
      setUrls([]);
    } catch {
      showToast({
        message: ErrorMessages.URL_NOT_SUBMITTED,
        variant: ToastVariants.ERROR,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <div className="flex items-center p-4 border-b">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Train on WebDocs URLs</h1>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto shadow-md p-6 rounded-xl border-2">
          <form className="flex flex-col gap-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="url">Enter URL</Label>
              <div className="flex w-full items-center space-x-2">
                <Input
                  type="url"
                  id="url"
                  placeholder="Enter the URL"
                  value={currentUrl}
                  onChange={(e) => setCurrentUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleUrlAdd();
                    }
                  }}
                  className="w-full"
                />
                <Button
                  type="button"
                  onClick={handleUrlAdd}
                  className="cursor-pointer"
                >
                  <Plus strokeWidth={3} />
                </Button>
              </div>
            </div>
            <Button
              type="submit"
              color="primary"
              className="mt-4 cursor-pointer"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit URLs'}
            </Button>

            {/* URL List */}
            <div className="mt-2">
              <Label>Added URLs</Label>
              <ScrollArea className="flex flex-col mt-1 text-sm overflow-y-auto max-h-[300px] border rounded-md p-2">
                {urls.length === 0 ? (
                  <p className="text-muted-foreground text-sm italic p-2">
                    No URLs added yet
                  </p>
                ) : (
                  urls.map((url, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-1 hover:bg-muted rounded"
                    >
                      <p className="truncate max-w-[80%]">{url}</p>
                      <Button
                        variant={'ghost'}
                        size="sm"
                        onClick={() => handleUrlRemove(url)}
                        type="button"
                      >
                        <Trash2 color="red" size={16} />
                      </Button>
                    </div>
                  ))
                )}
              </ScrollArea>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default URLUploadScreen;
