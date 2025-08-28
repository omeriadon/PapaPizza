export function getForegroundColour(hex?: string) {
  const color = hex || "#000000";

  const r = parseInt(color.substr(1, 2), 16) / 255;
  const g = parseInt(color.substr(3, 2), 16) / 255;
  const b = parseInt(color.substr(5, 2), 16) / 255;

  const RsRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const GsRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const BsRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  const L = 0.2126 * RsRGB + 0.7152 * GsRGB + 0.0722 * BsRGB;

  return L > 0.5 ? "#000000" : "#ffffff";
}
