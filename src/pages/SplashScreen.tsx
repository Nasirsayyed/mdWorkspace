export function SplashScreen() {
  return (
    <div className="flex items-center justify-center" style={{ height: '100dvh', background: 'var(--bg-canvas)' }}>
      <div className="flex flex-col items-center gap-3">
        <div
          className="flex items-center justify-center rounded-2xl"
          style={{ width: 44, height: 44, background: 'var(--accent, #4f46e5)', color: 'white', fontSize: 20 }}
        >
          ◈
        </div>
        <div className="skeleton" style={{ width: 140, height: 10, borderRadius: 6 }} />
      </div>
    </div>
  )
}
