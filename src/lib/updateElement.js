import { addEvent, removeEvent } from "./eventManager.js";
import { createElement } from "./createElement.js";

function updateAttributes(target, originNewProps, originOldProps) {
  const newProps = originNewProps || {};
  const oldProps = originOldProps || {};

  // 새로운 속성들 추가/업데이트
  Object.keys(newProps).forEach((key) => {
    if (key === "children") return; // children은 별도 처리

    const newValue = newProps[key];
    const oldValue = oldProps[key];

    if (newValue !== oldValue) {
      if (key.startsWith("on") && typeof newValue === "function") {
        // 이벤트 핸들러 처리
        if (oldValue) {
          removeEvent(target, key.toLowerCase().substring(2), oldValue);
        }
        if (newValue) {
          addEvent(target, key.toLowerCase().substring(2), newValue);
        }
      } else if (key === "className") {
        target.className = newValue;
      } else if (key.startsWith("data-")) {
        const dataKey = key.substring(5);
        target.dataset[dataKey] = newValue;
      } else if (typeof newValue === "boolean") {
        if (newValue) {
          target.setAttribute(key, "");
        } else {
          target.removeAttribute(key);
        }
      } else {
        target.setAttribute(key, newValue);
      }
    }
  });

  // 제거된 속성들 삭제
  Object.keys(oldProps).forEach((key) => {
    if (key === "children") return;
    if (!(key in newProps)) {
      if (key.startsWith("on") && typeof oldProps[key] === "function") {
        removeEvent(target, key.toLowerCase().substring(2), oldProps[key]);
      } else {
        target.removeAttribute(key);
      }
    }
  });
}

export function updateElement(parentElement, newNode, oldNode) {
  // 노드 타입이 다른 경우 완전히 교체
  if (typeof newNode !== typeof oldNode || (newNode && oldNode && newNode.type !== oldNode.type)) {
    const newElement = createElement(newNode);
    parentElement.replaceChild(newElement, oldNode);
    return;
  }

  // 텍스트 노드인 경우
  if (typeof newNode === "string" || typeof newNode === "number") {
    if (newNode !== oldNode) {
      oldNode.textContent = String(newNode);
    }
    return;
  }

  // vNode가 없는 경우
  if (!newNode || !oldNode) {
    if (newNode) {
      const newElement = createElement(newNode);
      parentElement.appendChild(newElement);
    } else if (oldNode) {
      parentElement.removeChild(oldNode);
    }
    return;
  }

  // 속성 업데이트
  updateAttributes(oldNode, newNode.props, oldNode._vNode?.props);

  // 자식 노드들 업데이트
  const newChildren = newNode.children || [];
  const oldChildren = oldNode.childNodes;

  // 더 많은 자식이 있는 경우 제거
  while (oldChildren.length > newChildren.length) {
    oldNode.removeChild(oldChildren[oldChildren.length - 1]);
  }

  // 자식 노드들 순회하며 업데이트
  newChildren.forEach((newChild, i) => {
    const oldChild = oldChildren[i];

    if (oldChild) {
      updateElement(oldNode, newChild, oldChild);
    } else {
      const newElement = createElement(newChild);
      oldNode.appendChild(newElement);
    }
  });

  // 현재 vNode 정보 저장
  oldNode._vNode = newNode;
}
