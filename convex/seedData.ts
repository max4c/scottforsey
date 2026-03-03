import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const seedAll = action({
  args: { password: v.string() },
  handler: async (ctx, { password }) => {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword || password !== adminPassword) {
      throw new Error("Invalid password");
    }

    await ctx.runMutation(internal.songs.seed, {
      songs: [
        { title: "Adrift in Perpetuity", audioUrl: "/music/adrift-in-perpetuity.m4a", duration: 108, order: 1, featured: false },
        { title: "A Taste of the Groove", audioUrl: "/music/a-taste-of-the-groove.m4a", duration: 70, order: 2, featured: false },
        { title: "Awaiting Revenance", audioUrl: "/music/awaiting-revenance.m4a", duration: 77, order: 3, featured: false },
        { title: "Beginning Anew", audioUrl: "/music/beginning-anew.m4a", duration: 181, order: 4, featured: false },
        { title: "Cast of the Pale Moon's Light", audioUrl: "/music/cast-of-the-pale-moons-light.m4a", duration: 127, order: 5, featured: false },
        { title: "I'm like, just a pirate", audioUrl: "/music/im-like-just-a-pirate.m4a", duration: 219, order: 6, featured: false },
        { title: "I'm Sorry", audioUrl: "/music/im-sorry.m4a", duration: 157, order: 7, featured: false },
        { title: "Misguided Notions", audioUrl: "/music/misguided-notions.m4a", duration: 30, order: 8, featured: false },
        { title: "My Song 3", audioUrl: "/music/my-song-3.m4a", duration: 50, order: 9, featured: false },
        { title: "My Song 27", audioUrl: "/music/my-song-27.m4a", duration: 144, order: 10, featured: false },
        { title: "Nothing In Return", audioUrl: "/music/nothing-in-return.m4a", duration: 115, order: 11, featured: false },
        { title: "Periodic Shift", audioUrl: "/music/periodic-shift.m4a", duration: 99, order: 12, featured: false },
        { title: "Permanence & Impermanence", audioUrl: "/music/permanence-and-impermanence.m4a", duration: 217, order: 13, featured: false },
        { title: "Phase One", audioUrl: "/music/phase-one.m4a", duration: 46, order: 14, featured: false },
        { title: "!Prey", audioUrl: "/music/prey.m4a", duration: 70, order: 15, featured: false },
        { title: "Riders of Rohan (Retro)", audioUrl: "/music/riders-of-rohan-retro.m4a", duration: 75, order: 16, featured: false },
        { title: "RunPod 4 audio signature", audioUrl: "/music/runpod-4-audio-signature.m4a", duration: 13, order: 17, featured: false },
        { title: "RunPod 5 audio signature", audioUrl: "/music/runpod-5-audio-signature.m4a", duration: 13, order: 18, featured: false },
        { title: "RunPod audio signature demos", audioUrl: "/music/runpod-audio-signature-demos.m4a", duration: 27, order: 19, featured: false },
        { title: "Serenity", audioUrl: "/music/serenity.m4a", duration: 73, order: 20, featured: false },
        { title: "Skipping Stones", audioUrl: "/music/skipping-stones.m4a", duration: 105, order: 21, featured: false },
        { title: "Temple of Ruins", audioUrl: "/music/temple-of-ruins.m4a", duration: 218, order: 22, featured: false },
        { title: "Those that were", audioUrl: "/music/those-that-were.m4a", duration: 189, order: 23, featured: false },
        { title: "Torn Tape", audioUrl: "/music/torn-tape.m4a", duration: 96, order: 24, featured: false },
        { title: "Wandering Merchant", audioUrl: "/music/wandering-merchant.m4a", duration: 166, order: 25, featured: false },
      ],
    });

    await ctx.runMutation(internal.artworks.seed, {
      artworks: [
        {
          title: "Adventure Time 16x16",
          imageUrl: "/art/adventure-time-pixel-characters.png",
          medium: "Pixel Art",
          year: 2024,
          dimensions: "426x537",
          series: "Pixel Art",
          featured: true,
          aspectRatio: 426 / 537,
          description: "16x16 pixel character sheet featuring the cast of Adventure Time.",
        },
      ],
    });

    return { songs: 25, artworks: 1 };
  },
});
