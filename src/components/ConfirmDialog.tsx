import { Modal } from './Modal';
import { OutlineButton, PrimaryButton, QuietButton } from './ui';

export type Confirmation = {
  title: string;
  message: string;
  cta: string;
  onConfirm: () => void;
  /** Optional middle way, shown as an outline button under the CTA. */
  alt?: { label: string; onClick: () => void };
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
      footer={
        <>
          <PrimaryButton onClick={confirmation.onConfirm}>
            {confirmation.cta}
          </PrimaryButton>
          {confirmation.alt && (
            <OutlineButton className="mt-3" onClick={confirmation.alt.onClick}>
              {confirmation.alt.label}
            </OutlineButton>
          )}
          <QuietButton className="mt-[18px] block w-full text-center" onClick={onCancel}>
            cancelar
          </QuietButton>
        </>
      }
    />
  );
}
