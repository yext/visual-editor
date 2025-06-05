// This look like the default Mapbox pin except that it has a number in the center instead of a white circle
export const MapPinIcon = ({
  width,
  height,
  color,
  resultIndex,
}: {
  width: string;
  height: string;
  color: string;
  resultIndex?: number;
}) => {
  return (
    <svg
      className={`${color} hover:cursor-pointer`}
      display="block"
      height={height}
      width={width}
      viewBox="0 0 27 41"
    >
      <defs>
        <radialGradient id="shadowGradient">
          <stop offset="10%" stopOpacity="0.4"></stop>
          <stop offset="100%" stopOpacity="0.05"></stop>
        </radialGradient>
      </defs>
      <ellipse
        cx="13.5"
        cy="34.8"
        rx="10.5"
        ry="5.25"
        fill="url(#shadowGradient)"
      ></ellipse>
      <path
        fill="currentColor"
        d="M27,13.5C27,19.07 20.25,27 14.75,34.5C14.02,35.5 12.98,35.5 12.25,34.5C6.75,27 0,19.22 0,13.5C0,6.04 6.04,0 13.5,0C20.96,0 27,6.04 27,13.5Z"
      ></path>
      <path
        opacity="0.25"
        d="M13.5,0C6.04,0 0,6.04 0,13.5C0,19.22 6.75,27 12.25,34.5C13,35.52 14.02,35.5 14.75,34.5C20.25,27 27,19.07 27,13.5C27,6.04 20.96,0 13.5,0ZM13.5,1C20.42,1 26,6.58 26,13.5C26,15.9 24.5,19.18 22.22,22.74C19.95,26.3 16.71,30.14 13.94,33.91C13.74,34.18 13.61,34.32 13.5,34.44C13.39,34.32 13.26,34.18 13.06,33.91C10.28,30.13 7.41,26.31 5.02,22.77C2.62,19.23 1,15.95 1,13.5C1,6.58 6.58,1 13.5,1Z"
      ></path>
      {resultIndex && (
        <text
          textAnchor="middle"
          fontWeight="bold"
          fontSize="14"
          x="50%"
          y="50%"
          fill="white"
        >
          {resultIndex}
        </text>
      )}
    </svg>
  );
};
