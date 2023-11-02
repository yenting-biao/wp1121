import ProfileButton from "./ProfileButton";
import Image from "next/image";

export default function TweetHeader() {
  return (
    // aside is a semantic html tag for side content
    <header className="flex flex-col fixed w-full justify-between px-1 py-1 bg-gray-100 rounded-lg left-0">
      <div className="flex flex-row items-center gap-2">
        <Image src="/github.svg" className="ml-2" alt="icon" width={40} height={40}/>
        <div className="w-full">
          {/*<Link href="/">*/}
            {/*<Image src={larry} alt="Larry the bird" width={40} height={40} />*/}
            
            <h1 className="font-bold text-2xl">CountMeIn!</h1>
          {/*</Link>*/}
        </div>
        {/*<HeaderButton Icon={Search} text="Search" />*/}
        {/*<HeaderButton Icon={PlusCircle} text="Add" />*/}
        <ProfileButton />
      </div>
    </header>
  );
}
