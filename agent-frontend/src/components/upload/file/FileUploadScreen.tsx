import { useState } from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react';
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

interface FileUploadScreenProps {
  onBack: () => void;
  onSubmit: (files: File[]) => Promise<void>;
}

const FileUploadScreen: React.FC<FileUploadScreenProps> = ({
  onBack,
  onSubmit,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles([...files, ...Array.from(event.target.files)]);
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
    if (event.dataTransfer.files) {
      setFiles([...files, ...Array.from(event.dataTransfer.files)]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    if (files.length === 0) {
      showToast({
        message: ErrorMessages.AT_LEAST_ONE_FILE,
        variant: ToastVariants.ERROR,
      });
      setSubmitting(false);
      return;
    }

    try {
      await onSubmit(files);
      showToast({
        message: SuccessMessages.FILE_SUBMITTED,
        variant: ToastVariants.SUCCESS,
      });
      setFiles([]);
    } catch {
      showToast({
        message: ErrorMessages.FILE_NOT_SUBMITTED,
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
        <h1 className="text-xl font-semibold">Upload Files</h1>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto shadow-md p-6 rounded-xl border-2">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                  accept=".yaml,.yml,.md,.json,.pdf"
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
                  Supported formats: .yaml, .yml, .md, .json, .pdf
                </p>
              </div>
            </div>
            <Button
              color="primary"
              className="mt-3 cursor-pointer"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Files'}
            </Button>

            {/* File List */}
            <div className="mt-4">
              <Label>Added Files</Label>
              <ScrollArea className="flex flex-col mt-1 text-sm overflow-y-auto max-h-[300px] border rounded-md p-2">
                {files.length === 0 ? (
                  <p className="text-muted-foreground text-sm italic p-2">
                    No files added yet
                  </p>
                ) : (
                  files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-1 hover:bg-muted rounded"
                    >
                      <p className="truncate max-w-[80%]">{file.name}</p>
                      <Button
                        variant={'ghost'}
                        size="sm"
                        onClick={() => handleFileRemove(file)}
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

export default FileUploadScreen;
