export const createButton = (text: string): HTMLButtonElement => {
  const button = document.createElement("button");
  button.textContent = text;
  return button;
};
