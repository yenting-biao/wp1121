type Props = {
  children: React.ReactNode;
  //params: { chatroomId: string };
};

export default function ChatroomLayout({ children /*, params*/ }: Props) {
  //console.log("layout params: ", params);
  return (
    <div className="mt-3 flex h-full w-full flex-col gap-5 px-8 pb-3 pt-2">
      {children}
    </div>
  );
}
