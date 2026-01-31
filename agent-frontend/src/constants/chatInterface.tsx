import { MessageRole } from '@/enums/message';
import { Message } from '@/types/chatInterface';
import { createElement } from 'react';

export const eventTypeId = '58b702f5-bd24-4ba1-b69b-51b1ccab2597';
export const eventSourceId = 'd1123986-22a0-46eb-a8dc-1696eec10bdd';

export const defaultMessages: Message[] = [
  {
    id: 'default-message',
    type: MessageRole.AGENT,
    content: 'Hello 👋, How can I help you?',
  },
];

function ImgComponent(props: any) {
  const { src: url } = props;
  const modifiedUrl = url?.startsWith('./') ? url.slice(2) : url;

  return <img src={modifiedUrl} />;
}

export const markdownOverrides = {
  h1: {
    component: 'h1',
    props: {
      style: {
        fontFamily: 'Ubuntu, sans-serif',
        marginBottom: 16,
        marginTop: 32,
        lineHeight: 1.3,
        scrollMarginTop: '5rem',
        fontSize: '2.25rem',
        fontWeight: 800,
        letterSpacing: '-0.025em',
        '@media (minWidth: 1024px)': {
          fontSize: '3rem',
        },
      },
    },
  },
  h2: {
    component: 'h2',
    props: {
      style: {
        fontFamily: 'Ubuntu, sans-serif',
        marginBottom: 14,
        marginTop: 28,
        lineHeight: 1.35,
        scrollMarginTop: '5rem',
        borderBottom: '1px solid',
        paddingBottom: '0.5rem',
        fontSize: '1.875rem',
        fontWeight: 600,
        letterSpacing: '-0.025em',
        '&:firstOfType': {
          marginTop: 0,
        },
      },
    },
  },
  h3: {
    component: 'h3',
    props: {
      style: {
        fontFamily: 'Ubuntu, sans-serif',
        marginBottom: 12,
        marginTop: 24,
        lineHeight: 1.4,
        scrollMarginTop: '5rem',
        fontSize: '1.5rem',
        fontWeight: 600,
        letterSpacing: '-0.025em',
      },
    },
  },
  h4: {
    component: 'h4',
    props: {
      style: {
        fontFamily: 'Ubuntu, sans-serif',
        marginBottom: 12,
        marginTop: 24,
        lineHeight: 1.4,
        scrollMarginTop: '5rem',
        fontSize: '1.25rem',
        fontWeight: 600,
        letterSpacing: '-0.025em',
      },
    },
  },
  h5: {
    component: 'h5',
    props: {
      style: {
        fontWeight: 500,
        fontSize: 18,
        fontFamily: 'Ubuntu, sans-serif',
        marginBottom: 8,
        marginTop: 18,
        lineHeight: 1.5,
      },
    },
  },
  h6: {
    component: 'h6',
    props: {
      style: {
        fontWeight: 500,
        fontSize: 16,
        fontFamily: 'Ubuntu, sans-serif',
        marginBottom: 6,
        marginTop: 16,
        lineHeight: 1.55,
      },
    },
  },
  p: {
    component: 'p',
    props: {
      className: 'leading-7 [&:not(:first-child)]:mt-6',
    },
  },
  b: {
    component: 'b',
    props: {
      style: {
        fontFamily: 'Ubuntu, sans-serif',
        lineHeight: '1.75rem',
        fontWeight: 600,
      },
    },
  },
  span: {
    component: 'span',
    props: {
      style: {
        fontSize: '1rem',
        fontFamily: 'Ubuntu, sans-serif',
        lineHeight: '1.75rem',
      },
    },
  },
  ul: {
    component: 'ul',
    props: {
      className: 'my-6 ml-6 list-disc [&>li]:mt-2',
      style: {
        listStyleType: 'disc',
      },
    },
  },
  ol: {
    component: 'ol',
    props: {
      style: {
        paddingLeft: 24,
        marginBottom: 12,
        listStyleType: 'decimal',
      },
    },
  },
  li: {
    component: 'li',
    props: {
      style: {
        fontSize: '1rem',
        fontFamily: 'Ubuntu, sans-serif',
        lineHeight: 1.6,
        marginBottom: 6,
        marginLeft: 16,
      },
    },
  },
  blockquote: {
    component: 'blockquote',
    props: {
      style: {
        marginTop: '1.5rem',
        fontStyle: 'italic',
        borderLeft: '2px solid #ccc',
        paddingLeft: '1.5rem',
      },
    },
  },
  hr: {
    component: 'hr',
    props: {
      style: {
        border: 'none',
        borderTop: '2px solid #ddd',
        margin: '24px 0',
      },
    },
  },
  a: {
    component: 'a',
    props: {
      style: {
        color: '#22a',
        textDecoration: 'underline',
        fontWeight: 500,
        fontStyle: 'italic',
      },
      target: '_blank',
    },
  },
  strong: {
    component: 'strong',
    props: {
      style: {
        fontWeight: 700,
      },
    },
  },
  em: {
    component: (props: any) => {
      return <em style={props.style}>_{props.children}_</em>;
    },
    props: {
      style: {
        fontStyle: 'normal',
      },
    },
  },
  del: {
    component: 'del',
    props: {
      style: {
        textDecoration: 'line-through',
      },
    },
  },
  table: {
    component: 'table',
    props: {
      style: {
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: 16,
      },
    },
  },
  thead: {
    component: 'thead',
    props: {
      className: 'bg-accent',
    },
  },
  tbody: {
    component: 'tbody',
  },
  tr: {
    component: 'tr',
    props: {
      className: 'border-b border-muted',
    },
  },
  th: {
    component: 'th',
    props: {
      style: {
        textAlign: 'left',
        fontWeight: 600,
        padding: '8px',
      },
    },
  },
  td: {
    component: 'td',
    props: {
      style: {
        textAlign: 'left',
        padding: '8px',
      },
    },
  },
  img: {
    component: ImgComponent,
  },
};

const buildReactMarkdownComponents = () => {
  return Object.fromEntries(
    Object.entries(markdownOverrides).map(([tag, override]) => {
      const { component, props = {} } = override as {
        component: string | React.ComponentType;
        props?: Record<string, any>;
      };
      return [
        tag,
        ({ ...rest }: any) => {
          if (typeof component === 'string') {
            // Intrinsic element (e.g., 'h1', 'p', etc.)
            const Comp = component as keyof JSX.IntrinsicElements;
            return <Comp {...props} {...rest} />;
          } else {
            // Custom React component function
            return createElement(component, { ...props, ...rest });
          }
        },
      ];
    }),
  );
};

export const reactMarkdownComponents = buildReactMarkdownComponents();
