import { reactMarkdownComponents } from '@/constants/chatInterface';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function Markdown({
  children,
  components = {},
}: {
  children: string;
  components?: Components;
}) {
  return (
    <ReactMarkdown
      components={{
        code: ({ className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || '');
          return match ? (
            <div className="flex flex-col bg-accent my-2 rounded">
              <span className="pl-2 py-1 text-sm">{match[1] || 'text'}</span>
              <SyntaxHighlighter
                style={atomDark}
                customStyle={{ margin: 0 }}
                language={match[1] || 'text'}
                PreTag="div"
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            </div>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
        ...reactMarkdownComponents,
        ...components,
      }}
      remarkPlugins={[remarkGfm]}
    >
      {children}
    </ReactMarkdown>
  );
}
