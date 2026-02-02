"use client";

import { useMemo } from "react";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type WeeklySummaryItem = {
  date: string; // "YYYY-MM-DD"
  totalCalorie: number;
};

type ChartRow = {
  date: string;        // "M/D"
  calorie: number;     // kcal
  achieve: number;     // グラフ表示用 達成率（0〜150にclamp）
  achieveRaw: number;  // Tooltip表示用 達成率（実値）
  barColor: string;    // 超标红色，否则绿色
};

function toMD(isoDate: string) {
  const d = new Date(isoDate);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export default function WeeklyChart({ weeklySummary }: { weeklySummary: WeeklySummaryItem[] }) {
  const TARGET = 1800;
  const DOMAIN_MIN = 0;
  const DOMAIN_MAX = 150;

  const chartData: ChartRow[] = useMemo(() => {
    return weeklySummary.map((item) => {
      const calorie = item.totalCalorie ?? 0;

      // ✅ 達成率（%）: calorie / TARGET * 100
      const achieveRaw = TARGET > 0 ? Number(((calorie / TARGET) * 100).toFixed(1)) : 0;

      // ✅ 見た目用：0〜150% に抑える（グラフが破綻しない）
      const achieve = clamp(achieveRaw, DOMAIN_MIN, DOMAIN_MAX);

      return {
        date: toMD(item.date),
        calorie,
        achieve,
        achieveRaw,
        barColor: calorie > TARGET ? "#ef4444" : "#4CAF50",
      };
    });
  }, [weeklySummary]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ResponsiveContainer>
        <ComposedChart data={chartData} margin={{ top: 44, right: 28, bottom: 8, left: 0 }}>
          <CartesianGrid stroke="#e6e6e6" strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />

          {/* 左：kcal */}
          <YAxis yAxisId="left" tick={{ fontSize: 12 }} domain={[0, "auto"]} />

          {/* 右：達成率(%) */}
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[DOMAIN_MIN, DOMAIN_MAX]}
            tickFormatter={(v: number) => `${v}%`}
            tick={{ fontSize: 12 }}
          />

          {/* ✅ Tooltip：達成率 + 超標提示 */}
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload || !payload.length) return null;

              const calorie = payload.find((p) => p.dataKey === "calorie")?.value;
              const row = payload[0]?.payload as ChartRow | undefined;
              const achieveRaw = row?.achieveRaw;

              const over = typeof calorie === "number" ? calorie - TARGET : null;

              return (
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    padding: "10px 12px",
                    fontSize: 12,
                    lineHeight: 1.6,
                    boxShadow: "0 10px 24px rgba(0,0,0,.08)",
                  }}
                >
                  <div>
                    <b>日付：</b>
                    {label}
                  </div>

                  <div style={{ color: "#16a34a" }}>
                    <b>カロリー：</b>
                    {calorie} kcal
                  </div>

                  {typeof achieveRaw === "number" && (
                    <div style={{ color: "#ff6f00" }}>
                      <b>達成率：</b>
                      {achieveRaw > DOMAIN_MAX ? `>${DOMAIN_MAX}%` : `${achieveRaw}%`}
                      {achieveRaw > DOMAIN_MAX && (
                        <span style={{ color: "#9ca3af" }}>（実際 {achieveRaw}%）</span>
                      )}
                    </div>
                  )}

                  {typeof calorie === "number" && over != null && over > 0 && (
                    <div style={{ color: "#ef4444" }}>
                      <b>注意：</b> 目標より +{over} kcal
                    </div>
                  )}
                </div>
              );
            }}
          />

          {/* 柱：kcal（超标红/未超标绿） */}
          <Bar yAxisId="left" dataKey="calorie" barSize={34} radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.barColor} />
            ))}
            <LabelList
              dataKey="calorie"
              position="top"
              offset={8}
              fill="#333"
              formatter={(v: any) => (Number(v) > 0 ? `${v}` : "")}
            />
          </Bar>

          {/* ✅ 橙线：達成率(%)（hover で Tooltip に出る） */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="achieve"
            stroke="#FF6F00"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
