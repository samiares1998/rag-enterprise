import GridLayout, { type Layout } from "react-grid-layout";
import DashboardCard from "../features/dashboard/ DashboardCard";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

export default function Dashboard() {
  const layout: Layout[] = [
    { i: "1", x: 0, y: 0, w: 3, h: 2 },
    { i: "2", x: 3, y: 0, w: 3, h: 2 },
    { i: "3", x: 6, y: 0, w: 3, h: 2 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Panel de Administración</h1>

      <GridLayout
  className="layout"
  layout={layout}
  cols={12}
  rowHeight={100}
  width={1200}
  draggableHandle=".drag-handle"
>
  <div key="1">
    <DashboardCard title="Card 1">
      <p>Contenido de card 1 🚀</p>
    </DashboardCard>
  </div>

  <div key="2">
    <DashboardCard title="Card 2">
      <p>Este es otro bloque 📊</p>
    </DashboardCard>
  </div>

  <div key="3">
    <DashboardCard title="Card 3">
      <p>Más contenido 🎉</p>
    </DashboardCard>
  </div>
</GridLayout>
    </div>
  );
}
