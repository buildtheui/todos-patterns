export const createActionsContainer = (): HTMLDivElement => {
  // Create a div element for the actions (check and delete)
  const actionsEl = document.createElement("div");
  actionsEl.classList.add("actions");
  return actionsEl;
};
