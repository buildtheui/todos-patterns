export const createButton = (text: string, id?: string): HTMLButtonElement => {
  const button = document.createElement("button");
  button.textContent = text;
  button.id = id ?? "";
  return button;
};
