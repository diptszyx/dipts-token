interface Token2022OptionsProps {
  transferFeeEnabled: boolean;
  transferFeeBasisPoints: number;
  transferFeeReceiver: string;
  nonTransferable: boolean;
  requireMemo: boolean;
  onTransferFeeEnabledChange: (enabled: boolean) => void;
  onTransferFeeBasisPointsChange: (points: number) => void;
  onTransferFeeReceiverChange: (address: string) => void;
  onNonTransferableChange: (enabled: boolean) => void;
  onRequireMemoChange: (enabled: boolean) => void;
}

export function Token2022Options({
  transferFeeEnabled,
  transferFeeBasisPoints,
  transferFeeReceiver,
  nonTransferable,
  requireMemo,
  onTransferFeeEnabledChange,
  onTransferFeeBasisPointsChange,
  onTransferFeeReceiverChange,
  onNonTransferableChange,
  onRequireMemoChange
}: Token2022OptionsProps) {
  return (
    <div className="mt-8 p-4 bg-gray-50 rounded-lg space-y-4">
      <h2 className="font-semibold text-gray-800">Token-2022 Features</h2>
      
      {/* Transfer Fee Settings */}
      <div className="space-y-2">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="transferFeeEnabled"
            checked={transferFeeEnabled}
            onChange={(e) => onTransferFeeEnabledChange(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="transferFeeEnabled">Enable Transfer Fee</label>
        </div>

        {transferFeeEnabled && (
          <>
            <div>
              <input
                type="number"
                placeholder="Transfer Fee (basis points)"
                value={transferFeeBasisPoints}
                onChange={(e) => onTransferFeeBasisPointsChange(Number(e.target.value))}
                min={0}
                max={10000}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              />
              <p className="text-sm text-gray-500 mt-1">100 basis points = 1%</p>
            </div>

            <div>
              <input
                type="text"
                placeholder="Fee Receiver Address"
                value={transferFeeReceiver}
                onChange={(e) => onTransferFeeReceiverChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              />
              <p className="text-sm text-gray-500 mt-1">Solana address to receive fees</p>
            </div>
          </>
        )}
      </div>

      {/* Other Token-2022 Features */}
      <div className="space-y-2">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="nonTransferable"
            checked={nonTransferable}
            onChange={(e) => onNonTransferableChange(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="nonTransferable">Non-transferable Token</label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="requireMemo"
            checked={requireMemo}
            onChange={(e) => onRequireMemoChange(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="requireMemo">Require Memo on Transfer</label>
        </div>
      </div>
    </div>
  );
}