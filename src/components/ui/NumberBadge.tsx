export default function NumberBadge({ number }: { number: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: -8,
        right: -8,
        width: 24,
        height: 24,
        borderRadius: '50%',
        backgroundColor: 'var(--badge-bg)',
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {number}
    </div>
  );
}
