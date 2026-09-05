import { useState } from 'react';
import { Modal } from '../components/Modal';
import { FieldLabel, PrimaryButton, QuietButton, TextField } from '../components/ui';
import { digits } from '../lib/format';
import { newAdhocExercise } from '../lib/session';
import { useStore } from '../store/store';

/**
 * Adds an exercise to the running session only — never written back to the
 * template (README §4).
 */
export function AdhocModal({ onClose }: { onClose: () => void }) {
  const { updateActive } = useStore();
  const [name, setName] = useState('');
  const [sets, setSets] = useState('3');

  const add = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const count = Math.max(1, parseInt(sets, 10) || 3);
    updateActive((session) => {
      session.exercises.push(newAdhocExercise(trimmed, count));
    });
    onClose();
  };

  return (
    <Modal
      title="Exercício avulso"
      subtitle="Só nesta sessão — o template do treino não muda."
      onClose={onClose}
      footer={
        <>
          <PrimaryButton onClick={add} disabled={!name.trim()}>
            Adicionar
          </PrimaryButton>
          <QuietButton className="mt-[18px] block w-full text-center" onClick={onClose}>
            cancelar
          </QuietButton>
        </>
      }
    >
      <FieldLabel className="mb-2">Nome</FieldLabel>
      <TextField
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Cadeira extensora"
        className="mb-[18px]"
        autoFocus
        aria-label="Nome do exercício"
      />

      <FieldLabel className="mb-2">Séries</FieldLabel>
      <TextField
        value={sets}
        onChange={(e) => setSets(digits(e.target.value))}
        inputMode="numeric"
        placeholder="3"
        className="tabular-nums"
        aria-label="Séries"
      />
    </Modal>
  );
}
