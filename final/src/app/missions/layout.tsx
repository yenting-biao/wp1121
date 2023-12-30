export default function MissionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="p-4 flex gap-2">
      {children}
    </main>
  )
}
