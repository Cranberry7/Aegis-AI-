import React from 'react';
import { LinkIcon } from 'lucide-react';
import { UploadProps } from '@/types/uploadInterface';
import { UploadType } from '@/enums/upload';
import { Button } from '@/components/ui/button';

export const UrlTile: React.FC<UploadProps> = ({ onSelect }) => {
  return (
    <Button
      variant="ghost"
      className="flex flex-col h-full items-center justify-center p-8 rounded-xl border-2 shadow-md hover:shadow-lg transition-all cursor-pointer hover:bg-accent/10"
      onClick={() => onSelect(UploadType.URL)}
    >
      <div className="bg-primary/10 p-4 rounded-full mb-4">
        <LinkIcon className="!h-12 !w-12 text-primary" />
      </div>
      <h2 className="text-xl font-semibold  text-center">
        Train on WebDocs URLs
      </h2>
      <p className="text-center text-muted-foreground">
        Add URLs to train your agent on web content
      </p>
    </Button>
  );
};
