import { useState } from 'react';
import {
  ArrowLeft,
  Clapperboard,
  LinkIcon,
  Plus,
  Trash2,
  YoutubeIcon,
} from 'lucide-react';
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

const YOUTUBE_REGEX =
  /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=[\w-]{11}|[\w-]{11})(&.*|\?.*)?$/i;

const VIDEO_FILE_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-ms-wmv',
  'video/x-flv',
  'video/webm',
  'video/x-matroska',
];

const SUPPORTED_VIDEO_TYPES = [
  '.mp4',
  '.mov',
  '.avi',
  '.wmv',
  '.flv',
  '.webm',
  '.mkv',
];

interface MediaUploadScreenProps {
  onBack: () => void;
  onSubmit: (files: File[], urls: string[]) => Promise<void>;
}

const MediaUploadScreen: React.FC<MediaUploadScreenProps> = ({
  onBack,
  onSubmit,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFiles = Array.from(event.target.files);
      const invalidFiles = selectedFiles.filter(
        (file) => !VIDEO_FILE_TYPES.includes(file.type),
      );
      if (invalidFiles.length > 0) {
        showToast({
          message: `Invalid file(s): ${invalidFiles
            .map((f) => f.name)
            .join(', ')}. Only video files are allowed.`,
          variant: ToastVariants.ERROR,
        });
      }
      const validFiles = selectedFiles.filter((file) =>
        VIDEO_FILE_TYPES.includes(file.type),
      );
      setFiles([...files, ...validFiles]);
    }
  };

  const handleFileRemove = (fileToRemove: File) => {
    setFiles(files.filter((file) => file !== fileToRemove));
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer?.files) {
      const droppedFiles = Array.from(event.dataTransfer.files);
      const invalidFiles = droppedFiles.filter(
        (file) => !VIDEO_FILE_TYPES.includes(file.type),
      );
      if (invalidFiles.length > 0) {
        showToast({
          message: `Invalid file(s): ${invalidFiles
            .map((f) => f.name)
            .join(', ')}. Only video files are allowed.`,
          variant: ToastVariants.ERROR,
        });
      }
      const validFiles = droppedFiles.filter((file) =>
        VIDEO_FILE_TYPES.includes(file.type),
      );
      setFiles([...files, ...validFiles]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    if (files.length === 0 && urls.length === 0) {
      showToast({
        message: ErrorMessages.AT_LEAST_ONE_MEDIA,
        variant: ToastVariants.ERROR,
      });
      setSubmitting(false);
      return;
    }

    try {
      await onSubmit(files, urls);
      showToast({
        message: SuccessMessages.MEDIA_SUBMITTED,
        variant: ToastVariants.SUCCESS,
      });
      setFiles([]);
      setUrls([]);
    } catch {
      showToast({
        message: ErrorMessages.MEDIA_NOT_SUBMITTED,
        variant: ToastVariants.ERROR,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleMediaRemove = (item: MediaItem) => {
    if (item.type === 'file') {
      handleFileRemove(item.file);
    } else {
      handleUrlRemove(item.url);
    }
  };

  // Combine files and urls for a common media list
  type MediaItem =
    | { type: 'file'; file: File }
    | { type: 'youtube'; url: string }
    | { type: 'link'; url: string };

  const getMediaList = (): MediaItem[] => {
    const urlItems: MediaItem[] = urls.map((url) =>
      YOUTUBE_REGEX.test(url)
        ? { type: 'youtube', url }
        : { type: 'link', url },
    );
    const fileItems: MediaItem[] = files.map((file) => ({
      type: 'file',
      file,
    }));
    return [...fileItems, ...urlItems];
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <div className="flex items-center p-4 border-b">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Upload Media</h1>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto shadow-md p-6 rounded-xl border-2">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* URL Input */}
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="url">
                Enter Video URL (YouTube or direct video link)
              </Label>
              <div className="flex w-full items-center space-x-2">
                <Input
                  type="url"
                  id="url"
                  placeholder="Enter YouTube or video file URL"
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
              <p className="text-foreground/40 text-xs mt-1">
                Supported: YouTube links or direct video URLs (
                {SUPPORTED_VIDEO_TYPES.join(', ')})
              </p>
            </div>
            {/* File Input */}
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="files">Upload or Drag & Drop Files</Label>
              <div
                className="border-2 border-dashed cursor-pointer rounded-lg p-8 text-center"
                style={{
                  borderColor: isDragging ? 'var(hsl(--primary))' : '#333',
                  backgroundColor: isDragging ? '#222' : 'transparent',
                  transition: 'background 0.2s',
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Input
                  accept=".mp4,.mov,.avi,.wmv,.flv,.webm,.mkv"
                  className="h-full w-full cursor-pointer"
                  id="file-upload"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  style={{ textAlign: 'center' }}
                />
                <p className="mt-4 text-foreground/60 text-sm">
                  Drag & Drop files here or click to upload
                </p>
                <p className="text-foreground/40 text-xs mt-2">
                  Supported formats: {SUPPORTED_VIDEO_TYPES.join(', ')}
                </p>
              </div>
            </div>
            <Button
              color="primary"
              className="mt-4 cursor-pointer"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </Button>

            {/* Common Media List */}
            <div className="mt-4">
              <Label>Added Media</Label>
              <ScrollArea className="flex flex-col mt-1 text-sm overflow-y-auto max-h-[300px] border rounded-md p-2">
                {getMediaList().length === 0 ? (
                  <p className="text-muted-foreground text-sm italic p-2">
                    No media added yet
                  </p>
                ) : (
                  getMediaList().map((item, idx) => (
                    <div
                      key={
                        item.type === 'file'
                          ? (item.file as File).name + idx
                          : item.url + idx
                      }
                      className="flex items-center justify-between p-1 hover:bg-muted rounded"
                    >
                      <span className="flex items-center gap-2 max-w-[80%]">
                        {item.type === 'file' && (
                          <Clapperboard size={18} className="text-primary" />
                        )}
                        {item.type === 'youtube' && (
                          <span className="text-[#FF0000]">
                            <YoutubeIcon size={18} />
                          </span>
                        )}
                        {item.type === 'link' && (
                          <LinkIcon size={18} className="text-primary" />
                        )}
                        <span className="truncate">
                          {item.type === 'file'
                            ? (item.file as File).name
                            : item.url}
                        </span>
                      </span>
                      <Button
                        variant={'ghost'}
                        size="sm"
                        onClick={() => handleMediaRemove(item)}
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

export default MediaUploadScreen;
