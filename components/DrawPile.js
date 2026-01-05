import { BackCard } from "~/components/Card";

export default function DrawPile({
  onDrawCard,
  canDrawFromPile,
  isCurrentPlayerTurn,
  drawPileRef,
}) {
  return (
    <button
      onClick={(e) => onDrawCard()}
      disabled={!(canDrawFromPile && isCurrentPlayerTurn)}
      className="draw-pile-button"
    >
      <div
        className="draw-pile-stack"
      >
        <div className="pile-card">
          <BackCard sizeSM={14} sizeMD={18} />
        </div>
        <div
          className="pile-card pile-offset-1"
        >
          <BackCard sizeSM={14} sizeMD={18} />
        </div>
        <div
          className="pile-card pile-offset-2"
          ref={drawPileRef}
        >
          <BackCard sizeSM={14} sizeMD={18} />
        </div>
      </div>
      <style jsx>{`
        .draw-pile-button {
          margin-right: 0.75em;
        }

        .draw-pile-stack {
          position: relative;
          padding-right: 0.75em;
          display: inline-flex;
        }

        .pile-card {
          position: relative;
        }

        .pile-offset-1 {
          position: absolute;
          top: 0;
          left: 0.5em;
        }

        .pile-offset-2 {
          position: absolute;
          top: 0;
          left: 1em;
        }

        @media (max-width: 520px) {
          .draw-pile-button {
            margin-right: 0.5em;
          }

          .draw-pile-stack {
            padding-right: 0.5em;
            flex-wrap: wrap;
            gap: 0.35em;
            justify-content: center;
          }

          .pile-card,
          .pile-offset-1,
          .pile-offset-2 {
            position: relative;
            top: auto;
            left: auto;
            margin-left: 0;
          }
        }

        @media (max-width: 420px) {
          .draw-pile-stack {
            gap: 0.25em;
            padding-right: 0.25em;
          }
        }
      `}</style>
    </button>
  );
}
