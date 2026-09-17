"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = ["#2d4d26", "#4c7a3d", "#D4A017", "#8a5a34", "#98bc9a", "#E6C158"];

export function SalesOverviewChart({ data }: { data: { date: string; sales: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0ebe0" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#6c9c70" />
        <YAxis tick={{ fontSize: 11 }} stroke="#6c9c70" />
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e0ebe0" }} />
        <Line type="monotone" dataKey="sales" stroke="#2d4d26" strokeWidth={2.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function OrdersOverviewChart({ data }: { data: { status: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0ebe0" />
        <XAxis dataKey="status" tick={{ fontSize: 10 }} stroke="#6c9c70" interval={0} angle={-20} textAnchor="end" height={60} />
        <YAxis tick={{ fontSize: 11 }} stroke="#6c9c70" allowDecimals={false} />
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e0ebe0" }} />
        <Bar dataKey="count" fill="#4c7a3d" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RevenueByCategoryChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={(d) => d.name}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e0ebe0" }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function MonthlySalesChart({ data }: { data: { month: string; sales: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0ebe0" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#6c9c70" />
        <YAxis tick={{ fontSize: 11 }} stroke="#6c9c70" />
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e0ebe0" }} />
        <Bar dataKey="sales" fill="#D4A017" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TopProductsChart({ data }: { data: { name: string; revenue: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0ebe0" />
        <XAxis type="number" tick={{ fontSize: 11 }} stroke="#6c9c70" />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="#6c9c70" width={120} />
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e0ebe0" }} />
        <Bar dataKey="revenue" fill="#2d4d26" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
