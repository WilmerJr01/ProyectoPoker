export const cardImages: Record<string, string> = {};

const modules = import.meta.glob("./*.webp", {
    eager: true,
    import: "default",
});

for (const path in modules) {
    const fileName = path
        .replace("./", "")
        .replace(".webp", "");

    cardImages[fileName] = modules[path] as string;
}
