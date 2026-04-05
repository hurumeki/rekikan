export default function EraBadge({ color }: { color: string }) {
  return (
    <div
      style={{
        width: 4,
        minHeight: '100%',
        backgroundColor: color,
        borderRadius: 2,
        flexShrink: 0,
      }}
    />
  );
}
