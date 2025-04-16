"use client"

import { Gauge, gaugeClasses, GaugeContainer } from '@mui/x-charts';


export default function GaugeClient({ value }: { value: number }) {
    const hours = (value / 100) * 24
    const rounded = Math.round(hours * 2) / 2
    return (
      <div style={{ width: 355, height: 347, position:'relative' }}>
        <Gauge
          value={value}
        //   text={({ value }) => 
        //     `${value}% \n ──────── \n ${rounded} hours \n Remaining`} 

          valueMin={0}
          valueMax={100}
          width={355}
          height={355}
          sx={(theme) => ({
            [`& .${gaugeClasses.valueText}`]: {
            //   fontSize: 32,
            //   textAnchor: 'middle',
            //   dominantBaseline: 'middle',
            //   textDecorationColor: '#33B7F7',
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
            <div style={{ fontSize: '64px' }}>{`${value}%`}</div>
            <div style={{ fontSize: '32px', whiteSpace: 'pre-line' }}>
            {`───────\n${rounded} hours\nRemaining`}
            </div>
        </div>
      </div>
    );
  }