"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  LabelList,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type WeeklySummaryItem = {
  date: string;
  totalCalorie: number;
};

export default function WeeklyChart({
  weeklySummary,
}: {
  weeklySummary: WeeklySummaryItem[];
}) {
  // ---- データ整形（グラフ用） ----
  const chartData = weeklySummary.map((item, idx) => {
    const d = new Date(item.date);
    const label = `${d.getMonth() + 1}/${d.getDate()}`;

    const prev = weeklySummary[idx - 1]?.totalCalorie ?? 0;

    let ratio = 0;
    if (idx > 0 && prev > 0) {
      ratio = ((item.totalCalorie - prev) / prev) * 100;
    }
    if (isNaN(ratio)) ratio = 0;

    return {
      date: label,
      calorie: item.totalCalorie ?? 0,
      ratio: Number(ratio.toFixed(1)),
    };
  });

  return (
    <div style={{ width: "100%", height: 360, marginTop: 25 }}>
      <ResponsiveContainer>
        <ComposedChart
          data={chartData}
          margin={{ top: 30, right: 40, bottom: 10, left: 0 }}
        >
          {/* 背景グリッド */}
          <CartesianGrid stroke="#e6e6e6" strokeDasharray="3 3" />

          {/* X軸（日付） */}
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />

          {/* 左軸：カロリー（目安 0〜3500） */}
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 12 }}
            domain={[0, "auto"]}
          />

          {/* 右軸：割合（%） */}
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[-50, 150]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 12 }}
          />

          <Tooltip
            formatter={(value, name) =>
              name === "calorie" ? `${value} kcal` : `${value}%`
            }
          />

          {/* 棒グラフ（kcal） */}
          <Bar
            yAxisId="left"
            dataKey="calorie"
            fill="#4CAF50"
            barSize={40}
            radius={[8, 8, 0, 0]}
          >
            <LabelList dataKey="calorie" position="top" fill="#333" />
          </Bar>

          {/* 折れ線（前日比%） */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="ratio"
            stroke="#FF6F00"
            strokeWidth={3}
            dot={{ r: 5 }}
            activeDot={{ r: 6 }}
          >
            <LabelList
              dataKey="ratio"
              position="top"
              formatter={(v) => `${v}%`}
              fill="#FF6F00"
            />
          </Line>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
