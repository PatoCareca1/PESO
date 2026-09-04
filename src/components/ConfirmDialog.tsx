import { Modal } from './Modal';
import { PrimaryButton, QuietButton } from './ui';

export type Confirmation = {
  title: string;
  message: string;
  cta: string;
  onConfirm: () => void;
};

export function ConfirmDialog({
  confirmation,
  onCancel,
}: {
  confirmation: Confirmation;
  onCancel: () => void;
}) {
  return (
    <Modal
      title={confirmation.title}
      subtitle={confirmation.message}
      onClose={onCancel}
      layer="confirm"
    >
      <PrimaryButton onClick={confirmation.onConfirm}>
        {confirmation.cta}
      </PrimaryButton>
      <QuietButton className="mt-[18px] block w-full text-center" onClick={onCancel}>
        cancelar
      </QuietButton>
    </Modal>
  );
}
