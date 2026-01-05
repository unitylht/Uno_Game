import { useRef, useEffect } from "react";

const useCardAnimations = (enabled = true) => {
  const isMountedRef = useRef(false);
  const pileRef = useRef();
  const drawPileRef = useRef();
  const ghostRef = useRef();

  useEffect(() => {
    isMountedRef.current = true;
    const ghostNode = document.createElement("div");
    ghostNode.style.position = "fixed";
    ghostNode.style.top = "0";
    ghostNode.style.left = "0";
    ghostNode.style.pointerEvents = "none";
    ghostNode.style.zIndex = "60";
    ghostNode.style.willChange = "transform";
    ghostRef.current = ghostNode;
    document.body.appendChild(ghostNode);

    return () => {
      isMountedRef.current = false;
      ghostNode.remove();
    };
  }, []);

  const animateCardTransition = (cardElement, toElement) => {
    if (!enabled || !isMountedRef.current) return;
    if (!cardElement || !toElement || !ghostRef.current) return;

    const originRect = cardElement.getBoundingClientRect();
    const targetRect = toElement.getBoundingClientRect();

    if (targetRect.height === 0 || originRect.height === 0) {
      return;
    }

    const scale = targetRect.height / originRect.height;
    const ghost = ghostRef.current;
    ghost.innerHTML = "";
    const cardClone = cardElement.cloneNode(true);
    cardClone.style.transformOrigin = "top left";
    ghost.appendChild(cardClone);

    requestAnimationFrame(() => {
      const animation = ghost.animate(
        [
          {
            transform: `translate(${originRect.left}px, ${originRect.top}px)`,
          },
          {
            transform: `translate(${targetRect.left}px, ${targetRect.top}px) scale(${scale})`,
          },
        ],
        {
          duration: 280,
          easing: "ease-in-out",
          fill: "forwards",
        }
      );
      animation.onfinish = () => {
        if (ghostRef.current) {
          ghostRef.current.innerHTML = "";
        }
      };
    });
  };

  const onCardRemove = (el) => {
    animateCardTransition(el, pileRef.current);
  };

  const onCardAdd = (el) => {
    animateCardTransition(drawPileRef.current, el);
  };

  return { drawPileRef, pileRef, onCardAdd, onCardRemove };
};

export default useCardAnimations;
