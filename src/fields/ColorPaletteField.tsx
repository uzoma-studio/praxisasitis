'use client'

import type { TextFieldClientComponent } from 'payload'
import { FieldLabel, useField } from '@payloadcms/ui'

// 10 columns per row: four shades (dark to light) of ten hues, then a row of
// brand colours. Edit this list to change the palette.
const PALETTE = [
  // Dark
  '#991B1B',
  '#9A3412',
  '#92400E',
  '#3F6212',
  '#166534',
  '#115E59',
  '#1E40AF',
  '#3730A3',
  '#6B21A8',
  '#9D174D',
  // Strong
  '#DC2626',
  '#EA580C',
  '#D97706',
  '#65A30D',
  '#16A34A',
  '#0D9488',
  '#2563EB',
  '#4F46E5',
  '#9333EA',
  '#DB2777',
  // Medium
  '#EF4444',
  '#F97316',
  '#F59E0B',
  '#84CC16',
  '#22C55E',
  '#14B8A6',
  '#3B82F6',
  '#6366F1',
  '#A855F7',
  '#EC4899',
  // Light
  '#FCA5A5',
  '#FDBA74',
  '#FCD34D',
  '#BEF264',
  '#86EFAC',
  '#5EEAD4',
  '#93C5FD',
  '#A5B4FC',
  '#D8B4FE',
  '#F9A8D4',
  // Brand
  '#D10000',
  '#00853F',
  '#0095D9',
  '#FCCA00',
  '#A900B2',
  '#008A42',
  '#662383',
  '#F4D900',
  '#181818',
  '#737373',
]

// Palette picker plus a custom colour box (the browser's full colour picker).
// Stores the chosen colour as a hex string, e.g. "#00853F".
export const ColorPaletteField: TextFieldClientComponent = ({ field, path }) => {
  const { value, setValue } = useField<string>({ path })

  return (
    <div className="field-type">
      <FieldLabel label={field.label} path={path} required={field.required} />

      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 32px)', gap: 8, marginTop: 8 }}
      >
        {PALETTE.map((color) => (
          <button
            key={color}
            type="button"
            title={color}
            onClick={() => setValue(color)}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: '1px solid var(--theme-elevation-150)',
              cursor: 'pointer',
              backgroundColor: color,
              boxShadow:
                color.toLowerCase() === value?.toLowerCase()
                  ? '0 0 0 2px var(--theme-bg), 0 0 0 4px var(--theme-text)'
                  : 'none',
            }}
          />
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
        <input
          type="color"
          value={value || '#000000'}
          onChange={(event) => setValue(event.target.value.toUpperCase())}
          aria-label="Custom colour"
          style={{
            width: 40,
            height: 40,
            padding: 0,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
          }}
        />
        <span style={{ fontSize: 13, opacity: 0.7 }}>Custom colour · {value ?? ''}</span>
      </div>
    </div>
  )
}
