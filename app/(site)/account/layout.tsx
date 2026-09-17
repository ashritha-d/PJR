import { AccountSidebar } from "@/components/site/AccountSidebar";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-page py-10">
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <AccountSidebar />
        <div>{children}</div>
      </div>
    </div>
  );
}
