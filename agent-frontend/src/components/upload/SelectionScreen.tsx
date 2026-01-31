import { UploadProps } from '@/types/uploadInterface';
import { UrlTile } from './url/Tile';
import { FileTile } from './file/Tile';
import { MediaTile } from './media/Tile';

const SelectionScreen: React.FC<UploadProps> = ({ onSelect }) => {
  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex flex-col items-center justify-center gap-8 p-6 ">
        <h1 className="text-center text-2xl font-bold mb-4">
          Choose Upload Type
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          {/* URL Upload Tile */}
          <UrlTile onSelect={onSelect} />

          {/* File Upload Tile */}
          <FileTile onSelect={onSelect} />

          {/* Media Upload Tile */}
          <MediaTile onSelect={onSelect} />
        </div>
      </div>
    </div>
  );
};

export default SelectionScreen;
