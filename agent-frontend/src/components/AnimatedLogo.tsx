import { useTheme } from './theme-provider';
import { motion } from 'framer-motion';

export default function AnimatedLogo() {
  const { theme } = useTheme();
  return (
    <motion.div layoutId="logo">
      <svg viewBox="-5 -5 93 93">
        <defs>
          <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
            <feOffset dx="2" dy="2" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.2" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <pattern id="shinePattern" x="0" y="0" width="200" height="200">
            <rect x="0" y="0" width="200" height="200" fill="none">
              <animate
                attributeName="x"
                from="-200"
                to="200"
                dur="4s"
                repeatCount="indefinite"
              />
            </rect>
            <rect
              x="-200"
              y="-200"
              width="400"
              height="400"
              fill="url(#shineGradient)"
              transform="rotate(45)"
            >
              <animate
                attributeName="x"
                from="-200"
                to="200"
                dur="4s"
                repeatCount="indefinite"
              />
            </rect>
          </pattern>

          <linearGradient id="shineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="45%" stopColor="rgba(255,255,255,0)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.8)" />
            <stop offset="55%" stopColor="rgba(255,255,255,0)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>

          <mask id="logoMask">
            <g fill="white">
              <path
                className="main-path"
                d="M38.047,27.661 C35.16,28.301 35.035,34.825 38.414,35.34 C53.359,37.625 61.078,41.036 58.227,56.043 C67.801,55.516 76.203,51.993 82.324,41.774 C76.219,24.852 59.109,22.985 38.047,27.661"
              />
              <path
                className="main-path"
                d="M26.609,22.317 C36.543,15.891 46.648,16.196 54.598,20.497 C53.559,10.899 48.633,4.067 41.379,0 C32.652,2.77 28.422,11.938 26.609,22.317"
              />
              <path
                className="main-path"
                d="M27.129,62.793 C37.059,69.215 48.977,66.059 55.633,60.457 C54.594,70.059 49.668,78.184 42.414,82.25 C33.691,79.485 28.938,73.168 27.129,62.793"
              />
              <path
                className="main-path"
                d="M44.277,55.786 C47.16,55.145 47.289,48.622 43.91,48.106 C28.961,45.817 21.242,42.411 24.094,27.399 C14.523,27.93 6.117,31.454 0,41.672 C6.102,58.594 23.211,60.457 44.277,55.786"
              />
              <polygon
                className="white-poly"
                points="14.164 32.9501 19.863 32.9501 19.863 27.2431 14.164 27.2431"
              />
              <polygon
                className="white-poly"
                points="8.797 36.4771 12.684 36.4771 12.684 32.5861 8.797 32.5861"
              />
              <polygon
                className="white-poly"
                points="14.359 41.1061 18.246 41.1061 18.246 37.2151 14.359 37.2151"
              />
              <polygon
                className="yellow-poly"
                points="7.988 27.4381 15.004 27.4381 15.004 20.4151 7.988 20.4151"
              />
              <polygon
                className="yellow-poly"
                points="1.383 20.8641 6.168 20.8641 6.168 16.0751 1.383 16.0751"
              />
              <polygon
                className="yellow-poly"
                points="8.23 15.1681 13.015 15.1681 13.015 10.3791 8.23 10.3791"
              />
            </g>
          </mask>
        </defs>

        <g
          stroke="none"
          strokeWidth="1"
          fill="none"
          fillRule="evenodd"
          filter="url(#dropShadow)"
        >
          <g transform="translate(0, 0)">
            <g>
              <path
                className="main-path"
                d="M38.047,27.661 C35.16,28.301 35.035,34.825 38.414,35.34 C53.359,37.625 61.078,41.036 58.227,56.043 C67.801,55.516 76.203,51.993 82.324,41.774 C76.219,24.852 59.109,22.985 38.047,27.661"
                fill="#009EE0"
              />
              <path
                className="main-path"
                d="M26.609,22.317 C36.543,15.891 46.648,16.196 54.598,20.497 C53.559,10.899 48.633,4.067 41.379,0 C32.652,2.77 28.422,11.938 26.609,22.317"
                fill="#CBD300"
              />
              <path
                className="main-path"
                d="M27.129,62.793 C37.059,69.215 48.977,66.059 55.633,60.457 C54.594,70.059 49.668,78.184 42.414,82.25 C33.691,79.485 28.938,73.168 27.129,62.793"
                fill="#009EE0"
              />
              <path
                className="main-path"
                d="M44.277,55.786 C47.16,55.145 47.289,48.622 43.91,48.106 C28.961,45.817 21.242,42.411 24.094,27.399 C14.523,27.93 6.117,31.454 0,41.672 C6.102,58.594 23.211,60.457 44.277,55.786"
                fill="#CBD300"
              />
              <polygon
                className="white-poly"
                fill={theme == 'dark' ? '#000000' : '#FFFFFF'}
                points="14.164 32.9501 19.863 32.9501 19.863 27.2431 14.164 27.2431"
              />
              <polygon
                className="white-poly"
                fill={theme == 'dark' ? '#000000' : '#FFFFFF'}
                points="8.797 36.4771 12.684 36.4771 12.684 32.5861 8.797 32.5861"
              />
              <polygon
                className="white-poly"
                fill={theme == 'dark' ? '#000000' : '#FFFFFF'}
                points="14.359 41.1061 18.246 41.1061 18.246 37.2151 14.359 37.2151"
              />
              <polygon
                className="yellow-poly"
                fill="#CBD300"
                points="7.988 27.4381 15.004 27.4381 15.004 20.4151 7.988 20.4151"
              />
              <polygon
                className="yellow-poly"
                fill="#CBD300"
                points="1.383 20.8641 6.168 20.8641 6.168 16.0751 1.383 16.0751"
              />
              <polygon
                className="yellow-poly"
                fill="#CBD300"
                points="8.23 15.1681 13.015 15.1681 13.015 10.3791 8.23 10.3791"
              />
            </g>
          </g>

          <rect
            x="-5"
            y="-5"
            width="93"
            height="93"
            fill="url(#shinePattern)"
            mask="url(#logoMask)"
          />
        </g>
      </svg>
    </motion.div>
  );
}
