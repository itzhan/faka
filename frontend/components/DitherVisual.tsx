"use client";

import { Dithering } from "@paper-design/shaders-react";

/** Hero 右侧的像素抖动视觉:蛋形容器 + swirl 漩涡,4x4 拜耳抖动 */
export default function DitherVisual() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[46%] bg-[#141416]">
      <Dithering
        colorBack="#141416"
        colorFront="#8b5cf6"
        shape="swirl"
        type="4x4"
        size={2}
        scale={0.8}
        speed={0.6}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
    </div>
  );
}
