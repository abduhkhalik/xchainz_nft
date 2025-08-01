// src/utils/ffmpeg.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
import ffmpeg from "fluent-ffmpeg";
import { existsSync, statSync } from "fs";
import { platform } from "os";

// ====== 1. SETUP PATH CROSS-PLATFORM ====== //

// Path FFmpeg and FFprobe default for each OS
const supportedPlatforms = ["win32", "linux", "darwin"] as const;
type SupportedPlatform = (typeof supportedPlatforms)[number];

const paths: {
  ffmpeg: Record<SupportedPlatform, string>;
  ffprobe: Record<SupportedPlatform, string>;
} = {
  ffmpeg: {
    win32: "C:/Program Files/ffmpeg/bin/ffmpeg.exe",
    linux: "/usr/bin/ffmpeg",
    darwin: "/opt/homebrew/bin/ffmpeg",
  },
  ffprobe: {
    win32: "C:/Program Files/ffmpeg/bin/ffprobe.exe",
    linux: "/usr/bin/ffprobe",
    darwin: "/opt/homebrew/bin/ffprobe",
  },
};

const currentPlatform = platform() as SupportedPlatform;

const ffmpegPath = supportedPlatforms.includes(currentPlatform)
  ? paths.ffmpeg[currentPlatform]
  : "";
const ffprobePath = supportedPlatforms.includes(currentPlatform)
  ? paths.ffprobe[currentPlatform]
  : "";

// Set FFmpeg and FFprobe paths only if they exist
if (existsSync(ffmpegPath)) ffmpeg.setFfmpegPath(ffmpegPath);
else
  console.warn(
    `FFmpeg executable not found at ${ffmpegPath}. Ensure FFmpeg is installed and path is correct.`
  );

if (existsSync(ffprobePath)) ffmpeg.setFfprobePath(ffprobePath);
else
  console.warn(
    `FFprobe executable not found at ${ffprobePath}. Ensure FFprobe is installed and path is correct.`
  );

// ====== 2. CEK VALID VIDEO ====== //

export function isValidVideo(filePath: string): Promise<boolean> {
  return new Promise((resolve) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        console.error(`❌ ffprobe gagal: ${filePath}`, err.message);
        return resolve(false);
      }

      const hasVideoStream = metadata.streams?.some(
        (s) => s.codec_type === "video"
      );

      if (!hasVideoStream) {
        console.warn(`⚠️ Tidak ditemukan stream video di: ${filePath}`);
      }

      resolve(hasVideoStream);
    });
  });
}

// ====== 3. COMBINE VIDEO SECARA OVERLAY ====== //

export async function combineVideosFromAnyFolder(
  videoPaths: string[],
  output: string,
  targetResolution: { width: number; height: number } = {
    width: 2000,
    height: 2000,
  },
  targetFPS: number = 20
): Promise<void> {
  const validInputs: string[] = [];

  for (const p of videoPaths) {
    const isValid = await isValidVideo(p);
    if (isValid) {
      validInputs.push(p);
    } else {
      console.warn(`⏭️ Dilewati (invalid): ${p}`);
    }
  }

  if (validInputs.length < 2) {
    throw new Error("Minimal 2 video valid diperlukan untuk digabung.");
  }

  return new Promise((resolve, reject) => {
    const command = ffmpeg();

    validInputs.forEach((input) => command.input(input));

    const filters: any[] = [];
    const scaledLabels = validInputs.map((_, i) => `s${i}`);

    // Step 1: Scale and label
    validInputs.forEach((_, i) => {
      filters.push({
        filter: "scale",
        options: {
          w: targetResolution.width,
          h: targetResolution.height,
          force_original_aspect_ratio: "decrease",
        },
        inputs: `[${i}:v]`,
        outputs: scaledLabels[i],
      });
    });

    // Step 2: Chained overlay
    let last = scaledLabels[0];
    for (let i = 1; i < scaledLabels.length; i++) {
      const out = `ov${i}`;
      filters.push({
        filter: "overlay",
        options: { shortest: 1 },
        inputs: [last, scaledLabels[i]],
        outputs: out,
      });
      last = out;
    }

    // Step 3: Convert to GIF
    filters.push({
      filter: "fps",
      options: targetFPS,
      inputs: last,
      outputs: "final",
    });

    command
      .complexFilter(filters, "final")
      .outputOptions([
        "-loop",
        "0", // loop forever
        "-y", // overwrite
      ])
      .format("gif")
      .on("start", (cmd) => console.log("▶️ Mulai FFmpeg:", cmd))
      .on("stderr", (line) => {
        const lower = line.toLowerCase();
        if (lower.includes("error")) {
          console.error("❌ FFmpeg stderr:", line);
        } else {
          console.log("ℹ️ FFmpeg log:", line);
        }
      })
      .on("end", () => {
        try {
          const stats = statSync(output);
          console.log(`✅ GIF berhasil: ${output}`);
          console.log(`📦 Ukuran file: ${stats.size} bytes`);

          if (stats.size < 1000) {
            console.warn("⚠️ File terlalu kecil, kemungkinan gagal render.");
          }

          resolve();
        } catch (e) {
          console.error("❌ File output tidak ditemukan:", e);
          reject(e);
        }
      })
      .on("error", (err) => {
        console.error("❌ FFmpeg gagal:", err.message);
        reject(err);
      })
      .save(output);
  });
}
