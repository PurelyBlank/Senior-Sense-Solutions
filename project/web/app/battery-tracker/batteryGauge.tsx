"use client"

import { Gauge, gaugeClasses, GaugeContainer } from '@mui/x-charts';


export default function GaugeClient({ value }: { value: number }) {
    const hours = (value / 100) * 24
    const rounded = Math.round(hours * 2) / 2
    return (
      <div style={{ width: 355, height: 347 }}>
        <Gauge
          value={value}
          text={({ value }) => 
            `${value}% \n ──────── \n ${rounded} hours \n Remaining`} 
          aria-labelledby="battery_level_label"
        aria-valuetext="50% (6 hours) remaining"
          valueMin={0}
          valueMax={100}
          width={355}
          height={355}
          sx={(theme) => ({
            [`& .${gaugeClasses.valueText}`]: {
              fontSize: 32,
              textAnchor: 'middle',
              dominantBaseline: 'middle',
              textDecorationColor: '#33B7F7',
            },
            [`& .${gaugeClasses.valueArc}`]: {
              fill: '#33B7F7',
            },
            [`& .${gaugeClasses.referenceArc}`]: {
              fill: theme.palette.text.disabled,
            },
          })}
        />
      </div>
    );
  }