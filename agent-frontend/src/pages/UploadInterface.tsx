import { useState } from 'react';
import { axiosBackendInstance } from '../utils/axiosInstance';
import SelectionScreen from '@/components/upload/SelectionScreen';
import URLUploadScreen from '@/components/upload/url/URLUploadScreen';
import FileUploadScreen from '@/components/upload/file/FileUploadScreen';
import { API_ROUTES } from '@/constants/routes';
import { UploadType } from '@/enums/upload';
import MediaUploadScreen from '@/components/upload/media/MediaUploadScreen';

const UploadInterface: React.FC = () => {
  const [uploadType, setUploadType] = useState<UploadType>(
    UploadType.SELECTION,
  );

  const handleUrlSubmit = async (urls: string[], isMedia: boolean = false) => {
    const urlsFormData = new FormData();
    urlsFormData.append('urls', JSON.stringify(urls));
    urlsFormData.append('isMedia', JSON.stringify(isMedia));
    await axiosBackendInstance.post(API_ROUTES.TRAIN, urlsFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  const handleFileSubmit = async (files: File[], isMedia: boolean = false) => {
    const batchSize = 5;
    for (let i = 0; i < files.length; i += batchSize) {
      const fileBatch = files.slice(i, i + batchSize);
      const filesBatchFormData = new FormData();
      fileBatch.forEach((file) => filesBatchFormData.append('files', file));
      filesBatchFormData.append('isMedia', JSON.stringify(isMedia));

      await axiosBackendInstance.post(API_ROUTES.TRAIN, filesBatchFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
  };

  const handleMediaSubmit = async (files: File[], urls: string[]) => {
    const promises: Promise<void>[] = [];

    if (urls.length > 0) promises.push(handleUrlSubmit(urls, true));
    if (files.length > 0) promises.push(handleFileSubmit(files, true));

    await Promise.all(promises);
  };

  function goToTrainingSelection() {
    setUploadType(UploadType.SELECTION);
  }

  return (
    <>
      {/* This forwards to the selection screen to choose between URL and file upload. */}
      {uploadType === UploadType.SELECTION && (
        <SelectionScreen onSelect={(type) => setUploadType(type)} />
      )}
      {uploadType === UploadType.URL && (
        <URLUploadScreen
          onBack={goToTrainingSelection}
          onSubmit={handleUrlSubmit}
        />
      )}
      {uploadType === UploadType.FILE && (
        <FileUploadScreen
          onBack={goToTrainingSelection}
          onSubmit={handleFileSubmit}
        />
      )}
      {uploadType === UploadType.MEDIA && (
        <MediaUploadScreen
          onBack={goToTrainingSelection}
          onSubmit={handleMediaSubmit}
        />
      )}
    </>
  );
};

export default UploadInterface;
