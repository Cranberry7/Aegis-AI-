import Markdown from '@/components/Markdown';
import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Link } from 'react-router-dom';
import { useTheme } from '@/components/theme-provider';
import { useSearchParams } from 'react-router-dom';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { enqueueSnackbar } from 'notistack';

// TODO: Need to use local package later.
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
const options = {
  //required to load jpx images correctly
  wasmUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/wasm/`,
};

export default function ReferencePage() {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [documentType, setDocumentType] = useState<string | null>(null);

  const pdfPageRef = useRef<HTMLDivElement>(null);

  const { setTheme } = useTheme();
  const searchParams = useSearchParams()[0];
  const sourceUrl = getFullUrl(searchParams.get('source_url') ?? '');
  const pageNumber = searchParams.get('page_number');
  const highlight = searchParams.get('highlight');
  const theme = searchParams.get('theme');

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    if (pdfPageRef.current) {
      pdfPageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  function getFullUrl(url: string): string {
    try {
      const request = new XMLHttpRequest();
      request.open('GET', url, false);
      request.send();

      if (request.status === 200) {
        return request.responseURL;
      }
    } catch {
      enqueueSnackbar('Unable to load reference', { variant: 'error' });
    }
    return url;
  }

  function getText(url: string): string {
    try {
      const request = new XMLHttpRequest();
      request.open('GET', url, false);
      request.send();

      if (request.status === 200) {
        return request.responseText;
      }
      throw new Error(`HTTP error! status: ${request.status}`);
    } catch {
      enqueueSnackbar('Unable to get content of this reference', {
        variant: 'error',
      });
      return 'Unable to get content';
    }
  }

  function getDocumentType() {
    if (sourceUrl) {
      if (sourceUrl.startsWith('https://s3.')) {
        if (sourceUrl.toLowerCase().endsWith('.pdf')) {
          setDocumentType('pdf');
        } else {
          setDocumentType('md');
        }
      } else {
        setDocumentType('url');
      }
    }
  }

  // Scroll correct pdf page to view once loaded
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (pdfPageRef.current) {
        pdfPageRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    });

    return () => cancelAnimationFrame(id);
  }, [pdfPageRef.current]);

  // Process depending on the document type
  useEffect(() => {
    const syntax = '#:~:text=';
    if (documentType == 'md') {
      if (highlight) {
        window.location.href = window.location.href + syntax + highlight;
      }
    } else if (documentType == 'url') {
      window.location.href = sourceUrl + syntax + highlight;
    }
  }, [documentType]);

  useEffect(() => {
    // Get document type & set theme (dark or light)
    getDocumentType();

    // Update the theme
    if (theme && (theme === 'light' || theme === 'dark')) {
      setTheme(theme);
    }

    // handle auto resize for pdf
    function handleResize() {
      setScreenWidth(window.innerWidth);
    }

    window.addEventListener('resize', handleResize);

    // Cleanup function to remove the event listener when the component unmounts
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Render pdf file
  if (documentType == 'pdf') {
    return (
      <div className="h-screen w-screen flex flex-col items-center overflow-y-scroll">
        <Button
          asChild
          className="sticky top-2 z-10 my-2"
          variant="secondary"
          size="sm"
        >
          <Link to={sourceUrl} target="_blank" className="text-xs">
            Load full pdf
          </Link>
        </Button>
        <Document
          file={sourceUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          options={options}
        >
          {Array.from({ length: 5 }, (_, index) => {
            const currentPage = parseInt(pageNumber || '1') + (index - 2);
            return currentPage > 0 && currentPage <= (numPages ?? Infinity) ? (
              <Page
                className="border"
                pageNumber={currentPage}
                key={`page_${currentPage}`}
                inputRef={index == 2 ? pdfPageRef : null}
                width={Math.min(screenWidth - 12, 1000)} // max width 1000px
              />
            ) : null;
          })}
        </Document>
      </div>
    );
  }

  // Render MD/Text files
  if (documentType == 'md') {
    return (
      <div className="h-screen w-screen overflow-y-scroll p-0 md:p-8 px-8 md:px-12">
        <Markdown>{getText(sourceUrl)}</Markdown>
      </div>
    );
  }

  // Show loading until doc loads
  return <p>Loading reference...</p>;
}
