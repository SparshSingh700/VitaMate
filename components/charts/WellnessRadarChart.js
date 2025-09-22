// components/charts/WellnessRadarChart.js

import React, { useMemo } from "react";
import { View } from "react-native";
import Svg, {
  G,
  Polygon,
  Circle,
  Line,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";

export default function WellnessRadarChart({
  data = [],
  size = 360,
  maxValue = 5,
  levels = 5,
  padding = 28,
  colors = {
    grid: "rgba(0,0,0,0.1)",
    label: "#333333",
    stroke: "#9CA3FF",
    facetBase: ["#7C3AED", "#06B6D4", "#10B981", "#F59E0B", "#EF476F"],
    gradientFrom: "#6EE7F1",
    gradientTo: "#7C3AED",
  },
}) {
  const count = Math.max(3, data.length);
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - padding;

  const angleForIndex = (i) => (Math.PI * 2 * i) / count - Math.PI / 2;

  const pointFor = (index, valueRatio) => {
    const angle = angleForIndex(index);
    const r = radius * valueRatio;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    return { x, y };
  };

  // FIX: This now correctly calculates an ARRAY of vertices {x, y}
  const vertices = useMemo(() => {
    return data.map((d, i) => {
      const roundedValue = Math.round(d.value || 0);
      const ratio = Math.max(0, Math.min(1, roundedValue / levels));
      return pointFor(i, ratio);
    });
  }, [data, size]);

  // FIX: This new variable creates the string for the polygon separately
  const polygonPoints = useMemo(() => {
    return vertices.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
  }, [vertices]);

  const grid = useMemo(() => {
    const g = [];
    for (let level = levels; level >= 1; level--) {
      const ratio = level / levels;
      const pts = [];
      for (let i = 0; i < count; i++) {
        const p = pointFor(i, ratio);
        pts.push(`${p.x.toFixed(2)},${p.y.toFixed(2)}`);
      }
      g.push(pts.join(" "));
    }
    return g;
  }, [levels, size]);

  const labels = useMemo(() => {
    return data.map((d, i) => {
      const p = pointFor(i, 1.07);
      return { x: p.x, y: p.y, label: d.label };
    });
  }, [data, size]);
  
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={colors.gradientFrom} stopOpacity={0.92} />
            <Stop offset="100%" stopColor={colors.gradientTo} stopOpacity={0.7} />
          </LinearGradient>
        </Defs>
        <G>
          {grid.map((poly, idx) => (
            <Polygon
              key={`grid-${idx}`}
              points={poly}
              fill="none"
              stroke={colors.grid}
              strokeWidth={1}
            />
          ))}
          {Array.from({ length: count }).map((_, i) => {
            const outer = pointFor(i, 1);
            return (
              <Line
                key={`radial-${i}`}
                x1={cx}
                y1={cy}
                x2={outer.x}
                y2={outer.y}
                stroke={colors.grid}
                strokeWidth={0.5}
              />
            );
          })}
          
          {/* Main data polygon */}
          <Polygon
            points={polygonPoints}
            fill="url(#grad)"
            stroke={colors.stroke}
            strokeWidth={1.5}
          />

          {/* FIX: This now maps over the 'vertices' array, not the string */}
          {vertices.map((p, i) => (
            <G key={`node-${i}`}>
              <Circle cx={p.x} cy={p.y} r={4} fill={colors.facetBase[i % colors.facetBase.length]} />
            </G>
          ))}

          {labels.map((lp, i) => {
            let anchor = "middle";
            if (lp.x > cx + 8) anchor = "start";
            else if (lp.x < cx - 8) anchor = "end";
            return (
              <SvgText
                key={`label-${i}`}
                x={lp.x}
                y={lp.y}
                fontSize={12}
                fill={colors.label}
                textAnchor={anchor}
                alignmentBaseline="middle"
                fontWeight="600"
              >
                {lp.label}
              </SvgText>
            );
          })}
        </G>
      </Svg>
    </View>
  );
}