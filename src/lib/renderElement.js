import { createElement } from "./createElement.js";
import { normalizeVNode } from "./normalizeVNode.js";
import { setupEventListeners } from "./eventManager.js";
import { updateElement } from "./updateElement.js";

export function renderElement(vNode, container) {
  // vNode를 정규화
  const normalizedVNode = normalizeVNode(vNode);

  // 기존 DOM이 있는지 확인
  const existingElement = container.firstChild;

  if (existingElement) {
    // 기존 DOM이 있으면 updateElement로 업데이트
    updateElement(container, normalizedVNode, existingElement);
  } else {
    // 최초 렌더링시에는 createElement로 DOM을 생성
    const element = createElement(normalizedVNode);
    container.appendChild(element);
  }

  // 렌더링이 완료되면 container에 이벤트를 등록
  // 이미 등록되어 있으면 다시 등록하지 않음
  if (!container._eventListenersSetup) {
    setupEventListeners(container);
    container._eventListenersSetup = true;
  }
}
