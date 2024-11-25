export function updateTransform(
  video: HTMLElement,
  scale: number,
  translateX: number,
  translateY: number
) {
  video.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
}

export function constrainPan(
  video: HTMLElement,
  area: HTMLElement,
  scale: number,
  translateX: number,
  translateY: number
) {
  const videoRect = video.getBoundingClientRect();
  const areaRect = area.getBoundingClientRect();

  // Calculate the maximum allowed translation
  const maxTranslateX = (videoRect.width * scale - areaRect.width) / 2;
  const maxTranslateY = (videoRect.height * scale - areaRect.height) / 2;

  // Constrain the translation values
  translateX = Math.max(-maxTranslateX, Math.min(maxTranslateX, translateX));
  translateY = Math.max(-maxTranslateY, Math.min(maxTranslateY, translateY));

  return { translateX, translateY };
}
