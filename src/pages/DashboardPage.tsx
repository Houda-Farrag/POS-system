import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from "chart.js";
import { Bar } from "react-chartjs-2";
import { api } from "../api";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export function DashboardPage({ arabicMode }: { arabicMode: boolean }) {
  const stats = api.getDashboard();
  const labels = stats.topProducts.map((item) => item.name);
  const values = stats.topProducts.map((item) => item.qty);

  return (
    <div className="grid-3">
      <section className="card"><h4>{arabicMode ? "إجمالي المبيعات" : "Total Sales"}</h4><p>{stats.totalSales.toFixed(2)}</p></section>
      <section className="card"><h4>{arabicMode ? "الرصيد غير المدفوع" : "Unpaid Balance"}</h4><p>{stats.unpaidBalance.toFixed(2)}</p></section>
      <section className="card"><h4>{arabicMode ? "عدد الفواتير" : "Invoices"}</h4><p>{stats.invoiceCount}</p></section>
      <section className="card chart-card">
        <h3>{arabicMode ? "أكثر المواد مبيعاً" : "Top Selling Materials"}</h3>
        <Bar
          data={{
            labels,
            datasets: [{ label: arabicMode ? "الكمية" : "Quantity", data: values, backgroundColor: "#B8860B" }],
          }}
        />
      </section>
    </div>
  );
}
