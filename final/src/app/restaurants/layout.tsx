export default function MapLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="h-full">
      <div className="h-full">
        {children}
      </div> 
    </main>
  )
}
