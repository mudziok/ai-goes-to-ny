export const avatars = {
    bear: {
        name: "🐻 Bear",
        color: "#B1907F",
    },
    frog: {
        name: "🐸 Frog",
        color: "#C6D57E",
    },
    raccoon: {
        name: "🦝 Raccoon",
        color: "#C0C1B7",
    },
    dolphin: {
        name: "🐬 Dolphin",
        color: "#CBDBF3",
    },
    fox: {
        name: "🦊 Fox",
        color: "#FFB347"
    }
} as const;

export type Avatar = typeof avatars[keyof typeof avatars];