import { Button } from '@/components/ui/button';
import { UploadType } from '@/enums/upload';
import { UploadProps } from '@/types/uploadInterface';
import { FileVideo } from 'lucide-react';
import React from 'react';

export const MediaTile: React.FC<UploadProps> = ({ onSelect }) => {
  return (
    <Button
      variant="ghost"
      className="flex flex-col h-full items-center justify-center p-8 rounded-xl border-2 shadow-md hover:shadow-lg transition-all cursor-pointer hover:bg-accent/10"
      onClick={() => onSelect(UploadType.MEDIA)}
    >
      <div className="bg-primary/10 p-4 rounded-full mb-4">
        <FileVideo className="!h-12 !w-12 text-primary" />
      </div>
      <h2 className="text-xl font-semibold ">Train on Media</h2>
      <p className="text-center text-muted-foreground">
        Train your agent on Youtube URLs or Videos
      </p>
    </Button>
  );
};
