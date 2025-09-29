export const getAvatarUrl = (name, lastname1, photo) => {
  if (photo) return photo;

  const baseUrl = "https://ui-avatars.com/api/";
  const fullName = `${name}+${lastname1}`;
  return `${baseUrl}?name=${fullName}&size=128&color=fff&background=007bff`;
};
