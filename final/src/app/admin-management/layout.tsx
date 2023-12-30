export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="p-4">
      {children}
    </main>
  )
}
