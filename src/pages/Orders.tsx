import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';

export default function Orders() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">My Orders</h1>
        <p className="text-muted-foreground">Track your artwork purchases</p>
      </div>
      <MobileNav />
    </div>
  );
}