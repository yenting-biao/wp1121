import Navbar from "./_components/Navbar";

type Props = {
  children: React.ReactNode;
};

export default function ChatroomLayout({ children }: Props) {
  return (
    // overflow-hidden for parent to hide scrollbar
    <main className="flex-rows fixed top-0 flex h-screen w-full overflow-hidden">
      {/* overflow-y-scroll for child to show scrollbar */}
      <nav className="flex w-3/12 flex-col border-r ">
        <Navbar />
      </nav>
      {/* overflow-y-scroll for child to show scrollbar */}
      <div className="flex w-full flex-col border-r pb-1">{children}</div>
    </main>
  );
}
