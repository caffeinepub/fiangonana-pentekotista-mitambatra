import React from 'react';

/**
 * Component that references generated static assets for Android build verification.
 * This ensures the assets are included in the build without adding new routes.
 */
export function GeneratedAssetsPreview() {
  return (
    <div className="hidden">
      {/* Preload Android app icons for build verification */}
      <img src="/assets/generated/android-app-icon.dim_512x512.png" alt="" />
      <img src="/assets/generated/android-adaptive-foreground.dim_432x432.png" alt="" />
      <img src="/assets/generated/android-adaptive-background.dim_432x432.png" alt="" />
    </div>
  );
}
