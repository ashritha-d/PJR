import {
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Users,
  Package,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import {
  SalesOverviewChart,
  OrdersOverviewChart,
  RevenueByCategoryChart,
  MonthlySalesChart,
  TopProductsChart,
} from "@/components/admin/AdminCharts";
import {
  getDashboardStats,
  getSalesOverview,
  getOrdersByStatus,
  getRevenueByCategory,
  getMonthlySales,
  getTopProducts,
} from "@/lib/admin-analytics";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [stats, salesOverview, ordersByStatus, revenueByCategory, monthlySales, topProducts] = await Promise.all([
    getDashboardStats(),
    getSalesOverview(),
    getOrdersByStatus(),
    getRevenueByCategory(),
    getMonthlySales(),
    getTopProducts(),
  ]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Sales" value={formatCurrency(stats.totalSales)} icon={DollarSign} accent="bg-forest-700" />
        <StatCard label="Total Orders" value={stats.totalOrders} icon={ShoppingBag} accent="bg-forest-600" />
        <StatCard label="Pending Orders" value={stats.pendingOrders} icon={Clock} accent="bg-gold-dark" />
        <StatCard label="Completed Orders" value={stats.completedOrders} icon={CheckCircle2} accent="bg-forest-800" />
        <StatCard label="Total Customers" value={stats.totalCustomers} icon={Users} accent="bg-earth-600" />
        <StatCard label="Total Products" value={stats.totalProducts} icon={Package} accent="bg-forest-500" />
        <StatCard
          label="Low Stock Products"
          value={stats.lowStockProducts}
          icon={AlertTriangle}
          accent="bg-orange-500"
          hint={stats.lowStockProducts > 0 ? "Needs attention" : undefined}
        />
        <StatCard
          label="Out of Stock"
          value={stats.outOfStockProducts}
          icon={XCircle}
          accent="bg-red-500"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="font-display font-bold text-forest-800">Sales Overview (Last 14 Days)</h3>
          <div className="mt-4">
            <SalesOverviewChart data={salesOverview} />
          </div>
        </div>
        <div className="card p-6">
          <h3 className="font-display font-bold text-forest-800">Orders Overview</h3>
          <div className="mt-4">
            <OrdersOverviewChart data={ordersByStatus} />
          </div>
        </div>
        <div className="card p-6">
          <h3 className="font-display font-bold text-forest-800">Revenue by Category</h3>
          <div className="mt-4">
            {revenueByCategory.length === 0 ? (
              <p className="py-16 text-center text-sm text-forest-400">No sales data yet.</p>
            ) : (
              <RevenueByCategoryChart data={revenueByCategory} />
            )}
          </div>
        </div>
        <div className="card p-6">
          <h3 className="font-display font-bold text-forest-800">Monthly Sales</h3>
          <div className="mt-4">
            <MonthlySalesChart data={monthlySales} />
          </div>
        </div>
        <div className="card p-6 lg:col-span-2">
          <h3 className="font-display font-bold text-forest-800">Top Selling Products</h3>
          <div className="mt-4">
            {topProducts.length === 0 ? (
              <p className="py-16 text-center text-sm text-forest-400">No sales data yet.</p>
            ) : (
              <TopProductsChart data={topProducts} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
