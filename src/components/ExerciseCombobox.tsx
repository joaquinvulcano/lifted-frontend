'use client'

import { useState, useRef, useEffect } from 'react'

interface Exercise {
  id: number
  name: string
  default_equipment: string
}

interface Props {
  exercises: Exercise[]
  selectedId: number | null
  onSelect: (id: number) => void
  onCreateNew: (name: string, equipment: string) => Promise<number>
}

const EQUIPMENT_OPTIONS = ['Barra', 'Mancuerna', 'Polea', 'Maquina', 'PropioPeso']

export function ExerciseCombobox({ exercises, selectedId, onSelect, onCreateNew }: Props) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [showEquipmentPicker, setShowEquipmentPicker] = useState(false)
  const [newEquipment, setNewEquipment] = useState('Barra')
  const [creating, setCreating] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close when user taps/clicks outside — pointerdown covers both mouse and touch
  useEffect(() => {
    function handleOutside(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setShowEquipmentPicker(false)
      }
    }
    document.addEventListener('pointerdown', handleOutside)
    return () => document.removeEventListener('pointerdown', handleOutside)
  }, [])

  const selected = selectedId ? exercises.find((e) => e.id === selectedId) : null
  const displayValue = selected ? selected.name : query

  const filtered = query.trim()
    ? exercises.filter((e) => e.name.toLowerCase().includes(query.toLowerCase()))
    : exercises

  const hasExactMatch = exercises.some(
    (e) => e.name.toLowerCase() === query.toLowerCase()
  )
  const canCreate = query.trim().length >= 2 && !hasExactMatch

  function handleSelect(ex: Exercise) {
    setQuery(ex.name)
    setIsOpen(false)
    setShowEquipmentPicker(false)
    onSelect(ex.id)
  }

  async function handleConfirmCreate() {
    setCreating(true)
    try {
      const newId = await onCreateNew(query.trim(), newEquipment)
      onSelect(newId)
      setIsOpen(false)
      setShowEquipmentPicker(false)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        placeholder="Buscar ejercicio..."
        value={displayValue}
        onChange={(e) => {
          setQuery(e.target.value)
          setIsOpen(true)
          setShowEquipmentPicker(false)
          if (selectedId) onSelect(0)
        }}
        onFocus={() => setIsOpen(true)}
        className="w-full rounded-lg bg-zinc-700 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white"
      />

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-52 overflow-y-auto rounded-xl border border-zinc-600 bg-zinc-800 shadow-2xl">
          {filtered.map((ex) => (
            <button
              key={ex.id}
              type="button"
              onClick={() => handleSelect(ex)}
              className="flex w-full items-center justify-between px-3 py-2.5 text-left hover:bg-zinc-700 first:rounded-t-xl"
            >
              <span className="text-sm text-white">{ex.name}</span>
              <span className="ml-2 shrink-0 text-xs text-zinc-500">{ex.default_equipment}</span>
            </button>
          ))}

          {filtered.length === 0 && !canCreate && (
            <p className="px-3 py-2 text-sm text-zinc-500">Sin resultados</p>
          )}

          {canCreate && !showEquipmentPicker && (
            <button
              type="button"
              onClick={() => setShowEquipmentPicker(true)}
              className="flex w-full items-center gap-2 border-t border-zinc-700 px-3 py-2.5 text-left text-sm font-semibold text-orange-400 hover:bg-zinc-700 last:rounded-b-xl"
            >
              + Crear &ldquo;{query.trim()}&rdquo;
            </button>
          )}

          {canCreate && showEquipmentPicker && (
            <div className="border-t border-zinc-700 p-3">
              <p className="mb-2 text-xs text-zinc-400">Tipo de equipamiento:</p>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {EQUIPMENT_OPTIONS.map((eq) => (
                  <button
                    key={eq}
                    type="button"
                    onClick={() => setNewEquipment(eq)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                      newEquipment === eq ? 'bg-white text-black' : 'bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    {eq}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleConfirmCreate}
                disabled={creating}
                className="w-full rounded-lg bg-orange-500 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                {creating ? 'Creando...' : `Crear "${query.trim()}"`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
