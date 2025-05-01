"use client"

import { Gauge, gaugeClasses } from '@mui/x-charts';


export default function GaugeClient({ value }: { value: number }) {
  const hours = (value / 100) * 24;
  const rounded = Math.round(hours * 2) / 2;

  return (
    <div className="gaugeChartContainer">
      <Gauge
        className="gauge-responsive"
        value={value}
        valueMin={0}
        valueMax={100}
        width={355}
        height={355}
        sx={(theme) => ({
          [`& .${gaugeClasses.valueText}`]: {
            display: 'none',
          },
          [`& .${gaugeClasses.valueArc}`]: {
            fill: '#33B7F7',
          },
          [`& .${gaugeClasses.referenceArc}`]: {
            fill: theme.palette.text.disabled,
          },
        })}
      />
      <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
            lineHeight: 1.2,
            color: '#33B7F7',
        }}>
            <div className="gauge-overlay">
              <div className="gauge-percent">{`${value}%`}</div>
              <div className="gauge-label">{`───────\n${rounded} hours\nRemaining`}</div>
            </div>
        </div>
    </div>
  );
}
