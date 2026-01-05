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
      style={{ marginRight: "1em" }}
    >
      <div
        style={{
          position: "relative",
          paddingRight: "1.4em",
        }}
      >
        <div>
          <BackCard sizeSM={22} sizeMD={30} />
        </div>
        <div
          style={{
            top: 0,
            position: "absolute",
            left: ".5em",
          }}
        >
          <BackCard sizeSM={22} sizeMD={30} />
        </div>
        <div
          style={{
            top: 0,
            position: "absolute",
            left: "1em",
          }}
          ref={drawPileRef}
        >
          <BackCard sizeSM={22} sizeMD={30} />
        </div>
      </div>
    </button>
  );
}
