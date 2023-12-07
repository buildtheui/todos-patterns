export const createListItem = (text: string, id?: string): HTMLLIElement => {
  const listItem = document.createElement("li");
  listItem.textContent = text;
  listItem.id = id ?? "";
  return listItem;
};
