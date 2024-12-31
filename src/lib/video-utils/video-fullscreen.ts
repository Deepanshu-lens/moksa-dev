
export function toggleFullscreen(element: HTMLElement) {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if ((element as any).webkitRequestFullscreen) {
    /* Safari */
    (element as any).webkitRequestFullscreen();
  } else if ((element as any).msRequestFullscreen) {
    /* IE11 */
    (element as any).msRequestFullscreen();
  }
}
