export function createVNode(type, props, ...children) {
  // 자식 배열을 평탄화하는 함수
  const flattenChildren = (children) => {
    return children.reduce((acc, child) => {
      if (Array.isArray(child)) {
        acc.push(...flattenChildren(child));
      } else if (child !== null && child !== undefined && child !== true && child !== false) {
        acc.push(child);
      }
      return acc;
    }, []);
  };

  // 자식들을 평탄화하고 필터링
  const normalizedChildren = flattenChildren(children);

  return {
    type,
    props,
    children: normalizedChildren,
  };
}
