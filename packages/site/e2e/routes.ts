/** Pages checked by the smoke, a11y and snapshot specs. Paths are relative to the base URL. */
export const ROUTES = [
    {name: "home", path: ""},
    {name: "ports", path: "ports"},
    {name: "port-vscode", path: "ports/vscode"},
    {name: "port-kitty", path: "ports/kitty"},
    {name: "port-wallpapers", path: "ports/wallpapers"},
    {name: "palette", path: "palette"},
] as const;
