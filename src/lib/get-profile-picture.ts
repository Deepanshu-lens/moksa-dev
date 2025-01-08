export function getProfilePicture(
  collectionId,
  recordId,
  fileName,
  size = "0x0"
) {
  return `${
    import.meta.env.PUBLIC_POCKETBASE_URL
  }/api/files/${collectionId}/${recordId}/${fileName}?thumb=${size}`;
}
