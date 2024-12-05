import Image from "next/image";

export default function Header() {
  return (
    <header className="absolute top-0 left-0 w-full p-4 flex items-center">
      <div className="ml-4">
        <h2 className="text-3xl font-[family-name:var(--font-brolink)]">HederaHive</h2>
      </div>
    </header>
  );
}
